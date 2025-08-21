'use client';
import { useState } from 'react';
import { Button, TextInput, NumberInput, Group, Text, Paper, Title } from '@mantine/core';
export default function AddProductForm({ onProductAdded }) {
  const [name, setName] = useState(''); const [sku, setSku] = useState(''); const [price, setPrice] = useState(0); const [stockQuantity, setStockQuantity] = useState(0); const [message, setMessage] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault(); setMessage('Adding product...');
    const productData = { name, sku, price: parseFloat(price) || 0, stock_quantity: parseInt(stockQuantity, 10) || 0 };
    try {
      const result = await window.api.addProduct(productData);
      if (result && result.name) {
        setMessage(`Success! Added: ${result.name}`);
        setName(''); setSku(''); setPrice(0); setStockQuantity(0);
        if (onProductAdded) { onProductAdded(); }
      } else { throw new Error('Failed to add product.'); }
    } catch (error) { setMessage(`Error: ${error.message}`); console.error("Add Product Error:", error); }
  };
  return (
    <Paper shadow="xs" p="md" withBorder mt="xl"><Title order={2} mb="md">Add a New Product</Title><form onSubmit={handleSubmit}><Group grow><TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required/><TextInput label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required/></Group><Group grow mt="md"><NumberInput label="Price" value={price} onChange={setPrice} required precision={2} step={0.01} min={0}/><NumberInput label="Stock Quantity" value={stockQuantity} onChange={setStockQuantity} required allowDecimal={false} min={0}/></Group><Button type="submit" mt="md">Add Product</Button></form>{message && <Text mt="sm" c={message.startsWith('Error') ? 'red' : 'green'}>{message}</Text>}</Paper>
  );
}
