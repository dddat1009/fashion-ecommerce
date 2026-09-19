import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const EditVoucher = ({ token }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minOrderValue, setMinOrderValue] = useState(0)
  const [maxDiscount, setMaxDiscount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Fetch dữ liệu của voucher hiện tại
  useEffect(() => {
    const fetchVoucherData = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/voucher/list')
        if (response.data.success) {
          const currentVoucher = response.data.vouchers.find(v => v._id === id)
          if (currentVoucher) {
            setCode(currentVoucher.code)
            setDiscountType(currentVoucher.discountType)
            setDiscountValue(currentVoucher.discountValue)
            setMinOrderValue(currentVoucher.minOrderValue || 0)
            setMaxDiscount(currentVoucher.maxDiscount || "")
            setUsageLimit(currentVoucher.usageLimit || "")
            setIsActive(currentVoucher.isActive)
            
            // Format date to YYYY-MM-DD for input type="date"
            if (currentVoucher.startDate) {
              setStartDate(new Date(currentVoucher.startDate).toISOString().split('T')[0])
            }
            if (currentVoucher.endDate) {
              setEndDate(new Date(currentVoucher.endDate).toISOString().split('T')[0])
            }
          } else {
            toast.error("Không tìm thấy Voucher!")
            navigate('/list-voucher')
          }
        }
      } catch (error) {
        console.log(error)
        toast.error("Lỗi khi tải dữ liệu Voucher")
      }
    }

    if (id) {
      fetchVoucherData()
    }
  }, [id, navigate])

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
        isActive
      }
      
      payload.maxDiscount = maxDiscount ? Number(maxDiscount) : null
      payload.usageLimit = usageLimit ? Number(usageLimit) : null

      const response = await axios.put(backendUrl + "/api/voucher/update/" + id, payload, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/list-voucher')
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
      <div className='flex justify-between items-center w-full max-w-[500px] mb-2'>
        <h2 className='text-xl font-bold text-gray-800'>Cập Nhật Mã Giảm Giá</h2>
        <div className='flex items-center gap-2'>
          <input 
            type="checkbox" 
            id="isActive" 
            checked={isActive} 
            onChange={(e) => setIsActive(e.target.checked)} 
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Kích hoạt</label>
        </div>
      </div>

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

      <div className='flex gap-4 mt-4'>
        <button type="submit" className='w-32 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors'>
          CẬP NHẬT
        </button>
        <button type="button" onClick={() => navigate('/list-voucher')} className='w-32 py-3 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors'>
          HỦY BỎ
        </button>
      </div>
    </form>
  )
}

export default EditVoucher
