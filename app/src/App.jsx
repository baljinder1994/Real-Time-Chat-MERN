import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import Home from './components/Home'
import './App.css'
const App = () => {
  const router=createBrowserRouter([
    {
      path:'/',
      element:<Register/>
    },
    {
      path:'/login',
      element:<Login/>
    },
    {
    path:'/home',
    element:<Home/>
    
  }
  ])
  return (
    <div>
     <RouterProvider router={router}/>
    </div>
  )
}

export default App
