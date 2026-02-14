# 🚀 Guía Paso a Paso: Subir Catálogo IMOLARTE a GitHub

## ✅ PASO 1: Instalar GitHub Desktop

1. Ve a: **https://desktop.github.com/**
2. Click en **"Download for Windows"**
3. Ejecuta el instalador
4. Abre GitHub Desktop
5. Click **"Sign in to GitHub.com"**
6. Inicia sesión con tu cuenta de GitHub
   - Si no tienes cuenta: **"Create your free account"**

**⏱️ Tiempo:** 5 minutos

---

## ✅ PASO 2: Crear Repositorio en GitHub Desktop

1. En GitHub Desktop, click **"File"** → **"New repository"**
2. Llena el formulario:
   - **Name:** `Catalogo-Imolarte`
   - **Description:** `Catálogo online de cerámicas artesanales italianas - IMOLARTE by Helena Caballero`
   - **Local path:** Elige una carpeta (ej: `C:\Users\TuNombre\Documents\GitHub`)
   - ✅ Marca: **"Initialize this repository with a README"**
   - **Git ignore:** None
   - **License:** MIT License (recomendado)
3. Click **"Create repository"**

**⏱️ Tiempo:** 2 minutos

---

## ✅ PASO 3: Copiar Archivos al Repositorio

1. Abre la carpeta del repositorio:
   - En GitHub Desktop, click **"Repository"** → **"Show in Explorer"**
   
2. **COPIA** toda la carpeta `catalogo-imolarte` que te di en el chat
   
3. La estructura debe quedar así:
   ```
   Catalogo-Imolarte/
   ├── images/
   │   ├── products/
   │   │   ├── 001.jpg
   │   │   ├── 002.jpg
   │   │   └── ... (94 archivos)
   │   ├── comodines/
   │   │   ├── GAROFANO_BLU.png
   │   │   └── ... (11 archivos)
   │   └── branding/
   │       ├── logo-hc.jpg
   │       └── logo-imolarte.png
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── catalog.js
   │   ├── cart.js
   │   └── checkout.js
   ├── index.html
   ├── README.md
   └── .gitignore
   ```

**⏱️ Tiempo:** 3 minutos

---

## ✅ PASO 4: Commit y Push

1. Vuelve a GitHub Desktop
2. Verás todos los archivos en **"Changes"**
3. En el campo de abajo escribe:
   - **Summary:** `Initial commit - Catálogo completo`
   - **Description:** `Catálogo con 104 productos, carrito, checkout, WhatsApp y Wompi`
4. Click **"Commit to main"**
5. Click **"Publish repository"**
6. ✅ Marca: **"Keep this code private"** (o desmarca si quieres público)
7. Click **"Publish repository"**

**⏱️ Tiempo:** 2 minutos

---

## ✅ PASO 5: Activar GitHub Pages

1. Ve a tu repositorio en GitHub.com:
   - GitHub Desktop → **"Repository"** → **"View on GitHub"**

2. En GitHub.com, click en **"Settings"** (arriba derecha)

3. En el menú izquierdo, click en **"Pages"**

4. En **"Source"**, selecciona:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **"Save"**

6. **Espera 2-3 minutos**

7. Refresca la página - verás:
   ```
   ✅ Your site is live at https://tu-usuario.github.io/Catalogo-Imolarte/
   ```

**⏱️ Tiempo:** 5 minutos (incluye espera de deploy)

---

## ✅ PASO 6: Configurar Dominio Personalizado (OPCIONAL)

Si quieres usar tu propio dominio (ej: `catalogo.imolarte.com`):

1. En la página de **Settings → Pages**
2. En **"Custom domain"** escribe: `catalogo.imolarte.com`
3. En tu proveedor de dominio (GoDaddy, Namecheap, etc):
   - Crea un registro **CNAME**:
     - **Host:** `catalogo`
     - **Points to:** `tu-usuario.github.io`

**⏱️ Tiempo:** 10 minutos

---

## 🎯 RESUMEN DE TIEMPOS

| Paso | Tiempo |
|------|---------|
| 1. Instalar GitHub Desktop | 5 min |
| 2. Crear repositorio | 2 min |
| 3. Copiar archivos | 3 min |
| 4. Commit y Push | 2 min |
| 5. Activar Pages | 5 min |
| **TOTAL** | **17 minutos** |

---

## 📝 SIGUIENTE PASO: Google Places

Una vez que el catálogo esté en GitHub Pages:
1. El dominio será HTTPS automáticamente
2. Podremos configurar Google Places API con restricciones correctas
3. Las direcciones funcionarán perfectamente

---

## ❓ ¿PROBLEMAS?

### "GitHub Desktop no se instala"
- Usa la versión web: **github.com/new**

### "No puedo hacer push"
- Verifica que iniciaste sesión en GitHub Desktop

### "GitHub Pages no se activa"
- Espera 5 minutos más
- Verifica que el repositorio sea público o tengas GitHub Pro

---

## 📧 CONTACTO

Si tienes problemas, pregúntame en el chat.

---

**¡Listo! En 17 minutos tendrás tu catálogo online profesional** 🚀
