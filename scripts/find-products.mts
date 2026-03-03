import { prisma } from '../lib/db'

const r = await prisma.product.findMany({
  where: { OR: [
    {name:{contains:'iphone',mode:'insensitive'}},
    {name:{contains:'samsung',mode:'insensitive'}},
    {name:{contains:'galaxy',mode:'insensitive'}},
    {name:{contains:'perfume',mode:'insensitive'}},
    {categoryKey:{contains:'perfume',mode:'insensitive'}},
  ]},
  orderBy: [{featured:'desc'},{rating:'desc'}],
  take: 15,
  select: {id:true, name:true, brand:true, categoryKey:true}
})
console.log(JSON.stringify(r, null, 2))
await prisma.$disconnect()
