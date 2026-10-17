import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import schemaTypes from './sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Milan Florist SG Studio',

  // 明确写死你的 Sanity 项目 ID 和数据集
  projectId: 'ja2cgg2u',
  dataset: 'production',

  basePath: '/studio',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
