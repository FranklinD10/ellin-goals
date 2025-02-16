import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { getUserData } from '../lib/firestore';
import { useUser } from '../contexts/UserContext';

export default function FirestoreTest() {
  const { currentUser } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError('No user logged in');
        setLoading(false);
        return;
      }

      try {
        const doc = await getUserData(currentUser);
        setData(doc);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>Firestore Test</Typography>
      <Typography variant="body1">
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Container>
  );
}
