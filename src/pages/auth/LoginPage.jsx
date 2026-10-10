import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../../components/LoginView';
import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { loginWithCredentials, isSupabaseConfigured } = useApp();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username, password) => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const { role } = await loginWithCredentials(username, password);
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (role === 'Judge') {
        navigate('/judge/competitions');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginView
      onLogin={handleLogin}
      isSupabaseConfigured={isSupabaseConfigured}
      isLoggingIn={isLoggingIn}
      loginError={loginError}
    />
  );
}
