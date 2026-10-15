import Image from 'next/image'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

interface Product {
  _id: string
  title: string
  slug: { current: string }
  images?: any[]
  price: number
  category: string
  description?: string
}

async function getProducts(): Promise<Product[]> {
  const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    images,
    price,
    category,
    description
  }`
  return await client.fetch(query)
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* 顶部 Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
            MILAN FLORIST SG
          </h1>
          <a
            href="https://wa.me/60167297027"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
          >
            WhatsApp 客服
          </a>
        </div>
      </header>

      {/* Hero 横幅 */}
      <section className="bg-emerald-900 text-white py-12 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif mb-3">
          Exquisite Floral Arrangements for Every Moment
        </h2>
        <p className="text-emerald-100 max-w-2xl mx-auto text-sm md:text-base">
          Premium Grand Opening Stands & Funeral Condolence Wreaths. Same-day delivery across Singapore.
        </p>
      </section>

      {/* 商品展示区 */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <h3 className="text-xl font-bold text-slate-900 mb-6 border-l-4 border-emerald-600 pl-3">
          最新鲜花款 (Our Collections)
        </h3>

        {products.length === 0 ? (
          <p className="text-slate-500">暂无商品，请在 Sanity Studio 后台添加。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const mainImg = product.images?.[0]
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full h-64 bg-slate-100">
                      {mainImg ? (
                        <Image
                          src={urlFor(mainImg).width(500).height(500).url()}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          暂无图片
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-2">
                        {product.category || 'Flower'}
                      </span>
                      <h4 className="font-medium text-slate-900 text-lg line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-emerald-800 font-bold text-xl mt-1">
                        SGD ${product.price}
                      </p>
                      {product.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <a
                      href={`https://wa.me/60167297027?text=${encodeURIComponent(
                        `Hallo, I would like to inquire about: ${product.title} (SGD$${product.price})`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition"
                    >
                      WhatsApp 快速订购
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}