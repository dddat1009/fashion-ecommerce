import React from 'react'
import Title from './Title';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
const CartTotal = () => {

    const {currency, delivery_fee, getCartAmount, getDiscountAmount} = useContext(ShopContext);
    
    const subtotal = getCartAmount();
    const discount = getDiscountAmount();
    const total = subtotal === 0 ? 0 : subtotal - discount + delivery_fee;


  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
            <p>Subtotal</p>
            <p>{currency} {subtotal}.00</p>
        </div>
        <hr/>
        {discount > 0 && (
          <>
            <div className='flex justify-between text-green-600 font-medium'>
                <p>Discount</p>
                <p>-{currency} {discount}</p>
            </div>
            <hr/>
          </>
        )}
        <div className='flex justify-between'>
            <p>Shipping Fee</p>
            <p>{currency} {delivery_fee}</p>
        </div>
        <hr/>
        <div className='flex justify-between'> 
            <b>Total</b>
            <b>{currency} {total} </b>
        </div>

      </div>
    </div>
  )
}

export default CartTotal
