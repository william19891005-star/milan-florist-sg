'use client';
import { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  
  // 购物车状态
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 会员积分查询状态
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [customerData, setCustomerData] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // 统一订单表单状态
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    client.fetch(`
      *[_type == "product"] {
        _id,
        title,
        price,
        description,
        images,
        category,
        whatsappNumber
      }
    `).then((data) => setProducts(data));
  }, []);

  // 加入购物车
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // 修改购物车数量
  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // 计算总金额
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 会员积分手机号查询逻辑
  const handleCheckPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError("");
    setCustomerData(null);

    try {
      const cleanPhone = searchPhone.replace(/[\s-]/g, "");
      const res = await client.fetch(
        `*[_type == "customer" && phone match $phone][0]`,
        { phone: `*${cleanPhone}*` }
      );

      if (res) {
        setCustomerData(res);
      } else {
        searchCustomerOrCreate(cleanPhone, senderName || "尊贵顾客");
      }
    } catch (err) {
      setSearchError("查询失败，请稍后再试。");
    } finally {
      setIsSearching(false);
    }
  };

  // 辅助函数：查询或创建用户（针对积分查询没找到时的自动创建）
  const searchCustomerOrCreate = async (phone: string, name: string) => {
    try {
      const existing = await client.fetch(
        `*[_type == "customer" && phone match $phone][0]`,
        { phone: `*${phone}*` }
      );
      if (existing) {
        setCustomerData(existing);
      } else {
        setSearchError("未找到该手机号。如果您是新顾客，下单时系统将为您自动注册并赠送积分账户！");
      }
    } catch (e) {
      setSearchError("查询失败。");
    }
  };

  // 提交订单至 WhatsApp + 自动累计积分逻辑
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmittingOrder) return;

    setIsSubmittingOrder(true);
    const defaultWaNumber = cart[0]?.whatsappNumber || "60167297027";
    const earnedPoints = Math.floor(totalPrice); // 消费 SGD $1 = 1 积分

    try {
      const cleanPhone = recipientPhone.replace(/[\s-]/g, "");
      
      // 1. 在 Sanity 后台查找该手机号是否已存在
      const existingCustomer = await client.fetch(
        `*[_type == "customer" && phone match $phone][0]`,
        { phone: `*${cleanPhone}*` }
      );

      if (existingCustomer) {
        // 如果是老顾客：自动累加积分
        const newTotalPoints = (existingCustomer.points || 0) + earnedPoints;
        await client.patch(existingCustomer._id)
          .set({ points: newTotalPoints })
          .commit();
      } else {
        // 如果是新顾客：自动在 Sanity 创建会员并录入首单积分
        await client.create({
          _type: 'customer',
          name: senderName || "新顾客",
          phone: recipientPhone,
          points: earnedPoints,
          notes: `自动注册：首单消费 SGD $${totalPrice}`
        });
      }
    } catch (error) {
      console.error("自动更新积分出错:", error);
      // 即使积分更新偶发异常，也不要阻断顾客发 WhatsApp 下单
    } finally {
      setIsSubmittingOrder(false);
    }

    // 2. 拼接 WhatsApp 订单文本
    const itemsText = cart
      .map((item, index) => `${index + 1}. *${item.title}* x ${item.quantity} (SGD $${item.price * item.quantity})`)
      .join("\n");

    const orderText = 
      `🌸 *【MILAN FLORIST SG 订单提交】* 🌸\n\n` +
      `🛒 *订购商品明细*:\n${itemsText}\n\n` +
      `💵 *订单总额*: *SGD $${totalPrice}* (已自动累计 ${earnedPoints} 积分)\n` +
      `---------------------------------\n` +
      `👤 *送花人 (Sender)*: ${senderName}\n` +
      `🧑 *收花人 (Recipient)*: ${recipientName}\n` +
      `📞 *收花人电话*: ${recipientPhone}\n` +
      `📍 *配送地址*: ${address}\n` +
      `📅 *配送日期/时段*: ${deliveryDate}\n` +
      `✍️ *贺词/挽词内容*: \n${message}\n\n` +
      `请问订单信息已确认，谢谢！`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${defaultWaNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', color: '#1F2937' }}>
      
      {/* 1. 顶部导航栏 */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669', letterSpacing: '0.5px' }}>
          🌹 MILAN FLORIST SG
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setIsPointsModalOpen(true)}
            style={{
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #D1D5DB',
              padding: '8px 14px',
              borderRadius: '20px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🎁 查积分 / 会员
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            🛒 购物车 ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </div>
      </nav>

      {/* 2. Banner 横幅 */}
      <header style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', color: '#ffffff', padding: '50px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0 0 12px 0' }}>
            MILAN FLORIST SG
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: '0.9', margin: 0 }}>
            Premium Grand Opening Flower Stands & Funeral Condolence Wreaths. 下单自动累积积分！
          </p>
        </div>
      </header>

      {/* 3. 商品展示区 */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
          Our Collections / 精选花款
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: '24px', justifyContent: 'center' }}>
          {products.map((product: any) => {
            const imageUrl = product.images && product.images[0] ? urlFor(product.images[0]).url() : null;

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
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ width: '100%', height: '260px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>暂无图片</div>
                    )}
                  </div>

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

                <div style={{ padding: '16px', paddingTop: 0 }}>
                  <button
                    onClick={() => addToCart(product)}
                    style={{
                      width: '100%',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      padding: '12px 0',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    🛒 加入购物车 (Add to Cart)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. 会员积分查询弹窗 */}
      {isPointsModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>🎁 查会员积分</h3>
              <button onClick={() => setIsPointsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleCheckPoints} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                required 
                placeholder="输入您的手机号码..." 
                value={searchPhone} 
                onChange={(e) => setSearchPhone(e.target.value)} 
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
              />
              <button type="submit" style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isSearching ? "查询中..." : "查询"}
              </button>
            </form>

            {searchError && (
              <div style={{ color: '#D97706', fontSize: '0.85rem', backgroundColor: '#FEF3C7', padding: '10px', borderRadius: '6px' }}>
                {searchError}
              </div>
            )}

            {customerData && (
              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#065F46' }}>👋 尊贵会员: {customerData.name}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', margin: '8px 0' }}>
                  {customerData.points} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>积分 (Points)</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: 0 }}>
                  💡 每消费 $1 自动累积 1 积分！下次下单直接填写手机号即可自动计分。
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 侧滑购物车 Drawer */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>🛍️ 您的购物车</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: '60px' }}>
                  购物车是空的，去选购心仪的花束吧！
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map((item) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.title}</div>
                        <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.85rem' }}>SGD ${item.price}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item._id, -1)} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#ffffff' }}>-</button>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} style={{ width: '28px', height: '28px', border: '1px solid #D1D5DB', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#ffffff' }}>+</button>
                      </div>
                    </div>
                  ))}

                  <form id="checkout-form" onSubmit={handleCheckout} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '2px dashed #E5E7EB', paddingTop: '16px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 'bold', color: '#111827' }}>填写送货详情 (自动累积积分)：</h4>
                    
                    <input type="text" required value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="送花人姓名 (Sender Name)*" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                    <input type="text" required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="收花人姓名/灵堂 (Recipient)*" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                    <input type="text" required value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="您的手机号码/积分账号 (Phone)*" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                    <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="新加坡详细配送地址/灵堂或展馆*" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'sans-serif' }} />
                    <input type="text" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} placeholder="配送日期与时间 (例: 10/20 14:00 前)*" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                    <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="卡片贺词 / 挽词内容" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'sans-serif' }} />
                  </form>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>
                  <span>总计 (Total):</span>
                  <span style={{ color: '#059669' }}>SGD ${totalPrice}</span>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmittingOrder}
                  style={{
                    width: '100%',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '14px 0',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  {isSubmittingOrder ? "正在为您自动计分..." : "💬 提交订单至 WhatsApp (自动记分)"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
