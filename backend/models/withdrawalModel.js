import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'shop', required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // 'Pending', 'Approved', 'Rejected'
    date: { type: Number, required: true }
});

const withdrawalModel = mongoose.models.withdrawal || mongoose.model("withdrawal", withdrawalSchema);
export default withdrawalModel;
