import api from '../axios.js';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    useEffect(() => {
        api.get('/user')
            .then(response => {
                console.log('controller',response.data);
                setAuthorized(true);                
            })
            .catch(error => {
                console.error(error);
                setAuthorized(false);
                navigate('/login');
            });
    }, [navigate]);
    
    if (authorized) {
        return <Outlet />;
    } else {
        return null;
    }
}
