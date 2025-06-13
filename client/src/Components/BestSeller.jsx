
import React from 'react'
import ProductCard from './ProductCart'
import { useAppContext } from '../Context/AppContext'

const BestSeller = () => {
  const { products } = useAppContext()

  return (
    <div className='mt-16 px-4'>
      <p className='text-xl sm:text-2xl md:text-3xl font-medium'>Best Sellers</p>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-6'>
        {products
          .filter((product) => product.inStock)
          .slice(0, 5)
          .map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
      </div>
    </div>
  )
}

export default BestSeller;

