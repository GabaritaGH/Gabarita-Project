// client/src/utils/auth.js

// 1. Verifica se o usuário está logado
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token; // Retorna true se tiver token
};

// 2. Pega o ID do usuário (Simples e direto)
export const getUserId = () => {
    // Tenta pegar o ID salvo explicitamente no Login
    const userId = localStorage.getItem('userId');
    
    if (userId) {
        return parseInt(userId); // Garante que seja número
    }
    
    // Fallback: Se não tiver salvo, tenta decodificar do token (opcional)
    const token = localStorage.getItem('authToken');
    const decoded = decodeToken(token);
    return decoded ? decoded.id : null;
};

// 3. Função auxiliar para decodificar JWT (se precisar)
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};