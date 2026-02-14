import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("userToken");
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");

    return token ? { token, name, email } : null;
  });

  const login = (token, userData) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userName", userData?.name || "User");
    localStorage.setItem("userEmail", userData?.email);
    setUser({ token, name: userData?.name, email: userData?.email, });
    navigate("/user-dashboard");
  };

  const loguserout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    setUser(null);
    navigate("/user-login");
  };

  return (
    <UserAuthContext.Provider value={{ user, login, loguserout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}
