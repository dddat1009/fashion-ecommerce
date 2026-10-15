import mongoose from "mongoose"
import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import voucherModel from "../models/voucherModel.js"
import shopModel from "../models/shopModel.js"
import inventoryModel from "../models/inventoryModel.js"
import inventoryLogModel from "../models/inventoryLogModel.js"
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = "usd"
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Helper trừ tồn kho khi đơn hàng được tạo/thanh toán
const deductInventoryForOrder = async (items) => {
    try {
        for (const item of items) {
            const prodId = item._id || item.productId;
            if (!prodId || !item.size || !item.quantity) continue;

            // Tìm kho có đủ số lượng trước
            let inventory = await inventoryModel.findOne({
                productId: prodId,
                size: item.size,
                quantity: { $gte: item.quantity }
            });

            // Nếu không có kho nào đủ toàn bộ, lấy kho có quantity > 0 lớn nhất
            if (!inventory) {
                inventory = await inventoryModel.findOne({
                    productId: prodId,
                    size: item.size,
                    quantity: { $gt: 0 }
                }).sort({ quantity: -1 });
            }

            if (inventory) {
                const deductQty = Math.min(inventory.quantity, item.quantity);
                inventory.quantity -= deductQty;
                await inventory.save();

                await inventoryLogModel.create({
                    warehouseId: inventory.warehouseId,
                    productId: prodId,
                    size: item.size,
                    type: 'EXPORT_ORDER',
                    quantityChange: -deductQty,
                    note: `Xuất ${deductQty} sản phẩm cho đơn hàng`
                });
            }
        }
    } catch (err) {
        console.error("Lỗi khi trừ tồn kho đơn hàng:", err);
    }
};

// Helper hoàn lại tồn kho khi đơn hàng bị hủy
const restoreInventoryForOrder = async (items) => {
    try {
        for (const item of items) {
            const prodId = item._id || item.productId;
            if (!prodId || !item.size || !item.quantity) continue;

            let inventory = await inventoryModel.findOne({
                productId: prodId,
                size: item.size
            });

            if (inventory) {
                inventory.quantity += item.quantity;
                await inventory.save();

                await inventoryLogModel.create({
                    warehouseId: inventory.warehouseId,
                    productId: prodId,
                    size: item.size,
                    type: 'CANCEL_ORDER',
                    quantityChange: item.quantity,
                    note: `Hoàn trả ${item.quantity} sản phẩm do hủy đơn hàng`
                });
            }
        }
    } catch (err) {
        console.error("Lỗi khi hoàn tồn kho đơn hàng:", err);
    }
};

// Placing orders using COD method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, voucherCode } = req.body;

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "Giỏ hàng rỗng" });
        }

        // 1. Kiểm tra tồn kho trước khi đặt hàng
        for (const item of items) {
            const prodId = item._id || item.productId;
            if (prodId && item.size) {
                const stockRecords = await inventoryModel.find({
                    productId: prodId,
                    size: item.size
                });
                if (stockRecords.length > 0) {
                    const totalQty = stockRecords.reduce((sum, r) => sum + (r.quantity || 0), 0);
                    if (totalQty < item.quantity) {
                        return res.json({
                            success: false,
                            message: `Sản phẩm "${item.name}" (Size ${item.size}) không đủ hàng trong kho (chỉ còn ${totalQty})`
                        });
                    }
                }
            }
        }

        // 2. Gom nhóm đơn hàng theo từng Shop (Split Order)
        const ordersByShop = {};

        for (const item of items) {
            let shopId = null;
            if (item.sellerId) {
                const shop = await shopModel.findOne({ userId: item.sellerId });
                if (shop) {
                    shopId = shop._id.toString();
                }
            }

            const shopKey = shopId || 'platform';
            if (!ordersByShop[shopKey]) {
                ordersByShop[shopKey] = {
                    shopId: shopId || null,
                    items: [],
                    amount: 0
                };
            }

            ordersByShop[shopKey].items.push(item);
            ordersByShop[shopKey].amount += (item.price || 0) * (item.quantity || 1);
        }

        // 3. Lưu từng đơn hàng cho từng Shop vào database
        for (const shopKey in ordersByShop) {
            const shopCart = ordersByShop[shopKey];

            const orderData = {
                shopId: shopCart.shopId,
                userId: userId,
                items: shopCart.items,
                amount: shopCart.amount + deliveryCharge,
                address: address,
                date: Date.now(),
                paymentMethod: "COD",
                payment: false
            };

            const newOrder = new orderModel(orderData);
            await newOrder.save();
        }

        // 4. Trừ tồn kho & ghi log xuất kho
        await deductInventoryForOrder(items);

        // 5. Nếu có dùng voucher, tăng usedCount lên 1
        if (voucherCode) {
            await voucherModel.findOneAndUpdate(
                { code: voucherCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        // 6. Xóa giỏ hàng người dùng
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Stripe method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address, voucherCode } = req.body;
        const { origin } = req.headers;

        // Tìm shopId từ sản phẩm
        let shopId = null;
        if (items[0]?.sellerId) {
            const shop = await shopModel.findOne({ userId: items[0].sellerId });
            if (shop) shopId = shop._id;
        }

        const orderData = {
            shopId,
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Nếu có dùng voucher, tăng usedCount lên 1
        if (voucherCode) {
            await voucherModel.findOneAndUpdate(
                { code: voucherCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

};

// Verify stripe
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;

    try {
        if (success === "true") {
            const order = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
            if (order && order.items) {
                await deductInventoryForOrder(order.items);
            }
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All orders data for Admin panel and seller panel
const allOrders = async (req, res) => {
    try {
        const { userId, userRole } = req.body;

        let queryCondition = {};

        // Phân luồng logic: Nếu là người bán, tìm theo shopId của shop họ sở hữu
        if (userRole === 'seller') {
            const shop = await shopModel.findOne({ userId });
            if (shop) {
                queryCondition = { $or: [{ shopId: shop._id }, { shopId: userId }] };
            } else {
                queryCondition = { shopId: userId };
            }
        }

        const orders = await orderModel.find(queryCondition).sort({ date: -1 });

        res.json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// User Order Data for Customer
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;

        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const currentOrder = await orderModel.findById(orderId);
        if (!currentOrder) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        const oldStatus = currentOrder.status;
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

        // --- XỬ LÝ HỦY ĐƠN: HOÀN TRẢ TỒN KHO ---
        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            if (updatedOrder.items && updatedOrder.items.length > 0) {
                await restoreInventoryForOrder(updatedOrder.items);
            }
        }

        // --- LOGIC VÍ TIỀN: CỘNG TIỀN CHO SELLER KHI GIAO HÀNG THÀNH CÔNG ---
        if (status === 'Delivered' && !updatedOrder.isPaidToSeller && updatedOrder.shopId) {
            if (updatedOrder.paymentMethod === 'COD') {
                updatedOrder.payment = true;
            }

            updatedOrder.isPaidToSeller = true;
            await updatedOrder.save();

            // Cộng tiền vào ví của Shop
            await shopModel.findOneAndUpdate(
                { _id: updatedOrder.shopId },
                { 
                    $inc: { 
                        walletBalance: updatedOrder.amount,
                        totalRevenue: updatedOrder.amount
                    } 
                }
            );
        }

        res.json({ success: true, message: 'Status Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Tính năng Thống kê cho Admin Dashboard và Seller Dashboard
const dashboardStats = async (req, res) => {
    try {
        const { userId, userRole } = req.body;

        let productFilter = {};
        let orderFilter = {};
        let aggregateMatch = { payment: true };

        // Nếu là Seller, chỉ đếm sản phẩm và đơn hàng của riêng họ
        if (userRole === 'seller') {
            const shop = await shopModel.findOne({ userId });
            const shopCondition = shop ? { $in: [shop._id, userId] } : userId;

            productFilter = { sellerId: userId };
            orderFilter = { shopId: shopCondition };
            aggregateMatch = { payment: true, shopId: shopCondition }; 
        }

        const totalUsers = userRole === 'admin' ? await userModel.countDocuments({}) : 0;
        const totalProducts = await productModel.countDocuments(productFilter);
        const totalOrders = await orderModel.countDocuments(orderFilter);

        // Tính tổng doanh thu
        const revenueResult = await orderModel.aggregate([
            { $match: aggregateMatch },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Gom nhóm Doanh thu theo tháng
        const revenueByMonthData = await orderModel.aggregate([
            { $match: aggregateMatch },
            {
                $group: {
                    _id: { $month: { $toDate: "$date" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } } 
        ]);
        
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            revenue: 0
        }));
        
        revenueByMonthData.forEach(item => {
            if (item._id && item._id >= 1 && item._id <= 12) {
                monthlyRevenue[item._id - 1].revenue = item.revenue;
            }
        });

        // Gom nhóm Đơn hàng theo Trạng thái
        const orderStatusData = await orderModel.aggregate([
            { $match: orderFilter },
            {
                $group: {
                    _id: "$status", 
                    count: { $sum: 1 } 
                }
            }
        ]);

        const orderStatus = orderStatusData.map(item => ({
            name: item._id,
            value: item.count
        }));

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                monthlyRevenue, 
                orderStatus     
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, dashboardStats };

