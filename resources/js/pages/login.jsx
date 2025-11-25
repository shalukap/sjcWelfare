import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axios.js';
import '../../css/bgimg.css'
import { usePermissions } from '../contexts/PermissionContext';
import { toast } from 'react-hot-toast';

export default function login() {
   const nav=useNavigate()
   const { reloadUser } = usePermissions();
   const [email,setEmail]=useState('')
   const [password,setPassword]=useState('')
   const [isLoading,setIsLoading]=useState(false)

   async function handleLogin(e){
    e.preventDefault();
    try {      
      setIsLoading(true);
       api.post('/login', { email, password })
        .then(response => {
      localStorage.setItem('token',response.data.token);
      // Reload user permissions after successful login
      reloadUser().then(() => {
        nav('/admin/dashboard')
        setIsLoading(false);
      });
    })
    .catch(error => {
      toast.error('You are not authorized to access this resource' );
      
    });
    }

    catch (error) {
      toast.error('Username or password is incorrect' );
      
    }
   }
  return (

  <div className='w-full h-screen flex justify-center items-center bg-blue-900 bgimg'>
  <div className='w-[600px] h-[400px] bg-white/20 backdrop-blur-xl rounded-2xl flex justify-center items-center p-10 flex-col'>
    <div className='flex'>
      <img src="/img/logo.jpg" alt="logo" className='w-[150px] h-[150px] bg-cover m-10' />
      <form>
        <div className='flex flex-col gap-10 text-white text-2xl'>
          <input type="email" placeholder='User Name' className='w-[300px] h-[50px] bg-transparent border-b-2 border-white' onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder='Password' className='w-[300px] h-[50px] bg-transparent border-b-2 border-white' onChange={(e)=>setPassword(e.target.value)}/>
          <button className="bg-blue-950 hover:bg-white text-white hover:text-blue-950 p-4 rounded-2xl text-2xl flex items-center justify-center" disabled={isLoading} onClick={handleLogin}>{isLoading ?  <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div> : 'Login'}</button>
        </div>
      </form>
    </div>
  </div>
</div>

  )
}
