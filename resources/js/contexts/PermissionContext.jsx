import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../axios';

const PermissionContext = createContext(null);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // permissions is an object mapping module -> { action: boolean }
  // Default to empty object (no permissions) to avoid accidental super-admin behavior
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const hasPermission = (module, action) => {
    // Admin users bypass permission checks
    if (user?.is_admin) {
      return true;
    }
    if (!permissions || !permissions[module]) return false;
    return permissions[module][action] === true;
  };

  const hasAnyPermission = (module, actions) => {
    // Admin users bypass permission checks
    if (user?.is_admin) {
      return true;
    }
    if (!permissions || !permissions[module]) return false;
    return actions.some(action => permissions[module][action] === true);
  };

  const loadUser = async () => {
    try {
      const { data } = await api.get('/user');
      setUser(data);
      setPermissions(data.permissions || {});
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = () => {
    setUser(null);
    setPermissions({});
    setLoading(true);
  };

  const value = {
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    reloadUser: loadUser,
    logout,
    loading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

