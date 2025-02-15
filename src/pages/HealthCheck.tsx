import React, { useEffect, useState } from 'react';
import { Container, Stack, Card, Typography, Box, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '../contexts/UserContext';

interface HealthStatus {
  name: string;
  status: 'ok' | 'error';
  message: string;
}

const HealthCheck: React.FC = () => {
  const { currentUser } = useUser();
  const [checks, setChecks] = useState<HealthStatus[]>([]);

  useEffect(() => {
    const runHealthChecks = async () => {
      const results: HealthStatus[] = [];

      // Check 1: Firebase Connection
      try {
        const snapshot = await getDocs(collection(db, 'habits'));
        results.push({
          name: 'Firebase Connection',
          status: 'ok',
          message: 'Successfully connected to Firestore'
        });
      } catch (error) {
        results.push({
          name: 'Firebase Connection',
          status: 'error',
          message: 'Failed to connect to Firestore'
        });
      }

      // Check 2: User Context
      results.push({
        name: 'User Context',
        status: currentUser ? 'ok' : 'error',
        message: currentUser ? `User context loaded: ${currentUser}` : 'User context not available'
      });

      // Check 3: Local Storage
      try {
        localStorage.setItem('health_check', 'test');
        localStorage.removeItem('health_check');
        results.push({
          name: 'Local Storage',
          status: 'ok',
          message: 'Local storage is working'
        });
      } catch {
        results.push({
          name: 'Local Storage',
          status: 'error',
          message: 'Local storage is not available'
        });
      }

      setChecks(results);
    };

    runHealthChecks();
  }, [currentUser]);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700} mb={2}>System Health Check</Typography>
        
        {checks.map((check, index) => (
          <Card key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }} elevation={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography fontWeight={500}>{check.name}</Typography>
                <Typography variant="body2" color="text.secondary">{check.message}</Typography>
              </Box>
              {check.status === 'ok' ? (
                <CheckCircleIcon color="success" fontSize="medium" />
              ) : (
                <CancelIcon color="error" fontSize="medium" />
              )}
            </Box>
          </Card>
        ))}

        {checks.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography color="text.secondary">Running health checks...</Typography>
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default HealthCheck;
