import { Container, Typography, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { getUserDoc } from '../lib/firestore';

export default function FirestoreTest() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doc = await getUserDoc('test');
        setData(doc);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
