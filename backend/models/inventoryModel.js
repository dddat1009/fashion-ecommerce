import mongoose from 'mongoose'

const inventorySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouse', required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    reservedQuantity: { type: Number, default: 0, min: 0 },
}, {
    timestamps: true
})

inventorySchema.index({ productId: 1, warehouseId: 1, size: 1 }, { unique: true })
const inventoryModel = mongoose.model('inventory', inventorySchema)

export default inventoryModel