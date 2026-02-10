const fs = require('fs');

const content = fs.readFileSync('products-list.json', 'utf8');
const lines = content.split('\n');

function parseRobotLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  
  let name, price;
  
  // Formato 1: ROBOT XIAOMI VACUUM ... / PRECIO |
  if (trimmed.includes('ROBOT') && trimmed.includes('/')) {
    const parts = trimmed.split(' / ');
    if (parts.length >= 2) {
      name = parts[0].trim().replace(/[|]/g, '');
      const priceStr = parts[1].replace(/[^0-9.,]/g, '').replace(',', '.');
      price = parseFloat(priceStr);
    }
  }
  // Formato 2: Xiaomi robot ... $PRECIO
  else if (trimmed.toLowerCase().includes('robot') && trimmed.includes('$')) {
    const match = trimmed.match(/(.+?)\s*\$([0-9]+(?:\.[0-9]+)?)/);
    if (match) {
      name = match[1].trim();
      price = parseFloat(match[2]);
    }
  }
  
  if (!name || isNaN(price)) return null;
  
  return {
    name,
    category: 'Electrónica',
    subcategory: 'Electrodomésticos',
    price,
    stock: Math.floor(Math.random() * 10) + 3,
    image: '/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg',
    description: `Robot aspirador ${name} con tecnología avanzada de limpieza.`,
    brand: 'Xiaomi',
    model: name.includes('X20') ? 'X20' : (name.includes('S40') ? 'S40' : 'Vacuum'),
    warranty: '1 año'
  };
}

// Parsear todos los robots
const allRobots = [];
lines.forEach(line => {
  const robot = parseRobotLine(line);
  if (robot) {
    allRobots.push(robot);
  }
});

console.log('=== TODOS LOS ROBOTS ENCONTRADOS ===');
console.log(`Total: ${allRobots.length}\n`);

allRobots.forEach((robot, index) => {
  console.log(`${index + 1}. ${robot.name}`);
  console.log(`   Precio: $${robot.price}`);
  console.log(`   Stock: ${robot.stock}`);
  console.log(`   Modelo: ${robot.model}`);
  console.log('');
});

// Guardar robots en archivo separado
fs.writeFileSync('robots-only.json', JSON.stringify(allRobots, null, 2));
console.log(`Robots guardados en: robots-only.json`);
