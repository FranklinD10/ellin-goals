import { useState, useEffect } from 'react';
import { Container, Title, Text, Loader, Alert } from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function FirestoreTest() {
  const [loading, setLoading] = useState(true);
  const [docCount, setDocCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const snapshot = await getDocs(collection(db, 'analytics'));
        setDocCount(snapshot.size);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      }
      setLoading(false);
    }
    testConnection();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container py="xl">
      <Title order={2}>Firestore Connection Test</Title>
      <Text>Documents in "analytics": {docCount}</Text>
    </Container>
  );
}
