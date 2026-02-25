import "dotenv/config"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import WebSocket from "ws"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is missing")

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })

const tvs = [
  { code: "1007862", name: 'TV AIWA 32" AW32B4SM GOOGLE TV BT HD', brand: "AIWA", model: "AW32B4SM", price: 99.00 },
  { code: "1043266", name: 'TV AIWA 43" AW43B4SMFL GOOGLE TV BT FULL HD', brand: "AIWA", model: "AW43B4SMFL", price: 159.00 },
  { code: "1274660", name: 'TV AIWA 50" AW50B4K GOOGLE TV BT 4K ULTRA HD', brand: "AIWA", model: "AW50B4K", price: 235.00 },
  { code: "1288063", name: 'TV AIWA 55" AW55B4KF GOOGLE TV BT 4K ULTRA HD', brand: "AIWA", model: "AW55B4KF", price: 279.00 },
  { code: "1009538", name: 'TV AIWA 58" AW58B4K GOOGLE TV BT 4K ULTRA HD', brand: "AIWA", model: "AW58B4K", price: 299.00 },
  { code: "1503043", name: 'TV AIWA 85" AW85B4QFG QLED GOOGLE TV BT 4K ULTRA HD', brand: "AIWA", model: "AW85B4QFG", price: 949.90 },
  { code: "1389975", name: 'TV AIWA 98" AW98B4QFG QLED GOOGLE TV BT 4K ULTRA HD', brand: "AIWA", model: "AW98B4QFG", price: 1984.90 },
  { code: "1515299", name: 'TV AUDISAT 24" AD-24AC/DC LED HD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-24AC/DC", price: 69.90 },
  { code: "1502305", name: 'TV AUDISAT 32" AD-32 SMART ANDROID HD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-32", price: 79.90 },
  { code: "1541861", name: 'TV AUDISAT 32" AD-32 SMART ANDROID HD +CONV+SOPORTE (2026)', brand: "AUDISAT", model: "AD-32", price: 85.00 },
  { code: "1515169", name: 'TV AUDISAT 32" AD-32Q QLED SMART ANDROID 14.0 HD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-32Q", price: 85.00 },
  { code: "1515190", name: 'TV AUDISAT 40" AD-40Q QLED SMART ANDROID 14.0 FHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-40Q", price: 129.90 },
  { code: "1515206", name: 'TV AUDISAT 43" AD-43Q QLED SMART ANDROID 14.0 FULL HD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-43Q", price: 139.90 },
  { code: "1541854", name: 'TV AUDISAT 43" AD-43Q QLED SMART ANDROID 14.0 FHD +CONV+SOPORTE (2026)', brand: "AUDISAT", model: "AD-43Q", price: 155.00 },
  { code: "1515220", name: 'TV AUDISAT 50" AD-50Q QLED SMART ANDROID 15.0 4K UHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-50Q", price: 209.90 },
  { code: "1515213", name: 'TV AUDISAT 50" AD-50Q2K QLED SMART ANDROID 14.0 FHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-50Q2K", price: 189.90 },
  { code: "1515237", name: 'TV AUDISAT 55" AD-55Q QLED SMART ANDROID 15.0 4K UHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-55Q", price: 229.90 },
  { code: "1587104", name: 'TV AUDISAT 60" AD-60 SMART ANDROID 15.0 4K UHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-60", price: 269.00 },
  { code: "1515312", name: 'TV AUDISAT 60" AD-60 SMART ANDROID 15.0 4K UHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-60", price: 269.90 },
  { code: "1515251", name: 'TV AUDISAT 65" AD-65GO GOOGLE TV 2 CONTROLES 4K ULTRA HD (2026)', brand: "AUDISAT", model: "AD-65GO", price: 349.90 },
  { code: "1515244", name: 'TV AUDISAT 65" AD-65Q QLED SMART ANDROID 15.0 4K UHD +CONVERSOR (2026)', brand: "AUDISAT", model: "AD-65Q", price: 329.90 },
  { code: "1567885", name: 'TV AUDISAT 65" AD-65Q-GO QLED GOOGLE TV 2 CONTROLES 4K ULTRA HD (2026)', brand: "AUDISAT", model: "AD-65Q-GO", price: 359.90 },
  { code: "1515275", name: 'TV AUDISAT 85" AD-85Q-GO QLED GOOGLE TV 2 CONTROLES 4K ULTRA HD (2026)', brand: "AUDISAT", model: "AD-85Q-GO", price: 599.00 },
  { code: "1364743", name: 'TV BAK 20" BK-20D LED HD +CONVERSOR', brand: "BAK", model: "BK-20D", price: 67.00 },
  { code: "1442328", name: 'TV BAK 32" BK-32S LED SMART HD ANDROID +CONVERSOR', brand: "BAK", model: "BK-32S", price: 98.00 },
  { code: "1473629", name: 'TV BAK 50" BK-50S LED SMART 4K ULTRA HD ANDROID +CONVERSOR', brand: "BAK", model: "BK-50S", price: 245.00 },
  { code: "1547191", name: 'TV BAK 55" BK-55G LED SMART GOOGLE TV 4K ULTRA HD', brand: "BAK", model: "BK-55G", price: 279.00 },
  { code: "1551532", name: 'TV COBY 40" CY3359-40SMS LED SMART FULL HD ANDROID 14', brand: "COBY", model: "CY3359-40SMS", price: 167.50 },
  { code: "1555714", name: 'TV HYE 24" HYE24ATHZ LED SMART HD ANDROID +CONVERSOR', brand: "HYE", model: "HYE24ATHZ", price: 85.00 },
  { code: "1587111", name: 'TV HYE 32" 32ATHQ QLED SMART HD ANDROID 16 +CONVERSOR', brand: "HYE", model: "32ATHQ", price: 88.00 },
  { code: "1584325", name: 'TV HYE 43" HYE43ATFZ LED SMART FULL HD ANDROID +CONVERSOR', brand: "HYE", model: "HYE43ATFZ", price: 165.00 },
  { code: "1529203", name: 'TV HYE 50" HYE50ATUX LED SMART 4K ULTRA HD BLUETOOTH ANDROID +CONVERSOR', brand: "HYE", model: "HYE50ATUX", price: 225.00 },
  { code: "1529197", name: 'TV HYE 55" HYE55ATUX LED SMART 4K ULTRA HD BLUETOOTH ANDROID +CONVERSOR', brand: "HYE", model: "HYE55ATUX", price: 268.00 },
  { code: "1585742", name: 'TV HYE 85" HYE85GTUH LED SMART 4K ULTRA HD ANDROID +CONVERSOR', brand: "HYE", model: "HYE85GTUH", price: 590.00 },
  { code: "1363920", name: 'TV LG 32" 32LQ630BPSA LED SMART HD BLUETOOTH +CONVERSOR', brand: "LG", model: "32LQ630BPSA", price: 140.00 },
  { code: "1358650", name: 'TV LG 43" 43UR7800PSB LED SMART 4K ULTRA HD BLUETOOTH +CONVERSOR', brand: "LG", model: "43UR7800PSB", price: 265.00 },
  { code: "1479812", name: 'TV LG 50" 50UT7300PSA LED SMART 4K ULTRA HD BLUETOOTH +CONVERSOR', brand: "LG", model: "50UT7300PSA", price: 310.00 },
  { code: "1463989", name: 'TV LG 55" 55UT7300PSA LED SMART 4K ULTRA HD BLUETOOTH +CONVERSOR', brand: "LG", model: "55UT7300PSA", price: 349.00 },
  { code: "1590234", name: 'TV LG 60" 60UA8050PSA LED SMART 4K ULTRA HD BLUETOOTH +CONVERSOR', brand: "LG", model: "60UA8050PSA", price: 520.00 },
  { code: "1590241", name: 'TV LG 65" 65UA8050PSA LED SMART 4K ULTRA HD BLUETOOTH +CONVERSOR', brand: "LG", model: "65UA8050PSA", price: 580.00 },
  { code: "1385632", name: 'TV MEGASTAR 32" LED32SM LED SMART FULL HD ANDROID +CONVERSOR', brand: "MEGASTAR", model: "LED32SM", price: 93.00 },
  { code: "1405378", name: 'TV MIDI PRO 32" MDP-3202 LED SMART FULL HD WIFI ANDROID +CONVERSOR', brand: "MIDI PRO", model: "MDP-3202", price: 100.00 },
  { code: "1405385", name: 'TV MIDI PRO 43" MDP-4303 LED SMART FULL HD WIFI ANDROID +CONVERSOR', brand: "MIDI PRO", model: "MDP-4303", price: 160.00 },
  { code: "1571929", name: 'TV MIDI PRO 55" MDP-5505 LED SMART 4K ULTRA HD WIFI ANDROID +CONVERSOR', brand: "MIDI PRO", model: "MDP-5505", price: 275.00 },
  { code: "1407983", name: 'TV MOTOROLA 43" 43FLE11 LED GOOGLE TV BLUETOOTH FULL HD', brand: "MOTOROLA", model: "43FLE11", price: 198.00 },
  { code: "1566147", name: 'TV MOX 32" MO-T32UHD SMART HD ANDROID 14 +CONVERSOR', brand: "MOX", model: "MO-T32UHD", price: 89.00 },
  { code: "1567441", name: 'TV MOX 55" MO-T55UHD LED SMART 4K ULTRA HD BLUETOOTH ANDROID 15 +CONVERSOR', brand: "MOX", model: "MO-T55UHD", price: 262.00 },
  { code: "1311587", name: 'TV MTEK 32" MK32FSAH LED SMART HD BLUETOOTH ANDROID +CONVERSOR', brand: "MTEK", model: "MK32FSAH", price: 110.00 },
  { code: "1500714", name: 'TV MTEK 32" MY32FSPH LED SMART HD WIFI ANDROID 14 +CONVERSOR', brand: "MTEK", model: "MY32FSPH", price: 90.00 },
  { code: "1493252", name: 'TV MTEK 43" MK43FSGF LED GOOGLE TV FULL HD BLUETOOTH', brand: "MTEK", model: "MK43FSGF", price: 170.00 },
  { code: "1311594", name: 'TV MTEK 50" MK50FSAU LED SMART 4K ULTRA HD BLUETOOTH ANDROID +CONVERSOR', brand: "MTEK", model: "MK50FSAU", price: 263.00 },
  { code: "1430578", name: 'TV MTEK 58" MKQ58FSGU QLED GOOGLE TV 4K ULTRA HD BLUETOOTH', brand: "MTEK", model: "MKQ58FSGU", price: 330.00 },
  { code: "1430585", name: 'TV MTEK 65" MKQ65FSGU QLED GOOGLE TV 4K ULTRA HD BLUETOOTH', brand: "MTEK", model: "MKQ65FSGU", price: 415.00 },
  { code: "1580556", name: 'TV QUANTA 32" QTATV32 LED SMART HD BLUETOOTH ANDROID 14 +CONVERSOR', brand: "QUANTA", model: "QTATV32", price: 85.00 },
  { code: "1575767", name: 'TV QUANTA 32" QTWTV32 LED SMART HD BLUETOOTH WHALE OS +CONVERSOR', brand: "QUANTA", model: "QTWTV32", price: 89.00 },
  { code: "1580563", name: 'TV QUANTA 43" QTATV43 LED SMART FULL HD BLUETOOTH ANDROID 14 +CONVERSOR', brand: "QUANTA", model: "QTATV43", price: 149.00 },
  { code: "1575774", name: 'TV QUANTA 43" QTWTV43 LED SMART FULL HD BLUETOOTH WHALE OS +CONVERSOR', brand: "QUANTA", model: "QTWTV43", price: 155.00 },
  { code: "1575781", name: 'TV QUANTA 50" QTWTV50 LED SMART 4K ULTRA HD BLUETOOTH WHALE OS', brand: "QUANTA", model: "QTWTV50", price: 233.00 },
  { code: "1580570", name: 'TV QUANTA 55" QTGTV55 LED GOOGLE TV 4K ULTRA HD BLUETOOTH', brand: "QUANTA", model: "QTGTV55", price: 279.00 },
  { code: "1575798", name: 'TV QUANTA 55" QTWTV55 LED SMART 4K ULTRA HD BLUETOOTH WHALE OS', brand: "QUANTA", model: "QTWTV55", price: 261.00 },
  { code: "1580587", name: 'TV QUANTA 65" QTGTV65 LED GOOGLE TV 4K ULTRA HD BLUETOOTH', brand: "QUANTA", model: "QTGTV65", price: 390.00 },
  { code: "1575804", name: 'TV QUANTA 65" QTWTV65 LED SMART 4K ULTRA HD BLUETOOTH WHALE OS', brand: "QUANTA", model: "QTWTV65", price: 372.00 },
  { code: "1565492", name: 'TV SAMSUNG 43" UN43T5203AG LED SMART FULL HD WIFI TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN43T5203AG", price: 199.00 },
  { code: "1590296", name: 'TV SAMSUNG 50" UN50U8000FGX LED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN50U8000FGX", price: 290.00 },
  { code: "1503890", name: 'TV SAMSUNG 55" QN55Q7FAAP QLED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "QN55Q7FAAP", price: 460.00 },
  { code: "1479720", name: 'TV SAMSUNG 55" UN55CU7090G LED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN55CU7090G", price: 350.00 },
  { code: "1567489", name: 'TV SAMSUNG 65" QN65Q7F5AG QLED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "QN65Q7F5AG", price: 650.00 },
  { code: "1591101", name: 'TV SAMSUNG 65" UN65U8000FG LED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN65U8000FG", price: 490.00 },
  { code: "1554281", name: 'TV SAMSUNG 70" UN70U8000FP LED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN70U8000FP", price: 600.00 },
  { code: "1554298", name: 'TV SAMSUNG 75" UN75U8000FP LED SMART 4K ULTRA HD BLUETOOTH TIZEN +CONVERSOR', brand: "SAMSUNG", model: "UN75U8000FP", price: 735.00 },
  { code: "1548259", name: 'TV SAMSUNG 85" UN85U8000FG LED SMART 4K UHD BLUETOOTH TIZEN (2025) +CONVERSOR', brand: "SAMSUNG", model: "UN85U8000FG", price: 1095.00 },
  { code: "1505146", name: 'TV SMARTFY 32" STV32 LED SMART HD WIFI ANDROID 14 2 CONTROLES +CONVERSOR', brand: "SMARTFY", model: "STV32", price: 90.00 },
  { code: "1540192", name: 'TV SMARTFY 50" STV50B LED SMART 4K ULTRA HD WIFI ANDROID 14 2 CONTROLES +CONVERSOR', brand: "SMARTFY", model: "STV50B", price: 221.00 },
  { code: "1500462", name: 'TV VIZZION 50" LE50GFU LED GOOGLE TV 4K ULTRA HD', brand: "VIZZION", model: "LE50GFU", price: 255.00 },
  { code: "1500486", name: 'TV VIZZION 65" LE65GFU LED GOOGLE TV 4K ULTRA HD', brand: "VIZZION", model: "LE65GFU", price: 395.00 },
  { code: "1390919", name: 'TV XIAOMI 32" A L32M8P2PH GOOGLE TV BLUETOOTH HD (2025)', brand: "XIAOMI", model: "L32M8P2PH", price: 117.00 },
  { code: "1505955", name: 'TV XIAOMI 32" A L32MBAPH GOOGLE TV BLUETOOTH HD (2026)', brand: "XIAOMI", model: "L32MBAPH", price: 119.00 },
  { code: "1446371", name: 'TV XIAOMI 43" A L43MAAFLA GOOGLE TV FULL HD (2025)', brand: "XIAOMI", model: "L43MAAFLA", price: 159.00 },
  { code: "1505962", name: 'TV XIAOMI 43" A L43MBAFPH GOOGLE TV FULL HD (2026)', brand: "XIAOMI", model: "L43MBAFPH", price: 189.00 },
  { code: "1476439", name: 'TV XIAOMI 43" A PRO L43MBAPPH QLED GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L43MBAPPH", price: 209.00 },
  { code: "1498349", name: 'TV XIAOMI 50" A L50MBALA GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L50MBALA", price: 259.00 },
  { code: "1498356", name: 'TV XIAOMI 55" A L55MBAPH GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L55MBAPH", price: 299.00 },
  { code: "1476446", name: 'TV XIAOMI 55" A PRO L55MBAPPH QLED GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L55MBAPPH", price: 309.00 },
  { code: "1498363", name: 'TV XIAOMI 65" A L65MBAPH GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L65MBAPH", price: 389.00 },
  { code: "1476453", name: 'TV XIAOMI 65" A PRO L65MBAPPH QLED GOOGLE TV BLUETOOTH 4K ULTRA HD (2026)', brand: "XIAOMI", model: "L65MBAPPH", price: 445.00 },
]

async function main() {
  console.log('🔄 Iniciando inserción de TVs...\n')

  try {
    // 1. Crear subcategoría "Televisores" dentro de electrodomesticos si no existe
    console.log('🏷️  Verificando subcategoría Televisores...')
    await prisma.subCategory.upsert({
      where: { id: 'electrodomesticos-televisores' },
      update: { name: 'Televisores', slug: 'televisores', categoryKey: 'electrodomesticos' },
      create: { id: 'electrodomesticos-televisores', name: 'Televisores', slug: 'televisores', categoryKey: 'electrodomesticos' }
    })
    console.log('✅ Subcategoría Televisores lista\n')

    // 2. Insertar productos en lotes de 10
    console.log(`📦 Insertando ${tvs.length} productos de TVs...`)
    let insertedCount = 0
    const batchSize = 10

    for (let i = 0; i < tvs.length; i += batchSize) {
      const batch = tvs.slice(i, i + batchSize).map((tv, idx) => ({
        id: `tv_${tv.code}_${Date.now()}_${idx}`,
        name: tv.name,
        categoryKey: 'electrodomesticos',
        price: tv.price,
        image: '/placeholder-tv.jpg',
        description: `${tv.name}. Modelo: ${tv.model}. Garantía: 1 año.`,
        brand: tv.brand,
        rating: 4.5,
        reviews: 0,
        inStock: true,
        stockQuantity: 10,
        featured: false,
      }))

      await prisma.product.createMany({ data: batch })
      insertedCount += batch.length
      console.log(`✅ Progreso: ${insertedCount}/${tvs.length} TVs insertadas`)
    }

    console.log(`\n🎉 ¡Listo! Se insertaron ${insertedCount} productos de TVs en electrodomesticos`)

    // 3. Verificar total
    const total = await prisma.product.count({ where: { categoryKey: 'electrodomesticos' } })
    console.log(`📊 Total en electrodomesticos ahora: ${total} productos`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
