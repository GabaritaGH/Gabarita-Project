import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    // Aqui você chamaria a API do backend
    console.log({ name, email, password });
    navigate("/"); // Volta para login após registro
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Registrar</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />
        <button type="submit" className="register-button">
          Registrar
        </button>
      </form>
      <p className="register-text-center register-text-small">
        Já tem conta? <Link to="/" className="register-link">Login</Link>
      </p>
    </div>
  );
};

export default Register;
