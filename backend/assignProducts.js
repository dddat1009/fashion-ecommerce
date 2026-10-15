import mongoose from 'mongoose';
import 'dotenv/config';
import shopModel from './models/shopModel.js';
import productModel from './models/productModel.js';
import warehouseModel from './models/warehouseModel.js';
import inventoryModel from './models/inventoryModel.js';
import inventoryLogModel from './models/inventoryLogModel.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB!");

        // 1. Tìm 3 shop đích
        const targetShopNames = ["SHOP A", "shop B", "SHOP C"];
        const shops = await shopModel.find({ name: { $in: targetShopNames } });

        if (shops.length === 0) {
            console.error("Không tìm thấy shop nào trong danh sách:", targetShopNames);
            process.exit(1);
        }

        console.log(`Tìm thấy ${shops.length} shop: ${shops.map(s => `"${s.name}" (ID: ${s._id})`).join(', ')}`);

        // 2. Đảm bảo mỗi shop có ít nhất 1 kho hàng mặc định
        const shopWarehouses = {};
        for (const shop of shops) {
            let wh = await warehouseModel.findOne({ shopId: shop._id, isDefault: true });
            if (!wh) {
                wh = await warehouseModel.findOne({ shopId: shop._id });
            }
            if (!wh) {
                wh = await warehouseModel.create({
                    shopId: shop._id,
                    name: `Kho Tổng ${shop.name}`,
                    address: `Địa chỉ kho ${shop.name}`,
                    city: 'Hà Nội',
                    phone: '0988888888',
                    isDefault: true,
                    status: 'active'
                });
                console.log(`+ Đã tạo kho mới: "${wh.name}" cho Shop "${shop.name}"`);
            } else {
                console.log(`= Đã có sẵn kho: "${wh.name}" cho Shop "${shop.name}"`);
            }
            shopWarehouses[shop._id.toString()] = wh;
        }

        // 3. Lấy tất cả sản phẩm chưa có sellerId
        const unassignedProducts = await productModel.find({
            $or: [{ sellerId: { $exists: false } }, { sellerId: null }]
        });

        console.log(`\nSố sản phẩm cần phân bổ: ${unassignedProducts.length}`);

        if (unassignedProducts.length === 0) {
            console.log("Không có sản phẩm nào cần phân bổ!");
            process.exit(0);
        }

        const counts = {};
        shops.forEach(s => counts[s.name] = 0);
        let inventoryCreated = 0;

        // 4. Chia đều Round-Robin cho 3 shop
        for (let i = 0; i < unassignedProducts.length; i++) {
            const product = unassignedProducts[i];
            const targetShop = shops[i % shops.length];
            const targetWarehouse = shopWarehouses[targetShop._id.toString()];

            // Gán sellerId cho sản phẩm (sellerId là userId của chủ shop)
            product.sellerId = targetShop.userId;
            await product.save();
            counts[targetShop.name]++;

            // Khởi tạo tồn kho ban đầu cho từng size của sản phẩm
            if (targetWarehouse && Array.isArray(product.sizes)) {
                for (const sz of product.sizes) {
                    const existingInv = await inventoryModel.findOne({
                        productId: product._id,
                        warehouseId: targetWarehouse._id,
                        size: sz
                    });

                    if (!existingInv) {
                        const initQty = 20; // Khởi tạo 20 chiếc mỗi size
                        await inventoryModel.create({
                            productId: product._id,
                            warehouseId: targetWarehouse._id,
                            size: sz,
                            quantity: initQty,
                            reservedQuantity: 0
                        });

                        await inventoryLogModel.create({
                            warehouseId: targetWarehouse._id,
                            productId: product._id,
                            size: sz,
                            type: 'IMPORT',
                            quantityChange: initQty,
                            note: 'Khởi tạo tồn kho ban đầu tự động'
                        });

                        inventoryCreated++;
                    }
                }
            }
        }

        console.log("\n=== KẾT QUẢ PHÂN BỔ SẢN PHẨM ===");
        for (const shopName in counts) {
            console.log(`- Shop "${shopName}": được gán ${counts[shopName]} sản phẩm`);
        }
        console.log(`- Tổng số bản ghi tồn kho đã khởi tạo: ${inventoryCreated}`);
        console.log("Hoàn thành xuất sắc!");
        process.exit(0);

    } catch (err) {
        console.error("Lỗi:", err);
        process.exit(1);
    }
};

run();
