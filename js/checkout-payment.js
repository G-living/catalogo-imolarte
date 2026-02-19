let isSubmitting = false;

async function handlePagarAnticipo(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  if (isSubmitting) return;
  isSubmitting = true;

  try {
    const btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    // Your validation + signature + widget logic here

    showToast('Procesando pago 60%...', 'info');

    // ... rest of your code

  } catch (err) {
    console.error('Anticipo error:', err);
    showToast('Error al procesar pago. Intenta de nuevo.', 'error');
  } finally {
    isSubmitting = false;
    if (e.target) {
      e.target.disabled = false;
      e.target.textContent = 'Pagar Anticipo 60%';
    }
  }
}

// Repeat the same pattern for handlePagarCompleto