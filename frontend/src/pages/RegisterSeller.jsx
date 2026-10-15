import React, { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const RegisterSeller = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (!token) {
                toast.error("Vui lòng đăng nhập trước khi mở shop!");
                return;
            }

            const response = await axios.post(backendUrl + '/api/shop/register', {
                name,
                email,
                address,
                description
            }, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                // Sau khi đăng ký thành công, điều hướng về trang chủ
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>Đăng ký Mở Shop</p>
                <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
            </div>

            <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Tên cửa hàng' required />
            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email cửa hàng' required />
            <input onChange={(e) => setAddress(e.target.value)} value={address} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Địa chỉ lấy hàng' required />
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-3 py-2 border border-gray-800' placeholder='Mô tả ngắn gọn về shop (tùy chọn)' rows="3"></textarea>

            <button type="submit" className='bg-black text-white font-light px-8 py-2 mt-4'>MỞ SHOP NGAY</button>
        </form>
    );
};

export default RegisterSeller;
