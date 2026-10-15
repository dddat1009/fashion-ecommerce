import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const ShopProfile = ({ token }) => {
    const [shopData, setShopData] = useState({
        name: '',
        description: '',
        address: '',
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    const fetchShopData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/shop/profile', { headers: { token } });
            if (response.data.success) {
                const shop = response.data.shop;
                setShopData({
                    name: shop.name || '',
                    description: shop.description || '',
                    address: shop.address || '',
                    bankName: shop.bankAccount?.bankName || '',
                    accountNumber: shop.bankAccount?.accountNumber || '',
                    accountName: shop.bankAccount?.accountName || ''
                });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/shop/update-profile', shopData, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchShopData();
    }, [token]);

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 p-8 bg-white rounded shadow-sm border border-gray-200'>
            <h1 className='text-2xl font-bold mb-2'>Hồ Sơ Cửa Hàng</h1>
            <p className='text-gray-500 text-sm mb-4'>Cập nhật thông tin để khách hàng dễ dàng nhận diện và Admin thanh toán tiền.</p>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Tên Cửa Hàng</p>
                <input onChange={(e) => setShopData({ ...shopData, name: e.target.value })} value={shopData.name} className='w-full px-4 py-2 border rounded' type="text" placeholder='Tên cửa hàng' required />
            </div>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Mô Tả Cửa Hàng</p>
                <textarea onChange={(e) => setShopData({ ...shopData, description: e.target.value })} value={shopData.description} className='w-full px-4 py-2 border rounded' placeholder='Mô tả ngắn gọn về cửa hàng...' rows={4}></textarea>
            </div>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Địa Chỉ Kho/Cửa Hàng</p>
                <input onChange={(e) => setShopData({ ...shopData, address: e.target.value })} value={shopData.address} className='w-full px-4 py-2 border rounded' type="text" placeholder='Địa chỉ chi tiết' required />
            </div>

            <hr className='w-full max-w-[600px] my-4' />
            <h2 className='text-xl font-semibold'>Thông Tin Thanh Toán (Rút Tiền)</h2>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Ngân Hàng</p>
                <input onChange={(e) => setShopData({ ...shopData, bankName: e.target.value })} value={shopData.bankName} className='w-full px-4 py-2 border rounded' type="text" placeholder='VD: Vietcombank, MBBank...' />
            </div>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Số Tài Khoản</p>
                <input onChange={(e) => setShopData({ ...shopData, accountNumber: e.target.value })} value={shopData.accountNumber} className='w-full px-4 py-2 border rounded' type="text" placeholder='VD: 10123456789' />
            </div>

            <div className='w-full max-w-[600px]'>
                <p className='mb-2 font-medium'>Tên Chủ Tài Khoản</p>
                <input onChange={(e) => setShopData({ ...shopData, accountName: e.target.value })} value={shopData.accountName} className='w-full px-4 py-2 border rounded' type="text" placeholder='VD: NGUYEN VAN A' />
            </div>

            <button type="submit" className='w-full max-w-[200px] bg-black text-white py-3 mt-4 rounded'>Cập Nhật Hồ Sơ</button>
        </form>
    );
};

export default ShopProfile;
