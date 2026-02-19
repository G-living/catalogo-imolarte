# IMOLARTE - Cerámicas Italianas Exclusivas

Blueprint catalogue v1.0 – production-ready, clone-ready for new brands.

## Features

- Luxury UX for Colombian audience (trust-building, mobile-first, COP-only prices)
- Catalogue: Garofano Blu teaser, popup for all collections with comodin placeholders
- Dono mode: gift credit with code gen, Whatsapp share, Sheet log
- Cart: comodin pic, SKU, price, quantity, subtotal, bin confirm modal
- Checkout: personal data, delivery toggle (Google Places API), checkboxes, single Wompi button → subsection with 60%/100% (3% off), referral/dono credits, back button
- Whatsapp wishlist: fixed resume, auto-log to Sheet with employee follow-up
- Backend: Cloudflare Workers (signature + webhook), Google Apps Script (code.gs), Sheet integration
- Coherence: omit missing images, lazy listeners, no duplicates, full-file mode

## Deployment Guide

1. **Frontend** (GitHub Pages)  
   - Fork this repo for new brands  
   - Update config.js (multiplier, keys, numbers)  
   - Upload images to /images/ (SKU.jpg for real, comodin-*.jpg for placeholders)  
   - Deploy to GitHub Pages (Settings → Pages → Main branch)  
   - Test: https://your-user.github.io/repo-name/

2. **Backend** (Cloudflare Workers)  
   - Fork workers/ folders  
   - Deploy signature-generator & wompi-webhook via Wrangler  
   - Set secrets: integrity, events, sheets URL

3. **Sheet** (Google Sheets)  
   - Copy IMOLARTE-sistema sheet  
   - Update code.gs (bound script)  
   - Deploy Web App (Anyone access)  
   - Sheets: PEDIDOS, CLIENTES, PAGOS, ITEMS_PEDIDO, DONOS, CONFIG, WISHLISTS

## Testing

- Catalogue → click product → popup → select qty → Agregar a carrito → toast
- Cart → items line-by-line, adjust qty, bin confirm, total, Seguir Comprando / Checkout
- Checkout → fill form, delivery toggle, checkboxes, Pago con Wompi → subsection, credits apply, net amount to Wompi
- Whatsapp → fixed resume, wa.me open, log to Sheet

## File Purposes

- config.js: multipliers, keys, numbers
- ui.js: helpers (toast, modals, loading)
- cart.js: cart state, UI, bin confirm
- catalog.js: render Garofano Blu, popup for collections
- dono.js: dono modal, code gen, share
- checkout.js: form, validation, Wompi subsection, Whatsapp wishlist
- main.js: entry point, lazy init

## Security & Notes

- No Euro prices shown – COP only
- Multiplier internal – update yearly
- Employee follow-up in Sheet for wishlists
- Google Places API key in checkout.js (replace placeholder)

Contact Filippo for clones.