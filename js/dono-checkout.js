/**
 * dono-checkout.js - VALIDACIÓN DE DONOS
 * Solo funciones, NO ejecuta nada automáticamente
 */

const DONO_CHECKOUT_CONFIG = {
    sheetsUrl: 'https://script.google.com/macros/s/AKfycbw_qPay6DfCh-xxeosxmD-tuEINf9UIPT_i_0sNg5b6GbD-zZc93ZsaxjrAoqkn_m1u/exec'
};

let validatedDono = null;

// Inicializar (llamado por core.js cuando se abre checkout)
function initDonoCheckout() {
    console.log('🎁 Configurando validación Dono...');
    
    const validateBtn = document.getElementById('validateDonoBtn');
    const donoInput = document.getElementById('donoCode');
    
    if (!validateBtn || !donoInput) return;
    
    // Remover listeners previos (por si acaso)
    const newValidateBtn = validateBtn.cloneNode(true);
    validateBtn.parentNode.replaceChild(newValidateBtn, validateBtn);
    
    const newDonoInput = donoInput.cloneNode(true);
    donoInput.parentNode.replaceChild(newDonoInput, donoInput);
    
    // Agregar listeners nuevos
    newValidateBtn.addEventListener('click', validateDonoCode);
    
    newDonoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            validateDonoCode();
        }
    });
    
    newDonoInput.addEventListener('input', () => {
        if (validatedDono) {
            validatedDono = null;
            const resultDiv = document.getElementById('donoValidationResult');
            if (resultDiv) {
                resultDiv.innerHTML = '';
                resultDiv.className = 'dono-validation-result';
            }
            restoreOriginalTotals();
        }
    });
    
    console.log('✅ Validación Dono configurada');
}

function getCartTotal() {
    if (typeof window.getCartTotal === 'function') {
        return window.getCartTotal();
    }
    return 0;
}

async function validateDonoCode() {
    const donoInput = document.getElementById('donoCode');
    const resultDiv = document.getElementById('donoValidationResult');
    const cartTotal = getCartTotal();
    
    if (!donoInput || !resultDiv) return;
    
    const code = donoInput.value.trim().toUpperCase();
    
    if (!code) {
        resultDiv.innerHTML = 'Ingresa un código Dono';
        resultDiv.className = 'dono-validation-result invalid';
        return;
    }
    
    resultDiv.innerHTML = 'Validando...';
    resultDiv.className = 'dono-validation-result info';
    
    try {
        const params = new URLSearchParams({
            action: 'VALIDATE_DONO',
            donoCode: code,
            cartAmount: cartTotal
        });
        
        const response = await fetch(DONO_CHECKOUT_CONFIG.sheetsUrl, {
            method: 'POST',
            body: params
        });
        
        const result = await response.json();
        
        if (result.valid) {
            validatedDono = {
                code: code,
                balance: result.balance,
                valid: true
            };
            
            resultDiv.innerHTML = `
                <strong>✅ Código válido!</strong><br>
                Saldo: ${formatPrice(result.balance)}<br>
                ${result.balance >= cartTotal ? '🎉 Cubre el total' : `💡 Cubre ${formatPrice(result.balance)}`}
            `;
            resultDiv.className = 'dono-validation-result valid';
            
            applyDonoToCheckout();
            
        } else {
            validatedDono = null;
            resultDiv.innerHTML = `❌ ${result.error || 'Código inválido'}`;
            resultDiv.className = 'dono-validation-result invalid';
        }
        
    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = '❌ Error de conexión';
        resultDiv.className = 'dono-validation-result invalid';
    }
}

function applyDonoToCheckout() {
    if (window.appliedDono) {
        if (typeof showToast === 'function') {
            showToast('Dono ya aplicado', 'info');
        }
        return;
    }
    
    if (!validatedDono) return;
    
    const cartTotal = getCartTotal();
    const subtotalSpan = document.getElementById('summarySubtotal');
    const totalSpan = document.getElementById('summaryTotal');
    
    if (!subtotalSpan || !totalSpan) return;
    
    window.originalCartTotal = window.originalCartTotal || cartTotal;
    
    const donoBalance = validatedDono.balance;
    const newTotal = Math.max(0, cartTotal - donoBalance);
    const donoApplied = Math.min(donoBalance, cartTotal);
    
    subtotalSpan.innerHTML = formatPrice(cartTotal) + 
        `<span style="color:#27ae60;font-size:0.9rem;margin-left:10px;">(-${formatPrice(donoApplied)})</span>`;
    totalSpan.textContent = formatPrice(newTotal);
    
    window.appliedDono = {
        code: validatedDono.code,
        amount: donoApplied,
        remainingBalance: donoBalance - donoApplied
    };
    
    if (newTotal === 0) {
        highlightDonoFullPayment();
    }
    
    if (typeof showToast === 'function') {
        showToast(`✅ Dono aplicado: ${formatPrice(donoApplied)}`, 'success');
    }
}

function restoreOriginalTotals() {
    if (window.originalCartTotal) {
        const subtotalSpan = document.getElementById('summarySubtotal');
        const totalSpan = document.getElementById('summaryTotal');
        
        if (subtotalSpan) subtotalSpan.textContent = formatPrice(window.originalCartTotal);
        if (totalSpan) totalSpan.textContent = formatPrice(window.originalCartTotal);
        
        window.appliedDono = null;
    }
}

function highlightDonoFullPayment() {
    const msg = document.createElement('div');
    msg.className = 'dono-full-message';
    msg.innerHTML = `
        <div style="background:#d4edda;color:#155724;padding:15px;border-radius:8px;margin:15px 0;text-align:center;">
            <strong>🎉 ¡Dono cubre el total!</strong><br>No necesitas pagar.
        </div>
    `;
    
    const container = document.querySelector('.checkout-actions-new');
    if (container) {
        document.querySelector('.dono-full-message')?.remove();
        container.parentNode.insertBefore(msg, container);
    }
}

function formatPrice(price) {
    return '$' + Math.round(price).toLocaleString('es-CO');
}

// Exportar
window.initDonoCheckout = initDonoCheckout;
window.validateDonoCode = validateDonoCode;
window.clearDono = () => {
    validatedDono = null;
    restoreOriginalTotals();
};

console.log('✅ dono-checkout.js cargado (modo diferido)');