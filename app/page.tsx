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
      images,
      category,
      whatsappNumber
    }
  `);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', color: '#1F2937' }}>
      
      {/* 1. 顶部导航栏 (Navbar) */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669', letterSpacing: '0.5px' }}>
          🌹 MILAN FLORIST SG
        </div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
          <a href="#collections" style={{ color: '#4B5563', textDecoration: 'none' }}>精选花款</a>
          <a href="#about" style={{ color: '#4B5563', textDecoration: 'none' }}>关于我们</a>
          <a href="#contact" style={{ color: '#4B5563', textDecoration: 'none' }}>联系客服</a>
        </div>
      </nav>

      {/* 2. 沉浸式幻灯片/横幅区 (Hero Slideshow Banner) */}
      <header style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', color: '#ffffff', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Singapore Same-Day Delivery
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '20px 0 12px 0' }}>
            MILAN FLORIST SG
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: '0.9', marginBottom: '24px', lineHeight: '1.5' }}>
            Exquisite Grand Opening Flower Stands & Funeral Condolence Wreaths crafted for every meaningful moment across Singapore.
          </p>
          <a 
            href="https://wa.me/60167297027?text=Hi,%20I%20would%20like%20to%20inquire%20about%20your%20floral%20services." 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ backgroundColor: '#ffffff', color: '#065F46', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            💬 WhatsApp 专属客服咨询
          </a>
        </div>
      </header>

      {/* 3. 商品展示区 (Product Collections) */}
      <main id="collections" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              最新鲜花款 (Our Collections)
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: '4px 0 0 0' }}>
              精选高品质鲜花，支持全岛各大殡仪馆、灵堂及开张庆典快速配送。
            </p>
          </div>
        </div>

        {/* 商品网格 (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: '24px', justifyContent: 'center' }}>
          {products.map((product: any) => {
            const imageUrl = product.images && product.images[0] ? urlFor(product.images[0]).url() : null;
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
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s'
                }}
              >
                <div>
                  {/* 图片容器 */}
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

                  {/* 商品信息 */}
                  <div style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#DB2777', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

                {/* WhatsApp 订购按钮 */}
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
      </main>

      {/* 4. 关于我们与服务保障 (About Us Section) */}
      <section id="about" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '50px 16px', marginTop: '60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '16px' }}>为什么选择 Milan Florist SG？</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '30px', textAlign: 'left' }}>
            <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>🚚 新加坡全岛配送</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>专业覆盖新加坡各大殡仪馆、灵堂、商业开张地点及住宅地址，准时送达。</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>✨ 严选优质鲜花</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>采用高品质新鲜花材，由专业花艺师精心设计，庄重肃穆或喜庆大方兼具。</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>💬 贴心一对一服务</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>支持定制挽词、贺词及加急订单，通过 WhatsApp 轻松快捷沟通对接。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 联系我们/页脚 (Contact & Footer) */}
      <footer id="contact" style={{ backgroundColor: '#111827', color: '#9CA3AF', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '12px' }}>Contact Us / 联系我们</h2>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
            如有任何定制需求或紧急订单，欢迎随时通过 WhatsApp 与我们取得联系。
          </p>
          <a 
            href="https://wa.me/60167297027?text=Hi,%20I%20would%20like%20to%20inquire%20about%20Milan%20Florist." 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-block', backgroundColor: '#059669', color: '#ffffff', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', marginBottom: '30px' }}
          >
            立即联系 WhatsApp (+60 16-729 7027)
          </a>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', fontSize: '0.85rem' }}>
            © 2026 Milan Florist SG. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
