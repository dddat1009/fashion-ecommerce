import mongoose from 'mongoose'

const warehouseSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true
})

const warehouseModel = mongoose.models.warehouse || mongoose.model('warehouse', warehouseSchema)

export default warehouseModel