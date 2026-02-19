const fs = require('fs');

async function obtenerTodosLosProductos() {
  try {
    console.log('🔍 Obteniendo TODOS los productos...');
    
    let todosLosProductos = [];
    let pagina = 1;
    let hayMas = true;
    
    while (hayMas) {
      console.log(`📄 Obteniendo página ${pagina}...`);
      
      const response = await fetch(`http://localhost:3000/api/products?page=${pagina}&limit=50`);
      const data = await response.json();
      
      const productos = data.products || [];
      todosLosProductos.push(...productos);
      
      console.log(`✅ Página ${pagina}: ${productos.length} productos`);
      
      // Si hay menos de 50 productos, es la última página
      if (productos.length < 50) {
        hayMas = false;
      } else {
        pagina++;
      }
    }
    
    console.log(`\n🎯 TOTAL DE PRODUCTOS: ${todosLosProductos.length}`);
    
    // Clasificar por categoría
    const categorias = {};
    todosLosProductos.forEach(producto => {
      const categoriaKey = producto.categoryKey || 'sin-categoria';
      const categoriaNombre = producto.category?.name || 'Sin categoría';
      
      if (!categorias[categoriaKey]) {
        categorias[categoriaKey] = {
          nombre: categoriaNombre,
          count: 0
        };
      }
      categorias[categoriaKey].count++;
    });
    
    console.log('\n📊 DISTRIBUCIÓN POR CATEGORÍA:');
    Object.entries(categorias).forEach(([key, data]) => {
      console.log(`   ${data.nombre}: ${data.count} productos`);
    });
    
    // Guardar reporte
    const reporte = `
REPORTE COMPLETO DE TODOS LOS PRODUCTOS
=====================================
Fecha: ${new Date().toISOString()}
Total de páginas procesadas: ${pagina}
🎯 TOTAL DE PRODUCTOS: ${todosLosProductos.length}

DISTRIBUCIÓN POR CATEGORÍA:
----------------------------
${Object.entries(categorias).map(([key, data]) => 
   `${data.nombre}: ${data.count} productos (${((data.count/todosLosProductos.length)*100).toFixed(1)}%)`
).join('\n')}

=====================================
    `;
    
    fs.writeFileSync('reporte-todos-productos.txt', reporte);
    console.log('\n✅ Reporte guardado en "reporte-todos-productos.txt"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

obtenerTodosLosProductos();
