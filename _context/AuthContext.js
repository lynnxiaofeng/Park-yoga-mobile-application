import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (on app start)
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Register function
  const register = async (username, email, password, is_admin) => {
    try {
      console.log("Registering with:", { username, email, password,  is_admin });
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          is_admin: false // Default to regular user
        }),
      });

      const data = await response.json();
      console.log("Register response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Logging in with:", { email });
      
      if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Get response as text first
      const responseText = await response.text();
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200));
        throw new Error("Invalid response from server");
      }
      
      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Extract token and user info from the response
      const token = data.token;
      const userData = data.user || {};

      // Store the token and user data
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setToken(null);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Export the context provider as default for expo-router compatibility
export default AuthProvider;