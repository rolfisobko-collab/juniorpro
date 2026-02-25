import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

const notebooks = [
  { code: "1523577", name: 'NB AUDISAT X105 INTEL I5 1030NG7 16GB/512GB/15.6" SILVER', brand: "AUDISAT", model: "X105", price: 319.00 },
  { code: "1457995", name: 'NB AUDISAT X99 INTEL N95 8GB/512GB/15.6" BLACK', brand: "AUDISAT", model: "X99", price: 229.00 },
  { code: "1457988", name: 'NB AUDISAT X99 INTEL N95 8GB/512GB/15.6" SILVER', brand: "AUDISAT", model: "X99", price: 229.00 },
  { code: "1533842", name: 'NB ACER AG15-21PT-R5GQ RYZEN 5 7520U 8GB/512GB/15.6" TOUCH SILVER', brand: "ACER", model: "AG15-21PT", price: 368.00 },
  { code: "1505610", name: 'NB ACER AG15-32P-39R2 3 N355 8GB/128GB/15.6" SILVER', brand: "ACER", model: "AG15-32P", price: 290.00 },
  { code: "1519105", name: 'NB ACER AG15-71PT-72GA I7 13620H 16GB/512GB/15.6" TOUCH SILVER', brand: "ACER", model: "AG15-71PT", price: 625.00 },
  { code: "1565973", name: 'NB ACER ANV15-52-57BB I5 13420H RTX 5050 16GB/512GB/15.6" PRETO', brand: "ACER", model: "ANV15-52", price: 745.00 },
  { code: "1587180", name: 'NB ACER CB315-4H-C7A1 N4500 4GB/64GB/15.6" SILVER', brand: "ACER", model: "CB315-4H", price: 175.00 },
  { code: "1522532", name: 'NB ASUS E1504GA-WS35 I3 N305 8GB/256GB/15.6" SILVER', brand: "ASUS", model: "E1504GA", price: 325.00 },
  { code: "1546910", name: 'NB ASUS F1605VA-WS74 I7 1355U 16GB/512GB/16" PRETO', brand: "ASUS", model: "F1605VA", price: 548.00 },
  { code: "1574777", name: 'NB ASUS UX3405CA-U7512 ULTRA 7 255H 16GB/512GB/14" TOUCH CINZA', brand: "ASUS", model: "UX3405CA", price: 865.00 },
  { code: "1495706", name: 'NB ASUS X1404VA-I38128 I3 1315U 8GB/128GB/14" AZUL', brand: "ASUS", model: "X1404VA", price: 279.00 },
  { code: "1485905", name: 'NB ASUS X1404VA-I712512 I7 1355U 12GB/512GB/14" AZUL', brand: "ASUS", model: "X1404VA", price: 530.00 },
  { code: "1584776", name: 'NB ASUS X1404VAP-V14-C58256 5 120U 8GB/256GB/14" AZUL', brand: "ASUS", model: "X1404VAP", price: 348.00 },
  { code: "1589047", name: 'NB DELL 14 LDB04250-7137BLU-PUS ULTRA 7 256V 16GB/1TB/14" TOUCH AZUL', brand: "DELL", model: "LDB04250", price: 830.00 },
  { code: "1546095", name: 'NB DELL 15 LDC15255-A117BLK RYZEN 7 7730U 16GB/512GB/15.6" TOUCH PRETO', brand: "DELL", model: "LDC15255", price: 512.00 },
  { code: "1587197", name: 'NB DELL DC16251 5 120U 8GB/512GB/16" SILVER', brand: "DELL", model: "DC16251", price: 475.00 },
  { code: "1490589", name: 'NB HP 14-DQ6011DX N150 4GB/128GB/14" SILVER', brand: "HP", model: "14-DQ6011DX", price: 183.00 },
  { code: "1538564", name: 'NB HP 14-DQ6013DX N150 4GB/128GB/14" VERDE', brand: "HP", model: "14-DQ6013DX", price: 183.00 },
  { code: "1584660", name: 'NB HP 14-DQ6014DX N150 4GB/128GB/14" ROXO', brand: "HP", model: "14-DQ6014DX", price: 183.00 },
  { code: "1577198", name: 'NB HP 14-DQ6015DX N150 4GB/128GB/14" ROSA', brand: "HP", model: "14-DQ6015DX", price: 183.00 },
  { code: "1587203", name: 'NB HP 14-EP2035CL 3 N355 16GB/512GB/14" SILVER', brand: "HP", model: "14-EP2035CL", price: 373.00 },
  { code: "1524116", name: 'NB HP 14-FP0023DX 7 150U OMNIBOOK 16GB/512GB/14" TOUCH SILVER', brand: "HP", model: "14-FP0023DX", price: 615.00 },
  { code: "1489255", name: 'NB HP 15-FC0047WM RYZEN 7 7730U 16GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FC0047WM", price: 495.00 },
  { code: "1584783", name: 'NB HP 15-FC0057WM RYZEN 7 7730U 16GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FC0057WM", price: 485.00 },
  { code: "1546903", name: 'NB HP 15-FC0146DX RYZEN 5 7520U 8GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FC0146DX", price: 375.00 },
  { code: "1567656", name: 'NB HP 15-FD0001DX N100 4GB/128GB/15.6" SILVER', brand: "HP", model: "15-FD0001DX", price: 202.00 },
  { code: "1588606", name: 'NB HP 15-FD0084WM N200 4GB/128GB/15.6" SILVER', brand: "HP", model: "15-FD0084WM", price: 235.00 },
  { code: "1542127", name: 'NB HP 15-FD0113DX I3 N305 8GB/128GB/15.6" SILVER', brand: "HP", model: "15-FD0113DX", price: 279.00 },
  { code: "1585827", name: 'NB HP 15-FD0127DX I7 150U 16GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FD0127DX", price: 585.00 },
  { code: "1497311", name: 'NB HP 15-FD0130WM I3 N305 8GB/256GB/15.6" TOUCH AZUL', brand: "HP", model: "15-FD0130WM", price: 340.00 },
  { code: "1565669", name: 'NB HP 15-FD0154WM ULTRA 5 125H 8GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FD0154WM", price: 440.00 },
  { code: "1590227", name: 'NB HP 15-FD0215DX 5 120U 16GB/512GB/15.6" TOUCH SILVER', brand: "HP", model: "15-FD0215DX", price: 483.00 },
  { code: "1584790", name: 'NB HP 15T-FD000 I7 1355U 12GB/256GB/15.6" PRETO', brand: "HP", model: "15T-FD000", price: 525.00 },
  { code: "1578973", name: 'NB HP 16-AF1017WM ULTRA 7 255U 16GB/1TB/16" TOUCH SILVER', brand: "HP", model: "16-AF1017WM", price: 685.00 },
  { code: "1471229", name: 'NB LENOVO 82LV0075US N4500 1 14IJL7 4GB/128GB/14" CINZA', brand: "LENOVO", model: "82LV0075US", price: 170.00 },
  { code: "1497007", name: 'NB LENOVO 82LX00D3US N4500 1 15IJL7 4GB/128GB/15.6" AZUL', brand: "LENOVO", model: "82LX00D3US", price: 215.00 },
  { code: "1520002", name: 'NB LENOVO 82LX00DGUS N4500 1 15IJL7 4GB/128GB/15.6" CINZA', brand: "LENOVO", model: "82LX00DGUS", price: 205.00 },
  { code: "1508123", name: 'NB LENOVO 82XB00C2US I3 N305 3 15IAN8 8GB/128GB/15.6" CINZA', brand: "LENOVO", model: "82XB00C2US", price: 285.00 },
  { code: "1586299", name: 'NB LENOVO 82XB00HVUS N100 3 15IAN8 4GB/128GB/15.6" CINZA', brand: "LENOVO", model: "82XB00HVUS", price: 198.00 },
  { code: "1487145", name: 'NB LENOVO 82XM00LMUS RYZEN 7 5825U 3 15ABR8 16GB/512GB/15.6" TOUCH CINZA', brand: "LENOVO", model: "82XM00LMUS", price: 475.00 },
  { code: "1588552", name: 'NB LENOVO 82XQ00RSUS RYZEN 5 7520U 3 15AMN8 8GB/512GB/15.6" TOUCH CINZA', brand: "LENOVO", model: "82XQ00RSUS", price: 375.00 },
  { code: "1581119", name: 'NB LENOVO 83A000PDUS I7 13620H V14 G4 IRU 8GB/256GB/14" PRETO', brand: "LENOVO", model: "83A000PDUS", price: 455.00 },
  { code: "1589030", name: 'NB LENOVO 83KU0013US RYZEN AI 7 350 5 16AKP10 16GB/1TB/16" TOUCH AZUL', brand: "LENOVO", model: "83KU0013US", price: 715.00 },
  { code: "1341119", name: 'NB MSI 15-A13VE-218US I7 13620H RTX 4050 16GB/512GB/15.6" PRETO', brand: "MSI", model: "15-A13VE", price: 935.00 },
  { code: "1589054", name: 'NB MSI KATANA 15 HX B14WEK-001US I7 14650HX RTX5050 16/512/15.6" PRETO', brand: "MSI", model: "KATANA 15 HX", price: 1060.00 },
  { code: "1588521", name: 'NB SAMSUNG GALAXY BOOK 4 EDGE NP750XQB 16GB/512GB/15.6" AZUL', brand: "SAMSUNG", model: "GALAXY BOOK 4 EDGE", price: 620.00 },
  { code: "1397956", name: 'NB SAMSUNG GALAXY BOOK 4 NP750XGK 7 150U 16GB/512GB/15.6" SILVER', brand: "SAMSUNG", model: "GALAXY BOOK 4", price: 629.00 },
]

async function main() {
  console.log('🔄 Iniciando inserción de Notebooks...\n')

  try {
    console.log(`📦 Insertando ${notebooks.length} notebooks en categoría computadoras...`)
    let insertedCount = 0
    const batchSize = 10

    for (let i = 0; i < notebooks.length; i += batchSize) {
      const batch = notebooks.slice(i, i + batchSize).map((n, idx) => ({
        id: `nb_${n.code}_${Date.now()}_${idx}`,
        name: n.name,
        categoryKey: 'computadoras',
        price: n.price,
        image: '/placeholder-notebook.jpg',
        description: `${n.name}. Modelo: ${n.model}. Garantía: 1 año.`,
        brand: n.brand,
        rating: 4.5,
        reviews: 0,
        inStock: true,
        stockQuantity: 10,
        featured: false,
      }))

      await prisma.product.createMany({ data: batch })
      insertedCount += batch.length
      console.log(`✅ Progreso: ${insertedCount}/${notebooks.length} notebooks insertadas`)
    }

    console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} notebooks`)

    const total = await prisma.product.count({ where: { categoryKey: 'computadoras' } })
    console.log(`📊 Total en computadoras ahora: ${total} productos`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
