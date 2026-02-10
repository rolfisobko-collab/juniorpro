const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function seedProducts() {
  try {
    console.log('🔄 Iniciando proceso de actualización de productos...\n');

    // 1. Eliminar todos los productos existentes
    console.log('🗑️  Eliminando todos los productos existentes...');
    const deletedCount = await prisma.product.deleteMany({});
    console.log(`✅ Se eliminaron ${deletedCount.count} productos de la base de datos\n`);

    // 2. Leer el JSON con los nuevos productos
    console.log('📖 Leyendo productos desde JSON...');
    const productsData = JSON.parse(fs.readFileSync('products-final-complete.json', 'utf8'));
    console.log(`📊 Se encontraron ${productsData.length} productos en el JSON\n`);

    // 3. Asegurar que existan las categorías necesarias
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

    // 4. Insertar los nuevos productos
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
    
    // 5. Estadísticas finales
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

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
seedProducts()
  .then(() => {
    console.log('\n✨ ¡Todos los productos han sido actualizados correctamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
