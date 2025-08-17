'use client'; // <-- This marks it as a Client Component

import { useState, useEffect } from 'react';
import { Title, Table, Paper, Text, List } from '@mantine/core';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/sales'); // Fetch from our API
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        setSales(data);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []); // This empty array means the effect runs once when the page loads

  if (loading) {
    return <p>Loading sales report...</p>;
  }

  if (error) {
    return <p>Error loading sales: {error}</p>;
  }

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={1} mb="xl">Sales Report</Title>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Sale ID</Table.Th>
            <Table.Th>Date & Time</Table.Th>
            <Table.Th>Items Sold</Table.Th>
            <Table.Th>Total Amount</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sales.map((sale) => (
            <Table.Tr key={sale.sale_id}>
              <Table.Td>{sale.sale_id}</Table.Td>
              <Table.Td>{new Date(sale.created_at).toLocaleString()}</Table.Td>
              <Table.Td>
                <List size="sm">
                  {sale.items.map((item, index) => (
                    <List.Item key={index}>
                      {item.product_name} (x{item.quantity}) - ${parseFloat(item.price_at_sale).toFixed(2)} each
                    </List.Item>
                  ))}
                </List>
              </Table.Td>
              <Table.Td>${parseFloat(sale.total_amount).toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {sales.length === 0 && <Text mt="md">No sales have been recorded yet.</Text>}
    </Paper>
  );
}