import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Chama o backend do Better Auth
      const res = await axios.post(
        "http://localhost:5000/api/auth/signin",
        { email, password },
        { withCredentials: true } // ✅ importante para cookies/sessão
      );

      if (res.data?.user) {
        setMessage("Login realizado com sucesso!");
        console.log("Usuário logado:", res.data.user);

        // Redireciona para a Home
        navigate("/home");
      } else {
        setMessage("Falha no login. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>

      {message && <p className="login-message">{message}</p>}

      <p className="login-text-center login-text-small">
        Não tem conta?{" "}
        <Link to="/register" className="login-link">
          Registrar
        </Link>
      </p>
    </div>
  );
};

export default Login;
