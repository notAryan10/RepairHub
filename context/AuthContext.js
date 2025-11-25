import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  android: 'http://10.123.2.90:3000/api',  
  ios: 'http://localhost:3000/api',      
  default: 'http://localhost:3000/api'   
});
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const ROLES = {STUDENT: 'student',WARDEN: 'warden',STAFF: 'staff',TECHNICIAN: 'technician'}

  useEffect(() => {
    console.log('AuthProvider: Loading stored user...');
    loadStoredUser().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        return; 
      }

      try {
        const userData = JSON.parse(storedUser);
        
        if (!userData.token) {
          await AsyncStorage.removeItem('user');
          return;
        }

        try {
          const decodedToken = jwtDecode(userData.token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp > currentTime) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            await AsyncStorage.removeItem('user');
          }
        } catch (tokenError) {
          await AsyncStorage.removeItem('user');
        }
      } catch (parseError) {
        console.error(parseError);
        await AsyncStorage.removeItem('user');
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  };

  const login = async (email, password, role) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password, 
        role 
      }, {
        headers: {'Content-Type': 'application/json'}
      });
      
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response format from server');
      }

      const { token, user } = response.data;
      const userData = { ...user, token };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.log(error)
    }
  }
  const register = async (name, email, password, role = ROLES.STUDENT, roomNumber = null, block = null, phoneNumber = null) => {
    try {
      setIsLoading(true);
      
  const response = await axios.post(`${API_URL}/auth/register`, {name,email,password,role,roomNumber,block,phoneNumber})

      const { token, user } = response.data
      const userData = {...user,token}

  await AsyncStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    } catch (error) {
      console.log(error)
      return { 
        success: false, 
        error: error 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      console.log('User logged out successfully')
    } catch (error) {
      console.log('Logout error:', error)
    }
  }

  const updateUser = async (updates) => {
    try {
      const token = user?.token
      const response = await axios.patch(
        `${API_URL}/auth/profile`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
        )

      const updatedUser = { ...user, ...response.data.user }
  await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true, user: updatedUser }
    } catch (error) {
      console.log(error)
      return { success: false, error: error }
    }
  }

  const value = {user,isLoading,isAuthenticated,login,register,logout,updateUser,ROLES}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
