import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/layout.jsx";
import Login from "./pages/auth/login/login.jsx";
import Register from "./pages/auth/register/register.jsx";
import Home from "./pages/home/home.jsx";
import PostView from './pages/postView/PostView.jsx';
import NewPost from "./pages/newPost/newPost.jsx";
import Questions from "./pages/questions/questions.jsx";
import Simulados from "./pages/simulado/simulados.jsx";
import PrivateRoute from "./components/privateRoute.jsx";

// Componente de proteção de rota
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("authToken"); 
  return isAuthenticated ? element : <Navigate to="/" replace />;
};


const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
        <Route path="/new-post" element={<ProtectedRoute element={<Layout><NewPost /></Layout>} />} />
        <Route path="/post/:id" element={<ProtectedRoute element={<Layout><PostView /></Layout>} />}  />
        <Route path="/home" element={<ProtectedRoute element={<Layout><Home /></Layout>} />} />
        <Route path="/simulados" element={<ProtectedRoute element={<Layout><Simulados /></Layout>} />} />
        <Route path="/questions" element={<ProtectedRoute element={<Layout><Questions /></Layout>} />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
