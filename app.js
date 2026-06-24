let cart = [];
let products = [];
let currentUser = null;
let isLoginMode = true;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupAuthForm();
});

async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts();
    } catch (err) {
        console.error("Error loading products catalog", err);
    }
}

function renderProducts() {
    const container = document.getElementById("products-container");
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="img-placeholder">[Product Image Case]</div>
            <h4>${product.name}</h4>
            <p style="font-size:12px; color:gray; margin-bottom:4px;">⭐ ${product.rating} (${product.reviews})</p>
            <div>
                <span class="price-tag">$${product.price.toFixed(2)}</span>
                <span class="old-price">$${product.oldPrice.toFixed(2)}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Cart Mechanics
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    document.getElementById("cart-count").innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    const itemsContainer = document.getElementById("cart-items-container");
    
    let total = 0;
    itemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                <div>
                    <h5>${item.name}</h5>
                    <p style="font-size:12px; color:gray;">$${item.price} x ${item.quantity}</p>
                </div>
                <button style="border:none; background:none; color:red; cursor:pointer;" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join('');
    
    document.getElementById("cart-total").innerText = total.toFixed(2);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function toggleCartSidebar() {
    document.getElementById("cart-sidebar").classList.toggle("open");
}

// Order Processing Submissions
async function checkout() {
    if (cart.length === 0) return alert("Your cart is empty.");
    
    const totalAmount = parseFloat(document.getElementById("cart-total").innerText);
    const orderData = {
        userEmail: currentUser ? currentUser.email : "Guest Session",
        cartItems: cart,
        totalAmount
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const resData = await response.json();
        if (response.ok) {
            alert(`Success! ${resData.message}\nOrder Number: ${resData.order.orderId}`);
            cart = [];
            updateCartUI();
            toggleCartSidebar();
        } else {
            alert(resData.message);
        }
    } catch (err) {
        alert("Error executing check out sequence structural pipeline.");
    }
}

// Modal Toggle Hooks & Authentication Engine Switches
function toggleAuthModal() {
    const modal = document.getElementById("auth-modal");
    modal.style.display = (modal.style.display === "flex") ? "none" : "flex";
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById("modal-title").innerText = isLoginMode ? "Login" : "Register Account";
}

function setupAuthForm() {
    document.getElementById("auth-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-email").value;
        const password = document.getElementById("auth-password").value;
        const targetEndpoint = isLoginMode ? '/api/login' : '/api/register';

        try {
            const response = await fetch(targetEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                currentUser = data.user;
                document.getElementById("auth-btn").innerText = `Hi, ${currentUser.email.split('@')[0]}`;
                toggleAuthModal();
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Authentication system validation error.");
        }
    });
}