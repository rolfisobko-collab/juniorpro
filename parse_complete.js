const fs = require('fs');

// Leer el archivo completo
const content = fs.readFileSync('products-list.json', 'utf8');
const lines = content.split('\n');

function parseProductLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  // Ignorar líneas que ya son JSON o headers
  if (trimmed.startsWith('[') || trimmed.startsWith(']') || 
      trimmed.startsWith('{') || trimmed.startsWith('}') ||
      trimmed.startsWith('*') || trimmed.startsWith('  ') ||
      trimmed.includes('"name":') || trimmed.includes('"category":')) {
    return null;
  }
  
  // Formato 1: NOMBRE / PRECIO |
  if (trimmed.includes('/') && (trimmed.endsWith('|') || trimmed.includes(' / '))) {
    const parts = trimmed.split(' / ');
    if (parts.length < 2) return null;
    
    let name = parts[0].trim().replace(/[|]/g, '');
    const priceStr = parts[parts.length - 1].replace(/[^0-9.,]/g, '').replace(',', '.');
    const price = parseFloat(priceStr);
    
    if (isNaN(price)) return null;
    
    return createProductObject(name, price);
  }
  
  // Formato 2: NOMBRE $PRECIO
  if (trimmed.includes('$')) {
    const match = trimmed.match(/(.+?)\s*\$([0-9]+(?:\.[0-9]+)?)/);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2]);
      return createProductObject(name, price);
    }
  }
  
  return null;
}

function createProductObject(name, price) {
  let category = 'Electrónica';
  let subcategory = 'Smartphones';
  let brand = '';
  let description = '';
  let model = '';
  
  // Determinar categoría
  if (name.includes('TABLET')) {
    subcategory = 'Tablets';
  } else if (name.includes('ROBOT') || name.includes('VACUUM') || name.toLowerCase().includes('robot')) {
    subcategory = 'Electrodomésticos';
  } else if (name.includes('MACBOOK') || name.includes('APPLE TV')) {
    subcategory = 'Computadoras';
  } else if (name.includes('IPHONE') || name.includes('SAMSUNG') || name.includes('XIAOMI') || name.includes('REALME') || name.includes('POCO') || name.includes('REDMI')) {
    subcategory = 'Smartphones';
  }
  
  // Determinar marca
  if (name.includes('SAMSUNG')) {
    brand = 'Samsung';
    if (name.includes('A06')) {
      description = 'Samsung A06 con 64GB de almacenamiento y 4GB de RAM.';
      model = 'SM-A065M/DS';
    } else if (name.includes('A07')) {
      description = 'Samsung A07 con 64GB de almacenamiento y 4GB de RAM.';
      model = 'SM-A075M/DS';
    } else if (name.includes('A16')) {
      description = 'Samsung A16 con 128GB de almacenamiento y 4GB de RAM.';
      model = 'SM-A165M';
    } else if (name.includes('A17')) {
      const ram = name.includes('6RAM') ? '6GB' : '4GB';
      const storage = name.includes('256GB') ? '256GB' : '128GB';
      description = `Samsung A17 ${name.includes('5G') ? '5G' : '4G'} con ${storage} de almacenamiento y ${ram} de RAM.`;
      model = name.includes('5G') ? 'SM-A176B' : 'SM-A175F';
    } else if (name.includes('A26')) {
      description = 'Samsung A26 5G con 8GB RAM y 256GB almacenamiento.';
      model = 'A266M';
    } else if (name.includes('A36')) {
      description = 'Samsung A36 5G con 8GB RAM y 256GB almacenamiento.';
      model = 'A366E';
    } else if (name.includes('A56')) {
      const ram = name.includes('12/256GB') ? '12GB' : '8GB';
      const storage = name.includes('8/128GB') ? '128GB' : '256GB';
      description = `Samsung A56 5G con ${ram} RAM y ${storage} almacenamiento.`;
      model = 'A566E';
    } else if (name.includes('TABLET')) {
      description = 'Tablet Samsung Tab A9 con WiFi, 64GB almacenamiento y 4GB RAM.';
      model = 'X110';
    }
  } else if (name.includes('XIAOMI')) {
    brand = 'Xiaomi';
    if (name.includes('ROBOT') || name.includes('VACUUM') || name.toLowerCase().includes('robot')) {
      description = `Robot aspirador Xiaomi con tecnología avanzada de limpieza.`;
      model = name.includes('X20') ? 'X20' : (name.includes('S40') ? 'S40' : 'Vacuum');
    } else if (name.includes('TABLET')) {
      const ram = name.includes('4RAM') ? '4GB' : '8GB';
      const storage = name.includes('128GB') ? '128GB' : '256GB';
      description = `Tablet Xiaomi Redmi Pad 2 con ${ram} RAM y ${storage} almacenamiento, pantalla 11'.`;
      model = 'Redmi Pad 2';
    } else if (name.includes('15T PRO')) {
      description = 'Xiaomi 15T Pro con 512GB almacenamiento y 12GB RAM, versión global.';
      model = '15T Pro';
    } else if (name.includes('NOTE 14')) {
      const storage = name.includes('128GB') ? '128GB' : (name.includes('256GB') ? '256GB' : '512GB');
      const ram = name.includes('6RAM') ? '6GB' : (name.includes('8RAM') ? '8GB' : '12RAM');
      description = `Xiaomi Note 14 con ${storage} almacenamiento y ${ram} RAM, versión global.`;
      model = 'NOTE 14';
    } else if (name.includes('NOTE 15')) {
      const storage = name.includes('128GB') ? '128GB' : '256GB';
      const ram = name.includes('6RAM') ? '6GB' : '8GB';
      description = `Xiaomi Note 15 con ${storage} almacenamiento y ${ram} RAM, versión global.`;
      model = 'NOTE 15';
    } else if (name.includes('POCO')) {
      const pocoModel = name.match(/POCO\s+([^\s]+)/);
      if (pocoModel) {
        description = `Xiaomi POCO ${pocoModel[1]} con especificaciones completas, versión global.`;
        model = `POCO ${pocoModel[1]}`;
      }
    } else if (name.includes('REDMI')) {
      const redmiModel = name.match(/REDMI\s+(\d+[A-Za-z]*)/);
      if (redmiModel) {
        description = `Xiaomi Redmi ${redmiModel[1]} con especificaciones completas, versión global.`;
        model = `Redmi ${redmiModel[1]}`;
      }
    }
  } else if (name.includes('REALME')) {
    brand = 'Realme';
    const realmeModel = name.match(/REALME\s+(\d+[A-Za-z]*)/);
    if (realmeModel) {
      description = `Realme ${realmeModel[1]} con especificaciones completas.`;
      model = realmeModel[0];
    } else if (name.includes('C')) {
      const cModel = name.match(/C(\d+[A-Za-z]*)/);
      if (cModel) {
        description = `Realme C${cModel[1]} con especificaciones completas.`;
        model = `C${cModel[1]}`;
      }
    }
  } else if (name.includes('APPLE') || name.includes('IPHONE') || name.includes('MACBOOK')) {
    brand = 'Apple';
    if (name.includes('MACBOOK')) {
      description = 'MacBook Air con procesador Apple Silicon, pantalla retina y excelente rendimiento.';
      model = name.match(/MC[A-Z0-9]+/)?.[0] || 'MacBook';
    } else if (name.includes('APPLE TV')) {
      description = 'Apple TV 4K con 128GB de almacenamiento para streaming en alta calidad.';
      model = 'Apple TV 4K';
    } else if (name.includes('IPHONE')) {
      const iphoneModel = name.match(/IPHONE\s+(\d+[A-Za-z\s]*)/);
      if (iphoneModel) {
        const storage = name.match(/(\d+GB)/)?.[1] || '';
        description = `iPhone ${iphoneModel[1].trim()} con ${storage} de almacenamiento.`;
        model = `iPhone ${iphoneModel[1].trim()}`;
      }
    }
  }
  
  // Si no hay descripción, usar una genérica
  if (!description) {
    description = `${brand} ${model} con especificaciones completas.`;
  }
  
  // Generar imagen
  const image = '/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
  
  return {
    name,
    category,
    subcategory,
    price,
    stock: Math.floor(Math.random() * 15) + 5,
    image,
    description,
    brand,
    model,
    warranty: '1 año'
  };
}

// Parsear todas las líneas
const allProducts = [];
const processedLines = new Set();

lines.forEach((line, index) => {
  const product = parseProductLine(line);
  if (product) {
    // Evitar duplicados por nombre
    const key = `${product.name}_${product.price}`;
    if (!processedLines.has(key)) {
      allProducts.push(product);
      processedLines.add(key);
    }
  }
});

// Ordenar por marca y nombre
allProducts.sort((a, b) => {
  if (a.brand !== b.brand) {
    return a.brand.localeCompare(b.brand);
  }
  return a.name.localeCompare(b.name);
});

// Guardar el JSON completo
fs.writeFileSync('products-list-complete.json', JSON.stringify(allProducts, null, 2));

// Análisis detallado
const categories = {};
const brands = {};
const duplicates = 0;

allProducts.forEach(product => {
  // Contar por categoría
  const cat = product.subcategory;
  if (!categories[cat]) {
    categories[cat] = [];
  }
  categories[cat].push(product);
  
  // Contar por marca
  if (!brands[product.brand]) {
    brands[product.brand] = [];
  }
  brands[product.brand].push(product);
});

console.log('=== ANÁLISIS COMPLETO DE PRODUCTOS ===');
console.log(`Total productos únicos: ${allProducts.length}`);
console.log(`Líneas procesadas: ${lines.length}`);
console.log(`Duplicados eliminidos: ${duplicates}\n`);

console.log('=== DISTRIBUCIÓN POR CATEGORÍAS ===');
Object.keys(categories).forEach(cat => {
  console.log(`${cat}: ${categories[cat].length} productos`);
});

console.log('\n=== DISTRIBUCIÓN POR MARCAS ===');
Object.keys(brands).forEach(brand => {
  console.log(`${brand}: ${brands[brand].length} productos`);
});

console.log('\n=== ROBOTS ASPIRADORES ===');
const robots = categories['Electrodomésticos'] || [];
if (robots.length > 0) {
  robots.forEach((robot, index) => {
    console.log(`${index + 1}. ${robot.name} - $${robot.price}`);
  });
} else {
  console.log('No se encontraron robots aspiradores');
}

console.log(`\n✅ Archivo guardado: products-list-complete.json`);
console.log(`📊 Total: ${allProducts.length} productos únicos`);
