import withdrawalModel from "../models/withdrawalModel.js";
import shopModel from "../models/shopModel.js";

// Seller yêu cầu rút tiền
const requestWithdrawal = async (req, res) => {
    try {
        const { userId, amount } = req.body; // userId từ sellerAuth
        
        // 1. Tìm shop
        const shop = await shopModel.findOne({ userId });
        if (!shop) {
            return res.json({ success: false, message: "Không tìm thấy Shop!" });
        }

        // 2. Kiểm tra số dư
        if (shop.walletBalance < amount || amount < 10) {
            return res.json({ success: false, message: "Số dư không đủ hoặc số tiền rút quá nhỏ (tối thiểu $10)!" });
        }

        // 3. Trừ tiền trong ví
        shop.walletBalance -= amount;
        await shop.save();

        // 4. Tạo yêu cầu rút tiền
        const newWithdrawal = new withdrawalModel({
            shopId: shop._id,
            amount,
            date: Date.now()
        });
        await newWithdrawal.save();

        res.json({ success: true, message: "Đã gửi yêu cầu rút tiền!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Lấy danh sách phiếu rút tiền
const getWithdrawals = async (req, res) => {
    try {
        const { userId, userRole } = req.body;

        if (userRole === 'admin') {
            // Admin thấy tất cả, kèm thông tin Shop (như tên ngân hàng, stk)
            const withdrawals = await withdrawalModel.find({}).populate('shopId');
            return res.json({ success: true, withdrawals });
        } 
        
        if (userRole === 'seller') {
            const shop = await shopModel.findOne({ userId });
            const withdrawals = await withdrawalModel.find({ shopId: shop._id });
            return res.json({ success: true, withdrawals });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Admin duyệt / từ chối rút tiền
const updateWithdrawalStatus = async (req, res) => {
    try {
        const { withdrawalId, status } = req.body; // status: 'Approved' hoặc 'Rejected'

        const withdrawal = await withdrawalModel.findById(withdrawalId);
        if (!withdrawal) {
             return res.json({ success: false, message: "Không tìm thấy yêu cầu rút tiền!" });
        }

        if (withdrawal.status !== 'Pending') {
             return res.json({ success: false, message: `Yêu cầu này đã được xử lý (${withdrawal.status}), không thể thay đổi lại!` });
        }

        // Nếu trạng thái đang Pending và chuyển sang Rejected -> Hoàn lại tiền cho Shop
        if (withdrawal.status === 'Pending' && status === 'Rejected') {
             await shopModel.findByIdAndUpdate(
                 withdrawal.shopId, 
                 { $inc: { walletBalance: withdrawal.amount } }
             );
        }

        withdrawal.status = status;
        await withdrawal.save();

        res.json({ success: true, message: "Đã cập nhật trạng thái!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { requestWithdrawal, getWithdrawals, updateWithdrawalStatus };
