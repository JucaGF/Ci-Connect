import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  Button,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  People as PeopleIcon,
  Timeline as ProgressIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning':
        return 'info';
      case 'Ongoing':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getProgressValue = (status) => {
    switch (status) {
      case 'Planning':
        return 10;
      case 'Ongoing':
        return 60;
      case 'Completed':
        return 100;
      default:
        return 0;
    }
  };

  const statusLabels = {
    'Planning': 'Planejamento',
    'Ongoing': 'Em Andamento',
    'Completed': 'Concluído'
  };

  return (
    <Card 
      className="project-card"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Cabeçalho com status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip 
            label={statusLabels[project.status] || project.status}
            color={getStatusColor(project.status)}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {new Date(project.createdAt).toLocaleDateString('pt-BR')}
          </Typography>
        </Box>

        {/* Título do projeto */}
        <Typography variant="h6" component="h2" gutterBottom>
          {project.title}
        </Typography>

        {/* Descrição */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {project.description}
        </Typography>

        {/* Progresso */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ProgressIcon sx={{ fontSize: 16, mr: 1 }} />
            <Typography variant="caption">
              Progresso: {getProgressValue(project.status)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressValue(project.status)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {project.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {project.tags.length > 3 && (
              <Chip
                label={`+${project.tags.length - 3}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        )}

        {/* Membros */}
        {project.members && project.members.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 16, mr: 1 }} />
            <AvatarGroup max={4} sx={{ mr: 1 }}>
              {project.members.map((member, index) => (
                <Avatar
                  key={index}
                  sx={{ width: 24, height: 24 }}
                  src={member.profilePicture}
                  alt={member.name}
                >
                  {member.name?.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
            <Typography variant="caption" color="text.secondary">
              {project.members.length} {project.members.length === 1 ? 'membro' : 'membros'}
            </Typography>
          </Box>
        )}

        {/* Laboratório */}
        {project.laboratory && (
          <Typography variant="caption" color="primary">
            {project.laboratory.name}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          startIcon={<ViewIcon />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project._id}`);
          }}
        >
          Ver Detalhes
        </Button>
        <Button 
          size="small" 
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            // Implementar lógica de interesse/seguir
          }}
        >
          Seguir
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
