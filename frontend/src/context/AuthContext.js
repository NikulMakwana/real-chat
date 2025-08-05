import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // No useEffect to load user from localStorage on initial load.
  // This ensures the user must explicitly log in or register.

  const login = (username) => {
    setUser({ username });
    localStorage.setItem('user', username); // Still save to localStorage for persistence across sessions
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}