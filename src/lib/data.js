/**
 * @file src/lib/data.js
 * @description Centralized module for all database query functions.
 */

import db from '@/lib/db';
// STEP 1: Import the 'unstable_noStore' function from next/cache
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Fetches all non-archived products from the database.
 * This function is marked as dynamic and will not be cached.
 * @returns {Promise<Array>} A promise that resolves to an array of product objects.
 */
export async function getProducts() {
  // STEP 2: Add this line to the top of the function
  noStore(); 

  try {
    const { rows: products } = await db.query(
      'SELECT * FROM products WHERE is_archived = false ORDER BY id ASC'
    );
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetches all sales, joining with items and products.
 * (For now, we'll let this one be cached unless you need it to be dynamic too)
 * @returns {Promise<Array>} A promise that resolves to an array of sale objects.
 */
export async function getSales() {
  try {
    const query = `
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
      FROM
        sales s
      JOIN
        sale_items si ON s.id = si.sale_id
      JOIN
        products p ON si.product_id = p.id
      GROUP BY
        s.id
      ORDER BY
        s.created_at DESC;
    `;
    const { rows: sales } = await db.query(query);
    return sales;
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return [];
  }
}