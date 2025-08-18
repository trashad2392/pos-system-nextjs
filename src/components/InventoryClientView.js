'use client';

import { useState, useEffect } from 'react';
import { Title, Box, TextInput, Table, Button, Paper, Group, ActionIcon, Modal, NumberInput } from '@mantine/core';
import { IconSearch, IconEdit } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import AddProductForm from '@/components/AddProductForm';

export default function InventoryClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');

  // State for the Edit Modal
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
  };

  // Function to handle clicking the "Edit" button
  const handleEditClick = (product) => {
    setSelectedProduct(product); // Set the product to be edited
    open(); // Open the modal
  };

  // Function to handle saving changes from the Edit form
  const handleUpdateProduct = async (event) => {
    event.preventDefault();
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProduct),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      await fetchProducts(); // Refresh the product list
      close(); // Close the modal

    } catch (error) {
      console.error("Failed to update product:", error);
      // Here you could add a state to show an error message in the modal
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* This is the Edit Product Modal. It is hidden until 'opened' is true. */}
      <Modal opened={opened} onClose={close} title="Edit Product">
        {selectedProduct && (
          <form onSubmit={handleUpdateProduct}>
            <TextInput
              label="Product Name"
              required
              value={selectedProduct.name}
              onChange={(event) => setSelectedProduct({ ...selectedProduct, name: event.currentTarget.value })}
            />
            <TextInput
              mt="md"
              label="SKU"
              required
              value={selectedProduct.sku}
              onChange={(event) => setSelectedProduct({ ...selectedProduct, sku: event.currentTarget.value })}
            />
            <NumberInput
              mt="md"
              label="Price"
              required
              precision={2}
              value={parseFloat(selectedProduct.price)}
              onChange={(value) => setSelectedProduct({ ...selectedProduct, price: value })}
            />
            <NumberInput
              mt="md"
              label="Stock Quantity"
              required
              allowDecimal={false}
              value={selectedProduct.stock_quantity}
              onChange={(value) => setSelectedProduct({ ...selectedProduct, stock_quantity: value })}
            />
            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </Group>
          </form>
        )}
      </Modal>

      {/* This is our main Inventory Page content */}
      <div>
        <h1>Inventory Management</h1>
        <AddProductForm onProductAdded={fetchProducts} />
        <hr style={{ margin: '2rem 0' }} />

        <Paper shadow="xs" p="md" withBorder mt="xl">
          <Title order={2} mb="md">Product List</Title>
          <Box mb="md">
            <TextInput
              placeholder="Search by name or SKU..."
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
          </Box>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Stock</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredProducts.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>{product.id}</Table.Td>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td>{product.sku}</Table.Td>
                  <Table.Td>${parseFloat(product.price).toFixed(2)}</Table.Td>
                  <Table.Td>{product.stock_quantity}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="outline" onClick={() => handleEditClick(product)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </div>
    </>
  );
}