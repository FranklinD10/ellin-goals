import { useEffect, useState } from 'react';
import { Container, Title, Loader, Alert, Table } from '@mantine/core';
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

  if (loading) return <Loader />;
  if (!analytics.length) return <Alert color="yellow">No analytics data available.</Alert>;

  return (
    <Container py="xl">
      <Title order={2}>Dynamic Analytics</Title>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {analytics.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{JSON.stringify(item)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
