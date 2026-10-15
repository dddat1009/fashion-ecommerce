import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Withdrawal = ({ token, role }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [amount, setAmount] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    const fetchWithdrawals = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/withdrawal/list', { headers: { token } });
            if (response.data.success) {
                setWithdrawals(response.data.withdrawals.reverse());
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const fetchShopProfile = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/shop/profile', { headers: { token } });
            if (response.data.success) {
                setWalletBalance(response.data.shop.walletBalance);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const requestWithdrawal = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/withdrawal/request', { amount: Number(amount) }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                setAmount('');
                fetchWithdrawals();
                fetchShopProfile(); // Cập nhật lại số dư
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const response = await axios.post(backendUrl + '/api/withdrawal/update-status', { withdrawalId: id, status }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchWithdrawals();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
        if (role === 'seller') {
            fetchShopProfile();
        }
    }, [token, role]);

    return (
        <div className='p-6 bg-white rounded shadow-sm border border-gray-200'>
            <h1 className='text-2xl font-bold mb-4'>Quản lý Rút Tiền</h1>

            {role === 'seller' && (
                <div className='mb-8 p-4 bg-gray-50 border rounded flex flex-col gap-4'>
                    <div>
                        <p className='text-gray-600'>Số dư khả dụng:</p>
                        <p className='text-3xl font-bold text-green-600'>{currency}{walletBalance}</p>
                    </div>
                    <form onSubmit={requestWithdrawal} className='flex items-center gap-2'>
                        <input 
                            type="number" 
                            min="10" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="Số tiền rút (Tối thiểu $10)"
                            className='px-3 py-2 border rounded w-[250px]'
                            required 
                        />
                        <button type="submit" className='bg-black text-white px-6 py-2 rounded'>Rút Tiền</button>
                    </form>
                </div>
            )}

            <h2 className='text-lg font-semibold mb-2'>Lịch Sử Rút Tiền</h2>
            <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left text-gray-500 border'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                        <tr>
                            <th className='px-6 py-3 border'>Ngày</th>
                            {role === 'admin' && <th className='px-6 py-3 border'>Thông tin Shop</th>}
                            <th className='px-6 py-3 border'>Số tiền</th>
                            <th className='px-6 py-3 border'>Trạng thái</th>
                            {role === 'admin' && <th className='px-6 py-3 border'>Hành động</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {withdrawals.map((item, index) => (
                            <tr key={index} className='bg-white border-b'>
                                <td className='px-6 py-4 border'>{new Date(item.date).toLocaleDateString('vi-VN')}</td>
                                {role === 'admin' && (
                                    <td className='px-6 py-4 border'>
                                        <p className='font-bold'>{item.shopId?.name}</p>
                                        {item.shopId?.bankAccount ? (
                                            <p className='text-xs mt-1 text-gray-500'>
                                                {item.shopId.bankAccount.bankName} - {item.shopId.bankAccount.accountNumber} <br/>
                                                Chủ TK: {item.shopId.bankAccount.accountName}
                                            </p>
                                        ) : (
                                            <p className='text-xs mt-1 text-red-500'>Chưa cập nhật NH</p>
                                        )}
                                    </td>
                                )}
                                <td className='px-6 py-4 border font-bold text-blue-600'>{currency}{item.amount}</td>
                                <td className='px-6 py-4 border'>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                {role === 'admin' && (
                                    <td className='px-6 py-4 border'>
                                        {item.status === 'Pending' && (
                                            <div className='flex gap-2'>
                                                <button onClick={() => updateStatus(item._id, 'Approved')} className='bg-green-500 text-white px-3 py-1 rounded text-xs'>Duyệt</button>
                                                <button onClick={() => updateStatus(item._id, 'Rejected')} className='bg-red-500 text-white px-3 py-1 rounded text-xs'>Từ chối</button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {withdrawals.length === 0 && <p className='text-center mt-4 text-gray-500'>Chưa có lịch sử rút tiền nào.</p>}
            </div>
        </div>
    );
};

export default Withdrawal;
