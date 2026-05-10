import React, { createContext, useState, useContext, useEffect } from "react";
// Create context
const AdminAuthContext = createContext();

// Provider component
export function AdminAuthProvider({ children }) {
  // Try to load 'isAdmin' from localStorage on first run
  const [isAdmin, setIsAdmin] = useState(() => {
    const stored = window.localStorage.getItem("isAdmin");
    return stored === "true";
  });

  const login = () => {
    setIsAdmin(true);
    window.localStorage.setItem("isAdmin", "true");
  };

  const logout = () => {
    setIsAdmin(false);
    window.localStorage.setItem("isAdmin", "false");
  };



  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Custom hook for cleaner usage
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}