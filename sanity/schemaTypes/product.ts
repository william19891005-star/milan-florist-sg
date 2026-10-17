import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'product',
  title: '商品 (Products)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '商品名称 (Product Title)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: '商品分类 (Category)',
      type: 'string',
      options: {
        list: [
          { title: '🎉 开张花篮 (Grand Opening)', value: 'Opening' },
          { title: '🕊️ 白事花圈 / 挽联 (Condolence Wreaths)', value: 'Condolence' },
          { title: '🌹 精选花束 (Bouquets)', value: 'Bouquets' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: '价格 SGD (Price)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'description',
      title: '商品描述 (Description)',
      type: 'text',
    }),
    defineField({
      name: 'images',
      title: '商品图片 (Images)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'whatsappNumber',
      title: '接收订单的 WhatsApp 号码 (含国家码，例 60167297027)',
      type: 'string',
      initialValue: '60167297027',
    }),
  ],
})
