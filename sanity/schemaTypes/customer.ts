export default {
  name: 'customer',
  title: '会员管理 (Customers)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: '顾客姓名 (Name)',
      type: 'string',
    },
    {
      name: 'phone',
      title: '手机号码/账号 (Phone)',
      type: 'string',
      description: '请输入带国家码的手机号（例如：6591234567 或 60167297027）',
    },
    {
      name: 'points',
      title: '可用积分 (Points)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'notes',
      title: '备注/消费历史 (Notes)',
      type: 'text',
    },
  ],
}
