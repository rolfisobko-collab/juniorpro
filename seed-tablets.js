import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

const tablets = [
  { code: "1466621", name: 'IPAD 11 (A16) MD3Y4 WIFI 128GB 11" SILVER', brand: "APPLE", model: "MD3Y4", price: 367.00 },
  { code: "1466638", name: 'IPAD 11 (A16) MD4A4 WIFI 128GB 11" AZUL', brand: "APPLE", model: "MD4A4", price: 357.00 },
  { code: "1466645", name: 'IPAD 11 (A16) MD4D4 WIFI 128GB 11" AMARELO', brand: "APPLE", model: "MD4D4", price: 354.00 },
  { code: "1466652", name: 'IPAD 11 (A16) MD4E4 WIFI 128GB 11" ROSA', brand: "APPLE", model: "MD4E4", price: 357.00 },
  { code: "1466676", name: 'IPAD 11 (A16) MD4H4 WIFI 256GB 11" AZUL', brand: "APPLE", model: "MD4H4", price: 480.00 },
  { code: "1475661", name: 'IPAD AIR MCG04 WIFI M3 256GB 11" CELULAR CINZA', brand: "APPLE", model: "MCG04", price: 890.00 },
  { code: "1437768", name: 'IPAD MINI 7 MXN63 WIFI 128GB 8.3" CINZA', brand: "APPLE", model: "MXN63", price: 445.00 },
  { code: "1437775", name: 'IPAD MINI 7 MXN73 WIFI 128GB 8.3" AZUL', brand: "APPLE", model: "MXN73", price: 445.00 },
  { code: "1437782", name: 'IPAD MINI 7 MXN83 WIFI 128GB 8.3" DOURADO', brand: "APPLE", model: "MXN83", price: 445.00 },
  { code: "1573374", name: 'IPAD MINI 7 MXN83 WIFI 128GB 8.3" DOURADO (S/LACRE)', brand: "APPLE", model: "MXN83", price: 445.00 },
  { code: "1437799", name: 'IPAD MINI 7 MXN93 WIFI 128GB 8.3" ROXO', brand: "APPLE", model: "MXN93", price: 445.00 },
  { code: "1540901", name: 'IPAD PRO MDWK4 WIFI M5 256GB 11" PRETO', brand: "APPLE", model: "MDWK4", price: 950.00 },
  { code: "1540888", name: 'IPAD PRO MDWM4 WIFI M5 512GB 11" PRETO', brand: "APPLE", model: "MDWM4", price: 1250.00 },
  { code: "1540826", name: 'IPAD PRO MDYJ4 WIFI M5 256GB 13" PRETO', brand: "APPLE", model: "MDYJ4", price: 1290.00 },
  { code: "1540949", name: 'IPAD PRO ME2N4 WIFI M5 256GB CEL 11" PRETO', brand: "APPLE", model: "ME2N4", price: 1290.00 },
  { code: "1540956", name: 'IPAD PRO ME2P4 WIFI M5 256GB CEL 11" SILVER', brand: "APPLE", model: "ME2P4", price: 1290.00 },
  { code: "1390148", name: 'IPAD PRO MVV93 WIFI M4 256GB 11" SILVER', brand: "APPLE", model: "MVV93", price: 894.00 },
  { code: "1581539", name: 'IPAD PRO MVV93 WIFI M4 256GB 11" SILVER (S/LACRE)', brand: "APPLE", model: "MVV93", price: 894.00 },
  { code: "1504408", name: 'TABLET AIWA AWTH1001 10" 4GB+64GB LTE CINZA', brand: "AIWA", model: "AWTH1001", price: 88.90 },
  { code: "1504415", name: 'TABLET AIWA AWTH801 8" 2GB+32GB WIFI PRETO', brand: "AIWA", model: "AWTH801", price: 49.90 },
  { code: "1460025", name: 'TABLET ATOUCH X19 MINI HD 7.0" 8GB+256GB 5G AZUL', brand: "ATOUCH", model: "X19 MINI", price: 55.00 },
  { code: "1520170", name: 'TABLET ATOUCH X19 MINI HD 7.0" 8GB+256GB 5G CINZA', brand: "ATOUCH", model: "X19 MINI", price: 55.00 },
  { code: "1460049", name: 'TABLET ATOUCH X19 MINI HD 7.0" 8GB+256GB 5G DOURADO', brand: "ATOUCH", model: "X19 MINI", price: 55.00 },
  { code: "1571264", name: 'TABLET BLACK SHARK BSG1 GAMING 8.8" 12GB+256GB WIFI CINZA', brand: "BLACK SHARK", model: "BSG1", price: 309.00 },
  { code: "1571240", name: 'TABLET BLACK SHARK BSG1 GAMING 8.8" 12GB+256GB WIFI PRETO', brand: "BLACK SHARK", model: "BSG1", price: 309.00 },
  { code: "1397772", name: 'TABLET BLACKVIEW ACTIVE 8 PRO 10.36" 8GB+256GB LTE PRETO', brand: "BLACKVIEW", model: "ACTIVE 8 PRO", price: 263.00 },
  { code: "1459678", name: 'TABLET BLACKVIEW ACTIVE 10 PRO 10.95" 12GB+256GB 5G PRETO', brand: "BLACKVIEW", model: "ACTIVE 10 PRO", price: 345.00 },
  { code: "1554243", name: 'TABLET BLACKVIEW ACTIVE 12 PRO 11" 12GB+256GB 5G PRETO', brand: "BLACKVIEW", model: "ACTIVE 12 PRO", price: 520.00 },
  { code: "1580976", name: 'TABLET BLACKVIEW LINK 1 KIDS 8.68" 4GB+64GB WIFI AZUL', brand: "BLACKVIEW", model: "LINK 1 KIDS", price: 85.00 },
  { code: "1580983", name: 'TABLET BLACKVIEW LINK 1 KIDS 8.68" 4GB+64GB WIFI ROXO', brand: "BLACKVIEW", model: "LINK 1 KIDS", price: 85.00 },
  { code: "1553529", name: 'TABLET BLACKVIEW LINK 2 8.68" 4GB+128GB WIFI AZUL', brand: "BLACKVIEW", model: "LINK 2", price: 99.00 },
  { code: "1544916", name: 'TABLET BLACKVIEW LINK 8 12.7" 6GB+256GB WIFI AZUL', brand: "BLACKVIEW", model: "LINK 8", price: 195.00 },
  { code: "1544909", name: 'TABLET BLACKVIEW LINK 8 12.7" 6GB+256GB WIFI CINZA', brand: "BLACKVIEW", model: "LINK 8", price: 195.00 },
  { code: "1544930", name: 'TABLET BLACKVIEW LINK 8 12.7" 6GB+256GB WIFI ROXO', brand: "BLACKVIEW", model: "LINK 8", price: 195.00 },
  { code: "1482751", name: 'TABLET BLACKVIEW MEGA 2 12" 12GB+256GB WIFI AZUL', brand: "BLACKVIEW", model: "MEGA 2", price: 160.00 },
  { code: "1482744", name: 'TABLET BLACKVIEW MEGA 2 12" 12GB+256GB WIFI CINZA', brand: "BLACKVIEW", model: "MEGA 2", price: 160.00 },
  { code: "1482768", name: 'TABLET BLACKVIEW MEGA 2 12" 12GB+256GB WIFI VERDE', brand: "BLACKVIEW", model: "MEGA 2", price: 160.00 },
  { code: "1507768", name: 'TABLET BLACKVIEW TAB 20 10.1" 4GB+64GB WIFI AZUL', brand: "BLACKVIEW", model: "TAB 20", price: 89.00 },
  { code: "1507751", name: 'TABLET BLACKVIEW TAB 20 10.1" 4GB+64GB WIFI CINZA', brand: "BLACKVIEW", model: "TAB 20", price: 89.00 },
  { code: "1532357", name: 'TABLET BLACKVIEW TAB 20 KIDS 10.1" 4GB+64GB WIFI AZUL', brand: "BLACKVIEW", model: "TAB 20 KIDS", price: 95.00 },
  { code: "1532364", name: 'TABLET BLACKVIEW TAB 20 KIDS 10.1" 4GB+64GB WIFI ROXO', brand: "BLACKVIEW", model: "TAB 20 KIDS", price: 95.00 },
  { code: "1581089", name: 'TABLET BLACKVIEW TAB 20 KIDS 10.1" 4GB+64GB WIFI VERDE', brand: "BLACKVIEW", model: "TAB 20 KIDS", price: 95.00 },
  { code: "1459623", name: 'TABLET BLACKVIEW TAB 60 10.1" 4GB+128GB WIFI AZUL', brand: "BLACKVIEW", model: "TAB 60", price: 90.00 },
  { code: "1459616", name: 'TABLET BLACKVIEW TAB 60 10.1" 4GB+128GB WIFI CINZA', brand: "BLACKVIEW", model: "TAB 60", price: 90.00 },
  { code: "1459630", name: 'TABLET BLACKVIEW TAB 60 10.1" 4GB+128GB WIFI VERDE', brand: "BLACKVIEW", model: "TAB 60", price: 90.00 },
  { code: "1446906", name: 'TABLET BLACKVIEW TAB A6 KIDS 10.1" 4GB+128GB WIFI AZUL', brand: "BLACKVIEW", model: "TAB A6 KIDS", price: 89.00 },
  { code: "1446913", name: 'TABLET BLACKVIEW TAB A6 KIDS 10.1" 4GB+128GB WIFI ROSA', brand: "BLACKVIEW", model: "TAB A6 KIDS", price: 89.00 },
  { code: "1580945", name: 'TABLET BLACKVIEW ZENO 10 11" 6GB+256GB 5G CINZA', brand: "BLACKVIEW", model: "ZENO 10", price: 189.00 },
  { code: "1544985", name: 'TABLET BLACKVIEW ZENO 10 11" 8GB+256GB 5G CINZA', brand: "BLACKVIEW", model: "ZENO 10", price: 189.00 },
  { code: "1506594", name: 'TABLET DOOGEE E3 ENJOY 11" 8GB+256GB LTE CINZA', brand: "DOOGEE", model: "E3 ENJOY", price: 135.00 },
  { code: "1579208", name: 'TABLET DOOGEE G6 PRO 12" 8GB+128GB LTE CINZA', brand: "DOOGEE", model: "G6 PRO", price: 139.00 },
  { code: "1579215", name: 'TABLET DOOGEE G6 PRO 12" 8GB+128GB LTE PRETO', brand: "DOOGEE", model: "G6 PRO", price: 139.00 },
  { code: "1579222", name: 'TABLET DOOGEE U12 12" 6GB+128GB WIFI CINZA', brand: "DOOGEE", model: "U12", price: 129.00 },
  { code: "1579239", name: 'TABLET DOOGEE U12 12" 6GB+128GB WIFI PRETO', brand: "DOOGEE", model: "U12", price: 129.00 },
  { code: "1344530", name: 'TABLET IPRO SPEED4 DUAL 7.0" 2GB+32GB LTE DOURADO+OCULOS', brand: "IPRO", model: "SPEED4", price: 41.00 },
  { code: "1344493", name: 'TABLET IPRO SPEED4 DUAL 7.0" 2GB+32GB LTE PRETO+OCULOS', brand: "IPRO", model: "SPEED4", price: 41.00 },
  { code: "1344554", name: 'TABLET IPRO SPEED4 DUAL 7.0" 2GB+32GB LTE VERDE+OCULOS', brand: "IPRO", model: "SPEED4", price: 41.00 },
  { code: "1295122", name: 'TABLET IPRO SPEED5 DUAL 7.0" 2GB+32GB LTE AMARELO/MARROM+OCULOS', brand: "IPRO", model: "SPEED5", price: 41.00 },
  { code: "1344646", name: 'TABLET IPRO SPEED5 DUAL 7.0" 2GB+32GB LTE VERDE/BRANCO+OCULOS', brand: "IPRO", model: "SPEED5", price: 41.00 },
  { code: "1344769", name: 'TABLET IPRO SPEED5 DUAL 7.0" 2GB+32GB LTE VERMELHO/MARROM+OCULOS', brand: "IPRO", model: "SPEED5", price: 41.00 },
  { code: "1235814", name: 'TABLET IPRO SPEED6 DUAL 7.0" 2GB+32GB LTE KIDS AMARELO+OCULOS', brand: "IPRO", model: "SPEED6", price: 48.00 },
  { code: "1235647", name: 'TABLET IPRO SPEED6 DUAL 7.0" 2GB+32GB LTE KIDS AZUL+OCULOS', brand: "IPRO", model: "SPEED6", price: 48.00 },
  { code: "1235807", name: 'TABLET IPRO SPEED6 DUAL 7.0" 2GB+32GB LTE KIDS LARANJA+OCULOS', brand: "IPRO", model: "SPEED6", price: 48.00 },
  { code: "1235654", name: 'TABLET IPRO SPEED6 DUAL 7.0" 2GB+32GB LTE KIDS ROSA+OCULOS', brand: "IPRO", model: "SPEED6", price: 48.00 },
  { code: "1344783", name: 'TABLET IPRO TURBO1 DUAL 7.0" 2GB+32GB LTE AZUL+OCULOS', brand: "IPRO", model: "TURBO1", price: 43.00 },
  { code: "1344790", name: 'TABLET IPRO TURBO1 DUAL 7.0" 2GB+32GB LTE DOURADO+OCULOS', brand: "IPRO", model: "TURBO1", price: 43.00 },
  { code: "1344776", name: 'TABLET IPRO TURBO1 DUAL 7.0" 2GB+32GB LTE PRETO+OCULOS', brand: "IPRO", model: "TURBO1", price: 43.00 },
  { code: "1344516", name: 'TABLET IPRO TURBO1 DUAL 7.0" 2GB+32GB LTE VERDE+OCULOS', brand: "IPRO", model: "TURBO1", price: 43.00 },
  { code: "1344547", name: 'TABLET IPRO TURBO2 DUAL 7.0" 2GB+32GB LTE DOURADO/MARROM+OCULOS', brand: "IPRO", model: "TURBO2", price: 43.00 },
  { code: "1344523", name: 'TABLET IPRO TURBO2 DUAL 7.0" 2GB+32GB LTE PRETO/CINZA+OCULOS', brand: "IPRO", model: "TURBO2", price: 43.00 },
  { code: "1344561", name: 'TABLET IPRO TURBO3 DUAL 7.0" 2GB+32GB LTE AZUL/MARROM+OCULOS', brand: "IPRO", model: "TURBO3", price: 43.00 },
  { code: "1344585", name: 'TABLET IPRO TURBO3 DUAL 7.0" 2GB+32GB LTE ROSA/AZUL+OCULOS', brand: "IPRO", model: "TURBO3", price: 43.00 },
  { code: "1344578", name: 'TABLET IPRO TURBO3 DUAL 7.0" 2GB+32GB LTE VERDE/AZUL+OCULOS', brand: "IPRO", model: "TURBO3", price: 43.00 },
  { code: "1494082", name: 'TABLET SAMSUNG P620 S6 LITE 10.4" 4GB+64GB WIFI CINZA', brand: "SAMSUNG", model: "P620", price: 216.00 },
  { code: "1539837", name: 'TABLET SAMSUNG X135G A11 8.7" 4GB+64GB LTE CINZA', brand: "SAMSUNG", model: "X135G", price: 155.00 },
  { code: "1435078", name: 'TABLET SAMSUNG X210 A9+ 11.0" 8GB+128GB WIFI CINZA', brand: "SAMSUNG", model: "X210", price: 199.00 },
  { code: "1401738", name: 'TABLET SAMSUNG X216B A9+ 11.0" 4GB+64GB 5G SILVER', brand: "SAMSUNG", model: "X216B", price: 199.00 },
  { code: "1401776", name: 'TABLET SAMSUNG X216B A9+ 11.0" 8GB+128GB 5G AZUL', brand: "SAMSUNG", model: "X216B", price: 260.00 },
  { code: "1401752", name: 'TABLET SAMSUNG X216B A9+ 11.0" 8GB+128GB 5G CINZA', brand: "SAMSUNG", model: "X216B", price: 260.00 },
  { code: "1401769", name: 'TABLET SAMSUNG X216B A9+ 11.0" 8GB+128GB 5G SILVER', brand: "SAMSUNG", model: "X216B", price: 260.00 },
  { code: "1560589", name: 'TABLET SAMSUNG X230 A11+ 11.0" 6GB+128GB WIFI CINZA', brand: "SAMSUNG", model: "X230", price: 199.00 },
  { code: "1560596", name: 'TABLET SAMSUNG X230 A11+ 11.0" 6GB+128GB WIFI SILVER', brand: "SAMSUNG", model: "X230", price: 199.00 },
  { code: "1560602", name: 'TABLET SAMSUNG X230 A11+ 11.0" 8GB+256GB WIFI CINZA', brand: "SAMSUNG", model: "X230", price: 250.00 },
  { code: "1560640", name: 'TABLET SAMSUNG X236B A11+ 11.0" 8GB+256GB 5G CINZA', brand: "SAMSUNG", model: "X236B", price: 248.00 },
  { code: "1510805", name: 'TABLET SAMSUNG X400 S10 LITE 10.9" 6GB+128GB WIFI CINZA', brand: "SAMSUNG", model: "X400", price: 280.00 },
  { code: "1580495", name: 'TABLET SAMSUNG X400 S10 LITE 10.9" 6GB+128GB WIFI CINZA + CAPA', brand: "SAMSUNG", model: "X400", price: 290.00 },
  { code: "1485776", name: 'TABLET SAMSUNG X520 S10 FE 10.9" 8GB+128GB WIFI AZUL', brand: "SAMSUNG", model: "X520", price: 340.00 },
  { code: "1475807", name: 'TABLET SAMSUNG X520 S10 FE 10.9" 8GB+128GB WIFI CINZA', brand: "SAMSUNG", model: "X520", price: 340.00 },
  { code: "1475814", name: 'TABLET SAMSUNG X520 S10 FE 10.9" 8GB+128GB WIFI SILVER', brand: "SAMSUNG", model: "X520", price: 340.00 },
  { code: "1482485", name: 'TABLET SAMSUNG X610 S9 FE+ 12.4" 8GB+128GB WIFI CINZA', brand: "SAMSUNG", model: "X610", price: 365.00 },
  { code: "1461862", name: 'TABLET XIAOMI PAD 7 11.2" 8GB+128GB WIFI CINZA', brand: "XIAOMI", model: "PAD 7", price: 275.00 },
  { code: "1461824", name: 'TABLET XIAOMI PAD 7 11.2" 8GB+256GB WIFI AZUL', brand: "XIAOMI", model: "PAD 7", price: 295.00 },
  { code: "1461817", name: 'TABLET XIAOMI PAD 7 11.2" 8GB+256GB WIFI CINZA', brand: "XIAOMI", model: "PAD 7", price: 310.00 },
  { code: "1461831", name: 'TABLET XIAOMI PAD 7 11.2" 8GB+256GB WIFI VERDE', brand: "XIAOMI", model: "PAD 7", price: 295.00 },
  { code: "1551419", name: 'TABLET XIAOMI PAD MINI 8.8" 8GB+256GB WIFI CINZA', brand: "XIAOMI", model: "PAD MINI", price: 455.00 },
  { code: "1551426", name: 'TABLET XIAOMI PAD MINI 8.8" 12GB+512GB WIFI CINZA', brand: "XIAOMI", model: "PAD MINI", price: 525.00 },
  { code: "1550337", name: 'TABLET XIAOMI POCO PAD M1 12.1" 8GB+256GB WIFI AZUL', brand: "XIAOMI", model: "POCO PAD M1", price: 255.00 },
  { code: "1550344", name: 'TABLET XIAOMI POCO PAD M1 12.1" 8GB+256GB WIFI CINZA', brand: "XIAOMI", model: "POCO PAD M1", price: 255.00 },
  { code: "1548006", name: 'TABLET XIAOMI POCO PAD X1 11.2" 8GB+512GB WIFI AZUL', brand: "XIAOMI", model: "POCO PAD X1", price: 295.00 },
  { code: "1547993", name: 'TABLET XIAOMI POCO PAD X1 11.2" 8GB+512GB WIFI CINZA', brand: "XIAOMI", model: "POCO PAD X1", price: 295.00 },
  { code: "1523225", name: 'TABLET XIAOMI REDMI PAD 2 11" 4GB+128GB LTE CINZA', brand: "XIAOMI", model: "REDMI PAD 2", price: 160.00 },
  { code: "1481396", name: 'TABLET XIAOMI REDMI PAD 2 11" 4GB+128GB WIFI CINZA', brand: "XIAOMI", model: "REDMI PAD 2", price: 148.75 },
  { code: "1515183", name: 'TABLET XIAOMI REDMI PAD 2 11" 8GB+256GB LTE CINZA', brand: "XIAOMI", model: "REDMI PAD 2", price: 205.00 },
  { code: "1480344", name: 'TABLET XIAOMI REDMI PAD 2 11" 8GB+256GB WIFI CINZA', brand: "XIAOMI", model: "REDMI PAD 2", price: 181.00 },
  { code: "1486711", name: 'TABLET XIAOMI REDMI PAD 2 11" 8GB+256GB WIFI VERDE', brand: "XIAOMI", model: "REDMI PAD 2", price: 183.00 },
  { code: "1584288", name: 'TABLET XIAOMI REDMI PAD 2 PRO 12.1" 8GB+256GB WIFI ROXO', brand: "XIAOMI", model: "REDMI PAD 2 PRO", price: 290.00 },
  { code: "1577341", name: 'TABLET XIAOMI REDMI PAD 2 PRO 12.1" 8GB+256GB WIFI SILVER', brand: "XIAOMI", model: "REDMI PAD 2 PRO", price: 285.00 },
]

async function main() {
  console.log('🔄 Iniciando inserción de Tablets...\n')

  try {
    console.log(`📦 Insertando ${tablets.length} productos en categoría tablets...`)
    let insertedCount = 0
    const batchSize = 10

    for (let i = 0; i < tablets.length; i += batchSize) {
      const batch = tablets.slice(i, i + batchSize).map((t, idx) => ({
        id: `tablet_${t.code}_${Date.now()}_${idx}`,
        name: t.name,
        categoryKey: 'tablets',
        price: t.price,
        image: '/placeholder-tablet.jpg',
        description: `${t.name}. Modelo: ${t.model}. Garantía: 1 año.`,
        brand: t.brand,
        rating: 4.5,
        reviews: 0,
        inStock: true,
        stockQuantity: 10,
        featured: false,
      }))

      await prisma.product.createMany({ data: batch })
      insertedCount += batch.length
      console.log(`✅ Progreso: ${insertedCount}/${tablets.length} tablets insertadas`)
    }

    console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} tablets`)

    const total = await prisma.product.count({ where: { categoryKey: 'tablets' } })
    console.log(`📊 Total en tablets ahora: ${total} productos`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
