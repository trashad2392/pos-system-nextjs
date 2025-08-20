import { getProducts } from '@/lib/data';
import InventoryClientView from '@/components/InventoryClientView';

// This line forces the page to always be rendered dynamically
export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const products = await getProducts();
  return <InventoryClientView initialProducts={products} />;
}