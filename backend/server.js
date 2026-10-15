import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import { connect } from 'mongoose'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import voucherRouter from './routes/voucherRoute.js'
import shopRouter from './routes/shopRoute.js'
import withdrawalRouter from './routes/withdrawalRoute.js'
import warehouseRouter from './routes/warehouseRoute.js'
import inventoryRouter from './routes/inventoryRoute.js'

//app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/voucher', voucherRouter)
app.use('/api/shop', shopRouter)
app.use('/api/withdrawal', withdrawalRouter)
app.use('/api/warehouse', warehouseRouter)
app.use('/api/inventory', inventoryRouter)
app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))