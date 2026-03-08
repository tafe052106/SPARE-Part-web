/* ========================================
   SPARE PART STRIKE SHOP V2 - JAVASCRIPT
   Advanced State Management & Theme Switching
   ======================================== */

/* ========================================
   PRODUCT DATA - MOTORCYCLE SPARE PARTS
   ======================================== */

const spareParts = [
    {
        id: 1,
        name: 'Akrapović Titanium Exhaust System',
        category: 'engine',
        price: 799.99,
        image: 'IMG-20260307-WA0013.jpg',
        badge: 'Premium'
    },
    {
        id: 2,
        name: 'Michelin Pilot Sport 4 120/70-17',
        category: 'tires',
        price: 229.99,
        image: 'IMG-20260307-WA0014.jpg',
        badge: 'New'
    },
    {
        id: 3,
        name: 'LED Integrated Headlight Assembly HID',
        category: 'lighting',
        price: 449.99,
        image: 'IMG-20260307-WA0016.jpg',
        badge: 'Hot'
    },
    {
        id: 4,
        name: 'Carbon Fiber Full Body Fairing Kit',
        category: 'body',
        price: 1599.99,
        image: 'Screenshot_20260225-123528~2.png',
        badge: 'Elite'
    },
    {
        id: 5,
        name: 'K&N High-Flow Air Intake Filter',
        category: 'engine',
        price: 129.99,
        image: 'IMG-20260307-WA0013.jpg',
        badge: 'Sale'
    },
    {
        id: 6,
        name: 'RGB LED Wheel Rim Light Kit (Set of 4)',
        category: 'lighting',
        price: 179.99,
        image: 'IMG-20260307-WA0014.jpg',
        badge: 'Trending'
    }
];

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
        if (this.currentCategory === 'all') {
            return spareParts;
        }
        return spareParts.filter(part => part.category === this.currentCategory);
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

        // Hamburger state
        this.navToggle.setAttribute('aria-expanded', this.appState.sidebarOpen);
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
            this.appState.openLoginModal();
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
                this.domManager.showNotification(`${provider} login would be handled here`);
            });
        });
    }
}

/* ========================================
   INITIALIZATION
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const domManager = new DOMManager(appState);
    const eventHandlers = new EventHandlers(appState, domManager);

    appState.subscribe(() => {
        domManager.updateUIFromState();
    });

    domManager.updateUIFromState();
    console.log('✓ Spare Part Strike Shop V2 initialized successfully');
    console.log('✓ Theme system active');
    console.log('✓ Login state management ready');
});
