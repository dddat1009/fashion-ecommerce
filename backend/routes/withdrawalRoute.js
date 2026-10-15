import express from 'express';
import { requestWithdrawal, getWithdrawals, updateWithdrawalStatus } from '../controllers/withdrawalController.js';
import adminAuth from '../middleware/adminAuth.js';
import sellerAuth from '../middleware/sellerAuth.js';

const withdrawalRouter = express.Router();

// Seller request
withdrawalRouter.post('/request', sellerAuth, requestWithdrawal);

// Seller/Admin lấy danh sách (Dùng chung sellerAuth vì sellerAuth hỗ trợ cả Admin)
withdrawalRouter.get('/list', sellerAuth, getWithdrawals);

// Admin duyệt/từ chối
withdrawalRouter.post('/update-status', sellerAuth, updateWithdrawalStatus); // Dùng sellerAuth vì đã nâng cấp để nhận cả 2 role

export default withdrawalRouter;
