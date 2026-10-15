import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Inventory = ({ token, role }) => {
    const [inventories, setInventories] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT'

    // Modal state
    const [modalType, setModalType] = useState(null); // 'create' | 'import' | 'adjust'
    const [activeItem, setActiveItem] = useState(null);

    // Form inputs for modals
    const [actionForm, setActionForm] = useState({
        warehouseId: '',
        productId: '',
        size: '',
        quantity: '',
        newQuantity: '',
        note: ''
    });

    // 1. Tải danh sách kho và sản phẩm
    const fetchPrerequisites = async () => {
        try {
            const whRes = await axios.get(`${backendUrl}/api/warehouse/list`, { headers: { token } });
            if (whRes.data.success) {
                setWarehouses(whRes.data.warehouses || []);
            }

            const prodRes = await axios.get(`${backendUrl}/api/product/seller-list`, { headers: { token } });
            if (prodRes.data.success) {
                setProducts(prodRes.data.products || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // 2. Tải danh sách tồn kho
    const fetchInventories = async () => {
        setLoading(true);
        try {
            let url = `${backendUrl}/api/inventory?`;
            if (selectedWarehouse) url += `warehouseId=${selectedWarehouse}&`;
            if (selectedProduct) url += `productId=${selectedProduct}&`;

            const res = await axios.get(url, { headers: { token } });
            if (res.data.success) {
                setInventories(res.data.inventories || []);
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

    useEffect(() => {
        fetchPrerequisites();
    }, [token]);

    useEffect(() => {
        fetchInventories();
    }, [selectedWarehouse, selectedProduct, token]);

    // 3. Tính toán thống kê nhanh
    const stats = useMemo(() => {
        const totalItems = inventories.length;
        let totalQuantity = 0;
        let totalReserved = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        inventories.forEach(item => {
            totalQuantity += (item.quantity || 0);
            totalReserved += (item.reservedQuantity || 0);
            if (item.quantity === 0) {
                outOfStockCount++;
            } else if (item.quantity <= 5) {
                lowStockCount++;
            }
        });

        return { totalItems, totalQuantity, totalReserved, lowStockCount, outOfStockCount };
    }, [inventories]);

    // 4. Lọc dữ liệu theo search và stock status
    const filteredInventories = useMemo(() => {
        return inventories.filter(item => {
            const prodName = item.productId?.name?.toLowerCase() || '';
            const size = item.size?.toLowerCase() || '';
            const whName = item.warehouseId?.name?.toLowerCase() || '';
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch = !query || prodName.includes(query) || size.includes(query) || whName.includes(query);

            if (!matchesSearch) return false;

            if (stockFilter === 'LOW') {
                return item.quantity > 0 && item.quantity <= 5;
            }
            if (stockFilter === 'OUT') {
                return item.quantity === 0;
            }
            return true;
        });
    }, [inventories, searchQuery, stockFilter]);

    // 5. Mở Modal Khởi tạo tồn kho mới
    const handleOpenCreateModal = () => {
        const defaultWh = warehouses[0]?._id || '';
        const defaultProd = products[0]?._id || '';
        const prodObj = products.find(p => p._id === defaultProd);
        const defaultSize = prodObj?.sizes?.[0] || '';

        setActionForm({
            warehouseId: defaultWh,
            productId: defaultProd,
            size: defaultSize,
            quantity: 10,
            newQuantity: '',
            note: 'Khởi tạo tồn kho ban đầu'
        });
        setModalType('create');
    };

    // Khi đổi sản phẩm trong modal tạo tồn kho, tự đổi size phù hợp
    const handleModalProductChange = (prodId) => {
        const prodObj = products.find(p => p._id === prodId);
        setActionForm({
            ...actionForm,
            productId: prodId,
            size: prodObj?.sizes?.[0] || ''
        });
    };

    // 6. Mở Modal Nhập Thêm
    const handleOpenImportModal = (item) => {
        setActiveItem(item);
        setActionForm({
            warehouseId: item.warehouseId?._id,
            productId: item.productId?._id,
            size: item.size,
            quantity: '',
            newQuantity: '',
            note: ''
        });
        setModalType('import');
    };

    // 7. Mở Modal Kiểm Kê
    const handleOpenAdjustModal = (item) => {
        setActiveItem(item);
        setActionForm({
            warehouseId: item.warehouseId?._id,
            productId: item.productId?._id,
            size: item.size,
            quantity: '',
            newQuantity: item.quantity,
            note: ''
        });
        setModalType('adjust');
    };

    // 8. Xử lý Submit Form Modal
    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'create') {
                if (!actionForm.warehouseId || !actionForm.productId || !actionForm.size) {
                    toast.error("Vui lòng chọn đầy đủ thông tin kho, sản phẩm và size!");
                    return;
                }
                const res = await axios.post(`${backendUrl}/api/inventory/create`, {
                    warehouseId: actionForm.warehouseId,
                    productId: actionForm.productId,
                    size: actionForm.size,
                    quantity: Number(actionForm.quantity)
                }, { headers: { token } });

                if (res.data.success) {
                    toast.success("Khởi tạo tồn kho thành công!");
                    setModalType(null);
                    fetchInventories();
                } else {
                    toast.error(res.data.message);
                }
            } else if (modalType === 'import') {
                const addQty = Number(actionForm.quantity);
                if (addQty <= 0 || isNaN(addQty)) {
                    toast.error("Số lượng nhập phải lớn hơn 0");
                    return;
                }
                const res = await axios.post(`${backendUrl}/api/inventory/import`, {
                    warehouseId: activeItem.warehouseId?._id,
                    productId: activeItem.productId?._id,
                    size: activeItem.size,
                    quantity: addQty,
                    note: actionForm.note
                }, { headers: { token } });

                if (res.data.success) {
                    toast.success(res.data.message || "Nhập hàng thành công!");
                    setModalType(null);
                    fetchInventories();
                } else {
                    toast.error(res.data.message);
                }
            } else if (modalType === 'adjust') {
                const newQty = Number(actionForm.newQuantity);
                if (newQty < 0 || isNaN(newQty)) {
                    toast.error("Số lượng kiểm kê không được âm");
                    return;
                }
                const res = await axios.post(`${backendUrl}/api/inventory/adjust`, {
                    warehouseId: activeItem.warehouseId?._id,
                    productId: activeItem.productId?._id,
                    size: activeItem.size,
                    newQuantity: newQty,
                    note: actionForm.note
                }, { headers: { token } });

                if (res.data.success) {
                    toast.success(res.data.message || "Điều chỉnh tồn kho thành công!");
                    setModalType(null);
                    fetchInventories();
                } else {
                    toast.error(res.data.message);
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    // Lấy danh sách sizes hợp lệ của sản phẩm đang chọn trong modal tạo mới
    const activeModalProductSizes = useMemo(() => {
        if (!actionForm.productId) return [];
        const prod = products.find(p => p._id === actionForm.productId);
        return prod?.sizes || [];
    }, [actionForm.productId, products]);

    return (
        <div className='flex flex-col gap-6 w-full pb-10'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Quản Lý Tồn Kho</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Theo dõi số lượng hàng khả dụng theo kho và size, nhập thêm hàng và kiểm kê cân kho.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className='bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 transition flex items-center gap-2 text-sm shadow-sm'
                >
                    <span className='text-lg leading-none'>+</span> Khởi Tạo Tồn Kho Mới
                </button>
            </div>

            {/* Thống kê nhanh */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Tổng SKU Tồn</p>
                    <p className='text-2xl font-bold text-gray-800 mt-1'>{stats.totalItems}</p>
                </div>
                <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Khả Dụng</p>
                    <p className='text-2xl font-bold text-green-600 mt-1'>{stats.totalQuantity}</p>
                </div>
                <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Đang Giữ (Đơn Hàng)</p>
                    <p className='text-2xl font-bold text-amber-600 mt-1'>{stats.totalReserved}</p>
                </div>
                <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
                    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Cảnh Báo Hết Hàng</p>
                    <div className='flex items-center gap-2 mt-1'>
                        <span className='text-2xl font-bold text-red-600'>{stats.outOfStockCount}</span>
                        <span className='text-xs text-gray-400'>({stats.lowStockCount} sắp hết)</span>
                    </div>
                </div>
            </div>

            {/* Bộ lọc Toolbar */}
            <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center'>
                <div className='flex flex-wrap items-center gap-3 flex-1'>
                    {/* Tìm kiếm */}
                    <div className='relative min-w-[200px] flex-1 sm:max-w-xs'>
                        <input
                            type='text'
                            placeholder='Tìm sản phẩm, size, kho...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600'
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Lọc theo kho */}
                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className='border px-3 py-2 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black'
                    >
                        <option value=''>Tất cả kho ({warehouses.length})</option>
                        {warehouses.map((w) => (
                            <option key={w._id} value={w._id}>
                                {w.name} {w.isDefault ? '(Mặc định)' : ''}
                            </option>
                        ))}
                    </select>

                    {/* Lọc theo sản phẩm */}
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className='border px-3 py-2 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black max-w-[240px]'
                    >
                        <option value=''>Tất cả sản phẩm</option>
                        {products.map((p) => (
                            <option key={p._id} value={p._id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabs trạng thái tồn kho */}
                <div className='flex items-center gap-1 bg-gray-100 p-1 rounded text-xs'>
                    <button
                        onClick={() => setStockFilter('ALL')}
                        className={`px-3 py-1.5 rounded transition font-medium ${
                            stockFilter === 'ALL' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
                        }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setStockFilter('LOW')}
                        className={`px-3 py-1.5 rounded transition font-medium ${
                            stockFilter === 'LOW' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-600 hover:text-black'
                        }`}
                    >
                        Sắp hết (&le; 5)
                    </button>
                    <button
                        onClick={() => setStockFilter('OUT')}
                        className={`px-3 py-1.5 rounded transition font-medium ${
                            stockFilter === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-black'
                        }`}
                    >
                        Hết hàng (0)
                    </button>
                </div>
            </div>

            {/* Bảng Dữ Liệu Tồn Kho */}
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left text-sm'>
                        <thead className='bg-gray-100 text-gray-700 font-semibold border-b'>
                            <tr>
                                <th className='p-3.5'>Sản Phẩm</th>
                                <th className='p-3.5'>Kho Hàng</th>
                                <th className='p-3.5 text-center'>Size</th>
                                <th className='p-3.5 text-center'>Khả Dụng</th>
                                <th className='p-3.5 text-center'>Đang Giữ</th>
                                <th className='p-3.5 text-center'>Tổng Thực Tế</th>
                                <th className='p-3.5 text-center'>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {loading ? (
                                <tr>
                                    <td colSpan='7' className='p-8 text-center text-gray-500'>
                                        Đang tải dữ liệu tồn kho...
                                    </td>
                                </tr>
                            ) : filteredInventories.length === 0 ? (
                                <tr>
                                    <td colSpan='7' className='p-12 text-center text-gray-500'>
                                        <div className='flex flex-col items-center gap-2'>
                                            <span className='text-3xl'>📦</span>
                                            <p className='font-medium text-gray-700'>Không tìm thấy dữ liệu tồn kho nào</p>
                                            <p className='text-xs text-gray-400'>
                                                Bấm nút "Khởi Tạo Tồn Kho Mới" phía trên để thiết lập số lượng hàng cho sản phẩm.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInventories.map((item) => {
                                    const available = item.quantity || 0;
                                    const reserved = item.reservedQuantity || 0;
                                    const total = available + reserved;

                                    return (
                                        <tr key={item._id} className='hover:bg-gray-50/80 transition'>
                                            {/* Product Info */}
                                            <td className='p-3.5'>
                                                <div className='flex items-center gap-3'>
                                                    <img
                                                        src={item.productId?.image?.[0] || 'https://via.placeholder.com/40'}
                                                        alt=''
                                                        className='w-11 h-11 object-cover rounded border bg-gray-50 flex-shrink-0'
                                                    />
                                                    <div className='min-w-0'>
                                                        <p className='font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs'>
                                                            {item.productId?.name || 'Sản phẩm đã bị xóa'}
                                                        </p>
                                                        <p className='text-xs text-gray-500'>
                                                            Loại: {item.productId?.category || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Warehouse */}
                                            <td className='p-3.5 text-gray-700'>
                                                <div className='flex items-center gap-1.5'>
                                                    <span className='font-medium'>{item.warehouseId?.name || 'Chưa rõ kho'}</span>
                                                    {item.warehouseId?.isDefault && (
                                                        <span className='text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.2 rounded'>
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </div>
                                                <p className='text-xs text-gray-400 truncate max-w-[180px]'>
                                                    {item.warehouseId?.address}
                                                </p>
                                            </td>

                                            {/* Size */}
                                            <td className='p-3.5 text-center'>
                                                <span className='px-2.5 py-1 bg-gray-100 border border-gray-300 font-semibold rounded text-xs text-gray-800'>
                                                    {item.size}
                                                </span>
                                            </td>

                                            {/* Available Quantity */}
                                            <td className='p-3.5 text-center'>
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        available === 0
                                                            ? 'bg-red-100 text-red-700'
                                                            : available <= 5
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                                >
                                                    {available === 0 ? 'Hết hàng (0)' : available}
                                                </span>
                                            </td>

                                            {/* Reserved Quantity */}
                                            <td className='p-3.5 text-center font-medium text-amber-600'>
                                                {reserved > 0 ? (
                                                    <span className='bg-amber-50 px-2 py-0.5 rounded border border-amber-200'>
                                                        {reserved}
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-400'>0</span>
                                                )}
                                            </td>

                                            {/* Total Stock */}
                                            <td className='p-3.5 text-center font-bold text-gray-800'>
                                                {total}
                                            </td>

                                            {/* Actions */}
                                            <td className='p-3.5 text-center'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <button
                                                        onClick={() => handleOpenImportModal(item)}
                                                        className='px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium transition'
                                                        title='Nhập thêm số lượng cho SKU này'
                                                    >
                                                        + Nhập Hàng
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenAdjustModal(item)}
                                                        className='px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-medium transition'
                                                        title='Kiểm kê thực tế và cân chỉnh số lượng'
                                                    >
                                                        Kiểm Kê
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog: Khởi tạo / Nhập hàng / Kiểm kê */}
            {modalType && (
                <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
                    <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn'>
                        <div className='flex justify-between items-center border-b pb-3 mb-4'>
                            <h2 className='text-lg font-bold text-gray-800'>
                                {modalType === 'create' && 'Khởi Tạo Tồn Kho Cho Sản Phẩm'}
                                {modalType === 'import' && `Nhập Hàng Vào Kho: ${activeItem?.warehouseId?.name}`}
                                {modalType === 'adjust' && `Kiểm Kê Tồn Kho: ${activeItem?.warehouseId?.name}`}
                            </h2>
                            <button
                                onClick={() => setModalType(null)}
                                className='text-gray-400 hover:text-gray-600 text-xl font-bold leading-none'
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleActionSubmit} className='space-y-4'>
                            {/* Form Khởi Tạo Tồn Kho */}
                            {modalType === 'create' && (
                                <>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Chọn Kho Hàng *</label>
                                        <select
                                            required
                                            value={actionForm.warehouseId}
                                            onChange={(e) => setActionForm({ ...actionForm, warehouseId: e.target.value })}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        >
                                            <option value='' disabled>-- Chọn kho --</option>
                                            {warehouses.map((w) => (
                                                <option key={w._id} value={w._id}>
                                                    {w.name} {w.isDefault ? '(Mặc định)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Chọn Sản Phẩm *</label>
                                        <select
                                            required
                                            value={actionForm.productId}
                                            onChange={(e) => handleModalProductChange(e.target.value)}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        >
                                            <option value='' disabled>-- Chọn sản phẩm --</option>
                                            {products.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Chọn Size *</label>
                                        {activeModalProductSizes.length > 0 ? (
                                            <select
                                                required
                                                value={actionForm.size}
                                                onChange={(e) => setActionForm({ ...actionForm, size: e.target.value })}
                                                className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                            >
                                                {activeModalProductSizes.map((s) => (
                                                    <option key={s} value={s}>
                                                        Size {s}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type='text'
                                                required
                                                placeholder='VD: S, M, L...'
                                                value={actionForm.size}
                                                onChange={(e) => setActionForm({ ...actionForm, size: e.target.value })}
                                                className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Số Lượng Tồn Ban Đầu *</label>
                                        <input
                                            type='number'
                                            min='0'
                                            required
                                            value={actionForm.quantity}
                                            onChange={(e) => setActionForm({ ...actionForm, quantity: e.target.value })}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        />
                                    </div>
                                </>
                            )}

                            {/* Form Nhập Thêm Hàng */}
                            {modalType === 'import' && (
                                <>
                                    <div className='bg-gray-50 p-3 rounded border text-xs space-y-1'>
                                        <p className='font-semibold text-gray-800'>{activeItem?.productId?.name}</p>
                                        <p className='text-gray-600'>
                                            Size: <b className='text-black'>{activeItem?.size}</b> | Tồn hiện tại: <b className='text-blue-600'>{activeItem?.quantity}</b>
                                        </p>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Số Lượng Nhập Thêm *</label>
                                        <input
                                            type='number'
                                            min='1'
                                            required
                                            placeholder='VD: 20'
                                            value={actionForm.quantity}
                                            onChange={(e) => setActionForm({ ...actionForm, quantity: e.target.value })}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        />
                                        {Number(actionForm.quantity) > 0 && (
                                            <p className='text-xs text-green-600 mt-1'>
                                                Tồn sau khi nhập: <b>{(activeItem?.quantity || 0) + Number(actionForm.quantity)}</b>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Ghi Chú Nhập Kho</label>
                                        <textarea
                                            placeholder='VD: Nhập thêm lô ngày 15/10 từ xưởng...'
                                            value={actionForm.note}
                                            onChange={(e) => setActionForm({ ...actionForm, note: e.target.value })}
                                            rows={2}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        />
                                    </div>
                                </>
                            )}

                            {/* Form Kiểm Kê Điều Chỉnh */}
                            {modalType === 'adjust' && (
                                <>
                                    <div className='bg-gray-50 p-3 rounded border text-xs space-y-1'>
                                        <p className='font-semibold text-gray-800'>{activeItem?.productId?.name}</p>
                                        <p className='text-gray-600'>
                                            Size: <b className='text-black'>{activeItem?.size}</b> | Tồn hệ thống ghi nhận: <b className='text-black'>{activeItem?.quantity}</b>
                                        </p>
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Số Lượng Thực Tế Kiểm Kê (Gán mới) *</label>
                                        <input
                                            type='number'
                                            min='0'
                                            required
                                            value={actionForm.newQuantity}
                                            onChange={(e) => setActionForm({ ...actionForm, newQuantity: e.target.value })}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        />

                                        {actionForm.newQuantity !== '' && (
                                            <div className='text-xs mt-1.5 flex items-center gap-2'>
                                                <span>Chênh lệch:</span>
                                                {Number(actionForm.newQuantity) - (activeItem?.quantity || 0) > 0 ? (
                                                    <span className='font-bold text-green-600'>
                                                        +{Number(actionForm.newQuantity) - (activeItem?.quantity || 0)} (Thừa)
                                                    </span>
                                                ) : Number(actionForm.newQuantity) - (activeItem?.quantity || 0) < 0 ? (
                                                    <span className='font-bold text-red-600'>
                                                        {Number(actionForm.newQuantity) - (activeItem?.quantity || 0)} (Thất thoát / Hư hỏng)
                                                    </span>
                                                ) : (
                                                    <span className='text-gray-500 font-medium'>Khớp dữ liệu (0)</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 mb-1'>Lý Do Điều Chỉnh</label>
                                        <textarea
                                            placeholder='VD: Kiểm đếm cuối tháng phát hiện hư hao...'
                                            value={actionForm.note}
                                            onChange={(e) => setActionForm({ ...actionForm, note: e.target.value })}
                                            rows={2}
                                            className='w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-black'
                                        />
                                    </div>
                                </>
                            )}

                            <div className='flex justify-end gap-3 pt-4 border-t'>
                                <button
                                    type='button'
                                    onClick={() => setModalType(null)}
                                    className='px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50'
                                >
                                    Hủy
                                </button>
                                <button
                                    type='submit'
                                    className='px-5 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition'
                                >
                                    Xác Nhận
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
