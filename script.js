// ===== GLOBAL VARIABLES =====
let cart = JSON.parse(localStorage.getItem('potoneCart')) || [];
let currentProductData = {};

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== INITIALIZATION =====
function initializeApp() {
    setupNavigation();
    setupCarousel();
    setupProductTabs();
    setupProductDetail();
    setupCart();
    setupContactForm();
    setupFAQ();
    setupModals();
    setupAnimations();
    updateCartCount();
    
    // Page-specific initializations
    if (window.location.pathname.includes('products.html')) {
        initializeProductsPage();
    }
    
    if (window.location.pathname.includes('product-detail.html')) {
        initializeProductDetailPage();
    }
    
    if (window.location.pathname.includes('cart.html')) {
        initializeCartPage();
    }
}

// ===== NAVIGATION =====
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Sticky navbar effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'linear-gradient(135deg, rgba(102, 204, 255, 0.95) 0%, rgba(0, 76, 153, 0.95) 100%)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'linear-gradient(135deg, #66CCFF 0%, #004C99 100%)';
                navbar.style.backdropFilter = 'none';
            }
        }
    });
}

// ===== CAROUSEL =====
function setupCarousel() {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (carousel && prevBtn && nextBtn) {
        let currentIndex = 0;
        const items = carousel.querySelectorAll('.carousel-item');
        const totalItems = items.length;
        
        function updateCarousel() {
            const translateX = -currentIndex * (280 + 32); // item width + gap
            carousel.style.transform = `translateX(${translateX}px)`;
        }
        
        prevBtn.addEventListener('click', function() {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
            updateCarousel();
        });
        
        nextBtn.addEventListener('click', function() {
            currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
            updateCarousel();
        });
        
        // Auto-play carousel
        setInterval(() => {
            currentIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
            updateCarousel();
        }, 5000);
    }
}

// ===== PRODUCT TABS =====
function setupProductTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const categorySection = document.querySelectorAll('.category-section');
    
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Update active tab
                tabBtns.forEach(tab => tab.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide categories
                categorySection.forEach(section => {
                    if (category === 'all') {
                        section.style.display = 'block';
                    } else {
                        section.style.display = section.classList.contains(category) ? 'block' : 'none';
                    }
                });
            });
        });
    }
}

// ===== PRODUCT DETAIL =====
function setupProductDetail() {
    // Quantity controls
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const quantityInput = document.getElementById('quantity');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value < 10) {
                quantityInput.value = value + 1;
            }
        });
    }
    
    // Specification tabs
    const specTabs = document.querySelectorAll('.spec-tab');
    const specPanels = document.querySelectorAll('.spec-panel');
    
    specTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPanel = this.dataset.tab;
            
            // Update active tab
            specTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show target panel
            specPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetPanel) {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    // Thumbnail images
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainIcon = document.getElementById('main-product-icon');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update main image icon (in a real app, this would change the image)
            if (mainIcon) {
                mainIcon.className = this.querySelector('i').className;
            }
        });
    });
}

// ===== CART FUNCTIONALITY =====
function setupCart() {
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productName = e.target.dataset.product;
            const productPrice = parseInt(e.target.dataset.price);
            
            addToCart(productName, productPrice);
        }
    });
    
    // Buy now button
    const buyNowBtn = document.getElementById('buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const productTitle = document.getElementById('product-title').textContent;
            const productPrice = parseInt(document.getElementById('product-price').textContent.replace('₹', '').replace(',', ''));
            const quantity = parseInt(document.getElementById('quantity').value);
            
            // Add to cart and redirect
            addToCart(productTitle, productPrice, quantity);
            window.location.href = 'cart.html';
        });
    }
}

function addToCart(productName, productPrice, quantity = 1) {
    const existingItem = cart.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: Date.now(),
            name: productName,
            price: productPrice,
            quantity: quantity,
            image: getProductIcon(productName)
        });
    }
    
    localStorage.setItem('potoneCart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${productName} added to cart!`);
}

function getProductIcon(productName) {
    if (productName.includes('TV')) return 'fas fa-tv';
    if (productName.includes('Air Fryer')) return 'fas fa-fire';
    if (productName.includes('Kettle')) return 'fas fa-coffee';
    if (productName.includes('Cooktop')) return 'fas fa-fire-burner';
    if (productName.includes('Cooler')) return 'fas fa-wind';
    return 'fas fa-box';
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('potoneCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    updateCartSummary();
}

function updateCartItemQuantity(itemId, newQuantity) {
    const item = cart.find(item => item.id === itemId);
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
        localStorage.setItem('potoneCart', JSON.stringify(cart));
        updateCartCount();
        updateCartSummary();
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('potoneCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    updateCartSummary();
}

// ===== CART PAGE =====
function initializeCartPage() {
    renderCartItems();
    updateCartSummary();
    
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const applyPromoBtn = document.getElementById('apply-promo');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your cart?')) {
                clearCart();
            }
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                openModal('checkout-modal');
            }
        });
    }
    
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            const promoInput = document.getElementById('promo-input');
            const promoCode = promoInput.value.trim().toUpperCase();
            
            if (promoCode === 'POTONE10') {
                showNotification('Promo code applied! 10% discount added.');
                updateCartSummary(0.1); // 10% discount
            } else if (promoCode) {
                showNotification('Invalid promo code.', 'error');
            }
        });
    }
}

function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        cartContainer.appendChild(emptyCart);
        document.getElementById('checkout-btn').disabled = true;
        return;
    }
    
    emptyCart.style.display = 'none';
    document.getElementById('checkout-btn').disabled = false;
    
    const cartItemsHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <i class="${item.image}"></i>
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Premium quality electronics</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" max="10" 
                       onchange="updateCartItemQuantity(${item.id}, parseInt(this.value))">
                <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
            <button class="remove-item-btn" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
    
    cartContainer.innerHTML = cartItemsHTML;
}

function updateCartSummary(discount = 0) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * discount;
    const tax = (subtotal - discountAmount) * 0.18; // 18% GST
    const total = subtotal - discountAmount + tax;
    
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const checkoutTotalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `₹${Math.round(tax).toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₹${Math.round(total).toLocaleString()}`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `₹${Math.round(total).toLocaleString()}`;
}

// ===== PRODUCTS PAGE =====
function initializeProductsPage() {
    // Category filtering is handled by setupProductTabs()
    // Add any additional products page specific functionality here
}

// ===== PRODUCT DETAIL PAGE =====
function initializeProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId) {
        loadProductDetails(productId);
    }
}

function loadProductDetails(productId) {
    // Product data mapping
    const products = {
        'tv-32': {
            title: 'Smart LED TV 32"',
            price: '₹18,900 - ₹22,900',
            description: 'HD Ready display with smart features and built-in WiFi connectivity.',
            icon: 'fas fa-tv',
            image: 'images/tv32.jpg',
            specs: {
                'Screen Size': '32 inches',
                'Resolution': '1366 x 768 (HD Ready)',
                'Display Technology': 'LED',
                'Smart Features': 'Android TV, Built-in WiFi',
                'Audio': '16W Stereo',
                'Connectivity': '2 HDMI, 1 USB, Bluetooth',
                'Power Consumption': '80W',
                'Dimensions': '73.2 x 42.7 x 8.9 cm',
                'Weight': '5.2 kg',
                'Warranty': '2 Years Comprehensive'
            }
        },
        'tv-43': {
            title: 'Smart LED TV 43"',
            price: '₹30,900 - ₹37,900',
            description: 'Ultra HD 4K display with HDR support and premium sound quality.',
            icon: 'fas fa-tv',
            image: 'images/tv.jpg',
            specs: {
                'Screen Size': '43 inches',
                'Resolution': '3840 x 2160 (4K Ultra HD)',
                'Display Technology': 'LED with HDR10',
                'Smart Features': 'Android TV, Built-in WiFi',
                'Audio': '20W Dolby Audio',
                'Connectivity': '3 HDMI, 2 USB, Bluetooth',
                'Power Consumption': '120W',
                'Dimensions': '96.3 x 55.8 x 8.9 cm',
                'Weight': '8.5 kg',
                'Warranty': '2 Years Comprehensive'
            }
        },
        'tv-55': {
            title: 'Smart LED TV 55"',
            price: '₹52,900',
            description: 'Ultra HD 4K display with HDR support and premium sound quality.',
            icon: 'fas fa-tv',
            image: 'images/tv55.jpg',
            specs: {
                'Screen Size': '55 inches',
                'Resolution': '3840 x 2160 (4K Ultra HD)',
                'Display Technology': 'LED with HDR10',
                'Smart Features': 'Android TV, Built-in WiFi',
                'Audio': '24W Dolby Audio',
                'Connectivity': '3 HDMI, 2 USB, Bluetooth',
                'Power Consumption': '140W',
                'Dimensions': '123.5 x 71.5 x 9.1 cm',
                'Weight': '12.3 kg',
                'Warranty': '2 Years Comprehensive'
            }
        },
        'tv-65': {
            title: 'Smart LED TV 65"',
            price: '₹79,900',
            description: 'Ultra HD 4K display with HDR support and premium sound quality.',
            icon: 'fas fa-tv',
            image: 'images/tv65.jpg',
            specs: {
                'Screen Size': '65 inches',
                'Resolution': '3840 x 2160 (4K Ultra HD)',
                'Display Technology': 'LED with HDR10',
                'Smart Features': 'Android TV, Built-in WiFi',
                'Audio': '30W Dolby Audio',
                'Connectivity': '4 HDMI, 3 USB, Bluetooth',
                'Power Consumption': '180W',
                'Dimensions': '145.2 x 83.9 x 9.5 cm',
                'Weight': '18.5 kg',
                'Warranty': '2 Years Comprehensive'
            }
        },
        'cooktop-m10': {
            title: 'Infrared Cooktop M10',
            price: '₹4,590',
            description: 'Efficient and precise cooking with infrared technology.',
            icon: 'fas fa-fire-burner',
            image: 'images/m10.jpg',
            specs: {
                'Power': '1000W',
                'Cooking Surface': 'Ceramic Glass',
                'Controls': 'Touch Control',
                'Safety Features': 'Auto Shut-off, Child Lock',
                'Voltage': '220-240V',
                'Dimensions': '28 x 34 x 6 cm',
                'Weight': '2.8 kg',
                'Warranty': '1 Year Comprehensive'
            }
        },
        'cooktop-m15': {
            title: 'Infrared Cooktop M15',
            price: '₹4,990',
            description: 'Efficient and precise cooking with infrared technology.',
            icon: 'fas fa-fire-burner',
            image: 'images/m15.jpg',
            specs: {
                'Power': '1500W',
                'Cooking Surface': 'Ceramic Glass',
                'Controls': 'Touch Control',
                'Safety Features': 'Auto Shut-off, Child Lock',
                'Voltage': '220-240V',
                'Dimensions': '32 x 38 x 6 cm',
                'Weight': '3.2 kg',
                'Warranty': '1 Year Comprehensive'
            }
        },
        'cooktop-m20': {
            title: 'Infrared Cooktop M20',
            price: '₹5,590',
            description: 'Efficient and precise cooking with infrared technology.',
            icon: 'fas fa-fire-burner',
            image: 'images/m20.jpg',
            specs: {
                'Power': '2000W',
                'Cooking Surface': 'Ceramic Glass',
                'Controls': 'Touch Control',
                'Safety Features': 'Auto Shut-off, Child Lock',
                'Voltage': '220-240V',
                'Dimensions': '36 x 42 x 6 cm',
                'Weight': '3.8 kg',
                'Warranty': '1 Year Comprehensive'
            }
        },
        'airfryer-a10': {
            title: 'Air Fryer AF1500',
            price: '₹7,999',
            description: 'Healthy cooking with advanced air circulation technology.',
            icon: 'fas fa-blender',
            image: 'images/airfryer.jpg',
            specs: {
                'Capacity': '4.5 Liters',
                'Power': '1500W',
                'Temperature Range': '80°C - 200°C',
                'Timer': '30 Minutes with Auto Shut-off',
                'Controls': 'Digital Display',
                'Dimensions': '32 x 38 x 30 cm',
                'Weight': '5.2 kg',
                'Warranty': '1 Year Comprehensive'
            }
        },
        'kettle-k10': {
            title: 'Electric Kettle K10',
            price: '₹1,390',
            description: 'Fast boiling with safety features.',
            icon: 'fas fa-coffee',
            image: 'images/kettle.jpg',
            specs: {
                'Capacity': '1.7 Liters',
                'Power': '1500W',
                'Boiling Time': '5-7 Minutes',
                'Safety Features': 'Auto Shut-off, Dry Boil Protection',
                'Material': 'Stainless Steel',
                'Dimensions': '22 x 16 x 24 cm',
                'Weight': '1.2 kg',
                'Warranty': '1 Year Comprehensive'
            }
        }
        // Add more products as needed
    };
    
    const product = products[productId];
    if (product) {
        updateProductDetailPage(product);
    }
}

function updateProductDetailPage(product) {
    const titleEl = document.getElementById('product-title');
    const priceEl = document.getElementById('product-price');
    const descEl = document.getElementById('product-desc');
    const iconEl = document.getElementById('main-product-icon');
    const currentProductEl = document.getElementById('current-product');
    const specTable = document.getElementById('spec-table');
    const addToCartBtn = document.getElementById('add-to-cart');
    
    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = product.price;
    if (descEl) descEl.textContent = product.description;
    if (iconEl) iconEl.className = product.icon;
    if (currentProductEl) currentProductEl.textContent = product.title;
    
    // Update main product image
    const mainImageEl = document.querySelector('.main-image img');
    if (mainImageEl && product.image) {
        mainImageEl.src = product.image;
        mainImageEl.alt = product.title;
    }
    
    // Update thumbnail images based on product type
    const thumbnailImages = document.querySelectorAll('.thumbnail-images img');
    if (thumbnailImages.length > 0 && product.image) {
        // Set first thumbnail to main product image
        thumbnailImages[0].src = product.image;
        thumbnailImages[0].alt = product.title;
        
        // Set other thumbnails based on product category
        if (product.icon === 'fas fa-tv') {
            // TV products - show different TV models
            const tvImages = ['images/tv32.jpg', 'images/tv55.jpg', 'images/tv65.jpg'];
            for (let i = 1; i < thumbnailImages.length && i < tvImages.length; i++) {
                thumbnailImages[i].src = tvImages[i];
                thumbnailImages[i].alt = `TV Model ${i + 1}`;
            }
        } else if (product.icon === 'fas fa-fire-burner') {
            // Cooktop products
            const cooktopImages = ['images/m10.jpg', 'images/m15.jpg', 'images/m20.jpg'];
            for (let i = 1; i < thumbnailImages.length && i < cooktopImages.length; i++) {
                thumbnailImages[i].src = cooktopImages[i];
                thumbnailImages[i].alt = `Cooktop Model ${i + 1}`;
            }
        } else if (product.icon === 'fas fa-blender') {
            // Air fryer
            if (thumbnailImages[1]) {
                thumbnailImages[1].src = 'images/airfryer.jpg';
                thumbnailImages[1].alt = 'Air Fryer';
            }
        } else if (product.icon === 'fas fa-coffee') {
            // Kettle
            if (thumbnailImages[1]) {
                thumbnailImages[1].src = 'images/kettle.jpg';
                thumbnailImages[1].alt = 'Electric Kettle';
            }
        }
    }
    
    // Update specifications table
    if (specTable && product.specs) {
        specTable.innerHTML = Object.entries(product.specs)
            .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
            .join('');
    }
    
    // Update add to cart button
    if (addToCartBtn) {
        const price = parseInt(product.price.replace('₹', '').replace(',', ''));
        addToCartBtn.dataset.product = product.title;
        addToCartBtn.dataset.price = price;
    }
}

// ===== CONTACT FORM =====
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    const checkoutForm = document.getElementById('checkout-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            setTimeout(() => {
                openModal('message-success-modal');
                contactForm.reset();
            }, 1000);
        });
    }
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Generate order ID
            const orderId = 'POT' + Date.now().toString().slice(-8);
            document.getElementById('order-id').textContent = orderId;
            
            // Clear cart and show success
            clearCart();
            closeModal('checkout-modal');
            openModal('success-modal');
        });
    }
}

// ===== FAQ =====
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// ===== MODALS =====
function setupModals() {
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const cancelCheckoutBtn = document.getElementById('cancel-checkout');
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', function() {
            closeModal('checkout-modal');
        });
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===== ANIMATIONS =====
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);

// ===== GLOBAL FUNCTIONS (for inline event handlers) =====
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.openModal = openModal;
window.closeModal = closeModal;
