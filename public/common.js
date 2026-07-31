/* ==========================================================
   common.js — Fonctions partagées sur tout le site Bobo Tech
   (gestion du panier via localStorage, badge panier, toasts)

   Ce fichier doit être chargé AVANT script.js ou tout script
   spécifique à une page, sur TOUTES les pages du site, afin
   que le panier et les notifications restent cohérents partout.
   ========================================================== */

const WHATSAPP_NUMBER = '22660692928'; // Numéro unique utilisé sur tout le site

/* ---------------- Panier (localStorage) ---------------- */

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error('Panier illisible dans le stockage local, réinitialisation.', e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    return cart;
}

function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart[index].quantity = Math.max(1, quantity);
        saveCart(cart);
    }
    return cart;
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
}

function clearCart() {
    saveCart([]);
}

function getCartTotalItems(cart = getCart()) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calcule le total du panier. Gère les prix multiples du type
 * "2000/3000/5000 FCFA" en prenant la première valeur.
 */
function calculateCartTotal(cart = getCart()) {
    const total = cart.reduce((sum, item) => {
        const firstPrice = String(item.price).split('/')[0];
        const numeric = parseFloat(firstPrice.replace(/[^\d.]/g, '')) || 0;
        return sum + numeric * item.quantity;
    }, 0);
    return total.toLocaleString('fr-FR') + ' FCFA';
}

/* ---------------- Badge panier (menu du bas) ---------------- */

function updateCartBadge() {
    const badge = document.getElementById('cart-item-count');
    if (!badge) return;
    const total = getCartTotalItems();
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
}

/* ---------------- Notifications toast ---------------- */
/**
 * Affiche une notification discrète en bas de l'écran.
 * type: 'default' | 'success' | 'error'
 */
function showToast(message, type = 'default') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'success' ? ' toast-success' : type === 'error' ? ' toast-error' : '');
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ---------------- Bulle WhatsApp flottante ---------------- */
/**
 * Injecte automatiquement un bouton WhatsApp flottant en bas à droite
 * sur toutes les pages qui chargent common.js — pas besoin de le
 * dupliquer dans chaque fichier HTML.
 */
function injectWhatsAppFloatingButton() {
    if (document.getElementById('whatsapp-float-btn')) return;

    const btn = document.createElement('a');
    btn.id = 'whatsapp-float-btn';
    btn.className = 'whatsapp-float-btn';
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, j'ai une question à propos de la boutique.")}`;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.setAttribute('aria-label', 'Discuter avec nous sur WhatsApp');
    btn.innerHTML = '<i class="fab fa-whatsapp"></i>';

    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    injectWhatsAppFloatingButton();
});
