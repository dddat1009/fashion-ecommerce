import warehouseModel from "../models/warehouseModel.js";
import shopModel from "../models/shopModel.js";
import inventoryModel from "../models/inventoryModel.js";

// Create 
const createWarehouse = async (req, res) => {
    try {
        let { shopId, name, address, city, phone, isDefault } = req.body;

        // Tự động tìm shopId nếu seller gọi mà không truyền shopId
        if (!shopId && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            if (shop) {
                shopId = shop._id;
            }
        }

        if (!shopId || !name || !address || !city || !phone) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc để tạo kho hàng"
            });
        }
        let shouldBeDefault = isDefault === true || isDefault === "true";

        const warehousecount = await warehouseModel.countDocuments({ shopId });
        if (warehousecount === 0) {
            shouldBeDefault = true;
        }

        // If isDefault is true, set all other warehouses of the shop to false
        if (shouldBeDefault) {
            await warehouseModel.updateMany({ shopId: shopId }, { isDefault: false });
        }

        const warehouse = await warehouseModel.create({
            shopId,
            name,
            address,
            city,
            phone,
            isDefault: shouldBeDefault
        });

        res.status(201).json({ success: true, warehouse, message: "Tạo kho hàng thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// READ 
const getWarehouses = async (req, res) => {
    try {
        let shopId = req.query.shopId || req.body.shopId;

        // Nếu là seller và không chỉ định shopId, tự động lấy theo shop của seller
        if (!shopId && req.body.userRole === 'seller' && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            if (shop) {
                shopId = shop._id;
            }
        }

        const query = shopId ? { shopId } : {};
        const warehouses = await warehouseModel.find(query).sort({ isDefault: -1, createdAt: -1 });
        res.status(200).json({ success: true, warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateWarehouse = async (req, res) => {
    try {
        const { id, name, address, city, phone, isDefault } = req.body;
        
        const existingWarehouse = await warehouseModel.findById(id);
        if (!existingWarehouse) {
            return res.status(404).json({ success: false, message: "Không tìm thấy kho hàng" });
        }

        let isDefaultBool = existingWarehouse.isDefault;
        if (isDefault !== undefined) {
            isDefaultBool = isDefault === true || isDefault === "true";
            if (isDefaultBool) {
                // Bỏ mặc định các kho khác cùng shop
                await warehouseModel.updateMany({ shopId: existingWarehouse.shopId }, { isDefault: false });
            }
        }

        const warehouse = await warehouseModel.findByIdAndUpdate(id, {
            name: name ?? existingWarehouse.name,
            address: address ?? existingWarehouse.address,
            city: city ?? existingWarehouse.city,
            phone: phone ?? existingWarehouse.phone,
            isDefault: isDefaultBool
        }, { new: true });

        res.status(200).json({ success: true, warehouse, message: "Cập nhật kho hàng thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.body;

        // 1. Kiểm tra xem kho hàng còn tồn kho sản phẩm khả dụng không
        const activeStockCount = await inventoryModel.countDocuments({ warehouseId: id, quantity: { $gt: 0 } });
        if (activeStockCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa kho hàng đang còn tồn kho sản phẩm! Vui lòng kiểm kê hoặc chuyển hết tồn kho về 0 trước."
            });
        }

        const warehouse = await warehouseModel.findByIdAndDelete(id);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: "Không tìm thấy kho hàng" });
        }

        // 2. Nếu xóa kho mặc định, tự động chuyển một kho khác của shop thành kho mặc định mới
        if (warehouse.isDefault) {
            const anotherWh = await warehouseModel.findOne({ shopId: warehouse.shopId });
            if (anotherWh) {
                anotherWh.isDefault = true;
                await anotherWh.save();
            }
        }

        // 3. Xóa các bản ghi tồn kho rỗng (quantity = 0) của kho này để dọn rác
        await inventoryModel.deleteMany({ warehouseId: id });

        res.status(200).json({ success: true, message: "Xóa kho hàng thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { createWarehouse, getWarehouses, updateWarehouse, deleteWarehouse };