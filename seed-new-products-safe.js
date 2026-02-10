import "dotenv/config"

import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"

import WebSocket from "ws"
import fs from 'fs'

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Seed requires DATABASE_URL in process.env (load .env).")
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString,
  }),
})

async function main() {
  console.log('🔄 Iniciando proceso de actualización de productos...\n');

  try {
    // 1. Eliminar datos dependientes primero (en orden correcto)
    console.log('🗑️  Eliminando datos dependientes...');
    
    // Eliminar en orden de dependencia
    await prisma.orderItem.deleteMany({});
    console.log('✅ OrderItems eliminados');
    
    await prisma.cartItem.deleteMany({});
    console.log('✅ CartItems eliminados');
    
    await prisma.favorite.deleteMany({});
    console.log('✅ Favorites eliminados');
    
    await prisma.productView.deleteMany({});
    console.log('✅ ProductViews eliminados');

    // 2. Ahora eliminar los productos
    console.log('🗑️  Eliminando todos los productos existentes...');
    const deletedCount = await prisma.product.deleteMany({});
    console.log(`✅ Se eliminaron ${deletedCount.count} productos de la base de datos\n`);

    // 3. Leer el JSON con los nuevos productos
    console.log('📖 Leyendo productos desde JSON...');
    const productsData = JSON.parse(fs.readFileSync('products-final-complete.json', 'utf8'));
    console.log(`📊 Se encontraron ${productsData.length} productos en el JSON\n`);

    // 4. Asegurar que existan las categorías necesarias
    console.log('🏷️  Verificando categorías...');
    
    // Mapeo de subcategorías a categoryKey
    const categoryMapping = {
      'Smartphones': 'smartphones',
      'Tablets': 'tablets', 
      'Computadoras': 'computadoras',
      'Electrodomésticos': 'electrodomesticos'
    };

    // Verificar/crear categorías principales
    const categories = [
      { key: 'smartphones', name: 'Smartphones', slug: 'smartphones', description: 'Teléfonos inteligentes de última generación' },
      { key: 'tablets', name: 'Tablets', slug: 'tablets', description: 'Tablets y dispositivos móviles' },
      { key: 'computadoras', name: 'Computadoras', slug: 'computadoras', description: 'Computadoras y accesorios' },
      { key: 'electrodomesticos', name: 'Electrodomésticos', slug: 'electrodomesticos', description: 'Robots y electrodomésticos inteligentes' }
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { key: cat.key },
        update: cat,
        create: cat
      });
    }

    // Verificar/crear subcategorías
    const subcategories = [
      { id: 'smartphones-basic', name: 'Smartphones', slug: 'smartphones', categoryKey: 'smartphones' },
      { id: 'tablets-basic', name: 'Tablets', slug: 'tablets', categoryKey: 'tablets' },
      { id: 'computadoras-basic', name: 'Computadoras', slug: 'computadoras', categoryKey: 'computadoras' },
      { id: 'electrodomesticos-basic', name: 'Electrodomésticos', slug: 'electrodomesticos', categoryKey: 'electrodomesticos' }
    ];

    for (const subcat of subcategories) {
      await prisma.subCategory.upsert({
        where: { id: subcat.id },
        update: subcat,
        create: subcat
      });
    }

    console.log('✅ Categorías verificadas\n');

    // 5. Insertar los nuevos productos
    console.log('📦 Insertando nuevos productos...');
    
    const productsToInsert = productsData.map((product, index) => {
      const categoryKey = categoryMapping[product.subcategory] || 'smartphones';
      
      return {
        id: `prod_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        name: product.name,
        categoryKey: categoryKey,
        price: product.price,
        image: product.image,
        images: [product.image],
        description: product.description,
        brand: product.brand,
        rating: 4.5 + Math.random() * 0.5, // Rating entre 4.5 y 5.0
        reviews: Math.floor(Math.random() * 100) + 10, // Entre 10 y 110 reviews
        inStock: product.stock > 0,
        stockQuantity: product.stock,
        featured: Math.random() > 0.8, // 20% de productos destacados
        weight: 0.5, // Peso por defecto
        length: 20, // Dimensiones por defecto
        width: 15,
        height: 10,
        paisOrigen: 'Importado'
      };
    });

    // Insertar en lotes para evitar timeouts
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      await prisma.product.createMany({
        data: batch
      });
      insertedCount += batch.length;
      console.log(`✅ Progreso: ${insertedCount}/${productsToInsert.length} productos insertados`);
    }

    console.log(`\n🎉 ¡Proceso completado exitosamente!`);
    console.log(`📊 Total de productos insertados: ${insertedCount}`);
    
    // 6. Estadísticas finales
    const finalStats = await prisma.product.groupBy({
      by: ['categoryKey'],
      _count: {
        id: true
      }
    });

    console.log('\n📈 Distribución por categorías:');
    finalStats.forEach(stat => {
      console.log(`   ${stat.categoryKey}: ${stat._count.id} productos`);
    });

    console.log('\n✨ ¡Todos los productos han sido actualizados correctamente!');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
