import mongoose from "mongoose"

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true }

})

const shopModel = mongoose.models.shop || mongoose.model("shop", shopSchema)
export default shopModel