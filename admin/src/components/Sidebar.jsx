import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = ({ role }) => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/dashboard">
          <img className='w-5 h-5' src={assets.add_icon} alt="" />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/add">
          <img className='w-5 h-5' src={assets.add_icon} alt="" />
          <p className='hidden md:block'>Add items</p>
        </NavLink>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/list">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block'>List items</p>
        </NavLink>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/orders">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block'>Orders</p>
        </NavLink>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/warehouse">
          <img className='w-5 h-5' src={assets.parcel_icon} alt="" />
          <p className='hidden md:block'>Kho Hàng</p>
        </NavLink>

        <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/inventory">
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block'>Tồn Kho</p>
        </NavLink>

        {role === 'seller' && (
          <>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/shop-profile">
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Hồ Sơ Shop</p>
            </NavLink>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/withdrawal">
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Rút Tiền</p>
            </NavLink>
          </>
        )}

        {role === 'admin' && (
          <>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/add-voucher">
              <img className='w-5 h-5' src={assets.add_icon} alt="" />
              <p className='hidden md:block'>Add Voucher</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/list-voucher">
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>List Voucher</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/withdrawal">
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Duyệt Rút Tiền</p>
            </NavLink>
          </>
        )}

      </div>
    </div>
  )
}

export default Sidebar
