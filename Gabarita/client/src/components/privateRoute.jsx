import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // 1. Verifique como você salva o login. 
  // Geralmente é no localStorage ou em um Contexto.
  // Exemplo verificando se tem token no localStorage:
  const token = localStorage.getItem('authToken'); 
  
  // Ou se você usa Contexto (AuthContext):
  // const { user } = useContext(AuthContext);

  // Se tiver token, renderiza as rotas filhas (Outlet). 
  // Se não, redireciona para o login.
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;