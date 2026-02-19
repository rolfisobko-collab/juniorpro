const https = require('https');

async function countProductsByCategory() {
  try {
    console.log('🔍 Obteniendo categorías...');
    
    // Obtener categorías desde la API
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    const categories = await categoriesResponse.json();
    
    console.log('🔍 Obteniendo productos...');
    
    // Obtener productos por categoría
    const electronicsResponse = await fetch('http://localhost:3000/api/products?category=electronics&limit=1000');
    const perfumesResponse = await fetch('http://localhost:3000/api/products?category=perfumes&limit=1000');
    const computersResponse = await fetch('http://localhost:3000/api/products?category=computadoras&limit=1000');
    const appliancesResponse = await fetch('http://localhost:3000/api/products?category=appliances&limit=1000');
    
    const electronics = await electronicsResponse.json();
    const perfumes = await perfumesResponse.json();
    const computers = await computersResponse.json();
    const appliances = await appliancesResponse.json();
    
    console.log('\n=== ANÁLISIS DE PRODUCTOS POR CATEGORÍA ===\n');
    
    // Contar por categoría principal
    const counts = {
      electronics: electronics.products?.length || 0,
      perfumes: perfumes.products?.length || 0,
      computadoras: computers.products?.length || 0,
      appliances: appliances.products?.length || 0
    };
    
    console.log(`📱 ELECTRÓNICA: ${counts.electronics} productos`);
    console.log(`👩 PERFUMES: ${counts.perfumes} productos`);
    console.log(`💻 COMPUTADORAS: ${counts.computadoras} productos`);
    console.log(`🏠 ELECTRODOMÉSTICOS: ${counts.appliances} productos`);
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    console.log(`\n🎯 TOTAL GENERAL: ${total} productos`);
    
    // Detalle por subcategorías
    console.log('\n=== DETALLE POR SUBCATEGORÍAS ===\n');
    
    if (electronics.products) {
      console.log('📱 ELECTRÓNICA:');
      const subcategories = {};
      electronics.products.forEach(product => {
        const subcat = product.subcategory || 'Sin categoría';
        subcategories[subcat] = (subcategories[subcat] || 0) + 1;
      });
      
      Object.entries(subcategories).forEach(([name, count]) => {
        console.log(`  📁 ${name}: ${count} productos`);
      });
    }
    
    if (perfumes.products) {
      console.log('\n👩 PERFUMES:');
      const subcategories = {};
      perfumes.products.forEach(product => {
        const subcat = product.subcategory || 'Sin categoría';
        subcategories[subcat] = (subcategories[subcat] || 0) + 1;
      });
      
      Object.entries(subcategories).forEach(([name, count]) => {
        console.log(`  📁 ${name}: ${count} productos`);
      });
    }
    
    // Generar reporte
    const report = `
REPORTE DE PRODUCTOS POR CATEGORÍA
=====================================
Fecha: ${new Date().toISOString()}
Servidor: http://localhost:3000

RESUMEN POR CATEGORÍA:
---------------------------
📱 ELECTRÓNICA: ${counts.electronics} productos
👩 PERFUMES: ${counts.perfumes} productos  
💻 COMPUTADORAS: ${counts.computadoras} productos
🏠 ELECTRODOMÉSTICOS: ${counts.appliances} productos

🎯 TOTAL GENERAL: ${total} productos

CATEGORÍAS DISPONIBLES EN LA BD:
-----------------------------------
${categories.map(cat => `✅ ${cat.name} (${cat.key})`).join('\n')}

=====================================
    `;
    
    require('fs').writeFileSync('productos-por-categoria.txt', report);
    console.log('\n✅ Reporte guardado en "productos-por-categoria.txt"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

countProductsByCategory();
