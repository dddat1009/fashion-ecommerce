import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';

const Product = () => {

  const {productId} = useParams();
  const navigate = useNavigate();
  const {products,currency,addToCart,backendUrl} = useContext(ShopContext);
  const [productData,setProductData] = useState(false); 
  const [image,setImage] = useState('')
  const [size,setSize] = useState('')
  const [stockBySize, setStockBySize] = useState({});

  const fetchProductData = async () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
      }
    });
  };

  const fetchProductStock = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/inventory/stock/${productId}`);
      if (response.data.success) {
        setStockBySize(response.data.stockBySize || {});
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
    fetchProductData();
    fetchProductStock();
    setSize('');
  },[productId,products])

  return productData ? ( 
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------------Product data-------------*/}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*Product images*/}

        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full '>
             {
              productData.image.map((item,index)=>(
                <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
              ))
             }
          </div>
          <div className='w-full sm:w-[80%]'>
             <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* ---------product infor ----------*/}
        <div className='flex-1'>
            <h1 className='font-medium text-2xl mt-2 text-gray-900'>{productData.name}</h1>
            
            <div className='flex items-center gap-1 mt-2'>
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_dull_icon} alt="" className="w-3.5" />
                <p className='pl-2 text-sm text-gray-500'>(122 đánh giá)</p>
            </div>
            
            <p className='mt-4 text-3xl font-semibold text-gray-900'>{currency}{productData.price}</p>
            
            {/* Khối Seller Card (Thông tin Shop) */}
            <div className='flex items-center justify-between p-4 my-5 border border-gray-200 rounded-xl bg-gray-50/70 hover:border-orange-200 transition'>
              <div className='flex items-center gap-3.5'>
                <div className='w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-lg shadow-xs overflow-hidden flex-shrink-0'>
                  {productData.shopInfo?.avatar ? (
                    <img src={productData.shopInfo.avatar} alt="Shop Avatar" className='w-full h-full object-cover' />
                  ) : (
                    (productData.shopInfo?.name ? productData.shopInfo.name.charAt(0).toUpperCase() : 'S')
                  )}
                </div>
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h3 className='font-semibold text-gray-900 text-base'>
                      {productData.shopInfo?.name || 'Forever Store'}
                    </h3>
                    <span className='bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-green-200'>
                      ✓ Shop Uy Tín
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 mt-0.5 flex items-center gap-2'>
                    <span>📍 {productData.shopInfo?.address || 'Hà Nội, Việt Nam'}</span>
                    <span>•</span>
                    <span className='text-amber-600 font-medium'>★ 4.9</span>
                  </p>
                </div>
              </div>

              {productData.shopInfo?.name && (
                <button 
                  onClick={() => navigate(`/collection?shop=${encodeURIComponent(productData.shopInfo.name)}`)}
                  className='ml-2 px-3.5 py-1.5 text-xs font-semibold text-orange-600 border border-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition duration-200 cursor-pointer flex-shrink-0'
                >
                  Xem Shop
                </button>
              )}
            </div>

            <p className='mt-2 text-gray-600 text-sm md:w-4/5 leading-relaxed'>{productData.description}</p>
            <div className='flex flex-col gap-4 my-8'>
                <p className='font-medium text-sm text-gray-700'>Chọn Kích Cỡ (Size):</p>
                <div className='flex flex-wrap gap-2'>
                  {productData.sizes.map((item, index) => {
                    const hasStockRecord = stockBySize[item] !== undefined;
                    const stockQty = hasStockRecord ? stockBySize[item] : null;
                    const isOutOfStock = stockQty !== null && stockQty <= 0;

                    return (
                      <button 
                        key={index}
                        disabled={isOutOfStock}
                        onClick={() => setSize(item)} 
                        className={`relative border py-2 px-4 text-sm font-medium transition ${
                          item === size 
                            ? 'border-orange-500 bg-orange-50 text-orange-600' 
                            : isOutOfStock
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-800'
                        }`}
                        title={isOutOfStock ? `Size ${item} hiện đã hết hàng` : stockQty !== null ? `Còn ${stockQty} sản phẩm` : ''}
                      >
                        {item}
                        {isOutOfStock && (
                          <span className='absolute -top-2 -right-1 text-[9px] bg-red-500 text-white px-1.5 py-0.2 rounded-full font-bold shadow-xs'>
                            Hết
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Trạng thái tồn kho của size đang chọn */}
                {size && (
                  <div className='text-xs mt-1'>
                    {stockBySize[size] !== undefined ? (
                      stockBySize[size] > 10 ? (
                        <p className='text-green-600 font-medium flex items-center gap-1'>
                          <span>✓</span> Còn hàng trong kho ({stockBySize[size]} sản phẩm có sẵn)
                        </p>
                      ) : stockBySize[size] > 0 ? (
                        <p className='text-amber-600 font-semibold flex items-center gap-1'>
                          <span>⚡</span> Sắp hết hàng! Chỉ còn {stockBySize[size]} sản phẩm
                        </p>
                      ) : (
                        <p className='text-red-500 font-semibold flex items-center gap-1'>
                          <span>✕</span> Size {size} hiện tại đã hết hàng
                        </p>
                      )
                    ) : (
                      <p className='text-gray-400'>Đang kiểm tra tồn kho...</p>
                    )}
                  </div>
                )}
            </div>

            {/* Nút Thêm vào giỏ hàng */}
            {(() => {
              const isSelectedSizeOutOfStock = size && stockBySize[size] !== undefined && stockBySize[size] <= 0;
              return (
                <button 
                  disabled={isSelectedSizeOutOfStock}
                  onClick={() => {
                    if (isSelectedSizeOutOfStock) return;
                    addToCart(productData._id, size);
                  }} 
                  className={`px-8 py-3 text-sm font-medium transition ${
                    isSelectedSizeOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-black text-white active:bg-gray-700 hover:bg-gray-900'
                  }`}
                >
                  {isSelectedSizeOutOfStock ? 'HẾT HÀNG' : 'ADD TO CART'}
                </button>
              );
            })()}
            <hr className='mt-8 sm:w-4/5'/>
            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>

            </div>
        </div>
      </div>
      {/*------------- Description & Review Section----------------*/}
      <div className='mt-20'>
          <div className='flex'>
              <b className='border px-5 py-3 text-sm'>Description</b>
              <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
          </div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the</p>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theLorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the</p>
          </div>
      </div>

      {/*------------- display related products */}
      
      <RelatedProducts category={productData.category} subCategory={productData.subCategory}/>
                  
    </div>

  ) : <div className='opacity-0'></div>
}

export default Product
