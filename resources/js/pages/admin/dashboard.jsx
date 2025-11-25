import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import api from '../../axios'
import { usePermissions } from '../../contexts/PermissionContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { hasPermission, hasAnyPermission, loading, permissions, user, logout: contextLogout } = usePermissions()

  function handleLogout(){
    api.post('/logout').then((res)=>{
      contextLogout()
      localStorage.removeItem('token')
      navigate('/login')
    }).catch((err)=>{
    })
  }

  const location = useLocation()

  const allMenuItems = [
    {name:'Dashboard',path:'/admin/dashboard', show: true},
    {name:'Students',path:'/admin/students', permission: {module: 'Students', action: 'View'}},
    {name:'Student Upgrade',path:'/admin/students/upgrade', permission: {module: 'Upgrading', action: 'View'}},
    {name:'Fee Assignments',path:'/admin/fee-assignments', permission: {module: 'Fee Assignment', action: 'View'}},
    {name:'Payments',path:'/admin/payments', permission: {module: 'Payments', action: 'View'}},
    {name:'Due Reports',path:'/admin/duereports', permission: {module: 'Due Reports', action: 'View'}},
    {name:'Users',path:'/admin/users', permission: {module: 'Users', action: 'View'}},
    {name:'Roles',path:'/admin/roles', show: false},
    {name:'Settings',path:'/admin/settings', show: false},
    {name:'Logout',path:'/login',onClick:handleLogout, show: true},
  ]


  const menuItem = allMenuItems.filter(item => {
    if (item.show !== undefined) {
      return item.show;
    }
    if (item.permission) {
      if (loading) {
        return false;
      }

      const hasPerm = hasPermission(item.permission.module, item.permission.action);
      return hasPerm;
    }
    return false;
  })

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

            </div>
        </div>

        {/* Main content area */}
        <div className='w-[80%] ml-[20%] bg-gray-100 min-h-screen'>
          <Outlet /> {/* This will render the nested routes */}
        </div>
    </div>
  )
}
