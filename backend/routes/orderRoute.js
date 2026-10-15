import express from 'express'
import { placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, dashboardStats } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'
import sellerAuth from '../middleware/sellerAuth.js'


const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', sellerAuth, allOrders)
orderRouter.post('/status', sellerAuth, updateStatus)
orderRouter.get('/dashboard', sellerAuth, dashboardStats)

//payment features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User feature
orderRouter.post('/userorders', authUser, userOrders)

// verify payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)

export default orderRouter