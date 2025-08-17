'use client';

import { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
import { Title, Box, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';

export default function InventoryClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  // --- THIS IS THE FIX ---
  // This useEffect hook will run whenever the 'initialProducts' prop from the page changes.
  // This forces our component to update its own list with the fresh data from the server.
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  // --------------------

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Inventory Management</h1>
      {/* The onProductAdded prop is no longer needed because router.refresh() handles it */}
      <AddProductForm /> 
      <hr style={{ margin: '2rem 0' }} />

      <Title order={2} mb="md">Product List</Title>
      <Box mb="md">
        <TextInput
          placeholder="Search by name or SKU..."
          leftSection={<IconSearch size={14} />}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />
      </Box>
      <ProductList products={filteredProducts} />
    </div>
  );
}