import React from 'react'
import Navbar from './Components/Navbar.jsx'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home.jsx'
import { Toaster } from "react-hot-toast"
import Footer from './Components/Fotter.jsx'
import { useAppContext } from './Context/AppContext.jsx'
import Login from './Components/Login.jsx'
import AllProducts from './Pages/AllProducts.jsx'
import ProductCategroy from './Pages/ProductCategory.jsx'
import ProductDetails from './Pages/ProductsDetails.jsx'
import Cart from './Pages/Cart.jsx'
import AddAddress from './Pages/AddAddress.jsx'
import MyOrders from './Pages/MyOrders.jsx'
import SellerLogin from './Components/Seller/SellerLogin.jsx'
import SellerLayout from './Pages/Seller/SellerLayout.jsx'
import AddProduct from './Pages/Seller/AddProduct.jsx'
import ProductList from './Pages/Seller/ProductList.jsx'
import Orders from './Pages/Seller/Orders.jsx'
import Loading from './Components/Loading.jsx'





const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");

  const { showUserLogin, isSeller } = useAppContext()

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath ? null : <Navbar />}

      {showUserLogin ? <Login /> : null}


      <Toaster />

      <div className={`${isSellerPath ? "" : "px-6 md:px-16 lg:24 xl:32"}`}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategroy />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/loader' element={<Loading />} />
          <Route path='/seller' element={isSeller ? <SellerLayout/> : <SellerLogin />}>
          <Route index element={isSeller ? <AddProduct/>:null} />
          <Route path='product-list' element={<ProductList/>} />
          <Route path='orders' element={<Orders/>} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  )
}

export default App;
