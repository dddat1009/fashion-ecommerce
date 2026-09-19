# Lộ trình Triển khai Hệ thống Multi-Vendor (Đa người bán)

Dự án được chia thành 4 giai đoạn (Sprints) tập trung vào MVP (Sản phẩm khả dụng tối thiểu).

## Giai đoạn 1 (Tuần 1-2): Tái cấu trúc Database & Phân quyền
- **Trọng tâm**: Thiết kế lại Schema cho Users (Thêm Role: `user`, `seller`, `admin`), Shops. Cập nhật middleware xác thực JWT.
- **Kết quả đầu ra**: Database mới đã sẵn sàng; API Auth phân luồng thành công.

## Giai đoạn 2 (Tuần 3-4): Tách luồng Đơn hàng (Split Order)
- **Trọng tâm**: Viết lại logic Giỏ hàng và Thanh toán. Tách 1 đơn hàng lớn (Master) thành các đơn nhỏ (Sub-orders) theo từng `shopId`.
- **Kết quả đầu ra**: Khách hàng có thể đặt 1 lần cho nhiều shop; Database lưu trữ độc lập.

## Giai đoạn 3 (Tuần 5-6): Giao diện Quản trị & Cửa hàng
- **Trọng tâm**: Xây dựng Seller Center (Quản lý shop riêng). Dùng chung base code với Admin hiện tại.
- **Kết quả đầu ra**: Hoàn thiện luồng UI/UX từ người mua đến người bán và người quản trị.

## Giai đoạn 4 (Tuần 7-8): Đóng gói & Tự động hóa
- **Trọng tâm**: Viết script CI/CD cơ bản (Docker đã có sẵn). 
- **Kết quả đầu ra**: Ứng dụng chạy ổn định trên môi trường Cloud, sẵn sàng demo.

---

## Quản trị Rủi ro & Giải pháp (Risk Management)

### Rủi ro 1: Rò rỉ dữ liệu chéo (Cross-tenant Data Leak)
- **Vấn đề**: Người bán A dùng Postman truyền ID sản phẩm của người bán B để chỉnh sửa giá.
- **Giải pháp**: Backend không tin tưởng `shopId` từ client. Luôn lấy `userId/shopId` từ JWT Token giải mã trên server để truy vấn.

### Rủi ro 2: Bế tắc logic Hủy/Hoàn tiền
- **Vấn đề**: Khách mua 3 sản phẩm từ 3 shop chung 1 lần, nhưng chỉ muốn hủy 1 sản phẩm.
- **Giải pháp**: Khách hàng quản lý trạng thái theo từng Sub-order. Việc hủy đơn chỉ áp dụng cho toàn bộ sản phẩm của 1 Shop cụ thể.

### Rủi ro 3: Phình to scope (Scope Creep)
- **Vấn đề**: Mất thời gian làm hệ thống ví điện tử chia tiền tự động.
- **Giải pháp**: MVP dùng đối soát thủ công. Admin nhận toàn bộ tiền qua Stripe, sau đó tính toán và chuyển khoản thủ công cho Seller.
