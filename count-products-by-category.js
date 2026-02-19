const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function countProductsByCategory() {
  try {
    // Obtener todas las categorías con sus productos
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            products: true
          }
        }
      }
    });

    console.log('=== ANÁLISIS DE PRODUCTOS POR CATEGORÍA ===\n');

    let totalProducts = 0;

    categories.forEach(category => {
      console.log(`\n📂 CATEGORÍA: ${category.name}`);
      console.log(`   Key: ${category.key}`);
      console.log(`   Subcategorías: ${category.subcategories.length}`);
      
      let categoryTotal = 0;
      
      category.subcategories.forEach(subcategory => {
        const productCount = subcategory.products.length;
        categoryTotal += productCount;
        console.log(`      📁 ${subcategory.name}: ${productCount} productos`);
      });
      
      console.log(`   📊 TOTAL ${category.name}: ${categoryTotal} productos`);
      totalProducts += categoryTotal;
    });

    console.log(`\n🎯 TOTAL GENERAL DE PRODUCTOS: ${totalProducts}\n`);

    // También contar por categoría principal (agrupando subcategorías)
    console.log('=== RESUMEN POR CATEGORÍA PRINCIPAL ===\n');
    
    const mainCategories = {};
    categories.forEach(category => {
      if (!mainCategories[category.key]) {
        mainCategories[category.key] = {
          name: category.name,
          count: 0,
          subcategories: []
        };
      }
      
      category.subcategories.forEach(subcategory => {
        mainCategories[category.key].count += subcategory.products.length;
        mainCategories[category.key].subcategories.push({
          name: subcategory.name,
          count: subcategory.products.length
        });
      });
    });

    Object.entries(mainCategories).forEach(([key, data]) => {
      console.log(`${key.toUpperCase()}:`);
      console.log(`  Nombre: ${data.name}`);
      console.log(`  Total: ${data.count} productos`);
      console.log(`  Subcategorías:`);
      data.subcategories.forEach(sub => {
        console.log(`    - ${sub.name}: ${sub.count}`);
      });
      console.log('');
    });

    // Guardar en archivo
    const fs = require('fs');
    const report = {
      fecha: new Date().toISOString(),
      totalProductos: totalProducts,
      categorias: mainCategories
    };

    fs.writeFileSync('productos-por-categoria.txt', `
REPORTE DE PRODUCTOS POR CATEGORÍA
=====================================
Fecha: ${report.fecha}
Total de productos: ${report.totalProductos}

CATEGORÍAS:
-----------
${Object.entries(mainCategories).map(([key, data]) => `
${key.toUpperCase()}:
  Nombre: ${data.name}
  Total: ${data.count} productos
  Subcategorías:
${data.subcategories.map(sub => `    - ${sub.name}: ${sub.count}`).join('\n')}
`).join('\n')}
=====================================
    `);

    console.log('✅ Reporte guardado en "productos-por-categoria.txt"');

  } catch (error) {
    console.error('Error al contar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countProductsByCategory();
