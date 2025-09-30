import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ROLES = {
    STUDENT: 'student',
    WARDEN: 'warden',
    STAFF: 'staff',
    TECHNICIAN: 'technician'
  };

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password, role = ROLES.STUDENT) => {
    try {
      setIsLoading(true);
      
      const mockUser = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role,
        roomNumber: role === ROLES.STUDENT ? `Room ${Math.floor(Math.random() * 100) + 1}` : null,
        block: role === ROLES.STUDENT ? `Block ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` : null,
        hostelId: 'hostel_001',
        avatar: null,
        createdAt: new Date().toISOString()
      };

      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, role = ROLES.STUDENT, roomNumber = null, block = null) => {
    try {
      setIsLoading(true);
      
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
        roomNumber,
        block,
        hostelId: 'hostel_001',
        avatar: null,
        createdAt: new Date().toISOString()
      };

      await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
