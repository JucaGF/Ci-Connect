import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Register = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Cadastro
          </Typography>
          <Typography variant="body1" align="center">
            Página de cadastro em desenvolvimento...
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
