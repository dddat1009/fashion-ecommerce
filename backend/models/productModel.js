import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required:true },
    image: { type: Array, required:true },
    category: { type: String, required:true },
    subCategory: { type: String, required:true },
    sizes: { type: Array, required:true },
    bestseller: {type:Boolean, default: false},
    date: {type: Number, required: true},
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: false }, // Cho phép false tạm thời để không lỗi dữ liệu cũ
    status: { type: String, default: 'pending' } // 'pending', 'approved', 'rejected'

})

const productModel = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel