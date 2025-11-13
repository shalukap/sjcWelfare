import api from '../axios.js';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
    const { reloadUser } = usePermissions();
    
    useEffect(() => {
        api.get('/user')
            .then(response => {
                // Load user permissions after successful auth check
                return reloadUser();
            })
            .then(() => {
                setAuthorized(true);
            })
            .catch(error => {
                console.error(error);
                setAuthorized(false);
                navigate('/login');
            });
    }, [navigate, reloadUser]);
    
    if (authorized) {
        return <Outlet />;
    } else {
        return null;
    }
}
