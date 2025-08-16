'use client'; 

import { useState, useEffect } from 'react';
import { Title, Grid, Table, Button, Paper, ScrollArea, List, Text, ThemeIcon } from '@mantine/core';
import { IconCircleCheck, IconShoppingCart } from '@tabler/icons-react';

export default function PosClientView({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);

  const handleAddToCart = (productToAdd) => {
    const existingItem = cart.find(item => item.id === productToAdd.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    if (currentQuantityInCart >= productToAdd.stock_quantity) {
      alert(`Cannot add more of "${productToAdd.name}". Stock limit of ${productToAdd.stock_quantity} reached!`);
      return; 
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === productToAdd.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

  // This is a fix for the hydration warning. We can remove it later if we solve it in layout.js
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading POS...</div>; // Or null
  }


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
                    <List.Item
                      key={item.id}
                      icon={
                        <ThemeIcon color="teal" size={24} radius="xl">
                          <IconCircleCheck size={16} />
                        </ThemeIcon>
                      }
                    >
                      {item.name} - ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                    </List.Item>
                  ))}
                </List>
                <hr />
                <Title order={3}>Total: ${cartTotal.toFixed(2)}</Title>
              </>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}