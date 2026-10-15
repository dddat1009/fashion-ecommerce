import mongoose from "mongoose"

const shopSchema = new mongoose.Schema({
    // 1. Liên kết với User
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    // 2. Thông tin cơ bản
    name: { type: String, required: true },
    description: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    avatar: { type: String, default: "" }, // Link ảnh logo shop

    // 3. Quản lý Tài chính / Lợi nhuận
    walletBalance: { type: Number, default: 0 }, // Tiền trong ví (có thể rút)
    totalRevenue: { type: Number, default: 0 },  // Tổng doanh thu từ trước đến nay (để thống kê)
    bankAccount: {
        bankName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        accountName: { type: String, default: "" }
    },

    // 4. Các chỉ số thống kê (hiển thị cho khách xem)
    rating: { type: Number, default: 0 }, // Đánh giá trung bình (vd: 4.8 sao)
    numReviews: { type: Number, default: 0 }, // Số lượng lượt đánh giá

    // 5. Trạng thái kiểm duyệt
    isActive: { type: Boolean, default: true }, // Admin có thể khóa shop bằng cách set thành false
    isVerified: { type: Boolean, default: false } // Đã xác minh danh tính hay chưa
}, { timestamps: true }) // Tự động tạo trường createdAt và updatedAt


const shopModel = mongoose.models.shop || mongoose.model("shop", shopSchema)
export default shopModel