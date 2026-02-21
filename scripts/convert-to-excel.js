// scripts/convert-excel-to-csv.js
// Convierte Excel de precios IMOLARTE → CSV unificado para catálogo

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const INPUT_FILE = path.join(__dirname, '../listino/IMOLARTE NET PRICE WHOLESALE EXTRA CEE.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../listino/catalogo-imolarte.csv');

// Mapeo de prefijos de SKU a comodines
const COMODIN_MAP = {
  'GB': 'BLU_CLASSICO.png',      // Garofano Blu
  'GIG': 'AVORIO_E_ORO.png',     // Giglio
  'GF': 'BIANCO_VERDE.png',      // Garofano Festivo (ejemplo)
  'DEFAULT': 'BLU_CLASSICO.png'  // Fallback
};

// Multiplicador EUR → COP
const EUR_TO_COP = 12600;

// ============================================================================
// FUNCIONES
// ============================================================================

function getComodinForSKU(sku) {
  const prefix = sku.match(/^[A-Z]+/);
  if (prefix && COMODIN_MAP[prefix[0]]) {
    return COMODIN_MAP[prefix[0]];
  }
  return COMODIN_MAP['DEFAULT'];
}

function convertExcelToCSV() {
  console.log('🔄 Convirtiendo Excel a CSV...');
  
  // Leer Excel
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Archivo no encontrado: ${INPUT_FILE}`);
    process.exit(1);
  }
  
  const workbook = XLSX.readFile(INPUT_FILE);
  const sheetName = workbook.SheetNames[0]; // Primera hoja
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 ${data.length} productos encontrados en Excel`);
  
  // Transformar datos
  const csvRows = [];
  const headers = ['SKU', 'Nombre', 'Coleccion', 'Precio_EUR', 'Precio_COP', 'Imagen_Real', 'Comodin', 'Stock', 'Activo'];
  csvRows.push(headers.join(','));
  
  data.forEach(row => {
    // Ajusta estos nombres de columna según tu Excel real
    const sku = row['SKU'] || row['CODICE'] || row['Codice'] || '';
    const nombre = row['Nombre'] || row['Descrizione'] || row['Descripcion'] || '';
    const coleccion = row['Coleccion'] || row['Collezione'] || row['Colección'] || 'General';
    const precioEur = parseFloat(row['Precio_EUR'] || row['Prezzo'] || row['Price'] || '0');
    const stock = parseInt(row['Stock'] || row['Giacenza'] || '50');
    const activo = row['Activo'] !== 'FALSE' && row['Attivo'] !== 'FALSE';
    
    if (!sku) return; // Saltar filas sin SKU
    
    const precioCop = Math.round(precioEur * EUR_TO_COP);
    const imagenReal = `${sku}.jpg`;
    const comodin = getComodinForSKU(sku);
    
    const csvRow = [
      sku,
      `"${nombre.replace(/"/g, '""')}"`, // Escape comillas
      coleccion,
      precioEur.toFixed(2),
      precioCop,
      imagenReal,
      comodin,
      stock,
      activo ? 'TRUE' : 'FALSE'
    ];
    
    csvRows.push(csvRow.join(','));
  });
  
  // Escribir CSV
  const csvContent = csvRows.join('\n');
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');
  
  console.log(`✅ CSV generado: ${OUTPUT_FILE}`);
  console.log(`📦 ${csvRows.length - 1} productos exportados`);
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

convertExcelToCSV();