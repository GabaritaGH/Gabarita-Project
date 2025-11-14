import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/layout.jsx";
import Login from "./pages/auth/login/login.jsx";
import Register from "./pages/auth/register/register.jsx";
import Home from "./pages/home/home.jsx";
import NewPost from "./pages/newPost/newPost.jsx";

// Componente de proteção de rota
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("authToken"); // <--- CORREÇÃO: Verifica o localStorage
  return isAuthenticated ? element : <Navigate to="/" replace />;
};


const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ✅ Rota Home agora usa o Layout */}
        <Route path="/new-post" element={<ProtectedRoute element={<Layout><NewPost /></Layout>} />} />
        <Route path="/home" element={<ProtectedRoute element={<Layout><Home /></Layout>} />} />
      </Routes>
    </div>
  );
};

export default App;
