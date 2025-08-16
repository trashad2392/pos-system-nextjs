import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  // A "client" is a single connection from the pool, dedicated to this transaction
  const client = await pool.connect();

  try {
    // Get the cart items from the request sent by the frontend
    const cartItems = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. START THE TRANSACTION
    await client.query('BEGIN');

    // 2. Calculate the total amount on the server for security
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);

    // 3. Insert one record into the main 'sales' table
    const saleResult = await client.query(
      'INSERT INTO sales (total_amount) VALUES ($1) RETURNING id',
      [totalAmount]
    );
    const saleId = saleResult.rows[0].id;

    // 4. Loop through every item that was in the cart
    for (const item of cartItems) {
      // 4a. Insert a record for this item into the 'sale_items' table
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES ($1, $2, $3, $4)',
        [saleId, item.id, item.quantity, item.price]
      );

      // 4b. CRITICAL: Decrease the stock quantity in the 'products' table
      const updateStockResult = await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *',
        [item.quantity, item.id]
      );

      // If a product is out of stock, the update will return 0 rows, and we must fail.
      if (updateStockResult.rowCount === 0) {
        throw new Error(`Insufficient stock for product ID ${item.id}`);
      }
    }

    // 5. If all of the above commands succeeded, COMMIT the transaction to save it permanently.
    await client.query('COMMIT');

    return NextResponse.json({ success: true, saleId: saleId }, { status: 201 });

  } catch (error) {
    // 6. If ANY error occurred at any step, ROLLBACK the transaction to undo everything.
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: 'Transaction failed', details: error.message }, { status: 500 });
  } finally {
    // 7. No matter what, ALWAYS release the client back to the connection pool.
    client.release();
  }
}