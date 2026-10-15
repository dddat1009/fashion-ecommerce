import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js'

const sellerAuth = async (req, res, next) => {
    try {
        const { token } = req.headers

        if (!token) {
            return res.json({ success: false, message: 'not Authorize Login Again' });
        }

        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET)
            
            // Đảm bảo req.body tồn tại (trên GET request đôi khi req.body bị undefined)
            req.body = req.body || {};

            // XỬ LÝ LỖI: Kiểm tra nếu token này là của Admin gốc (nằm trong .env)
            if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
                req.body.userRole = 'admin';
                return next();
            }

            req.body.userId = token_decode.id
            const user = await userModel.findById(token_decode.id)
            if (!user) {
                return res.json({ success: false, message: 'Không tìm thấy thông tin người dùng' })
            }
            if (user.role !== 'seller' && user.role !== 'admin') {
                return res.json({ success: false, message: 'Bạn không có quyển truy cập thông tin người bán' })
            }
            req.body.userId = token_decode.id
            req.body.userRole = user.role;
            next()
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

export default sellerAuth 