// src/app/sales/page.js

import { getSales } from '@/lib/data';
import { Title, Paper } from '@mantine/core';
import SalesTable from '@/components/SalesTable'; // Import our new client component

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  // 1. This page remains a fast Server Component for fetching data.
  const sales = await getSales();

  // 2. We then pass that data down to the Client Component for rendering.
  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={1} mb="xl">Sales Report</Title>
      <SalesTable sales={sales} />
    </Paper>
  );
}