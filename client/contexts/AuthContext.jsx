import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('devhub_token');
    const storedUser = localStorage.getItem('devhub_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, authToken, refreshToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('devhub_token', authToken);
    localStorage.setItem('devhub_refresh_token', refreshToken);
    localStorage.setItem('devhub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devhub_token');
    localStorage.removeItem('devhub_refresh_token');
    localStorage.removeItem('devhub_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('devhub_user', JSON.stringify(userData));
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
