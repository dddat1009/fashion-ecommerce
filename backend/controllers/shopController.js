import shopModel from "../models/shopModel.js";
import userModel from "../models/userModel.js";

// Đăng ký mở Shop mới (dành cho User thường)
const registerShop = async (req, res) => {
    try {
        // req.body.userId được middleware authUser cấp
        const { userId, name, description, email, address } = req.body;

        // 1. Kiểm tra xem user này đã có shop chưa
        const existingShop = await shopModel.findOne({ userId });
        if (existingShop) {
            return res.json({ success: false, message: "Bạn đã đăng ký shop rồi!" });
        }

        // 2. Tạo Shop mới
        const shopData = {
            userId,
            name,
            description,
            email,
            address
        };

        const newShop = new shopModel(shopData);
        await newShop.save();

        // 3. Nâng cấp role của User thành 'seller'
        await userModel.findByIdAndUpdate(userId, { role: 'seller' });

        res.json({ success: true, message: "Đăng ký mở Shop thành công! Vui lòng đăng nhập vào trang Admin." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Lấy thông tin Shop của Seller hiện tại (dành cho Admin Panel)
const getShopProfile = async (req, res) => {
    try {
        const { userId } = req.body; // Được cấp bởi sellerAuth

        const shop = await shopModel.findOne({ userId });
        if (!shop) {
            return res.json({ success: false, message: "Không tìm thấy thông tin Shop" });
        }

        res.json({ success: true, shop });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Cập nhật thông tin Shop
const updateShopProfile = async (req, res) => {
    try {
        const { userId, name, description, address, bankName, accountNumber, accountName } = req.body;

        const updateData = {
            name,
            description,
            address,
            bankAccount: {
                bankName,
                accountNumber,
                accountName
            }
        };

        // Tìm và cập nhật shop dựa trên userId
        const updatedShop = await shopModel.findOneAndUpdate(
            { userId },
            updateData,
            { new: true } // Trả về data mới sau khi update
        );

        if (!updatedShop) {
            return res.json({ success: false, message: "Không tìm thấy thông tin Shop" });
        }

        res.json({ success: true, message: "Cập nhật hồ sơ Shop thành công", shop: updatedShop });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { registerShop, getShopProfile, updateShopProfile };
