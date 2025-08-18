import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// This function handles PUT requests to /api/products/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = params; // Read the ID from the URL
    const { name, sku, price, stock_quantity } = await request.json(); // Read the new data from the request body

    // Simple validation
    if (!name || !sku || price === undefined || stock_quantity === undefined) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const updatedProduct = await pool.query(
      'UPDATE products SET name = $1, sku = $2, price = $3, stock_quantity = $4 WHERE id = $5 RETURNING *',
      [name, sku, price, stock_quantity, id]
    );

    if (updatedProduct.rowCount === 0) {
      // This happens if no product with the given ID was found
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct.rows[0]); // Return the updated product data
  } catch (error) {
    // Handle specific errors like a duplicate SKU on a different item
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A product with this SKU already exists.' }, { status: 409 });
    }
    console.error('Update Product Error:', error);
    return NextResponse.json({ error: 'Server error while updating product' }, { status: 500 });
  }
}