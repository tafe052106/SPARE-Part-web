/* ========================================
   SPARE PART STRIKE SHOP V2 - JAVASCRIPT
   Advanced State Management & Persistent Data Storage
   ======================================== */

/* ========================================
   INITIAL DATABASE - MOCK DATA STRUCTURE
   ======================================== */

const INITIAL_DATABASE = [
    {
        id: 1,
        name: 'Akrapović Titanium Exhaust System',
        category: 'engine',
        price: 799.99,
        stockCount: 12,
        image: 'IMG-20260307-WA0013.jpg',
        badge: 'Premium'
    },
    {
        id: 2,
        name: 'Michelin Pilot Sport 4 120/70-17',
        category: 'tires',
        price: 229.99,
        stockCount: 25,
        image: 'IMG-20260307-WA0014.jpg',
        badge: 'New'
    },
    {
        id: 3,
        name: 'LED Integrated Headlight Assembly HID',
        category: 'lighting',
        price: 449.99,
        stockCount: 8,
        image: 'IMG-20260307-WA0016.jpg',
        badge: 'Hot'
    },
    {
        id: 4,
        name: 'Carbon Fiber Full Body Fairing Kit',
        category: 'body',
        price: 1599.99,
        stockCount: 5,
        image: 'Screenshot_20260225-123528~2.png',
        badge: 'Elite'
    },
    {
        id: 5,
        name: 'K&N High-Flow Air Intake Filter',
        category: 'engine',
        price: 129.99,
        stockCount: 35,
        image: 'IMG-20260307-WA0013.jpg',
        badge: 'Sale'
    },
    {
        id: 6,
        name: 'RGB LED Wheel Rim Light Kit (Set of 4)',
        category: 'lighting',
        price: 179.99,
        stockCount: 18,
        image: 'IMG-20260307-WA0014.jpg',
        badge: 'Trending'
    },
    {
        id: 7,
        name: 'Brembo Brake Pads Performance Set',
        category: 'engine',
        price: 349.99,
        stockCount: 22,
        image: 'IMG-20260307-WA0016.jpg',
        badge: 'Popular'
    },
    {
        id: 8,
        name: 'NGK Iridium Spark Plugs (Pack of 4)',
        category: 'engine',
        price: 89.99,
        stockCount: 0,
        image: 'IMG-20260307-WA0013.jpg',
        badge: 'Out'
    },
    {
        id: 9,
        name: 'Pirelli Angel Street Tires 180/55',
        category: 'tires',
        price: 259.99,
        stockCount: 14,
        image: 'IMG-20260307-WA0014.jpg',
        badge: 'New'
    }
];

/* ========================================
   DATABASE MANAGEMENT - CRUD OPERATIONS
   ======================================== */

/**
 * Initialize localStorage database on first page load.
 * If strike_shop_db doesn't exist, creates it with INITIAL_DATABASE.
 */
function initializeDatabase() {
    if (!localStorage.getItem('strike_shop_db')) {
        localStorage.setItem('strike_shop_db', JSON.stringify(INITIAL_DATABASE));
        console.log('✓ Database initialized with default data');
    }
}

/**
 * Retrieve all products from localStorage.
 * Gracefully handles errors and returns fallback data.
 * @returns {Array} Array of product objects
 */
function getProducts() {
    try {
        const dbData = localStorage.getItem('strike_shop_db');
        if (!dbData) {
            console.warn('No database found. Reinitializing...');
            initializeDatabase();
            return INITIAL_DATABASE;
        }
        return JSON.parse(dbData);
    } catch (error) {
        console.error('Error retrieving products:', error);
        return INITIAL_DATABASE;
    }
}

/**
 * Save products array to localStorage.
 * @param {Array} products - Array of product objects to save
 */
function saveProducts(products) {
    try {
        localStorage.setItem('strike_shop_db', JSON.stringify(products));
        console.log('✓ Products saved to database');
    } catch (error) {
        console.error('Error saving products:', error);
    }
}

/**
 * Update stock count for a specific product.
 * Reduces stockCount and persists to localStorage.
 * @param {number} productId - ID of the product to update
 * @param {number} amount - Amount to reduce from stock (typically 1)
 * @returns {Object} Result object with success status and updated product
 */
function updateStock(productId, amount = 1) {
    try {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error(`Product with ID ${productId} not found`);
            return { success: false, message: 'Product not found' };
        }
        
        if (product.stockCount < amount) {
            return { success: false, message: 'Insufficient stock' };
        }
        
        product.stockCount -= amount;
        saveProducts(products);
        
        return { 
            success: true, 
            message: 'Stock updated', 
            product: product,
            outOfStock: product.stockCount === 0
        };
    } catch (error) {
        console.error('Error updating stock:', error);
        return { success: false, message: 'Error updating stock' };
    }
}

/**
 * Get a single product by ID.
 * @param {number} productId - ID of the product
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(productId) {
    const products = getProducts();
    return products.find(p => p.id === productId) || null;
}

/* ========================================
   STATE MANAGEMENT
   ======================================== */

class AppState {
    constructor() {
        this.cart = this.loadCart();
        this.sidebarOpen = false;
        this.loginModalOpen = false;
        this.quickViewOpen = false;
        this.currentCategory = 'all';
        this.isLoggedIn = this.loadLoginState();
        this.currentUser = this.loadUser();
        this.authMode = 'signin'; // 'signin' or 'signup'
        this.listeners = [];
        this.theme = this.loadTheme();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(callback => callback(this));
    }

    // Theme Management
    loadTheme() {
        return localStorage.getItem('theme') || 'dark';
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        this.notify();
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Auth State Management
    login(user) {
        this.isLoggedIn = true;
        this.currentUser = user;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        this.notify();
    }

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.cart = [];
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        this.notify();
    }

    loadLoginState() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    loadUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Cart Operations
    addToCart(product) {
        if (!this.isLoggedIn) {
            return { success: false, message: 'Please log in to manage your cart.' };
        }
        
        // Check and update stock from database
        const stockResult = updateStock(product.id, 1);
        if (!stockResult.success) {
            return { success: false, message: 'Item out of stock.' };
        }
        
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.notify();
        return { success: true, message: `${product.name} added to cart!` };
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.notify();
    }

    saveCart() {
        if (this.isLoggedIn) {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        }
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // UI State
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.notify();
    }

    openLoginModal() {
        this.loginModalOpen = true;
        this.authMode = 'signin';
        this.notify();
    }

    closeLoginModal() {
        this.loginModalOpen = false;
        this.notify();
    }

    setAuthMode(mode) {
        this.authMode = mode;
        this.notify();
    }

    setCategory(category) {
        this.currentCategory = category;
        this.notify();
    }

    getFilteredProducts() {
        const products = getProducts();
        if (this.currentCategory === 'all') {
            return products;
        }
        return products.filter(part => part.category === this.currentCategory);
    }
}

// Global app state
const appState = new AppState();

/* ========================================
   DOM MANAGER
   ======================================== */

class DOMManager {
    constructor(appState) {
        this.appState = appState;
        this.cacheDOMElements();
        this.setupIntersectionObserver();
        this.applyTheme();
        this.renderProductGrid();
    }

    cacheDOMElements() {
        this.productGrid = document.querySelector('.product-grid');
        this.productTemplate = document.getElementById('product-card-template');
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarOverlay = document.querySelector('.sidebar-overlay');
        this.navToggle = document.querySelector('.nav__toggle');
        this.sidebarClose = document.querySelector('.sidebar__close');
        this.loginModal = document.querySelector('.modal--login');
        this.loginBtn = document.querySelector('.nav__login-btn');
        this.themeToggle = document.querySelector('.theme-toggle');
        this.categoryLinks = document.querySelectorAll('.category-link');
        this.emptyState = document.querySelector('.empty-state');
        this.cartNotification = document.getElementById('cart-notification');
        this.authForms = document.querySelectorAll('.auth-form');
        this.toggleAuthForms = document.querySelectorAll('.toggle-auth-form');
        this.signinForm = document.getElementById('signin-form');
        this.signupForm = document.getElementById('signup-form');
        this.authMessage = document.getElementById('auth-message');
        this.headerNav = document.getElementById('header-nav');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.appState.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = this.appState.theme === 'dark' ? '☀️' : '🌙';
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                }
            });
        }, observerOptions);
    }

    renderProductGrid() {
        const filteredProducts = this.appState.getFilteredProducts();
        this.productGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            this.emptyState.removeAttribute('hidden');
            return;
        }

        this.emptyState.setAttribute('hidden', '');

        filteredProducts.forEach((product) => {
            const clone = this.productTemplate.content.cloneNode(true);
            const card = clone.querySelector('.product-card');

            clone.querySelector('.product-card__image').src = product.image;
            clone.querySelector('.product-card__image').alt = product.name;
            clone.querySelector('.product-card__name').textContent = product.name;
            clone.querySelector('.product-card__category').textContent = product.category.replace('-', ' ');
            clone.querySelector('.product-card__price').textContent = `$${product.price.toFixed(2)}`;
            clone.querySelector('.product-card__badge').textContent = product.badge;

            // Handle stock display and button state
            const addToCartBtn = clone.querySelector('[data-action="add-to-cart"]');
            const isOutOfStock = product.stockCount === 0;
            
            if (isOutOfStock) {
                // Disable button and apply out-of-stock styling
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = '❌ Out of Stock';
                addToCartBtn.classList.add('btn--disabled');
                card.classList.add('product-card--out-of-stock');
            } else {
                // Show stock count in button
                addToCartBtn.textContent = `🛒 Add to Cart (${product.stockCount})`;
            }

            card.dataset.productId = product.id;
            card.dataset.product = JSON.stringify(product);

            this.productGrid.appendChild(clone);

            if (this.intersectionObserver) {
                const newCard = this.productGrid.lastElementChild;
                this.intersectionObserver.observe(newCard);
            }
        });
    }

    updateUIFromState() {
        // Sidebar visibility
        if (this.appState.sidebarOpen) {
            this.sidebar.classList.add('is-open');
            this.sidebarOverlay.classList.add('is-visible');
        } else {
            this.sidebar.classList.remove('is-open');
            this.sidebarOverlay.classList.remove('is-visible');
        }

        // Modal visibility
        if (this.appState.loginModalOpen) {
            this.loginModal.classList.add('is-open');
            this.updateAuthForm();
        } else {
            this.loginModal.classList.remove('is-open');
        }

        // Category active state
        this.categoryLinks.forEach(link => {
            if (link.dataset.category === this.appState.currentCategory) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update header based on login state
        this.updateHeaderAuthUI();

        // Hamburger state
        this.navToggle.setAttribute('aria-expanded', this.appState.sidebarOpen);
    }

    updateHeaderAuthUI() {
        if (this.appState.isLoggedIn && this.appState.currentUser) {
            // Show user profile
            this.loginBtn.innerHTML = `
                <span class="user-avatar">${this.appState.currentUser.avatar || '👤'}</span>
                <span class="user-name">${this.appState.currentUser.name}</span>
                <span class="dropdown-indicator">▼</span>
            `;
            this.loginBtn.classList.add('is-profile');
            this.loginBtn.setAttribute('aria-label', `Profile: ${this.appState.currentUser.name}`);
        } else {
            // Show login button
            this.loginBtn.innerHTML = '🔐 Login';
            this.loginBtn.classList.remove('is-profile');
            this.loginBtn.setAttribute('aria-label', 'Open login modal');
        }
    }

    updateAuthForm() {
        this.authForms.forEach(form => {
            form.classList.remove('active');
        });
        
        if (this.appState.authMode === 'signin') {
            document.querySelector('.auth-form--signin').classList.add('active');
            this.authMessage.textContent = '';
        } else {
            document.querySelector('.auth-form--signup').classList.add('active');
        }
    }

    showNotification(message, type = 'success') {
        this.cartNotification.textContent = message;
        this.cartNotification.style.backgroundColor = type === 'error' ? '#ff6b6b' : '#4CAF50';
        this.cartNotification.removeAttribute('hidden');

        setTimeout(() => {
            this.cartNotification.setAttribute('hidden', '');
        }, 3000);
    }

    showAuthMessage(message) {
        this.authMessage.textContent = message;
    }
}

/* ========================================
   EVENT HANDLERS
   ======================================== */

class EventHandlers {
    constructor(appState, domManager) {
        this.appState = appState;
        this.domManager = domManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Theme toggle
        this.domManager.themeToggle.addEventListener('click', () => {
            this.appState.toggleTheme();
            this.domManager.updateThemeIcon();
        });

        // Sidebar toggle
        this.domManager.navToggle.addEventListener('click', () => {
            this.appState.toggleSidebar();
        });

        this.domManager.sidebarClose.addEventListener('click', () => {
            this.appState.sidebarOpen = false;
            this.appState.notify();
        });

        this.domManager.sidebarOverlay.addEventListener('click', () => {
            this.appState.sidebarOpen = false;
            this.appState.notify();
        });

        // Login modal
        this.domManager.loginBtn.addEventListener('click', () => {
            if (this.appState.isLoggedIn) {
                // Show logout confirmation
                const confirmed = confirm(`Logout from ${this.appState.currentUser?.provider || 'your account'}?`);
                if (confirmed) {
                    this.appState.logout();
                    this.domManager.renderProductGrid();
                    this.domManager.showNotification('Logged out successfully 👋');
                }
            } else {
                this.appState.openLoginModal();
            }
        });

        this.domManager.loginModal.querySelector('.modal__overlay').addEventListener('click', () => {
            this.appState.closeLoginModal();
        });

        this.domManager.loginModal.querySelector('.modal__close').addEventListener('click', () => {
            this.appState.closeLoginModal();
        });

        // Auth form toggle
        this.domManager.toggleAuthForms.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetForm = btn.dataset.form;
                this.appState.setAuthMode(targetForm);
            });
        });

        // Sign in form
        this.domManager.signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            this.appState.login({ email, name: 'User' });
            this.appState.closeLoginModal();
            this.domManager.showNotification(`Welcome back, ${email}!`);
            this.domManager.signinForm.reset();
        });

        // Sign up form
        this.domManager.signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (password !== confirm) {
                this.domManager.showAuthMessage('Passwords do not match!');
                return;
            }

            this.appState.login({ email, name });
            this.appState.closeLoginModal();
            this.domManager.showNotification(`Welcome, ${name}!`);
            this.domManager.signupForm.reset();
        });

        // Category filtering
        this.domManager.categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.appState.setCategory(link.dataset.category);
                this.domManager.renderProductGrid();
                this.appState.sidebarOpen = false;
                this.appState.notify();
            });
        });

        // Product grid event delegation
        this.domManager.productGrid.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const card = button.closest('.product-card');
            const productData = JSON.parse(card.dataset.product);

            if (action === 'add-to-cart') {
                const result = this.appState.addToCart(productData);
                if (result.success) {
                    this.domManager.showNotification(result.message, 'success');
                } else {
                    this.domManager.showAuthMessage(result.message);
                    this.appState.openLoginModal();
                }
            } else if (action === 'quick-view') {
                // Quick view functionality
                alert(`Quick view for: ${productData.name}\n\nPrice: $${productData.price}`);
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.appState.closeLoginModal();
                this.appState.sidebarOpen = false;
                this.appState.notify();
            }
        });

        // Social login handlers
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = btn.dataset.provider;
                this.handleSocialLogin(provider);
            });
        });
    }

    handleSocialLogin(provider) {
        // Show fake popup with loading state
        this.showSocialLoginPopup(provider);
        
        // Simulate connection delay (1.5 seconds)
        setTimeout(() => {
            const userData = this.generateSocialUserData(provider);
            this.appState.login(userData);
            this.closeSocialLoginPopup();
            this.appState.closeLoginModal();
            this.domManager.showNotification(`Welcome, ${userData.name}! 🎉`);
            this.domManager.renderProductGrid();
        }, 1500);
    }

    generateSocialUserData(provider) {
        const platformData = {
            google: {
                name: 'Google User',
                email: `user${Math.random().toString(36).substr(2, 9)}@gmail.com`,
                avatar: '🔵',
                provider: 'Google',
                id: 'google_' + Math.random().toString(36).substr(2, 9)
            },
            facebook: {
                name: 'Facebook User',
                email: `user${Math.random().toString(36).substr(2, 9)}@facebook.com`,
                avatar: '🔵',
                provider: 'Facebook',
                id: 'facebook_' + Math.random().toString(36).substr(2, 9)
            },
            twitter: {
                name: 'Twitter User',
                email: `user${Math.random().toString(36).substr(2, 9)}@twitter.com`,
                avatar: '⚫',
                provider: 'Twitter (X)',
                id: 'twitter_' + Math.random().toString(36).substr(2, 9)
            },
            instagram: {
                name: 'Instagram User',
                email: `user${Math.random().toString(36).substr(2, 9)}@instagram.com`,
                avatar: '📷',
                provider: 'Instagram',
                id: 'instagram_' + Math.random().toString(36).substr(2, 9)
            },
            tiktok: {
                name: 'TikTok User',
                email: `user${Math.random().toString(36).substr(2, 9)}@tiktok.com`,
                avatar: '🎵',
                provider: 'TikTok',
                id: 'tiktok_' + Math.random().toString(36).substr(2, 9)
            }
        };

        return platformData[provider] || platformData.google;
    }

    showSocialLoginPopup(provider) {
        let popup = document.getElementById('social-login-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'social-login-popup';
            popup.className = 'social-login-popup';
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div class="social-popup-content">
                <div class="social-popup-icon">🔄</div>
                <h3>Connecting to ${provider}...</h3>
                <p>Authenticating your account</p>
                <div class="loading-spinner"></div>
            </div>
        `;
        popup.classList.add('is-visible');
    }

    closeSocialLoginPopup() {
        const popup = document.getElementById('social-login-popup');
        if (popup) {
            popup.classList.remove('is-visible');
        }
    }
}

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize database from localStorage
    initializeDatabase();
    
    const domManager = new DOMManager(appState);
    const eventHandlers = new EventHandlers(appState, domManager);

    appState.subscribe(() => {
        domManager.updateUIFromState();
    });

    domManager.updateUIFromState();
    console.log('✓ Spare Part Strike Shop V2 initialized successfully');
    console.log('✓ Theme system active');
    console.log('✓ Login state management ready');
    console.log('✓ Database persistence active');
    console.log('✓ Total products:', getProducts().length);
});
