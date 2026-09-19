import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const AddVoucher = ({ token }) => {
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minOrderValue, setMinOrderValue] = useState(0)
  const [maxDiscount, setMaxDiscount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [usageLimit, setUsageLimit] = useState("")

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        code,
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        startDate,
        endDate,
      }
      
      if (maxDiscount) payload.maxDiscount = Number(maxDiscount)
      if (usageLimit) payload.usageLimit = Number(usageLimit)

      const response = await axios.post(backendUrl + "/api/voucher/create", payload, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        // Reset form
        setCode("")
        setDiscountType("percentage")
        setDiscountValue("")
        setMinOrderValue(0)
        setMaxDiscount("")
        setStartDate("")
        setEndDate("")
        setUsageLimit("")
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4'>
      <h2 className='text-xl font-bold text-gray-800 mb-2'>Thêm Mã Giảm Giá Mới</h2>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Mã Voucher (Code)</p>
        <input 
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          value={code} 
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded' 
          type="text" 
          placeholder='Ví dụ: SUMMER2024' 
          required 
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[500px]'>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Loại giảm giá</p>
          <select 
            onChange={(e) => setDiscountType(e.target.value)} 
            value={discountType} 
            className='w-full px-3 py-2 border border-gray-300 rounded'
          >
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed">Tiền cố định</option>
          </select>
        </div>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Mức giảm</p>
          <input 
            onChange={(e) => setDiscountValue(e.target.value)} 
            value={discountValue} 
            className='w-full px-3 py-2 border border-gray-300 rounded' 
            type="number" 
            placeholder={discountType === 'percentage' ? 'VD: 15' : 'VD: 50000'} 
            required 
          />
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[500px]'>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Đơn tối thiểu áp dụng</p>
          <input 
            onChange={(e) => setMinOrderValue(e.target.value)} 
            value={minOrderValue} 
            className='w-full px-3 py-2 border border-gray-300 rounded' 
            type="number" 
            min="0"
          />
        </div>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Giảm tối đa (Chỉ dùng cho %)</p>
          <input 
            onChange={(e) => setMaxDiscount(e.target.value)} 
            value={maxDiscount} 
            className='w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-100' 
            type="number" 
            disabled={discountType === 'fixed'}
            placeholder='VD: 100000'
          />
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full max-w-[500px]'>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Ngày bắt đầu</p>
          <input 
            onChange={(e) => setStartDate(e.target.value)} 
            value={startDate} 
            className='w-full px-3 py-2 border border-gray-300 rounded' 
            type="date" 
            required
          />
        </div>
        <div className='flex-1'>
          <p className='mb-2 font-medium'>Ngày kết thúc</p>
          <input 
            onChange={(e) => setEndDate(e.target.value)} 
            value={endDate} 
            className='w-full px-3 py-2 border border-gray-300 rounded' 
            type="date" 
            required
          />
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Giới hạn lượt dùng (Tùy chọn)</p>
        <input 
          onChange={(e) => setUsageLimit(e.target.value)} 
          value={usageLimit} 
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded' 
          type="number" 
          placeholder='Để trống nếu không giới hạn' 
        />
      </div>

      <button type="submit" className='w-28 py-3 mt-4 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors'>
        THÊM MỚI
      </button>
    </form>
  )
}

export default AddVoucher
