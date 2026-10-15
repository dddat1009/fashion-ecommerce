import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import { Routes, Route } from 'react-router-dom'
import List from './pages/List.jsx'
import Orders from './pages/Orders.jsx'
import Login from './components/Login.jsx'
import Add from './pages/Add.jsx'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Dashboard from './pages/Dashboard.jsx'
import AddVoucher from './pages/AddVoucher.jsx'
import ListVoucher from './pages/ListVoucher.jsx'
import EditVoucher from './pages/EditVoucher.jsx'
import ShopProfile from './pages/ShopProfile.jsx'
import Withdrawal from './pages/Withdrawal.jsx'
import Warehouse from './pages/Warehouse.jsx'
import Inventory from './pages/Inventory.jsx'

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '$'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
  const [role, setRole] = useState(localStorage.getItem('role') ? localStorage.getItem('role') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
  }, [token, role])
  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} setRole={setRole} />
        :
        <>
          <Navbar setToken={setToken} setRole={setRole} />
          <hr />
          <div className='flex w-full'>
            <Sidebar role={role} />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/dashboard' element={<Dashboard token={token} />} />
                {/* Truyền prop token vào đây */}
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/add-voucher' element={<AddVoucher token={token} />} />
                <Route path='/list-voucher' element={<ListVoucher token={token} />} />
                <Route path='/edit-voucher/:id' element={<EditVoucher token={token} />} />
                <Route path='/shop-profile' element={<ShopProfile token={token} />} />
                <Route path='/withdrawal' element={<Withdrawal token={token} role={role} />} />
                <Route path='/warehouse' element={<Warehouse token={token} role={role} />} />
                <Route path='/inventory' element={<Inventory token={token} role={role} />} />
              </Routes>

            </div>
          </div>

        </>
      }


    </div>
  )
}

export default App
