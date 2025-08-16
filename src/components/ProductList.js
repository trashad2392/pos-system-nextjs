'use client';

import React from 'react';
import { Table, Paper, Title } from '@mantine/core';

export default function ProductList({ products }) {
  const rows = Array.isArray(products) ? products.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>{product.id}</Table.Td>
      <Table.Td>{product.name}</Table.Td>
      <Table.Td>{product.sku}</Table.Td>
      <Table.Td>${parseFloat(product.price).toFixed(2)}</Table.Td>
      <Table.Td>{product.stock_quantity}</Table.Td>
    </Table.Tr>
  )) : [];

  return (
    <Paper shadow="xs" p="md" withBorder mt="xl">
      <Title order={2} mb="md">Product List</Title>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>SKU</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Stock Quantity</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Paper>
  );
}