import { useState } from 'react';
import { getCurrentUser, logout as authLogout } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(getCurrentUser());

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return { user, logout, setUser };
};
