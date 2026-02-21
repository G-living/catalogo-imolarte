export function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalAmount = document.getElementById('cart-total-amount');
  const cartCount = document.getElementById('cart-count');
  
  if (!cartItemsContainer) return;
  
  // Filtrar solo items válidos (cantidad > 0 y precio > 0)
  const validCart = cart.filter(item => 
    item && 
    item.cantidad > 0 && 
    item.precio > 0 &&
    item.sku
  );
  
  if (validCart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
    if (cartTotalAmount) cartTotalAmount.textContent = '$ 0';
    if (cartCount) cartCount.textContent = '0';
    return;
  }
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let itemCount = 0;
  
  validCart.forEach(item => {
    const subtotal = (item.precio || 0) * (item.cantidad || 0);
    total += subtotal;
    itemCount += (item.cantidad || 0);
    
    const cartItem = createCartItem(item);
    cartItemsContainer.appendChild(cartItem);
  });
  
  if (cartTotalAmount) cartTotalAmount.textContent = formatPrice(total);
  if (cartCount) cartCount.textContent = itemCount;
}