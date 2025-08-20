// src/components/SalesTable.js

// This is the most important line. It tells Next.js to render this component in the browser.
"use client";

import { Table, Text } from '@mantine/core';

export default function SalesTable({ sales }) {
  // We moved all the table rendering logic here.
  // This component receives the 'sales' data as a prop.
  return (
    <>
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
                <div>
                  {sale.items.map((item, index) => (
                    <p key={index} style={{ margin: 0, padding: '2px 0', fontSize: '14px' }}>
                      {item.product_name} (x{item.quantity})
                    </p>
                  ))}
                </div>
              </Table.Td>
              <Table.Td>${parseFloat(sale.total_amount).toFixed(2)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {sales.length === 0 && <Text mt="md">No sales have been recorded yet.</Text>}
    </>
  );
}