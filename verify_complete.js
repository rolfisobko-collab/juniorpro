const fs = require('fs');

// Leer el JSON completo
const data = JSON.parse(fs.readFileSync('products-list-complete.json', 'utf8'));

// Verificación cruzada: buscar productos que podrían faltar
const originalContent = fs.readFileSync('products-list.json', 'utf8');
const lines = originalContent.split('\n');

// Extraer todos los productos del formato original
const originalProducts = [];
lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('*') && !trimmed.startsWith('[') && 
      !trimmed.startsWith(']') && !trimmed.startsWith('{') && 
      !trimmed.startsWith('}') && !trimmed.startsWith('  ') &&
      (trimmed.includes('/') || trimmed.includes('$'))) {
    
    // Extraer nombre y precio
    let name = '';
    let price = 0;
    
    if (trimmed.includes('/') && (trimmed.endsWith('|') || trimmed.includes(' / '))) {
      const parts = trimmed.split(' / ');
      if (parts.length >= 2) {
        name = parts[0].trim().replace(/[|]/g, '');
        const priceStr = parts[parts.length - 1].replace(/[^0-9.,]/g, '').replace(',', '.');
        price = parseFloat(priceStr);
      }
    } else if (trimmed.includes('$')) {
      const match = trimmed.match(/(.+?)\s*\$([0-9]+(?:\.[0-9]+)?)/);
      if (match) {
        name = match[1].trim();
        price = parseFloat(match[2]);
      }
    }
    
    if (name && price > 0) {
      originalProducts.push({ name, price });
    }
  }
});

console.log('=== VERIFICACIÓN CRUZADA ===');
console.log(`Productos en JSON final: ${data.length}`);
console.log(`Productos en archivo original: ${originalProducts.length}\n`);

// Buscar productos que podrían faltar
const missingProducts = [];
originalProducts.forEach(orig => {
  const found = data.find(p => 
    p.name.toLowerCase().includes(orig.name.toLowerCase().substring(0, 20)) &&
    Math.abs(p.price - orig.price) < 1
  );
  
  if (!found) {
    missingProducts.push(orig);
  }
});

if (missingProducts.length > 0) {
  console.log(`⚠️  Posibles productos faltantes: ${missingProducts.length}\n`);
  missingProducts.slice(0, 10).forEach((prod, index) => {
    console.log(`${index + 1}. ${prod.name} - $${prod.price}`);
  });
  
  if (missingProducts.length > 10) {
    console.log(`\n... y ${missingProducts.length - 10} más`);
  }
} else {
  console.log('✅ Todos los productos del archivo original están en el JSON final');
}

// Verificar duplicados
const duplicates = {};
data.forEach(product => {
  const key = product.name.toLowerCase();
  if (!duplicates[key]) {
    duplicates[key] = [];
  }
  duplicates[key].push(product);
});

const duplicateGroups = Object.keys(duplicates).filter(key => duplicates[key].length > 1);
if (duplicateGroups.length > 0) {
  console.log(`\n⚠️  Posibles duplicados: ${duplicateGroups.length} grupos`);
  duplicateGroups.slice(0, 5).forEach(key => {
    console.log(`- ${key}: ${duplicates[key].length} productos`);
  });
} else {
  console.log('\n✅ No se encontraron duplicados');
}

// Estadísticas finales
const categories = {};
data.forEach(product => {
  const cat = product.subcategory;
  if (!categories[cat]) {
    categories[cat] = [];
  }
  categories[cat].push(product);
});

console.log('\n=== RESUMEN FINAL VERIFICADO ===');
Object.keys(categories).forEach(cat => {
  console.log(`${cat}: ${categories[cat].length} productos`);
});

console.log(`\n🎯 TOTAL VERIFICADO: ${data.length} productos únicos`);
