import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouse', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    size: { type: String, required: true },
    type: {
        type: String,
        enum: ['IMPORT', 'EXPORT_ORDER', 'CANCEL_ORDER', 'ADJUSTMENT'],
        required: true
    },
    quantityChange: { type: Number, required: true }, // Số lượng tăng (+10) hoặc giảm (-2)
    note: { type: String, default: "" },
}, { timestamps: true });
const inventoryLogModel = mongoose.models.inventoryLog || mongoose.model("inventoryLog", inventoryLogSchema);
export default inventoryLogModel;