import React, { useEffect, useState } from 'react';
import { Container, Stack, Card, Text, Group, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
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
    <Container size="sm" py="xl">
      <Stack spacing="md">
        <Text size="xl" weight={700} mb="md">System Health Check</Text>
        
        {checks.map((check, index) => (
          <Card key={index} padding="md" radius="md" withBorder>
            <Group position="apart">
              <div>
                <Text weight={500}>{check.name}</Text>
                <Text size="sm" color="dimmed">{check.message}</Text>
              </div>
              <ThemeIcon 
                color={check.status === 'ok' ? 'teal' : 'red'} 
                size="lg" 
                radius="xl"
              >
                {check.status === 'ok' ? <IconCheck size={20} /> : <IconX size={20} />}
              </ThemeIcon>
            </Group>
          </Card>
        ))}

        {checks.length === 0 && (
          <Text color="dimmed" align="center">Running health checks...</Text>
        )}
      </Stack>
    </Container>
  );
};

export default HealthCheck;
