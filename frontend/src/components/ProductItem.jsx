import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'

const ProductItem = ({ id, image, name, price, shopInfo }) => {
  const { currency } = useContext(ShopContext);

  const shopName = shopInfo?.name || 'Forever Store';

  return (
    <Link className='text-gray-700 cursor-pointer group flex flex-col justify-between' to={`/product/${id}`}>
      <div className='overflow-hidden rounded-lg relative bg-gray-100 aspect-square'>
        <img 
          className='w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-in-out' 
          src={image && image[0]} 
          alt={name} 
        />
        {/* Badge Shop ở góc ảnh */}
        {shopInfo?.name && (
          <span className='absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-orange-600 border border-orange-200 text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs flex items-center gap-1 z-10'>
            <span>🏪</span> {shopName}
          </span>
        )}
      </div>
      <div className='pt-2'>
        <p className='text-xs text-gray-400 font-medium truncate'>
          {shopName}
        </p>
        <p className='pt-0.5 pb-1 text-sm font-medium text-gray-800 group-hover:text-orange-600 transition truncate' title={name}>
          {name}
        </p>
        <p className='text-sm font-semibold text-gray-900'>{currency}{price}</p>
      </div>
    </Link>
  )
}

export default ProductItem

