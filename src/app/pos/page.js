import pool from '@/lib/db';
import PosClientView from '@/components/PosClientView';

async function getProducts() {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_archived = false ORDER BY id ASC');
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function PosPage() {
  const products = await getProducts();
  return <PosClientView initialProducts={products} />;
}