import { StackClientApp } from '@stackframe/react';
import { useNavigate } from 'react-router-dom';

// Acessa as variáveis de ambiente do Vite (prefixadas com VITE_)
export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: 'cookie', // Armazena o token de sessão em cookie
  redirectMethod: { useNavigate }, // Usa o hook do React Router para redirecionamento
});