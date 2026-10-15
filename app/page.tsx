import { client } from "@/sanity/lib/client";

export const revalidate = 10;

export default async function Home() {
  const products = await client.fetch(`
    *[_type == "product"]
  `);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Sanity 数据库原始数据检查：
      </h1>
      <pre style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
        {JSON.stringify(products, null, 2)}
      </pre>
    </main>
  );
}
