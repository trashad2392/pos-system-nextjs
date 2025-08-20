import { getProducts } from '@/lib/data';
import PosClientView from '@/components/PosClientView';

// This line forces the page to always be rendered dynamically
export const dynamic = 'force-dynamic';

export default async function PosPage() {
  const products = await getProducts();
  return <PosClientView initialProducts={products} />;
}