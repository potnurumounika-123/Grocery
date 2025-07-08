// Application State
let currentUser = null;
let cart = [];
let products = [];

// Sample Products Data
const sampleProducts = [
    {
        id: 1,
        name: "Fresh Apples",
        description: "Crisp and sweet red apples",
        price: 120,
        image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "fruits"
    },
    {
        id: 2,
        name: "Organic Bananas",
        description: "Fresh organic bananas",
        price: 60,
        image: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "fruits"
    },
    {
        id: 3,
        name: "Fresh Tomatoes",
        description: "Juicy red tomatoes",
        price: 40,
        image: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "vegetables"
    },
    {
        id: 4,
        name: "Green Spinach",
        description: "Fresh leafy spinach",
        price: 30,
        image: "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "vegetables"
    },
    {
        id: 5,
        name: "Fresh Milk",
        description: "Pure cow milk 1L",
        price: 55,
        image: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "dairy"
    },
    {
        id: 6,
        name: "Greek Yogurt",
        description: "Creamy Greek yogurt",
        price: 80,
        image: "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "dairy"
    },
    {
        id: 7,
        name: "Fresh Bread",
        description: "Whole wheat bread loaf",
        price: 35,
        image: "https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=300",
        category: "bakery"
    },
    {
        id: 8,
        name: "Croissants",
        description: "Buttery French croissants",
        price: 25,
        image: "https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=300",
        category: "bakery"
    }
];

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const userDisplay = document.getElementById('userDisplay');
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const modalTitle = document.getElementById('modalTitle');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const productGrid = document.getElementById('productGrid');
const overlay = document.getElementById('overlay');
const toastContainer = document.getElementById('toastContainer');
const searchInput = document.getElementById('searchInput');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadUserSession();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Auth Modal
    loginBtn.addEventListener('click', handleLoginClick);
    closeModal.addEventListener('click', closeAuthModal);
    showSignup.addEventListener('click', switchToSignup);
    showLogin.addEventListener('click', switchToLogin);
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Cart
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', handleCheckout);
    
    // Overlay
    overlay.addEventListener('click', closeAllModals);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    
    // Category filters
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProductsByCategory(category);
        });
    });
}

// Authentication Functions
function handleLoginClick() {
    if (currentUser) {
        showLogoutConfirm();
    } else {
        showAuthModal('login');
    }
}

function showLogoutConfirm() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
}

function showAuthModal(type) {
    if (type === 'signup') {
        modalTitle.textContent = 'Sign Up';
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Login';
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
    authModal.classList.add('show');
    overlay.classList.add('show');
}

function closeAuthModal() {
    authModal.classList.remove('show');
    overlay.classList.remove('show');
    // Reset forms
    loginForm.reset();
    signupForm.reset();
}

function switchToSignup() {
    showAuthModal('signup');
}

function switchToLogin() {
    showAuthModal('login');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUserDisplay();
        closeAuthModal();
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid email or password!', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('Account already exists with this email!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateUserDisplay();
    closeAuthModal();
    showToast('Account created successfully!', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserDisplay();
    cart = [];
    updateCartDisplay();
    showToast('Logged out successfully!', 'success');
}

function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserDisplay();
    }
}

function updateUserDisplay() {
    if (currentUser) {
        userDisplay.textContent = currentUser.name;
        loginBtn.innerHTML = `<i class="fas fa-user"></i> <span>${currentUser.name}</span>`;
    } else {
        userDisplay.textContent = 'Login';
        loginBtn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
    }
}

// Product Functions
function loadProducts() {
    products = sampleProducts;
    displayProducts(products);
}

function displayProducts(productsToShow) {
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">₹${product.price}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

function filterProductsByCategory(category) {
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
    
    // Scroll to products section
    document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

// Cart Functions
function addToCart(productId) {
    if (!currentUser) {
        showToast('Please login to add items to cart!', 'warning');
        showAuthModal('login');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    showToast('Item removed from cart!', 'success');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItems.appendChild(cartItem);
        });
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
}

function createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price}</div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: 1rem; background: #ff4444; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    return cartItem;
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function handleCheckout() {
    if (!currentUser) {
        showToast('Please login to checkout!', 'warning');
        showAuthModal('login');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }
    
    // Simulate checkout process
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (confirm(`Proceed with checkout for ₹${total}?`)) {
        // Clear cart
        cart = [];
        updateCartDisplay();
        toggleCart();
        showToast('Order placed successfully!', 'success');
    }
}

// Utility Functions
function closeAllModals() {
    closeAuthModal();
    if (cartSidebar.classList.contains('open')) {
        toggleCart();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}