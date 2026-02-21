// scripts/convert-excel-to-csv.js
// IMOLARTE - Convertir Excel de precios → CSV unificado para catálogo
// Dependencia: xlsx (^0.18.5)

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const INPUT_FILE = path.join(__dirname, '../listino/IMOLARTE NET PRICE WHOLESALE EXTRA CEE.xlsx');
const OUTPUT_FILE = path.join(__dirname, '../listino/catalogo-imolarte.csv');

// Mapeo de prefijos de SKU a comodines por colección
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

/**
 * Obtiene el nombre del comodín según el prefijo del SKU
 * @param {string} sku - Código del producto (ej: 'GB110')
 * @returns {string} Nombre del archivo comodín
 */
function getComodinForSKU(sku) {
  if (!sku) return COMODIN_MAP['DEFAULT'];
  const prefix = sku.match(/^[A-Z]+/);
  if (prefix && COMODIN_MAP[prefix[0]]) {
    return COMODIN_MAP[prefix[0]];
  }
  return COMODIN_MAP['DEFAULT'];
}

/**
 * Convierte el Excel de precios a CSV unificado
 */
function convertExcelToCSV() {
  console.log('🔄 Convirtiendo Excel a CSV...');
  
  // Verificar que el archivo de entrada existe
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Archivo no encontrado: ${INPUT_FILE}`);
    console.log('💡 Asegúrate de que el Excel está en: /listino/');
    process.exit(1);
  }
  
  // Leer Excel
  const workbook = XLSX.readFile(INPUT_FILE);
  const sheetName = workbook.SheetNames[0]; // Primera hoja
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📊 ${data.length} filas encontradas en Excel`);
  
  // Transformar datos a formato CSV
  const csvRows = [];
  const headers = ['SKU', 'Nombre', 'Coleccion', 'Precio_EUR', 'Precio_COP', 'Imagen_Real', 'Comodin', 'Stock', 'Activo'];
  csvRows.push(headers.join(','));
  
  data.forEach((row, index) => {
    // Mapeo flexible de nombres de columna (ajusta según tu Excel real)
    const sku = row['SKU'] || row['CODICE'] || row['Codice'] || row['Código'] || '';
    const nombre = row['Nombre'] || row['Descrizione'] || row['Descripcion'] || row['Description'] || '';
    const coleccion = row['Coleccion'] || row['Collezione'] || row['Colección'] || row['Collection'] || 'General';
    const precioEur = parseFloat(row['Precio_EUR'] || row['Prezzo'] || row['Price'] || row['Precio'] || '0');
    const stock = parseInt(row['Stock'] || row['Giacenza'] || row['Cantidad'] || '50');
    const activoRaw = row['Activo'] || row['Attivo'] || row['Active'] || 'TRUE';
    const activo = String(activoRaw).toUpperCase() !== 'FALSE' && String(activoRaw).toUpperCase() !== 'NO';
    
    // Saltar filas sin SKU válido
    if (!sku || String(sku).trim() === '') {
      console.log(`⚠️ Fila ${index + 2} saltada: sin SKU`);
      return;
    }
    
    // Calcular precio en COP
    const precioCop = Math.round(precioEur * EUR_TO_COP);
    
    // Definir nombre de imagen y comodín
    const imagenReal = `${sku}.jpg`;
    const comodin = getComodinForSKU(sku);
    
    // Escape de comillas para CSV
    const nombreEscapado = String(nombre).replace(/"/g, '""');
    
    // Construir fila CSV
    const csvRow = [
      sku,
      `"${nombreEscapado}"`,
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
  
  // Escribir archivo CSV
  const csvContent = csvRows.join('\n');
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');
  
  console.log(`✅ CSV generado: ${OUTPUT_FILE}`);
  console.log(`📦 ${csvRows.length - 1} productos exportados`);
  console.log('💡 Ahora ejecuta: npm run dev para testear');
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

convertExcelToCSV();