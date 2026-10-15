# 🛍️ Nền Tảng Thương Mại Điện Tử Đa Người Bán (Multi-Vendor E-Commerce Platform)

Hệ thống sàn thương mại điện tử hiện đại, hỗ trợ mô hình đa người bán (Multi-Vendor), tích hợp quản lý kho hàng đa chi nhánh, kiểm soát xuất - nhập - tồn kho tự động theo thời gian thực, tách đơn hàng (Split Orders), hệ thống ví doanh thu và thanh toán trực tuyến.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🏢 Quản Lý Kho Hàng & Tồn Kho (Warehouse & Inventory)
- **Quản lý đa kho hàng**: Mỗi Shop có thể sở hữu nhiều kho hàng, thiết lập kho xuất hàng mặc định (`isDefault`).
- **Kiểm soát tồn kho theo Size**: Quản lý số lượng khả dụng (`quantity`) và số lượng đang giữ cho đơn hàng (`reservedQuantity`) chi tiết đến từng kích cỡ sản phẩm.
- **Khởi tạo & Nhập hàng**: Dễ dàng tạo mới tồn kho hoặc cộng dồn số lượng hàng về kho (`/api/inventory/import`).
- **Kiểm kê & Cân kho**: Điều chỉnh số lượng thực tế kiểm đếm, tự động tính chênh lệch thừa/thiếu và ghi lại lý do kiểm kê.
- **Lưu vết biến động kho (Stock Logs)**: Tự động ghi lại toàn bộ lịch sử: `IMPORT` (Nhập kho), `EXPORT_ORDER` (Xuất bán), `CANCEL_ORDER` (Hoàn hàng hủy), `ADJUSTMENT` (Kiểm kê).
- **Cập nhật thời gian thực trên Frontend**: Tự động gạch ngang và vô hiệu hóa nút Size đã hết hàng; cảnh báo còn ít sản phẩm khi khách xem hàng.

### 2. 🏪 Hệ Thống Đa Người Bán (Multi-Vendor)
- **Phân quyền 3 cấp (Role-Based Access Control)**:
  - **Khách hàng (User)**: Xem sản phẩm, đặt hàng, áp dụng voucher, theo dõi đơn hàng, đăng ký nâng cấp mở Shop.
  - **Người bán (Seller)**: Quản lý hồ sơ Shop, danh sách sản phẩm, quản lý kho hàng, xuất nhập tồn, quản lý đơn hàng của shop, tạo yêu cầu rút tiền từ ví.
  - **Quản trị viên (Admin)**: Quản lý toàn bộ hệ thống, duyệt/từ chối yêu cầu rút tiền của Seller, tạo voucher khuyến mãi toàn sàn, xem thống kê tổng thể.
- **Bảo mật Tenant chéo (Anti Cross-tenant Leak)**: Mọi thao tác kho, tồn kho, sản phẩm và đơn hàng đều được kiểm tra quyền sở hữu thông qua JWT Token trên server.

### 3. 📦 Tách Đơn Hàng Thông Minh (Split Orders)
- Khách hàng có thể mua sản phẩm từ nhiều Shop khác nhau trong cùng 1 giỏ hàng.
- Hệ thống tự động tách thành các đơn hàng con độc lập theo từng `shopId`.
- **Tự động trừ kho**: Trừ số lượng tồn kho khả dụng ngay khi đặt hàng thành công.
- **Tự động hoàn kho**: Tự động hoàn trả số lượng vào kho khi đơn hàng bị Hủy (`Cancelled`).

### 4. 💳 Ví Tiền & Rút Tiền (Wallet & Withdrawal)
- Khi đơn hàng hoàn thành (`Delivered`), tiền tự động được giải ngân vào ví người bán (`walletBalance`).
- Người bán gửi yêu cầu rút tiền về tài khoản ngân hàng.
- Admin xem xét thông tin tài khoản và duyệt (`Approved`) hoặc từ chối (`Rejected` - tự động hoàn tiền về ví người bán).

### 5. 🎟️ Mã Giảm Giá (Vouchers)
- Quản lý mã giảm giá theo tỷ lệ phần trăm hoặc số tiền cố định.
- Giới hạn đơn hàng tối thiểu, mức giảm tối đa, thời hạn hiệu lực và số lần sử dụng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend & Admin** | React 19, Vite, Tailwind CSS, React Router v7, React Toastify, Recharts, Lucide Icons |
| **Backend API** | Node.js, Express.js (ES Modules), JWT Authentication, Multer |
| **Database & Cache** | MongoDB (Mongoose ODM), Redis |
| **Lưu trữ & Thanh toán** | Cloudinary (Hình ảnh), Stripe API (Thanh toán quốc tế) |
| **Triển khai & Vận hành** | Docker, Docker Compose |

---

## 📁 Cấu Trúc Dự Án

```
doan/
├── admin/                  # Giao diện Quản trị dành cho Admin & Người Bán (Port: 5174)
│   ├── src/
│   │   ├── pages/          # Dashboard, Warehouse, Inventory, Orders, List, Add, Voucher...
│   │   ├── components/     # Navbar, Sidebar, Login...
│   │   └── App.jsx
│   └── package.json
│
├── frontend/               # Giao diện Cửa hàng dành cho Khách hàng (Port: 5173)
│   ├── src/
│   │   ├── pages/          # Home, Collection, Product, Cart, PlaceOrder, Orders, Verify...
│   │   ├── components/     # BestSeller, LatestCollection, CartTotal...
│   │   └── context/        # ShopContext (Quản lý giỏ hàng, xác thực, API)
│   └── package.json
│
├── backend/                # Server REST API (Port: 4000)
│   ├── config/             # Kết nối MongoDB, Cloudinary, Redis
│   ├── controllers/        # Điều khiển: inventory, warehouse, order, product, shop, voucher...
│   ├── middleware/         # Xác thực: authUser, sellerAuth, adminAuth
│   ├── models/             # Mongoose Schemas: inventory, warehouse, order, product, shop...
│   ├── routes/             # API Endpoints
│   ├── assignProducts.js   # Script tự động phân bổ sản phẩm vào các shop
│   └── server.js
│
├── docker-compose.yml      # Cấu hình container hóa Redis, Backend, Frontend, Admin
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Cách 1: Khởi chạy nhanh bằng Docker Compose (Khuyên Dùng)

Đảm bảo bạn đã cài đặt Docker và Docker Desktop trên máy:

```bash
# 1. Clone repository về máy
git clone <URL_REPOSITORY>
cd doan

# 2. Khởi chạy toàn bộ hệ thống (Redis, Backend, Frontend, Admin)
docker-compose up --build
```

Sau khi chạy xong:
- **Giao diện Khách hàng**: [http://localhost:5173](http://localhost:5173)
- **Giao diện Quản trị / Người Bán**: [http://localhost:5174](http://localhost:5174)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

---

### Cách 2: Khởi chạy thủ công từng dịch vụ (Development Mode)

#### 1. Cấu hình Backend:
Tạo file `backend/.env`:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/e-commerce"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_SECRET_KEY="your_secret_key"
CLOUDINARY_NAME="your_cloud_name"
JWT_SECRET="your_jwt_secret"
ADMIN_EMAIL="admin@forever.com"
ADMIN_PASSWORD="your_admin_password"
STRIPE_SECRET_KEY="your_stripe_key"
```

Cài đặt và chạy server:
```bash
cd backend
npm install
npm run server    # Chạy trên port 4000
```

#### 2. Cấu hình Admin:
```bash
cd admin
npm install
npm run dev       # Chạy trên port 5173 hoặc 5174
```

#### 3. Cấu hình Frontend:
```bash
cd frontend
npm install
npm run dev       # Chạy trên port 5173
```

---

## 📋 Danh Sách Tài Khoản Thử Nghiệm

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Admin Quản Trị** | `admin@forever.com` | `qwerty123` | Toàn quyền hệ thống, duyệt rút tiền, tạo voucher toàn sàn |
| **Seller (SHOP A)** | `shop1@gmail.com` | `12345678` | Quản lý SHOP A, quản lý kho & tồn kho riêng |
| **Seller (shop B)** | `shop2@gmail.com` | `12345678` | Quản lý shop B, quản lý kho & tồn kho riêng |
| **Seller (SHOP C)** | `shop3@gmail.com` | `12345678` | Quản lý SHOP C, quản lý kho & tồn kho riêng |

---

## 📖 API Reference Tóm Tắt

### Kho Hàng (Warehouse)
- `GET /api/warehouse/list` - Lấy danh sách kho hàng (Headers: `token`).
- `POST /api/warehouse/create` - Tạo kho mới (`shopId, name, address, city, phone, isDefault`).
- `POST /api/warehouse/update` - Cập nhật thông tin kho hàng.
- `POST /api/warehouse/delete` - Xóa kho hàng (chỉ cho phép khi tồn kho = 0).

### Tồn Kho (Inventory)
- `GET /api/inventory` - Lấy danh sách tồn kho (lọc theo `warehouseId`, `productId`).
- `GET /api/inventory/stock/:productId` - Lấy số lượng tồn theo từng Size (Public cho khách xem).
- `POST /api/inventory/create` - Khởi tạo tồn kho ban đầu cho sản phẩm & size.
- `POST /api/inventory/import` - Nhập thêm số lượng hàng (cộng dồn).
- `POST /api/inventory/adjust` - Cân kho / Kiểm kê thực tế (gán số lượng mới & tính chênh lệch).

### Đơn Hàng (Orders)
- `POST /api/order/place` - Đặt hàng thanh toán khi nhận hàng (COD), tự động tách đơn theo Shop và trừ kho.
- `POST /api/order/stripe` - Đặt hàng qua cổng thanh toán Stripe.
- `POST /api/order/list` - Lấy danh sách đơn hàng cho Admin & Người bán.
- `POST /api/order/status` - Cập nhật trạng thái đơn (tự động hoàn kho khi `Cancelled`, giải ngân ví khi `Delivered`).

---

## 📝 Giấy Phép
Dự án được phát triển phục vụ mục đích học tập và xây dựng nền tảng thương mại điện tử đa người bán.
