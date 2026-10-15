import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export const revalidate = 10;

export default async function Home() {
  const products = await client.fetch(`
    *[_type == "product"] {
      _id,
      title,
      price,
      description,
      image,
      category,
      whatsappNumber
    }
  `);

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
      {/* 头部标题 */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
          MILAN FLORIST SG
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4B5563', margin: '0 0 4px 0' }}>
          Exquisite Floral Arrangements for Every Moment
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
          Premium Grand Opening Stands & Funeral Condolence Wreaths. Same-day delivery across Singapore.
        </p>
      </header>

      {/* 商品列表 */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
          最新鲜花款 (Our Collections)
        </h2>

        {/* 卡片网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: '24px', justifyContent: 'center' }}>
          {products.map((product: any) => {
            const imageUrl = product.image ? urlFor(product.image).url() : null;
            const waNumber = product.whatsappNumber || "60167297027";
            const waLink = `https://wa.me/${waNumber}?text=Hi,%20I%20would%20like%20to%20inquire%20about%20${encodeURIComponent(product.title)}`;

            return (
              <div 
                key={product._id} 
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* 图片展示区 */}
                  <div style={{ width: '100%', height: '260px', overflow: 'hidden', position: 'relative', backgroundColor: '#F3F4F6' }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                        暂无图片
                      </div>
                    )}
                  </div>

                  {/* 商品文字信息 */}
                  <div style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#DB2777', textTransform: 'uppercase' }}>
                      {product.category || "Flower Arrangement"}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827', marginTop: '4px', marginBottom: '8px' }}>
                      {product.title}
                    </h3>
                    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669', margin: '0 0 8px 0' }}>
                      SGD ${product.price}
                    </p>
                    {product.description && (
                      <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: 0, lineHeight: '1.4' }}>
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* 订购按钮 */}
                <div style={{ padding: '16px', paddingTop: 0 }}>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      padding: '10px 0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    WhatsApp 快速订购
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
