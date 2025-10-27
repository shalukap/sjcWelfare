import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate=useNavigate()
  function handleLogout(){
    axios.post('/logout',{},{withCredentials:true}).then((res)=>{
      localStorage.removeItem('token')
      navigate('/login')
    }).catch((err)=>{
      console.log(err)
    })
    
  }

  const location=useLocation()
  const menuItem=[
    {name:'Dashboard',path:'/admin/dashboard'},
    {name:'Users',path:'/admin/users'},
    {name:'Roles',path:'/admin/roles'},
    {name:'Settings',path:'/admin/settings'},
    {name:'Logout',path:'/login',onClick:handleLogout},
  ]
  return (
    <div className='w-full h-screen flex'>
        <div className='w-[20%] h-screen bg-blue-900 fixed'>
            <div>
                <img src="/img/logo.jpg" alt="logo" className='w-16 h-15 bg-cover m-10'/>
                <p>St Joseph's College Welfare Association </p>
                <h1 className='ml-10 font-bold'>Admin Panel</h1>

            </div>
            <div className='flex flex-col gap-2 ml-2 mt-5'>
              {menuItem.map((item,index)=>(
            <Link key={index} to ={item.path} className={`hover:bg-blue-700 rounded-md p-2 transition-all p-5 ${location.pathname===item.path?'bg-blue-200 rounded-md transition p-5':'bg-blue-900'}`} onClick={item.onClick}>
              {item.name}
            </Link>
          ))}
            </div>
           
        </div>
        <div className='w-[80%] h-screen bg-gray-500 ml-[20%]'></div>
          
    </div>
  )
}
