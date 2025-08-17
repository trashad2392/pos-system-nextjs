'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Grid, Table, Button, Paper, ScrollArea, List, Text, ThemeIcon, Group, ActionIcon, Box, TextInput } from '@mantine/core';
import { IconCircleCheck, IconShoppingCart, IconPlus, IconMinus, IconX, IconSearch } from '@tabler/icons-react';

export default function PosClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // This function fetches the latest product list from the backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setProducts(data); // Directly update our product list state
    } catch (error) {
      console.error("Failed to re-fetch products:", error);
      setMessage("Error: Could not refresh product list.");
    }
  };

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find(item => item.id === productToAdd.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    if (currentQuantityInCart >= productToAdd.stock_quantity) {
      alert(`Cannot add more of "${productToAdd.name}". Stock limit reached!`);
      return;
    }
    if (existingItem) {
      handleIncreaseQuantity(productToAdd.id);
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemIdToRemove) => {
    setCart(cart.filter(item => item.id !== itemIdToRemove));
  };

  const handleIncreaseQuantity = (itemIdToIncrease) => {
    const itemInCart = cart.find(item => item.id === itemIdToIncrease);
    const productInStock = products.find(p => p.id === itemIdToIncrease);
    if (itemInCart && productInStock && itemInCart.quantity < productInStock.stock_quantity) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemIdToIncrease
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      alert(`Stock limit for "${itemInCart.name}" reached!`);
    }
  };

  const handleDecreaseQuantity = (itemIdToDecrease) => {
    const existingItem = cart.find(item => item.id === itemIdToDecrease);
    if (existingItem.quantity === 1) {
      handleRemoveItem(itemIdToDecrease);
    } else {
      setCart(cart.map(item =>
        item.id === itemIdToDecrease
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setMessage('Processing sale...');
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.details || 'Checkout failed'); }
      
      setMessage(`Sale successful! Sale ID: ${result.saleId}`);
      setCart([]); 
      
      await fetchProducts(); 
      
    } catch (error) {
      setMessage(`Error during checkout: ${error.message}`);
      console.error('Checkout error:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Title order={1} mb="xl">Point of Sale</Title>
      <Grid>
        <Grid.Col span={8}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={2} mb="md">Products</Title>
            <Box mb="md">
              <TextInput
                placeholder="Search by name or SKU..."
                leftSection={<IconSearch size={14} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </Box>
            <ScrollArea h={550}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Stock</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredProducts.map((product) => (
                    <Table.Tr key={product.id}>
                      <Table.Td>{product.name}</Table.Td>
                      <Table.Td>${parseFloat(product.price).toFixed(2)}</Table.Td>
                      <Table.Td>{product.stock_quantity}</Table.Td>
                      <Table.Td>
                        <Button size="xs" onClick={() => handleAddToCart(product)} leftSection={<IconShoppingCart size={14} />}>
                          Add
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Grid.Col>
        <Grid.Col span={4}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={2} mb="md">Cart</Title>
            {cart.length === 0 ? <Text>Cart is empty</Text> : (
              <>
                <List spacing="xs" size="sm">
                  {cart.map(item => (
                    <List.Item key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div>
                        <Text size="sm">{item.name}</Text>
                        <Text size="xs" c="dimmed">${parseFloat(item.price).toFixed(2)} x {item.quantity}</Text>
                      </div>
                      <Group gap="xs">
                        <ActionIcon size="sm" variant="outline" onClick={() => handleDecreaseQuantity(item.id)}><IconMinus size={14} /></ActionIcon>
                        <ActionIcon size="sm" variant="outline" onClick={() => handleIncreaseQuantity(item.id)}><IconPlus size={14} /></ActionIcon>
                        <ActionIcon size="sm" color="red" variant="outline" onClick={() => handleRemoveItem(item.id)}><IconX size={14} /></ActionIcon>
                      </Group>
                    </List.Item>
                  ))}
                </List>
                <hr />
                <Title order={3}>Total: ${cartTotal.toFixed(2)}</Title>
                <Button fullWidth mt="md" color="green" onClick={handleCheckout}>
                  Checkout
                </Button>
              </>
            )}
            {message && <Text mt="sm" c={message.startsWith('Error') ? 'red' : 'green'}>{message}</Text>}
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}