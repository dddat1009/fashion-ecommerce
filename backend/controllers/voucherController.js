import voucherModel from "../models/voucherModel.js";

// Route for creating a new voucher
const createVoucher = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit } = req.body;

        if (!code || !discountType || discountValue === undefined) {

            return res.status(400).json({
                success: false,
                message: "missing required fields"
            });
        }

        const existingVoucher = await voucherModel.findOne({
            code: code.toUpperCase(),
        });

        if (existingVoucher) {
            return res.status(400).json({
                success: false,
                message: "Voucher code already exists",
            });
        }

        const voucher = await voucherModel.create({
            code: code.toUpperCase(),
            discountType, discountValue, minOrderValue, maxDiscount, startDate, endDate, usageLimit
        });

        res.status(201).json({
            success: true,
            message: "Voucher created successfully",
            voucher,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,

        });
    }
};

const getVouchers = async (req, res) => {
    try {
        const vouchers = await voucherModel.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true, 
            vouchers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await voucherModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher updated successfully",
      voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await voucherModel.findByIdAndDelete(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const applyVoucher = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
    }

    const voucher = await voucherModel.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại" });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã bị vô hiệu hóa" });
    }

    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
      return res.status(400).json({ success: false, message: "Mã giảm giá không nằm trong thời gian áp dụng hoặc đã hết hạn" });
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
      return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu để áp dụng là ${voucher.minOrderValue}` });
    }

    res.status(200).json({
      success: true,
      message: "Áp dụng mã giảm giá thành công",
      voucher: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscount: voucher.maxDiscount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createVoucher, getVouchers, updateVoucher, deleteVoucher, applyVoucher };
