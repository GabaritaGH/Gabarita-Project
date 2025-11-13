import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StackHandler, StackProvider, StackTheme, useUser } from "@stackframe/react";
import { stackClientApp } from "./stack";

import Home from "./pages/home/home.jsx";

// Componente de proteção de rota usando o hook do Stackframe
const ProtectedRoute = ({ element }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Carregando...</div>; // Tela de carregamento
  }

  // Redireciona para a tela de login se não estiver autenticado
  if (!user) {
    return <Navigate to="/handler/sign-in" replace />;
  }

  return element;
};

// Componente para lidar com as rotas de autenticação do Stackframe
function HandlerRoutes() {
  const location = useLocation();
  
  // O StackHandler lida com as rotas /handler/* (sign-in, sign-up, etc.)
  return <StackHandler app={stackClientApp} location={location.pathname} fullPage />;
}

const App = () => {
  return (
    <Suspense fallback={<div>Carregando Aplicação...</div>}>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <div className="app">
            <Routes>
              {/* Rota para o handler de autenticação do Neon Auth */}
              <Route path="/handler/*" element={<HandlerRoutes />} />
              
              {/* Rota principal (Home) - Protegida */}
              <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
              
              {/* Redireciona a rota raiz para o login do Neon Auth */}
              <Route path="/" element={<Navigate to="/handler/sign-in" replace />} />
              
              {/* Rotas antigas de login/registro não são mais necessárias, mas se existirem, serão ignoradas */}
            </Routes>
          </div>
        </StackTheme>
      </StackProvider>
    </Suspense>
  );
};

export default App;
