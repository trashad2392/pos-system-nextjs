import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_archived = false ORDER BY id ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, sku, price, stock_quantity } = await request.json();
    const newProduct = await pool.query(
      'INSERT INTO products (name, sku, price, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, price, stock_quantity]
    );
    return NextResponse.json(newProduct.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}