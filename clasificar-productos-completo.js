const fs = require('fs');

async function clasificarTodosLosProductos() {
  try {
    console.log('🔍 Obteniendo TODOS los productos...');
    
    // Obtener todos los productos sin límite
    const response = await fetch('http://localhost:3000/api/products?limit=10000');
    const data = await response.json();
    const productos = data.products || [];
    
    console.log(`📊 Total de productos encontrados: ${productos.length}`);
    
    // Clasificar por categoría
    const categorias = {};
    const subcategorias = {};
    let total = 0;
    
    productos.forEach(producto => {
      total++;
      const categoriaKey = producto.categoryKey || 'sin-categoria';
      const categoriaNombre = producto.category?.name || 'Sin categoría';
      const subcategoria = producto.subcategory || 'Sin subcategoría';
      
      // Contar por categoría principal
      if (!categorias[categoriaKey]) {
        categorias[categoriaKey] = {
          nombre: categoriaNombre,
          count: 0,
          productos: []
        };
      }
      categorias[categoriaKey].count++;
      categorias[categoriaKey].productos.push({
        id: producto.id,
        name: producto.name,
        price: producto.price,
        brand: producto.brand
      });
      
      // Contar por subcategoría
      const subcatKey = `${categoriaKey}-${subcategoria}`;
      if (!subcategorias[subcatKey]) {
        subcategorias[subcatKey] = {
          categoria: categoriaNombre,
          subcategoria: subcategoria,
          count: 0
        };
      }
      subcategorias[subcatKey].count++;
    });
    
    console.log('\n=== ANÁLISIS COMPLETO DE PRODUCTOS ===\n');
    
    // Mostrar resumen por categoría
    console.log('📊 RESUMEN POR CATEGORÍA:');
    console.log('================================');
    Object.entries(categorias).forEach(([key, data]) => {
      console.log(`\n📂 ${data.nombre} (${key}):`);
      console.log(`   📊 Total: ${data.count} productos`);
      console.log(`   📋 Ejemplos:`);
      data.productos.slice(0, 3).forEach(p => {
        console.log(`      • ${p.name} - $${p.price}`);
      });
      if (data.count > 3) {
        console.log(`      ... y ${data.count - 3} más`);
      }
    });
    
    console.log('\n📁 DETALLE POR SUBCATEGORÍA:');
    console.log('================================');
    Object.entries(subcategorias).forEach(([key, data]) => {
      console.log(`   ${data.categoria} → ${data.subcategoria}: ${data.count} productos`);
    });
    
    console.log(`\n🎯 TOTAL GENERAL DE PRODUCTOS: ${total}`);
    
    // Generar reporte completo
    const reporte = `
REPORTE COMPLETO DE PRODUCTOS POR CATEGORÍA
=============================================
Fecha: ${new Date().toISOString()}
Servidor: http://localhost:3000

📊 RESUMEN GENERAL:
-------------------
🎯 TOTAL DE PRODUCTOS: ${total}

📂 DISTRIBUCIÓN POR CATEGORÍA:
-------------------------------
${Object.entries(categorias).map(([key, data]) => `
${data.nombre} (${key}):
   📊 Total: ${data.count} productos
   📋 Productos principales:
${data.productos.slice(0, 5).map(p => `      • ${p.name} - $${p.price}`).join('\n')}
${data.count > 5 ? `      ... y ${data.count - 5} productos más` : ''}
`).join('\n')}

📁 DETALLE POR SUBCATEGORÍA:
----------------------------
${Object.entries(subcategorias).map(([key, data]) => 
   `${data.categoria} → ${data.subcategoria}: ${data.count} productos`
).join('\n')}

📈 ANÁLISIS DE COBERTURA:
-------------------------
${Object.entries(categorias).map(([key, data]) => 
   `✅ ${data.nombre}: ${data.count} productos (${((data.count/total)*100).toFixed(1)}%)`
).join('\n')}

=============================================
    `;
    
    fs.writeFileSync('reporte-completo-productos.txt', reporte);
    console.log('\n✅ Reporte completo guardado en "reporte-completo-productos.txt"');
    
    return { total, categorias, subcategorias };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

clasificarTodosLosProductos();
