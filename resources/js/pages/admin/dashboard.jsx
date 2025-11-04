import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const navigate = useNavigate()

  function handleLogout(){
    axios.post('/api/logout',{},{withCredentials:true}).then((res)=>{
      localStorage.removeItem('token')
      navigate('/login')
    }).catch((err)=>{
      console.log(err)
    })
  }

  const location = useLocation()
  const menuItem = [
    {name:'Dashboard',path:'/admin/dashboard'},
    {name:'Students',path:'/admin/students'},
    {name:'Student Upgrade',path:'/admin/students/upgrade'},
    {name:'Fee Assignments',path:'/admin/fee-assignments'},
    {name:'Payments',path:'/admin/payments'},
    {name:'Users',path:'/admin/users'},
    {name:'Roles',path:'/admin/roles'},
    {name:'Settings',path:'/admin/settings'},
    {name:'Logout',path:'/login',onClick:handleLogout},
  ]

  return (
    <div className='w-full h-screen flex'>
        {/* Sidebar with scroll */}
        <div className='w-[20%] h-screen bg-blue-900 fixed overflow-y-auto'>
            <div className='p-4 border-b border-blue-700'>
                <img src="/img/logo.jpg" alt="logo" className='w-16 h-16 bg-cover mx-auto rounded-full'/>
                <p className='text-white text-center text-sm mt-2'>St Joseph's College</p>
                <p className='text-white text-center text-xs'>Welfare Association</p>
                <h1 className='text-center font-bold text-white mt-2'>Admin Panel</h1>
            </div>

            {/* Scrollable menu */}
            <div className='flex flex-col gap-1 p-2 mt-2 h-[calc(100vh-180px)] overflow-y-auto'>
              {menuItem.map((item,index)=>(
<<<<<<< HEAD
            <Link key={index} to ={item.path} className={`hover:bg-blue-400 rounded-md p-2 transition-all p-5 ${location.pathname===item.path?'bg-white rounded-md transition p-5':'bg-blue-900 text-white'}`} onClick={item.onClick}>
              {item.name}
            </Link>
          ))}
=======
                <Link
                  key={index}
                  to={item.path}
                  className={`hover:bg-blue-700 rounded-md p-3 transition-all text-white ${
                    location.pathname === item.path ? 'bg-blue-600' : 'bg-transparent'
                  }`}
                  onClick={item.onClick}
                >
                  {item.name}
                </Link>
              ))}
>>>>>>> 812dd105573c3990db6f9234730f773a6aaee26f
            </div>
        </div>

        {/* Main content area */}
        <div className='w-[80%] ml-[20%] bg-gray-100 min-h-screen'>
          <Outlet /> {/* This will render the nested routes */}
        </div>
    </div>
  )
}
