# 🚀 Instrucciones de Deployment - IMOLARTE Catálogo

## ✅ ARCHIVOS COMPLETOS Y LISTOS

Tu catálogo está 100% completo con todos los archivos necesarios:

### 📁 Estructura del Proyecto
```
catalogo-imolarte/
├── index.html                    (10.7 KB) ✅ HTML optimizado
├── README.md                     (855 B)   ✅ Documentación
├── .gitignore                    (125 B)   ✅ Git configuration
├── GUIA_GITHUB.md               (4.4 KB)  ✅ Guía paso a paso
│
├── css/
│   └── styles.css               (30 KB)   ✅ Estilos completos
│
├── js/
│   ├── cart.js                  (1.4 KB)  ✅ Gestión de carrito
│   ├── catalog-data.js          (128 KB)  ✅ Datos de productos
│   ├── checkout.js              (23 KB)   ✅ Checkout + Wompi + WhatsApp
│   ├── google-places.js         (3.5 KB)  ✅ Google Places API (New)
│   ├── image-config.js          (6.1 KB)  ✅ Configuración de imágenes
│   └── products.js              (16 KB)   ✅ Renderizado de productos
│
└── images/
    ├── branding/                (2 archivos)
    │   ├── logo-hc.jpg         ✅ Logo Helena Caballero
    │   └── logo-imolarte.png   ✅ Logo Imolarte
    │
    ├── comodines/              (11 archivos)
    │   └── *.png               ✅ Comodines de colecciones
    │
    └── products/               (94 archivos)
        └── *.jpg               ✅ Imágenes de productos

TOTAL: 107 imágenes + 11 archivos de código = 2.6 MB
```

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### ✅ Funcionalidades Principales
- [x] 104 productos en 10 colecciones
- [x] Catálogo responsive (móvil, tablet, desktop)
- [x] Modal de producto con variantes
- [x] Selector de cantidad por variante
- [x] Carrito de compras persistente (LocalStorage)
- [x] Página dedicada del carrito
- [x] Modal de checkout completo

### ✅ Formulario de Checkout
- [x] Datos personales (nombre, apellido, email, teléfono)
- [x] Selector de código de país
- [x] Método de entrega (retiro/domicilio)
- [x] Campos de dirección condicionales
- [x] Validaciones en tiempo real
- [x] Términos y condiciones (popup)

### ✅ Integraciones
- [x] **Google Places API (New)** - Autocompletado de direcciones
  - Implementación correcta con `importLibrary`
  - Sugerencias en dropdown
  - Auto-fill de barrio y ciudad
  - Session tokens para optimizar costos
  
- [x] **WhatsApp** - Envío de pedidos
  - Mensaje formateado profesional
  - Datos del cliente
  - Detalle de productos
  - Total del pedido
  
- [x] **Wompi** - Procesamiento de pagos
  - Tarjetas de crédito/débito
  - PSE (Pagos Seguros en Línea)
  - Nequi
  - Confirmación por WhatsApp

### ✅ Diseño y UX
- [x] Diseño sofisticado y elegante
- [x] Animaciones suaves
- [x] Feedback visual en todas las acciones
- [x] Notificaciones temporales
- [x] Estados de loading
- [x] Responsive completo
- [x] Accesibilidad (ARIA labels, keyboard navigation)

---

## 🚀 DEPLOYMENT EN GITHUB PAGES

### Paso 1: Subir a tu repositorio

Ya creaste el repositorio: **https://github.com/G-living/Catalogo-imolarte**

Ahora sube los archivos:

#### Opción A: GitHub Desktop (Recomendado)

1. Abre **GitHub Desktop**
2. Click **"File"** → **"Add Local Repository"**
3. Navega a la carpeta `catalogo-imolarte`
4. Si no es un repositorio, click **"Create Repository"**
5. En GitHub Desktop, verás todos los archivos en **"Changes"**
6. En el campo de abajo:
   - **Summary:** `Catálogo completo - Versión optimizada`
   - **Description:** `HTML, CSS, JS modulares + Google Places API (New) + Wompi + WhatsApp`
7. Click **"Commit to main"**
8. Click **"Push origin"**

#### Opción B: Línea de comandos

```bash
cd catalogo-imolarte
git init
git add .
git commit -m "Catálogo completo - Versión optimizada"
git branch -M main
git remote add origin https://github.com/G-living/Catalogo-imolarte.git
git push -u origin main
```

### Paso 2: Activar GitHub Pages

1. Ve a tu repositorio: **https://github.com/G-living/Catalogo-imolarte**
2. Click en **"Settings"**
3. En el menú izquierdo, click **"Pages"**
4. En **"Source"**:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **"Save"**
6. **Espera 2-3 minutos**
7. Refresca la página
8. Verás: **"Your site is live at https://g-living.github.io/Catalogo-imolarte/"**

---

## 🔑 CONFIGURACIÓN DE GOOGLE PLACES API

Tu API Key ya está configurada en el código:
```
AIzaSyDd1f-rpDSztTvxz07eaCDNCa8rjNG_Jb4
```

### APIs habilitadas en tu proyecto:
✅ Maps JavaScript API
✅ Maps Static API  
✅ Places API (New)
✅ Geolocation API

### Restricciones actuales:
- **Aplicación:** Ninguna (para testing)
- **APIs:** Las 4 mencionadas arriba

### 🔒 IMPORTANTE: Después del deployment

Una vez que tu sitio esté en GitHub Pages, actualiza las restricciones:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Click en tu API key
3. En **"Restricciones de aplicación"**:
   - Selecciona: **"Referentes HTTP (sitios web)"**
   - Agrega: `https://g-living.github.io/*`
4. Click **"Guardar"**

Esto protegerá tu API key contra uso no autorizado.

---

## 💳 CONFIGURACIÓN DE WOMPI

Actualmente usa la **key de prueba**:
```javascript
const WOMPI_PUBLIC_KEY = 'pub_test_tXB8qjDFJayJhSoG8M0RGjdQj9O2GwuZ';
```

### Para producción:

1. Ve a: https://comercios.wompi.co/
2. Inicia sesión con tu cuenta de Wompi
3. Ve a **"Configuración"** → **"API Keys"**
4. Copia tu **Public Key de Producción**
5. Edita `js/checkout.js`:
   ```javascript
   // Línea 7
   const WOMPI_PUBLIC_KEY = 'pub_prod_TU_KEY_AQUI';
   ```
6. Haz commit y push del cambio

### Tarjetas de prueba (modo test):
- **Aprobada:** 4242 4242 4242 4242
- **Rechazada:** 4111 1111 1111 1111
- **CVV:** 123
- **Fecha:** Cualquier fecha futura

---

## 📱 CONFIGURACIÓN DE WHATSAPP

El número actual es:
```javascript
const WHATSAPP_NUMBER = '573004257367';
```

Si necesitas cambiarlo:

1. Edita `js/checkout.js` (línea 6)
2. Formato: Código de país + número (sin espacios ni símbolos)
3. Ejemplo Colombia: `573001234567`
4. Ejemplo USA: `15551234567`

---

## 🧪 TESTING LOCAL

Antes de subir a GitHub, prueba localmente:

### Opción 1: Live Server (VS Code)

1. Instala la extensión **"Live Server"** en VS Code
2. Click derecho en `index.html`
3. Selecciona **"Open with Live Server"**
4. Se abrirá en: `http://127.0.0.1:5500`

### Opción 2: Python Simple Server

```bash
cd catalogo-imolarte
python -m http.server 8000
```
Abre: `http://localhost:8000`

### Opción 3: Node.js http-server

```bash
npm install -g http-server
cd catalogo-imolarte
http-server
```
Abre: `http://localhost:8080`

### ✅ Checklist de Testing:

- [ ] El catálogo muestra los 104 productos
- [ ] Las imágenes cargan correctamente
- [ ] Los modales se abren y cierran
- [ ] Se pueden agregar productos al carrito
- [ ] El carrito persiste al recargar la página
- [ ] Google Places sugiere direcciones al escribir
- [ ] El formulario valida correctamente
- [ ] WhatsApp se abre con el mensaje correcto
- [ ] Wompi abre el widget de pago
- [ ] Todo funciona en móvil

---

## 🐛 TROUBLESHOOTING

### Google Places no muestra sugerencias:

**Causa:** API key sin permisos o APIs no habilitadas

**Solución:**
1. Verifica en: https://console.cloud.google.com/apis/dashboard
2. Asegúrate que estén habilitadas:
   - Places API (New)
   - Maps JavaScript API
   - Geocoding API
3. Espera 5 minutos después de habilitar
4. Limpia caché del navegador (Ctrl + Shift + Delete)

### Imágenes no cargan:

**Causa:** Rutas incorrectas o archivos faltantes

**Solución:**
1. Verifica que existan las carpetas:
   - `images/products/`
   - `images/comodines/`
   - `images/branding/`
2. Revisa la consola (F12) para ver errores 404

### Carrito no persiste:

**Causa:** LocalStorage deshabilitado

**Solución:**
1. Verifica que el navegador permita cookies/storage
2. No uses modo incógnito para testing persistente

### Wompi no abre:

**Causa:** Script de Wompi no cargado

**Solución:**
1. Verifica que el script esté en `index.html`:
   ```html
   <script src="https://checkout.wompi.co/widget.js"></script>
   ```
2. Revisa la consola para errores de red

### Errores de JavaScript:

**Causa:** Archivos cargados en orden incorrecto

**Solución:**
Los scripts en `index.html` deben estar en este orden:
1. catalog-data.js
2. image-config.js
3. cart.js
4. products.js
5. checkout.js
6. google-places.js

---

## 📊 MONITOREO

### Google Cloud Console

Monitorea el uso de tu API:
https://console.cloud.google.com/apis/dashboard

**Cuotas gratuitas mensuales:**
- Places API: 25,000 búsquedas
- Maps JavaScript: 28,000 cargas
- Geocoding: 40,000 solicitudes

**Costos después del límite:** ~$7 USD por 1,000 adicionales

### Analytics (Opcional)

Para ver visitantes, agrega Google Analytics:

1. Crea cuenta en: https://analytics.google.com/
2. Copia el código de seguimiento
3. Agrégalo en `index.html` antes de `</head>`

---

## 🔄 ACTUALIZACIONES FUTURAS

### Agregar nuevo producto:

1. Edita `js/catalog-data.js`
2. Agrega imagen en `images/products/XXX.jpg`
3. Si es nueva colección, agrega comodín en `images/comodines/`
4. Actualiza `js/image-config.js`
5. Commit y push

### Cambiar precios:

1. Edita `js/catalog-data.js`
2. Busca el producto
3. Cambia el valor de `price`
4. Commit y push

### Modificar estilos:

1. Edita `css/styles.css`
2. Las variables están al inicio (`:root`)
3. Commit y push

---

## 📧 SOPORTE

### Documentación oficial:

- **Google Places API:** https://developers.google.com/maps/documentation/javascript/places
- **Wompi:** https://docs.wompi.co/
- **GitHub Pages:** https://pages.github.com/

### Consultas:

- Issues del repositorio
- Email de soporte de cada servicio

---

## ✅ CHECKLIST FINAL

Antes de considerar el deployment completo:

- [ ] Código subido a GitHub
- [ ] GitHub Pages activado
- [ ] Sitio accesible en https://g-living.github.io/Catalogo-imolarte/
- [ ] Google Places funciona
- [ ] WhatsApp envía pedidos
- [ ] Wompi procesa pagos de prueba
- [ ] Restricciones de API key configuradas
- [ ] Wompi key de producción configurada
- [ ] Testing en móvil completado
- [ ] Testing en diferentes navegadores
- [ ] Compartiste el link con al menos 3 personas para beta testing

---

## 🎉 ¡FELICIDADES!

Tu catálogo está listo para vender. Características profesionales:

- ✅ Diseño sofisticado y responsive
- ✅ Carrito de compras completo
- ✅ Checkout con validaciones
- ✅ Integración con Google Places API (New)
- ✅ Pagos con Wompi
- ✅ WhatsApp para pedidos
- ✅ Optimizado para velocidad
- ✅ Código limpio y modular

**URL de tu catálogo:**
```
https://g-living.github.io/Catalogo-imolarte/
```

---

**Última actualización:** Febrero 14, 2026
**Versión:** 1.0.0 - Optimizada y Completa
