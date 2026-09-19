import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
// Import các công cụ vẽ biểu đồ
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
// Import Icons
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react'

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        orderStatus: []
    })

    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/order/dashboard', { headers: { token } })
            if (response.data.success) {
                setStats(response.data.stats)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token) {
            fetchDashboardStats()
        }
    }, [token])

    // Bảng màu cho biểu đồ tròn
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444'];

    return (
        <div className="pb-10">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Tổng Quan Kinh Doanh (Bản Mới)</h2>

            {/* 4 Thẻ thống kê */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Tổng Khách Hàng */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-500 text-sm font-semibold">Tổng Khách Hàng</h3>
                        <div className="p-2 bg-blue-50 rounded-md">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stats.totalUsers}</p>
                    <p className="text-xs"><span className="text-green-500 font-medium">↑ 12%</span> <span className="text-gray-400">so với tháng trước</span></p>
                </div>

                {/* Tổng Sản Phẩm */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-500 text-sm font-semibold">Tổng Sản Phẩm</h3>
                        <div className="p-2 bg-green-50 rounded-md">
                            <Package className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stats.totalProducts}</p>
                    <p className="text-xs"><span className="text-green-500 font-medium">↑ 5%</span> <span className="text-gray-400">so với tháng trước</span></p>
                </div>

                {/* Tổng Đơn Hàng */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-500 text-sm font-semibold">Tổng Đơn Hàng</h3>
                        <div className="p-2 bg-orange-50 rounded-md">
                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stats.totalOrders}</p>
                    <p className="text-xs"><span className="text-red-500 font-medium">↓ 2%</span> <span className="text-gray-400">so với tháng trước</span></p>
                </div>

                {/* Tổng Doanh Thu */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-500 text-sm font-semibold">Tổng Doanh Thu</h3>
                        <div className="p-2 bg-red-50 rounded-md">
                            <DollarSign className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 mb-1">{currency}{stats.totalRevenue}</p>
                    <p className="text-xs"><span className="text-green-500 font-medium">↑ 18%</span> <span className="text-gray-400">so với tháng trước</span></p>
                </div>
            </div>

            {/* Khu vực Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Biểu đồ Cột (Chiếm 2/3 không gian màn hình lớn) */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Doanh Thu Theo Tháng (Năm nay)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${currency}${value}`} />
                                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} formatter={(value) => [`${currency}${value}`, 'Doanh thu']} />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ Tròn (Chiếm 1/3) */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Trạng Thái Đơn Hàng</h3>
                    <div className="h-80 w-full flex justify-center items-center">
                        {stats.orderStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.orderStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [value, 'Số lượng đơn']} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400">Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard
