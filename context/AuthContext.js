import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://192.168.0.113:3000/api';
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

  const ROLES = {STUDENT: 'student',WARDEN: 'warden',STAFF: 'staff',TECHNICIAN: 'technician'}

  useEffect(() => {
    console.log('AuthProvider: Loading stored user...');
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        try {
          const decodedToken = jwtDecode(userData.token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('✅ User restored from storage:', userData.email);
            console.log('✅ Authentication state set to true');
          } else {
            console.log('❌ Token expired, removing from storage');
            await AsyncStorage.removeItem('user');
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          await AsyncStorage.removeItem('user');
        }
      } else {
        console.log('❌ No stored user found');
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
    } finally {
      console.log('✅ Auth loading completed, isLoading set to false');
      setIsLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password, role });

      const { token, user } = response.data;
      
      const userData = { ...user, token };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful, user stored:', userData.email);
      return { success: true, user: userData };
    } catch (error) {
      console.log('Login error:', error.response?.data?.message || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, role = ROLES.STUDENT, roomNumber = null, block = null, phoneNumber = null) => {
    try {
      setIsLoading(true);
      
  const response = await axios.post(`${API_URL}/auth/register`, {name,email,password,role,roomNumber,block,phoneNumber})

      const { token, user } = response.data
      const userData = {...user,token}

  await AsyncStorage.setItem('user', JSON.stringify(userData))
      setUser(userData);
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    } catch (error) {
      console.log('Registration error:', error.response?.data?.message || error.message)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log('User logged out successfully');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const token = user?.token;
      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = { ...user, ...response.data.user };
  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.log('Update user error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const value = {user,isLoading,isAuthenticated,login,register,logout,updateUser,ROLES}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
