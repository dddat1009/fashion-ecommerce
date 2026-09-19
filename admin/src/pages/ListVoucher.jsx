import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const ListVoucher = ({ token }) => {
  const [list, setList] = useState([])

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/voucher/list')
      if (response.data.success) {
        setList(response.data.vouchers)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeVoucher = async (id) => {
    try {
      const response = await axios.delete(backendUrl + '/api/voucher/delete/' + id, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchVouchers()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-xl font-bold text-gray-800 mb-2'>Danh Sách Mã Giảm Giá</h2>

      <div className='overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm'>
        <table className='w-full text-sm text-left text-gray-500'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200'>
            <tr>
              <th scope="col" className='px-6 py-3'>Mã Voucher</th>
              <th scope="col" className='px-6 py-3'>Mức Giảm</th>
              <th scope="col" className='px-6 py-3'>Điều kiện</th>
              <th scope="col" className='px-6 py-3'>Thời hạn</th>
              <th scope="col" className='px-6 py-3 text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => {
              const isExpired = new Date(item.endDate) < new Date();
              return (
                <tr key={index} className='bg-white border-b hover:bg-gray-50'>
                  <td className='px-6 py-4 font-medium text-gray-900'>
                    {item.code}
                    {isExpired && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded">Hết hạn</span>}
                  </td>
                  <td className='px-6 py-4'>
                    {item.discountType === 'percentage' ? `${item.discountValue}%` : `${currency}${item.discountValue}`}
                    {item.discountType === 'percentage' && item.maxDiscount ? ` (Tối đa ${currency}${item.maxDiscount})` : ''}
                  </td>
                  <td className='px-6 py-4'>
                    Đơn tối thiểu: {currency}{item.minOrderValue}
                    <br />
                    <span className="text-xs text-gray-400">
                      Đã dùng: {item.usedCount} {item.usageLimit ? `/ ${item.usageLimit}` : ''}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 flex justify-center gap-3'>
                    <Link to={`/edit-voucher/${item._id}`} className='text-blue-600 hover:underline cursor-pointer font-medium'>Sửa</Link>
                    <button onClick={() => removeVoucher(item._id)} className='text-red-600 hover:underline cursor-pointer font-medium'>Xóa</button>
                  </td>
                </tr>
              )
            })}
            
            {list.length === 0 && (
              <tr>
                <td colSpan="5" className='px-6 py-8 text-center text-gray-500'>
                  Chưa có mã giảm giá nào được tạo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListVoucher
