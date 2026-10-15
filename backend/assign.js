import mongoose from 'mongoose';
import 'dotenv/config';
import productModel from './models/productModel.js';

const assignProductsToShop = async () => {
    try {
        // 1. Kết nối DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Đã kết nối MongoDB!");

        // 2. ĐIỀN ID CỦA NGƯỜI BÁN (SELLER) VÀO ĐÂY
        // Bạn có thể lấy ID này trong MongoDB Compass (bảng users hoặc shops)
        const SELLER_ID = "ĐIỀN_USER_ID_CỦA_SELLER_VÀO_ĐÂY"; 

        if (SELLER_ID === "ĐIỀN_USER_ID_CỦA_SELLER_VÀO_ĐÂY") {
            console.log("❌ LỖI: Bạn chưa điền SELLER_ID vào file assign.js");
            process.exit(1);
        }

        // 3. Cập nhật tất cả sản phẩm chưa có sellerId (hoặc tất cả sản phẩm)
        // Nếu muốn gán TẤT CẢ sản phẩm (kể cả đã có chủ) cho shop này, dùng {} thay vì { sellerId: { $exists: false } }
        const result = await productModel.updateMany(
            { $or: [{ sellerId: { $exists: false } }, { sellerId: null }] }, // Chỉ gán những sản phẩm đang "vô chủ"
            { $set: { sellerId: SELLER_ID } }
        );

        console.log(`✅ Thành công! Đã gán ${result.modifiedCount} sản phẩm vô chủ cho Seller có ID: ${SELLER_ID}`);
        process.exit(0);

    } catch (error) {
        console.log("Lỗi:", error);
        process.exit(1);
    }
};

assignProductsToShop();
