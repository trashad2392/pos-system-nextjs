import pool from '@/lib/db';
import PosClientView from '@/components/PosClientView';

// This server component fetches the initial data
async function getProducts() {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function PosPage() {
  const products = await getProducts();

  // It then passes the data to our interactive client component
  return <PosClientView initialProducts={products} />;
}