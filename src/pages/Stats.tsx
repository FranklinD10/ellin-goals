import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Alert, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { getAnalytics } from '../lib/firestore';

export default function Stats() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!analytics.length) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="warning">No analytics data available.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>Dynamic Analytics</Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.map(item => (
              <TableRow key={item.id} hover>
                <TableCell>{item.id}</TableCell>
                <TableCell>{JSON.stringify(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
