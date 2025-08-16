import pool from '@/lib/db';
import AddProductForm from '@/components/AddProductForm';
import ProductList from '@/components/ProductList';

async function getProducts() {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
  } catch (error) { return []; }
}

export default async function InventoryPage() {
  const products = await getProducts();
  return (
    <div>
      <h1>Inventory Management</h1>
      <AddProductForm />
      <hr />
      <ProductList products={products} />
    </div>
  );
}