import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configurar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ci-connect-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('ci-connect-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços da API
export const apiService = {
  // Projetos
  getProjects: async (params = {}) => {
    try {
      const response = await api.get('/api/projects', { params });
      return response.data;
    } catch (error) {
      // Retornar dados mockados em caso de erro
      return {
        data: [
          {
            _id: '1',
            title: 'Sistema de Recomendação com IA',
            description: 'Desenvolvimento de um sistema de recomendação utilizando machine learning para sugerir projetos e conexões acadêmicas.',
            status: 'Ongoing',
            tags: ['machine-learning', 'python', 'recommender-system'],
            members: [
              { name: 'João Silva', profilePicture: null },
              { name: 'Maria Santos', profilePicture: null }
            ],
            laboratory: { name: 'Laboratório de IA' },
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Plataforma de Ensino Online',
            description: 'Criação de uma plataforma web para ensino à distância com funcionalidades de videoconferência e gamificação.',
            status: 'Planning',
            tags: ['web-development', 'education', 'react', 'node.js'],
            members: [
              { name: 'Ana Costa', profilePicture: null },
              { name: 'Pedro Lima', profilePicture: null }
            ],
            laboratory: { name: 'Lab. Eng. Software' },
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            title: 'IoT para Monitoramento Ambiental',
            description: 'Sistema IoT para monitoramento da qualidade do ar e condições climáticas no campus universitário.',
            status: 'Completed',
            tags: ['iot', 'sensors', 'arduino', 'data-analysis'],
            members: [
              { name: 'Carlos Oliveira', profilePicture: null }
            ],
            laboratory: { name: 'Lab. Redes e Sistemas' },
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  },

  // Recomendações
  getRecommendations: async () => {
    try {
      const response = await api.get('/api/recommendations');
      return response.data;
    } catch (error) {
      // Dados mockados
      return {
        projects: [
          {
            _id: '4',
            title: 'Chatbot para Atendimento Acadêmico',
            description: 'Desenvolvimento de um chatbot inteligente para auxiliar estudantes com dúvidas acadêmicas...',
            tags: ['nlp', 'chatbot', 'python']
          },
          {
            _id: '5',
            title: 'App Mobile para Gestão de Eventos',
            description: 'Aplicativo móvel para organização e participação em eventos acadêmicos...',
            tags: ['mobile', 'react-native', 'events']
          }
        ]
      };
    }
  },

  // Atividades
  getActivities: async (params = {}) => {
    try {
      const response = await api.get('/api/activities', { params });
      return response.data;
    } catch (error) {
      // Dados mockados
      return {
        data: [
          {
            user: { name: 'João Silva', profilePicture: null },
            action: 'criou um novo projeto',
            description: 'Sistema de Recomendação com IA',
            timestamp: new Date().toISOString()
          },
          {
            user: { name: 'Maria Santos', profilePicture: null },
            action: 'se juntou ao projeto',
            description: 'Plataforma de Ensino Online',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            user: { name: 'Ana Costa', profilePicture: null },
            action: 'publicou uma atualização',
            description: 'Progresso na implementação do frontend',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      };
    }
  },

  // Estatísticas do dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      // Dados mockados
      return {
        totalProjects: 15,
        totalUsers: 45,
        totalLabs: 5,
        totalOpportunities: 8
      };
    }
  },

  // Usuários
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/api/users', { params });
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  // Laboratórios
  getLaboratories: async () => {
    try {
      const response = await api.get('/api/laboratories');
      return response.data;
    } catch (error) {
      return {
        data: [
          {
            _id: '1',
            name: 'Laboratório de Inteligência Artificial',
            description: 'Pesquisa em IA, Machine Learning e Deep Learning'
          },
          {
            _id: '2',
            name: 'Laboratório de Engenharia de Software',
            description: 'Desenvolvimento de metodologias e ferramentas'
          }
        ]
      };
    }
  },

  // Oportunidades
  getOpportunities: async () => {
    try {
      const response = await api.get('/api/opportunities');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }
};

export default api;
