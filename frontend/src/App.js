import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Profile, Projects, ProjectDetail, Laboratories, Opportunities, NetworkMap } from './pages/index';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth, AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="App">
      {user && <Navbar />}
      <Container maxWidth="lg" sx={{ mt: user ? 4 : 0, mb: 4 }}>
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />
          
          {/* Rotas protegidas */}
          {user ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetail />} />
              <Route path="/laboratories" element={<Laboratories />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/network" element={<NetworkMap />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Container>
    </div>
  );
}

export default App;
