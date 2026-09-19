import productModel from "../models/productModel.js"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import voucherModel from "../models/voucherModel.js"
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = "usd"
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Placing orders using COD method
const placeOrder = async (req, res) => {
    try {

        const { userId, items, amount, address, voucherCode } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        // Nếu có dùng voucher, tăng usedCount lên 1
        if (voucherCode) {
            await voucherModel.findOneAndUpdate(
                { code: voucherCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Stripe method
const placeOrderStripe = async (req, res) => {
    try {

        const { userId, items, amount, address, voucherCode } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

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
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

}

// Verify stripe
const verifyStripe = async (req, res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// All orders data for Admin panel
const allOrders = async (req, res) => {
    try {

        const orders = await orderModel.find({})
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// User Order Data for Admin panel
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//update oders status from admin panel
const updateStatus = async (req, res) => {
    try {

        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Tính năng Thống kê cho Admin Dashboard (Đã nâng cấp có Biểu đồ)
const dashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({});
        const totalProducts = await productModel.countDocuments({});
        const totalOrders = await orderModel.countDocuments({});
        // 1. Tính tổng doanh thu
        const revenueResult = await orderModel.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        // 2. Gom nhóm Doanh thu theo tháng (cho Biểu đồ cột)
        // Mongoose sẽ xem xét trường 'date' và trích xuất ra Tháng (từ 1 đến 12)
        const revenueByMonthData = await orderModel.aggregate([
            { $match: { payment: true } },
            {
                $group: {
                    // Chuyển timestamp (date) sang kiểu ngày tháng rồi lấy ra Tháng (month)
                    _id: { $month: { $toDate: "$date" } },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } } // Sắp xếp từ tháng 1 đến tháng 12
        ]);
        // Tạo mảng 12 tháng mặc định (doanh thu = 0) để frontend vẽ biểu đồ không bị lỗi nếu tháng đó chưa có ai mua
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            name: `Tháng ${i + 1}`,
            revenue: 0
        }));
        // Đắp dữ liệu thật vào mảng mặc định
        revenueByMonthData.forEach(item => {
            if (item._id) {
                monthlyRevenue[item._id - 1].revenue = item.revenue;
            }
        });
        // 3. Gom nhóm Đơn hàng theo Trạng thái (cho Biểu đồ tròn)
        const orderStatusData = await orderModel.aggregate([
            {
                $group: {
                    _id: "$status", // Gom nhóm theo tên trạng thái (Order Placed, Shipped...)
                    count: { $sum: 1 } // Đếm số lượng
                }
            }
        ]);

        // Chuẩn hóa dữ liệu cho frontend vẽ
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
                monthlyRevenue, // Dữ liệu biểu đồ cột
                orderStatus     // Dữ liệu biểu đồ tròn
            }
        });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export { verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, dashboardStats }

