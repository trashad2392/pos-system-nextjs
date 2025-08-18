'use client';

import { useState, useEffect } from 'react';
import { Title, Box, TextInput, Table, Button, Paper, Group, ActionIcon, Modal, NumberInput } from '@mantine/core';
import { IconSearch, IconEdit, IconArchive } from '@tabler/icons-react'; // Changed from IconTrash
import { useDisclosure } from '@mantine/hooks';
import AddProductForm from '@/components/AddProductForm';

export default function InventoryClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for the Edit Modal
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Function to refresh the product list from the server
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Sync state with props when they change
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Function to handle clicking the "Edit" button
  const handleEditClick = (product) => {
    setSelectedProduct({ ...product }); // Use a copy to avoid direct state mutation
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
    }
  };

  // Function to "soft delete" by archiving a product
  const handleArchive = async (productId) => {
    // This is the confirmation pop-up you requested
    if (window.confirm('Are you sure you want to archive this product? It will be hidden from view but remain in your sales history.')) {
      try {
        // We still use the DELETE method, but our backend logic now archives instead of deleting
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to archive product');
        }
        await fetchProducts(); // Refresh the list after archiving
      } catch (error) {
        console.error("Failed to archive product:", error);
        // You could show an error message to the user here
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
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
              min={0}
              value={parseFloat(selectedProduct.price)}
              onChange={(value) => setSelectedProduct({ ...selectedProduct, price: value || 0 })}
            />
            <NumberInput
              mt="md"
              label="Stock Quantity"
              required
              allowDecimal={false}
              min={0}
              value={selectedProduct.stock_quantity}
              onChange={(value) => setSelectedProduct({ ...selectedProduct, stock_quantity: value || 0 })}
            />
            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={close}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </Group>
          </form>
        )}
      </Modal>

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
                    <Group gap="xs">
                      <ActionIcon variant="outline" onClick={() => handleEditClick(product)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon title="Archive Product" color="red" variant="outline" onClick={() => handleArchive(product.id)}>
                        <IconArchive size={16} />
                      </ActionIcon>
                    </Group>
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