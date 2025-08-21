import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  Lightbulb,
  People,
  School,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import ProjectCard from '../components/ProjectCard';
import { apiService } from '../services/api';

const Home = () => {
  const [feedTab, setFeedTab] = useState('recent');

  // Queries para dados do dashboard
  const { data: recentProjects, isLoading: loadingProjects } = useQuery(
    'recentProjects',
    () => apiService.getProjects({ limit: 6, sort: 'recent' })
  );

  const { data: recommendations, isLoading: loadingRecs } = useQuery(
    'recommendations',
    () => apiService.getRecommendations()
  );

  const { data: activities, isLoading: loadingActivities } = useQuery(
    'activities',
    () => apiService.getActivities({ limit: 10 })
  );

  const { data: stats } = useQuery(
    'dashboardStats',
    () => apiService.getDashboardStats()
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Seção principal */}
        <Grid item xs={12} md={8}>
          {/* Header de boas-vindas */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Bem-vindo ao CI-Connect! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Conecte-se, colabore e construa o futuro da computação na UFPB
            </Typography>
          </Paper>

          {/* Estatísticas rápidas */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" color="primary">
                    {stats?.totalProjects || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projetos Ativos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" color="secondary">
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Membros
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School color="success.main" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" color="success.main">
                    {stats?.totalLabs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Laboratórios
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Lightbulb color="warning.main" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" color="warning.main">
                    {stats?.totalOpportunities || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Oportunidades
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Projetos em Destaque */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Projetos em Destaque
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Descubra os projetos mais ativos da nossa comunidade
            </Typography>
            
            {loadingProjects ? (
              <Typography>Carregando projetos...</Typography>
            ) : (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {recentProjects?.data?.slice(0, 3).map((project) => (
                  <Grid item xs={12} md={4} key={project._id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>
            )}
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" href="/projects">
                Ver Todos os Projetos
              </Button>
            </Box>
          </Paper>

          {/* Feed de Atividades */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Atividades Recentes
            </Typography>
            
            {loadingActivities ? (
              <Typography>Carregando atividades...</Typography>
            ) : (
              <List className="activity-feed">
                {activities?.data?.map((activity, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={activity.user?.profilePicture}>
                        {activity.user?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography component="span" variant="body1">
                          <strong>{activity.user?.name}</strong> {activity.action}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recomendações para você */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recomendado para Você
            </Typography>
            
            {loadingRecs ? (
              <Typography>Carregando recomendações...</Typography>
            ) : (
              <>
                {recommendations?.projects?.slice(0, 3).map((project) => (
                  <Card key={project._id} sx={{ mb: 2 }} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {project.description.substring(0, 100)}...
                      </Typography>
                      <Box>
                        {project.tags?.slice(0, 2).map((tag, index) => (
                          <Chip key={index} label={tag} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="text" size="small" fullWidth>
                  Ver Mais Recomendações
                </Button>
              </>
            )}
          </Paper>

          {/* Oportunidades */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Oportunidades em Destaque
            </Typography>
            
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ mb: 2 }} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Estágio em Data Science
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Oportunidade para estudantes de computação...
                  </Typography>
                  <Chip label="Estágio" size="small" color="primary" />
                </CardContent>
              </Card>
            ))}
            
            <Button variant="text" size="small" fullWidth href="/opportunities">
              Ver Todas as Oportunidades
            </Button>
          </Paper>

          {/* Links Rápidos */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Links Rápidos
            </Typography>
            <List dense>
              <ListItem button component="a" href="/network">
                <ListItemText primary="Mapa de Conexões" />
              </ListItem>
              <ListItem button component="a" href="/laboratories">
                <ListItemText primary="Laboratórios" />
              </ListItem>
              <ListItem button component="a" href="/profile">
                <ListItemText primary="Editar Perfil" />
              </ListItem>
              <ListItem button component="a" href="/help">
                <ListItemText primary="Central de Ajuda" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
