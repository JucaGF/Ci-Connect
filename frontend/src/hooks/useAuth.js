import { useState, useEffect, createContext, useContext } from 'react';

// Context para autenticação
const AuthContext = createContext();

// Hook personalizado para autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Retornar valores padrão se não houver context
    return {
      user: null,
      loading: false,
      logout: () => {},
      login: () => {}
    };
  }
  return context;
};

// Provider de autenticação (implementação simplificada para demonstração)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    const token = localStorage.getItem('ci-connect-token');
    if (token) {
      // Em uma implementação real, validaria o token com o backend
      setUser({
        id: '1',
        name: 'Usuário Demo',
        email: 'demo@ci.ufpb.br',
        role: 'student'
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulação de login - em produção faria chamada para API
      if (email && password) {
        const mockUser = {
          id: '1',
          name: 'Usuário Demo',
          email: email,
          role: 'student'
        };
        
        setUser(mockUser);
        localStorage.setItem('ci-connect-token', 'demo-token');
        return { success: true };
      }
      throw new Error('Credenciais inválidas');
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ci-connect-token');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
