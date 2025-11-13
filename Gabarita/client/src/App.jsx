import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login/login.jsx";
import Register from "./pages/auth/register/register.jsx";
import Home from "./pages/home/home.jsx";

// Componente de proteção de rota
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = document.cookie.includes("auth_session");
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ✅ Protege a rota Home */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
      </Routes>
    </div>
  );
};

export default App;
