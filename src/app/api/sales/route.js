import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// --- ADD THIS NEW GET FUNCTION ---
export async function GET() {
  try {
    // This is our most advanced SQL query yet! 
    // It joins the sales, sale_items, and products tables together 
    // to create a clean list of sales with all their items.
    const salesQuery = `
      SELECT 
        s.id AS sale_id,
        s.total_amount,
        s.created_at,
        json_agg(
          json_build_object(
            'product_name', p.name,
            'quantity', si.quantity,
            'price_at_sale', si.price_at_sale
          )
        ) AS items
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN products p ON si.product_id = p.id
      GROUP BY s.id
      ORDER BY s.created_at DESC;
    `;
    const result = await pool.query(salesQuery);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return NextResponse.json({ error: 'Server error while fetching sales' }, { status: 500 });
  }
}
// ------------------------------------

// This is our existing, working POST function for creating a sale
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