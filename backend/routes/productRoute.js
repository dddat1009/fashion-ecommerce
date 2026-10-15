import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, listSellerProducts } from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js'
import sellerAuth from '../middleware/sellerAuth.js'
const productRouter = express.Router()

productRouter.post('/add', sellerAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct);
productRouter.post('/remove', sellerAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.get('/seller-list', sellerAuth, listSellerProducts);

export default productRouter
