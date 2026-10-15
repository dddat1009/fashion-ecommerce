import express from 'express';
import { registerShop, getShopProfile, updateShopProfile } from '../controllers/shopController.js';
import authUser from '../middleware/auth.js';
import sellerAuth from '../middleware/sellerAuth.js';

const shopRouter = express.Router();

// Route cho Khách hàng đăng ký mở Shop (cần token của user)
shopRouter.post('/register', authUser, registerShop);

// Route cho Seller lấy và cập nhật thông tin Shop của họ (cần token của seller)
shopRouter.get('/profile', sellerAuth, getShopProfile);
shopRouter.post('/update-profile', sellerAuth, updateShopProfile);

export default shopRouter;
