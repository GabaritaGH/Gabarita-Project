import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login/login.jsx";
import Register from "./pages/auth/register/register.jsx";
import Home from "./pages/home/home.jsx";

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
