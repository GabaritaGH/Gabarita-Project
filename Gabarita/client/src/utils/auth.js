/**
 * Decodifica o payload de um JWT sem verificar a assinatura.
 * @param {string} token O token JWT.
 * @returns {object | null} O payload decodificado ou null se o token for inválido.
 */
export const decodeToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar token:", e);
    return null;
  }
};

/**
 * Obtém o ID do usuário logado a partir do token armazenado no localStorage.
 * @returns {number | null} O ID do usuário ou null.
 */
export const getUserId = () => {
  const token = localStorage.getItem('authToken');
  const decoded = decodeToken(token);
  // O payload do nosso JWT tem o campo 'id'
  return decoded ? decoded.id : null;
};