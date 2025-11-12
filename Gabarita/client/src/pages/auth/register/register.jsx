import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        { name, email, password },
        { withCredentials: true } // permite cookies/sessão
      );

      if (res.data?.user) {
        setMessage("Cadastro realizado com sucesso!");
        console.log("Usuário criado:", res.data.user);

        // Redireciona para o login
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMessage("Erro ao registrar. Tente novamente.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Falha ao registrar. Verifique os dados.");
    }
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

      {message && <p className="register-message">{message}</p>}

      <p className="register-text-center register-text-small">
        Já tem conta?{" "}
        <Link to="/" className="register-link">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
