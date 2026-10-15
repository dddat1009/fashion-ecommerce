import inventoryModel from "../models/inventoryModel.js"
import productModel from "../models/productModel.js"
import warehouseModel from "../models/warehouseModel.js"
import shopModel from "../models/shopModel.js"
import inventoryLogModel from "../models/inventoryLogModel.js"

// Tạo tồn kho cho sản phẩm mới
const createInventory = async (req, res) => {
    try {
        const { productId, warehouseId, size, quantity } = req.body;
        const parsedQuantity = Number(quantity);

        // 1. Kiểm tra đầu vào
        if (!productId || !warehouseId || !size || quantity === undefined || parsedQuantity < 0 || isNaN(parsedQuantity)) {
            return res.status(400).json({ success: false, message: "Thiếu dữ liệu vui lòng nhập đầy đủ thông tin" });
        }

        // 2. Kiểm tra sản phẩm có tồn tại không
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        // 3. Kiểm tra size có nằm trong danh sách size của sản phẩm không (Kiểm tra TRƯỚC khi tạo)
        if (!product.sizes.includes(size)) {
            return res.status(400).json({ success: false, message: "Size không hợp lệ cho sản phẩm này" });
        }

        // 4. Kiểm tra kho có tồn tại không
        const warehouse = await warehouseModel.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: "Không tìm thấy kho hàng" });
        }

        // 5. Kiểm tra quyền sở hữu kho & shop
        if (req.body.userRole === 'seller' && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            if (!shop) {
                return res.status(404).json({ success: false, message: "Không tìm thấy thông tin shop của bạn" });
            }

            // Kho phải thuộc về shop của seller
            if (warehouse.shopId.toString() !== shop._id.toString()) {
                return res.status(403).json({ success: false, message: "Kho này không thuộc quyền quản lý của shop bạn" });
            }

            // Sản phẩm phải thuộc về seller đang đăng nhập
            if (product.sellerId && product.sellerId.toString() !== req.body.userId.toString()) {
                return res.status(403).json({ success: false, message: "Bạn không có quyền tạo tồn kho cho sản phẩm của người khác" });
            }
        }

        // 6. Kiểm tra sản phẩm tại kho với size này đã được tạo tồn kho chưa
        const existingInventory = await inventoryModel.findOne({ productId, warehouseId, size });
        if (existingInventory) {
            return res.status(400).json({ success: false, message: "Sản phẩm với size này đã có trong kho, vui lòng dùng chức năng nhập thêm hàng" });
        }

        // 7. Tạo tồn kho
        const inventory = await inventoryModel.create({
            productId,
            warehouseId,
            size,
            quantity: Number(quantity)
        });

        // 8. Ghi log nhập kho lần đầu nếu số lượng > 0
        if (Number(quantity) > 0) {
            await inventoryLogModel.create({
                warehouseId,
                productId,
                size,
                type: 'IMPORT',
                quantityChange: Number(quantity),
                note: 'Khởi tạo tồn kho ban đầu'
            });
        }

        res.status(201).json({ success: true, inventory, message: "Tạo tồn kho thành công" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Lấy danh sách tồn kho (Có thể lọc theo warehouseId hoặc productId)
const getInventory = async (req, res) => {
    try {
        const { warehouseId, productId } = req.query;
        let filter = {};
        if (warehouseId) {
            filter.warehouseId = warehouseId;
        } else if (req.body.userRole === 'seller' && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            if (shop) {
                const shopWarehouses = await warehouseModel.find({ shopId: shop._id }).select('_id');
                const whIds = shopWarehouses.map(w => w._id);
                filter.warehouseId = { $in: whIds };
            }
        }
        if (productId) filter.productId = productId;
        const inventories = await inventoryModel.find(filter)
            .populate('productId', 'name image price category sizes')
            .populate('warehouseId', 'name address')
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, inventories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Nhập thêm hàng (Cộng dồn số lượng)
const importStock = async (req, res) => {
    try {
        const { warehouseId, productId, size, quantity, note } = req.body;
        const addQty = Number(quantity);
        if (!warehouseId || !productId || !size || addQty <= 0 || isNaN(addQty)) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ dữ liệu và số lượng phải lớn hơn 0"
            });
        }

        // Kiểm tra quyền sở hữu kho nếu là seller
        if (req.body.userRole === 'seller' && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            const warehouse = await warehouseModel.findById(warehouseId);
            if (!shop || !warehouse || warehouse.shopId.toString() !== shop._id.toString()) {
                return res.status(403).json({ success: false, message: "Kho này không thuộc quyền quản lý của shop bạn" });
            }
        }

        // Tăng số lượng bằng findOneAndUpdate
        const inventory = await inventoryModel.findOneAndUpdate(
            { warehouseId, productId, size },
            { $inc: { quantity: addQty } },
            { new: true }
        );
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Chưa có bản ghi tồn kho cho sản phẩm và size này, vui lòng khởi tạo trước"
            });
        }
        // Ghi log lịch sử nhập hàng
        await inventoryLogModel.create({
            warehouseId,
            productId,
            size,
            type: "IMPORT",
            quantityChange: addQty,
            note: note || `Nhập thêm ${addQty} sản phẩm size ${size}`
        });
        res.status(200).json({
            success: true,
            inventory,
            message: "Nhập hàng thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Điều chỉnh tồn kho khi kiểm kê (Gán số lượng mới)
const adjustInventory = async (req, res) => {
    try {
        const { warehouseId, productId, size, newQuantity, note } = req.body;
        const targetQty = Number(newQuantity);
        if (!warehouseId || !productId || !size || targetQty < 0 || isNaN(targetQty)) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ dữ liệu và số lượng mới không được âm"
            });
        }

        // Kiểm tra quyền sở hữu kho nếu là seller
        if (req.body.userRole === 'seller' && req.body.userId) {
            const shop = await shopModel.findOne({ userId: req.body.userId });
            const warehouse = await warehouseModel.findById(warehouseId);
            if (!shop || !warehouse || warehouse.shopId.toString() !== shop._id.toString()) {
                return res.status(403).json({ success: false, message: "Kho này không thuộc quyền quản lý của shop bạn" });
            }
        }

        const existing = await inventoryModel.findOne({ warehouseId, productId, size });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Chưa có bản ghi tồn kho cho sản phẩm và size này"
            });
        }
        const difference = targetQty - existing.quantity; // Độ lệch (+ hoặc -)
        // Cập nhật số lượng mới bằng $set
        const inventory = await inventoryModel.findOneAndUpdate(
            { warehouseId, productId, size },
            { $set: { quantity: targetQty } },
            { new: true }
        );
        // Ghi log kiểm kê với type ADJUSTMENT
        await inventoryLogModel.create({
            warehouseId,
            productId,
            size,
            type: "ADJUSTMENT",
            quantityChange: difference,
            note: note || `Kiểm kê điều chỉnh từ ${existing.quantity} thành ${targetQty}`
        });
        res.status(200).json({
            success: true,
            inventory,
            message: "Điều chỉnh tồn kho thành công"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tổng tồn kho theo từng size cho 1 sản phẩm (Public cho khách xem ngoài Frontend)
const getProductStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await productModel.findById(productId);
        const inventories = await inventoryModel.find({ productId });

        // Khởi tạo tất cả size của sản phẩm với giá trị 0
        const stockBySize = {};
        if (product && Array.isArray(product.sizes)) {
            product.sizes.forEach(sz => {
                stockBySize[sz] = 0;
            });
        }

        // Gom nhóm cộng dồn: { "S": 10, "M": 0, "L": 5 }
        inventories.forEach(item => {
            stockBySize[item.size] = (stockBySize[item.size] || 0) + (item.quantity || 0);
        });

        res.status(200).json({ success: true, stockBySize });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export { createInventory, getInventory, importStock, adjustInventory, getProductStock };