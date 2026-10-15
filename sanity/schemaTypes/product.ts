export default {
  name: 'product',
  title: 'Florist Products (花店商品)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Product Name (商品名称)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (网址别名)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'images',
      title: 'Product Images (商品图片)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'price',
      title: 'Price (SGD 新币价格)',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category (商品分类)',
      type: 'string',
      options: {
        list: [
          { title: 'Grand Opening Flower Stand (开张花篮)', value: 'opening-stand' },
          { title: 'Condolence Wreath (白事花圈)', value: 'condolence-wreath' },
          { title: 'Bouquet & Hand Flower (手捧花束)', value: 'bouquet' },
          { title: 'Opening Table Basket (案台开张花篮)', value: 'table-basket' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description (商品详情描述)',
      type: 'text',
    },
  ],
}