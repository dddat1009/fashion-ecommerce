import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
const Login = ({setToken, setRole}) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSeller, setIsSeller] = useState(false) // Toggle: Đăng nhập với tư cách người bán

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      
      const endpoint = isSeller ? '/api/user/login' : '/api/user/admin';
      const response = await axios.post(backendUrl + endpoint, { email, password })
      
      if (response.data.success) {
          // Nếu đăng nhập Seller thành công, kiểm tra xem có đúng là seller/admin không
          if (isSeller) {
            const role = response.data.role;
            if (role !== 'seller' && role !== 'admin') {
              toast.error('Tài khoản này không có quyền truy cập Người bán!');
              return;
            }
            setRole(role);
          } else {
            // Đăng nhập bằng Admin tĩnh (.env)
            setRole('admin');
          }
          
          setToken(response.data.token)
      } else {
        toast.error(response.data.message)
      }
     
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full '>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md'>
        
        {/* Toggle Chọn Vai Trò */}
        <div className='flex justify-center gap-4 mb-6 border-b pb-2'>
          <button 
            onClick={() => setIsSeller(false)}
            className={`font-semibold ${!isSeller ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
          >
            Admin Panel
          </button>
          <button 
            onClick={() => setIsSeller(true)}
            className={`font-semibold ${isSeller ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
          >
            Seller Panel
          </button>
        </div>

        <form onSubmit={onSubmitHandler}>
          <div className='mb-3 min-w-72 '>
            <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
            <input onChange={(e) => setEmail(e.target.value)} value={email} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="email" placeholder='your@email.com' required />
          </div>
          <div className='mb-3 min-w-72 '>
            <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
            <input onChange={(e) => setPassword(e.target.value)} value={password} className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none' type="password" placeholder='Enter your password' required />
          </div>
          <button className='mt-2 w-full py-2 px-4 rounded-md text-white bg-black' type="submit"> Login </button>
        </form>
      </div>
    </div>
  )
}

export default Login
