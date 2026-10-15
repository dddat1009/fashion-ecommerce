import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import inventoryModel from "../models/inventoryModel.js"
import shopModel from "../models/shopModel.js"
// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url

            })
        )

        const productData = {
            sellerId: req.body.userId,
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()


        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }


}

// function for list product cho khach hang xem
const listProducts = async (req, res) => {
    try {
        const products = await productModel.aggregate([
            {
                $lookup: {
                    from: "shops", // MongoDB tự động thêm 's' vào cuối (shop -> shops)
                    localField: "sellerId",
                    foreignField: "userId",
                    as: "shopInfo"
                }
            },
            {
                $unwind: {
                    path: "$shopInfo",
                    preserveNullAndEmptyArrays: true // Giữ lại các sản phẩm không thuộc shop nào (ví dụ Admin đăng)
                }
            }
        ]);
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const listSellerProducts = async (req, res) => {
    try {
        let queryCondition = {};
        if (req.body.userRole === 'seller') {
            queryCondition = { sellerId: req.body.userId };
        }

        const products = await productModel.find(queryCondition);
        res.json({ success: true, products })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        const query = req.body.userRole === 'admin' 
            ? { _id: req.body.id } 
            : { _id: req.body.id, sellerId: req.body.userId };

        const deletedProduct = await productModel.findOneAndDelete(query);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm hoặc bạn không có quyền xóa" });
        }

        // Xóa tồn kho liên quan đến sản phẩm này để tránh rác dữ liệu
        await inventoryModel.deleteMany({ productId: req.body.id });

        res.json({ success: true, message: "Product Removed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({ success: false, message: "Không tìm thấy sản phẩm" })
        }

        let shopInfo = null;
        if (product.sellerId) {
            shopInfo = await shopModel.findOne({ userId: product.sellerId }).select("name email address avatar rating isVerified")
        }

        res.json({
            success: true,
            product: {
                ...product.toObject(),
                shopInfo: shopInfo || { name: "Forever Store" }
            }
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, listSellerProducts }