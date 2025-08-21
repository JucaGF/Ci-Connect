import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

// Páginas em desenvolvimento - estrutura básica

export const Profile = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Perfil do Usuário</Typography>
        <Typography variant="body1">Página de perfil em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export const Projects = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Projetos</Typography>
        <Typography variant="body1">Listagem de projetos em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export const ProjectDetail = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Detalhes do Projeto</Typography>
        <Typography variant="body1">Página de detalhes em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export const Laboratories = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Laboratórios</Typography>
        <Typography variant="body1">Página de laboratórios em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export const Opportunities = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Oportunidades</Typography>
        <Typography variant="body1">Hub de oportunidades em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export const NetworkMap = () => (
  <Container maxWidth="lg">
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Mapa de Conexões</Typography>
        <Typography variant="body1">Visualização da rede em desenvolvimento...</Typography>
      </Paper>
    </Box>
  </Container>
);

export default {
  Profile,
  Projects,
  ProjectDetail,
  Laboratories,
  Opportunities,
  NetworkMap
};
