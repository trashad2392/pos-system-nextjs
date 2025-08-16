'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Grid, Table, Button, Paper, ScrollArea, List, Text, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconShoppingCart } from '@tabler/icons-react';

export default function PosClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find(item => item.id === productToAdd.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    if (currentQuantityInCart >= productToAdd.stock_quantity) {
      alert(`Cannot add more of "${productToAdd.name}". Stock limit reached!`);
      return;
    }
    if (existingItem) {
      setCart(cart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
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
      router.refresh();
    } catch (error) {
      setMessage(`Error during checkout: ${error.message}`);
      console.error('Checkout error:', error);
    }
  };

  return (
    <div>
      <Title order={1} mb="xl">Point of Sale</Title>
      <Grid>
        <Grid.Col span={8}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={2} mb="md">Products</Title>
            <ScrollArea h={600}>
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
                  {products.map((product) => (
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
                <List spacing="xs" size="sm" center>
                  {cart.map(item => (
                    <List.Item key={item.id} icon={<ThemeIcon color="teal" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
                      {item.name} - ${parseFloat(item.price).toFixed(2)} x {item.quantity}
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