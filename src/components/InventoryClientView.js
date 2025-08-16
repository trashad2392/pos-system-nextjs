'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Box, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';

export default function InventoryClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // This function will be passed to the AddProductForm to refresh the product list
  const handleProductAdded = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data); // Update the product list with the latest data
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Inventory Management</h1>
      <AddProductForm onProductAdded={handleProductAdded} />
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