import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();
  try {
    const cartItems = await request.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    await client.query('BEGIN');

    const totalAmount = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

    const saleResult = await client.query(
      'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id',
      [totalAmount]
    );
    const saleId = saleResult.rows[0].id;

    for (const item of cartItems) {
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)',
        [saleId, item.id, item.quantity, item.price]
      );
      const updateStockResult = await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *',
        [item.quantity, item.id]
      );
      if (updateStockResult.rowCount === 0) {
        throw new Error(`Insufficient stock for product ID ${item.id}`);
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, saleId: saleId }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: 'Transaction failed', details: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}