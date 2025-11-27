import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

import API_URL from '../config';
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

  const ROLES = { STUDENT: 'student', WARDEN: 'warden', STAFF: 'staff', TECHNICIAN: 'technician' }

  useEffect(() => {
    loadStoredUser().finally(() => {
      setIsLoading(false)
    })
  }, [])

  const loadStoredUser = async () => {
    setIsLoading(true)
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;

      const userData = JSON.parse(storedUser)
      if (!userData?.token) {
        return AsyncStorage.removeItem('user')
      }

      const decodedToken = jwtDecode(userData.token)
      const currentTime = Date.now() / 1000

      if (decodedToken.exp > currentTime) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        await AsyncStorage.removeItem('user')
      }

    } catch (err) {
      console.error(err);
      await AsyncStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }


  const login = useCallback(async (email, password, role) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`${API_URL}/auth/login`, {email, password, role}, {headers: { 'Content-Type': 'application/json' }})
      if (!response.data.token || !response.data.user) {
        throw new Error('Invalid response format from server')
      }

      const { token, user } = response.data
      const userData = { ...user, token }

      await AsyncStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)

      return { success: true, user: userData }
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password, role = ROLES.STUDENT, roomNumber = null, block = null, phoneNumber = null) => {
    try {
      setIsLoading(true)

      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, role, roomNumber, block, phoneNumber })

      const { token, user } = response.data
      const userData = { ...user, token }

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
  }, [ROLES.STUDENT]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      console.log('User logged out successfully')
    } catch (error) {
      console.log('Logout error:', error)
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    try {
      const token = user?.token
      const response = await axios.patch(`${API_URL}/auth/profile`, updates, { headers: { Authorization: `Bearer ${token}` } })

      const updatedUser = { ...user, ...response.data.user }
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true, user: updatedUser }
    } catch (error) {
      console.log(error)
      return { success: false, error: error }
    }
  }, [user]);

  const value = useMemo(() => ({
    user, isLoading, isAuthenticated, login, register, logout, updateUser, ROLES
  }), [user, isLoading, isAuthenticated, login, register, logout, updateUser, ROLES]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
