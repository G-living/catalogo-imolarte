/**
 * dono.js - COMPRA DE DONOS
 * Solo funciones, NO ejecuta nada automáticamente
 */

const DONO_CONFIG = {
    prefix: 'DNO-',
    codeLength: 10,
    minAmount: 50000,
    sheetsUrl: 'https://script.google.com/macros/s/AKfycbw_qPay6DfCh-xxeosxmD-tuEINf9UIPT_i_0sNg5b6GbD-zZc93ZsaxjrAoqkn_m1u/exec'
};

let selectedDonoAmount = 0;

// Inicializar (llamado por core.js cuando se necesita)
function initDonoModal() {
    console.log('🎁 Configurando modal Dono...');
    
    const closeBtn = document.getElementById('closeDonoModal');
    const cancelBtn = document.getElementById('cancelDono');
    const addBtn = document.getElementById('addDonoToCart');
    
    if (closeBtn) closeBtn.addEventListener('click', closeDonoModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDonoModal);
    if (addBtn) addBtn.addEventListener('click', handleAddDonoToCart);
    
    // Presets
    document.querySelectorAll('.dono-preset').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDonoAmount(parseInt(this.dataset.amount));
            document.querySelectorAll('.dono-preset').forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('donoCustomAmount').value = '';
        });
    });
    
    // Custom amount
    document.getElementById('donoCustomAmount')?.addEventListener('input', function() {
        const amount = parseInt(this.value);
        if (amount >= DONO_CONFIG.minAmount) {
            selectDonoAmount(amount);
            document.querySelectorAll('.dono-preset').forEach(p => p.classList.remove('selected'));
        }
    });
    
    console.log('✅ Modal Dono configurado');
}

function openDonoModal() {
    document.getElementById('donoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    resetDonoForm();
}

function closeDonoModal() {
    document.getElementById('donoModal').classList.remove('active');
    document.body.style.overflow = '';
}

function resetDonoForm() {
    ['donoRecipientName', 'donoRecipientEmail', 'donoRecipientPhone', 'donoCustomAmount', 'donoMessage']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    
    document.querySelectorAll('.dono-preset').forEach(p => p.classList.remove('selected'));
    selectedDonoAmount = 0;
    updateDonoTotal();
}

function selectDonoAmount(amount) {
    if (amount < DONO_CONFIG.minAmount) {
        if (typeof showToast === 'function') {
            showToast(`Mínimo ${formatPrice(DONO_CONFIG.minAmount)}`, 'warning');
        }
        return;
    }
    selectedDonoAmount = amount;
    updateDonoTotal();
}

function updateDonoTotal() {
    const span = document.getElementById('donoTotalAmount');
    if (span) span.textContent = formatPrice(selectedDonoAmount);
}

function generateDonoCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = DONO_CONFIG.prefix;
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function handleAddDonoToCart() {
    if (selectedDonoAmount < DONO_CONFIG.minAmount) {
        if (typeof showToast === 'function') {
            showToast(`Mínimo ${formatPrice(DONO_CONFIG.minAmount)}`, 'error');
        }
        return;
    }
    
    const recipientName = document.getElementById('donoRecipientName')?.value.trim();
    if (!recipientName) {
        if (typeof showToast === 'function') {
            showToast('Ingresa el nombre del beneficiario', 'error');
        }
        document.getElementById('donoRecipientName')?.focus();
        return;
    }
    
    const donoCode = generateDonoCode();
    
    if (typeof window.addToCart === 'function') {
        window.addToCart('🎁 Crédito Dono', 'DONO', donoCode, selectedDonoAmount, 1);
        
        // Añadir metadata (después de agregar al carrito)
        setTimeout(() => {
            const item = window.cart?.find(i => i.code === donoCode);
            if (item) {
                item.isDono = true;
                item.recipientName = recipientName;
                item.recipientEmail = document.getElementById('donoRecipientEmail')?.value.trim() || '';
                item.recipientPhone = document.getElementById('donoRecipientPhone')?.value.trim() || '';
                item.message = document.getElementById('donoMessage')?.value.trim() || '';
                item.donoCode = donoCode;
            }
        }, 100);
        
        if (typeof showToast === 'function') {
            showToast(`✅ Dono agregado: ${formatPrice(selectedDonoAmount)}`, 'success');
        }
        closeDonoModal();
    }
}

function formatPrice(price) {
    return '$' + Math.round(price).toLocaleString('es-CO');
}

// Exportar funciones (NO ejecutar nada)
window.initDonoModal = initDonoModal;
window.openDonoModal = openDonoModal;
window.closeDonoModal = closeDonoModal;

console.log('✅ dono.js cargado (modo diferido)');