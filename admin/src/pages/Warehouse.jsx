import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Warehouse = ({ token, role }) => {
    const [warehouses, setWarehouses] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        isDefault: false
    });

    // 1. Tải thông tin Shop (đối với role seller)
    const fetchShop = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/shop/profile`, { headers: { token } });
            if (res.data.success && res.data.shop) {
                setShop(res.data.shop);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // 2. Tải danh sách kho
    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/warehouse/list`, { headers: { token } });
            if (res.data.success) {
                setWarehouses(res.data.warehouses || []);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Xử lý mở modal thêm mới
    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({
            name: '',
            phone: '',
            address: '',
            city: '',
            isDefault: warehouses.length === 0
        });
        setShowModal(true);
    };

    // 4. Xử lý mở modal sửa
    const handleOpenEditModal = (wh) => {
        setIsEditing(true);
        setEditId(wh._id);
        setFormData({
            name: wh.name,
            phone: wh.phone,
            address: wh.address,
            city: wh.city,
            isDefault: wh.isDefault
        });
        setShowModal(true);
    };

    // 5. Submit Thêm hoặc Cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const res = await axios.post(`${backendUrl}/api/warehouse/update`, {
                    id: editId,
                    ...formData
                }, { headers: { token } });

                if (res.data.success) {
                    toast.success("Cập nhật kho hàng thành công!");
                    setShowModal(false);
                    fetchWarehouses();
                } else {
                    toast.error(res.data.message);
                }
            } else {
                const payload = {
                    ...formData,
                    shopId: shop?._id
                };
                const res = await axios.post(`${backendUrl}/api/warehouse/create`, payload, { headers: { token } });

                if (res.data.success) {
                    toast.success("Tạo kho hàng thành công!");
                    setShowModal(false);
                    fetchWarehouses();
                } else {
                    toast.error(res.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // 6. Đặt kho làm mặc định nhanh
    const handleSetDefault = async (wh) => {
        if (wh.isDefault) return;
        try {
            const res = await axios.post(`${backendUrl}/api/warehouse/update`, {
                id: wh._id,
                isDefault: true
            }, { headers: { token } });
            if (res.data.success) {
                toast.success(`Đã đặt "${wh.name}" làm kho xuất hàng mặc định!`);
                fetchWarehouses();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // 7. Xóa kho
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa kho "${name}"?`)) return;
        try {
            const res = await axios.post(`${backendUrl}/api/warehouse/delete`, { id }, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message || "Xóa kho thành công");
                fetchWarehouses();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchWarehouses();
        if (role === 'seller') {
            fetchShop();
        }
    }, [token, role]);

    return (
        <div className='flex flex-col gap-6 w-full pb-10'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Quản Lý Danh Sách Kho</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        {shop ? `Cửa hàng: ${shop.name} | ` : ''}Quản lý các địa điểm lưu kho, xuất hàng cho đơn hàng của bạn.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className='bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 transition flex items-center gap-2 text-sm shadow-sm'
                >
                    <span className='text-lg leading-none'>+</span> Thêm Kho Mới
                </button>
            </div>

            {/* Warehouse Cards Grid */}
            {loading ? (
                <div className='text-center py-12 text-gray-500'>Đang tải danh sách kho...</div>
            ) : warehouses.length === 0 ? (
                <div className='bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center gap-3'>
                    <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold'>
                        🏢
                    </div>
                    <h3 className='text-base font-semibold text-gray-700'>Chưa có kho hàng nào</h3>
                    <p className='text-sm text-gray-500 max-w-md'>
                        Bạn cần tạo ít nhất một kho hàng để có thể nhập hàng và gán tồn kho cho các sản phẩm của shop.
                    </p>
                    <button
                        onClick={handleOpenCreateModal}
                        className='mt-2 bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800'
                    >
                        Tạo Kho Đầu Tiên
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {warehouses.map((wh) => (
                        <div
                            key={wh._id}
                            className={`bg-white rounded-lg border p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                                wh.isDefault ? 'border-green-500 ring-1 ring-green-500/20' : 'border-gray-200'
                            }`}
                        >
                            <div>
                                <div className='flex justify-between items-start gap-2 mb-3'>
                                    <h3 className='font-semibold text-lg text-gray-800 leading-snug'>{wh.name}</h3>
                                    {wh.isDefault ? (
                                        <span className='bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap'>
                                            ✓ Kho Mặc Định
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleSetDefault(wh)}
                                            className='text-xs text-gray-400 hover:text-green-600 border border-dashed border-gray-300 hover:border-green-500 px-2 py-0.5 rounded transition'
                                            title='Nhấn để chọn làm kho mặc định'
                                        >
                                            Đặt mặc định
                                        </button>
                                    )}
                                </div>

                                <div className='space-y-2 text-sm text-gray-600 mb-4'>
                                    <p className='flex items-center gap-2'>
                                        <span className='text-gray-400'>📞 Hotline:</span>
                                        <span className='font-medium text-gray-700'>{wh.phone}</span>
                                    </p>
                                    <p className='flex items-start gap-2'>
                                        <span className='text-gray-400 whitespace-nowrap'>📍 Địa chỉ:</span>
                                        <span className='text-gray-700'>{wh.address}, {wh.city}</span>
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <span className='text-gray-400'>Trạng thái:</span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                            wh.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {wh.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-100 text-sm'>
                                <button
                                    onClick={() => handleOpenEditModal(wh)}
                                    className='text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded transition'
                                >
                                    Chỉnh Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(wh._id, wh.name)}
                                    className='text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition'
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Thêm / Chỉnh Sửa Kho */}
            {showModal && (
                <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fadeIn'>
                        <div className='flex justify-between items-center border-b pb-3 mb-4'>
                            <h2 className='text-lg font-bold text-gray-800'>
                                {isEditing ? 'Chỉnh Sửa Kho Hàng' : 'Tạo Kho Hàng Mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className='text-gray-400 hover:text-gray-600 text-xl font-bold leading-none'
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <label className='block text-xs font-semibold text-gray-700 mb-1'>Tên Kho Hàng *</label>
                                <input
                                    type='text'
                                    required
                                    placeholder='VD: Kho Tổng Hà Nội, Kho Q1 TP.HCM'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-semibold text-gray-700 mb-1'>Số Điện Thoại Liên Hệ *</label>
                                <input
                                    type='text'
                                    required
                                    placeholder='VD: 0987654321'
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                />
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>Tỉnh / Thành Phố *</label>
                                    <input
                                        type='text'
                                        required
                                        placeholder='Hà Nội, TP.HCM...'
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 mb-1'>Địa Chỉ Chi Tiết *</label>
                                    <input
                                        type='text'
                                        required
                                        placeholder='Số nhà, tên đường...'
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                    />
                                </div>
                            </div>

                            <div className='flex items-center gap-2 pt-2'>
                                <input
                                    type='checkbox'
                                    id='isDefaultModal'
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className='w-4 h-4 rounded text-black focus:ring-black'
                                />
                                <label htmlFor='isDefaultModal' className='text-sm text-gray-700 cursor-pointer'>
                                    Đặt làm kho xuất hàng mặc định của shop
                                </label>
                            </div>

                            <div className='flex justify-end gap-3 pt-4 border-t'>
                                <button
                                    type='button'
                                    onClick={() => setShowModal(false)}
                                    className='px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50'
                                >
                                    Hủy Bỏ
                                </button>
                                <button
                                    type='submit'
                                    className='px-5 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition'
                                >
                                    {isEditing ? 'Lưu Thay Đổi' : 'Tạo Kho'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouse;
