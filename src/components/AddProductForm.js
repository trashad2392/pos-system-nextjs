'use client';

import { useState } from 'react';
// We no longer need the router here
// import { useRouter } from 'next/navigation';
import { Button, TextInput, NumberInput, Group, Text } from '@mantine/core';


// It now accepts 'onProductAdded' as a prop
export default function AddProductForm({ onProductAdded }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Adding product...');
    const productData = { name, sku, price: parseFloat(price), stock_quantity: parseInt(stockQuantity, 10) };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.error || 'Failed to add product'); }

      setMessage(`Success! Added: ${result.name}`);
      setName(''); setSku(''); setPrice(''); setStockQuantity('');

      // --- THIS IS THE FIX ---
      // Instead of router.refresh(), we call the function our parent gave us
      if (onProductAdded) {
        onProductAdded();
      }
      // -----------------------

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Add a New Product</h2>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          mb="sm"
        />
        <TextInput
          label="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
          mb="sm"
        />
        <NumberInput
          label="Price"
          value={price}
          onChange={setPrice}
          required
          mb="sm"
          precision={2}
          step={0.01}
        />
        <NumberInput
          label="Stock Quantity"
          value={stockQuantity}
          onChange={setStockQuantity}
          required
          mb="sm"
          allowDecimal={false}
        />
        <Button type="submit">Add Product</Button>
      </form>
      {message && <Text mt="sm" c={message.startsWith('Error') ? 'red' : 'green'}>{message}</Text>}
    </div>
  );
}