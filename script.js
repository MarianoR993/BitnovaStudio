// CONSTANTES Y CONFIGURACIÓN
const CONFIG = {
    CAROUSEL_INTERVAL: 5000,
    MODAL_TIMEOUT: 4000
};

// SELECTORES DEL DOM
const DOM_SELECTORS = {
    contactForm: '#contactForm',
    successModal: '#successModal',
    closeModal: '#closeModal',
    carousel: '.carousel'
};

// ESTADO DE LA APLICACIÓN
const APP_STATE = {
    currentCarouselIndex: 0,
    carouselItems: [],
    carouselInterval: null,
    modalTimeout: null,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// MÓDULO DE UTILIDADES
const UTILS = {
    sanitizeInput: (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    saveToStorage: (key, value) => {
        try {
            if (typeof Storage !== "undefined") {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
            return false;
        } catch (error) {
            console.warn('localStorage no disponible:', error);
            return false;
        }
    },

    getFromStorage: (key) => {
        try {
            if (typeof Storage !== "undefined") {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            }
            return null;
        } catch (error) {
            console.warn('Error leyendo localStorage:', error);
            return null;
        }
    }
};

// MÓDULO DEL CARRUSEL
const CAROUSEL = {
    init: () => {
        const carousel = document.querySelector(DOM_SELECTORS.carousel);
        if (!carousel) return;

        APP_STATE.carouselItems = carousel.querySelectorAll('.carousel-item');
        if (APP_STATE.carouselItems.length === 0) return;
        
        if (!APP_STATE.prefersReducedMotion) {
            CAROUSEL.startAutoPlay();
        }
    },

    goTo: (index) => {
        if (index < 0) index = APP_STATE.carouselItems.length - 1;
        if (index >= APP_STATE.carouselItems.length) index = 0;

        APP_STATE.currentCarouselIndex = index;
        CAROUSEL.update();
    },

    next: () => {
        CAROUSEL.goTo(APP_STATE.currentCarouselIndex + 1);
    },

    update: () => {
        const carousel = document.querySelector(DOM_SELECTORS.carousel);
        if (!carousel) return;

        carousel.style.transform = `translateX(-${APP_STATE.currentCarouselIndex * 100}%)`;
    },

    startAutoPlay: () => {
        CAROUSEL.stopAutoPlay();
        if (!APP_STATE.prefersReducedMotion) {
            APP_STATE.carouselInterval = setInterval(() => {
                CAROUSEL.next();
            }, CONFIG.CAROUSEL_INTERVAL);
        }
    },

    stopAutoPlay: () => {
        if (APP_STATE.carouselInterval) {
            clearInterval(APP_STATE.carouselInterval);
            APP_STATE.carouselInterval = null;
        }
    }
};

// MÓDULO DE FORMULARIO
const FORM = {
    init: () => {
        const contactForm = document.querySelector(DOM_SELECTORS.contactForm);
        if (!contactForm) return;

        FORM.setupEventListeners(contactForm);
        FORM.loadSavedFormData();
    },

    setupEventListeners: (form) => {
        form.addEventListener('submit', FORM.handleSubmit);
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', FORM.debounce(() => {
                FORM.saveFormData();
            }, 500));
            
            input.addEventListener('focus', function() { 
                this.parentElement.classList.add('focused'); 
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                this.parentElement.classList[this.value.trim() ? 'add' : 'remove']('has-value');
            });
        });
    },

    handleSubmit: async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const formUrl = form.getAttribute('action');
        const data = Object.fromEntries(formData);
        
        Object.keys(data).forEach(key => {
            data[key] = UTILS.sanitizeInput(data[key]);
        });
        
        if (!FORM.validate(data, form)) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch(formUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                MODAL.show();
                form.reset();
                FORM.clearSavedFormData();
            } else {
                FORM.showError('¡Ups! Algo salió mal. Por favor, inténtelo de nuevo.');
                console.error(await response.json());
            }

        } catch (error) {
            FORM.showError('Error de red. Por favor, inténtelo de nuevo más tarde.');
            console.error(error);
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    },
    
    validate: (data, form) => {
        let isValid = true;
        const validations = [
            { 
                field: 'name', 
                value: data.name?.trim(), 
                rules: [
                    { test: val => val && val.length > 0, message: 'El nombre es requerido' },
                    { test: val => val && val.length >= 2, message: 'El nombre debe tener al menos 2 caracteres' }
                ]
            },
            { 
                field: 'email', 
                value: data.email?.trim(), 
                rules: [
                    { test: val => val && val.length > 0, message: 'El email es requerido' },
                    { test: val => UTILS.isValidEmail(val), message: 'Formato de email inválido' }
                ]
            },
            { 
                field: 'message', 
                value: data.message?.trim(), 
                rules: [
                    { test: val => val && val.length > 0, message: 'El mensaje es requerido' },
                    { test: val => val && val.length >= 10, message: 'El mensaje debe tener al menos 10 caracteres' }
                ]
            }
        ];

        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input, textarea').forEach(input => input.style.borderColor = '');

        validations.forEach(validation => {
            const input = form.querySelector(`[name="${validation.field}"]`);
            const failedRule = validation.rules.find(rule => !rule.test(validation.value));
            
            if (failedRule) {
                FORM.showFieldError(input, failedRule.message);
                isValid = false;
            }
        });

        return isValid;
    },

    showFieldError: (input, message) => {
        const formGroup = input.parentElement;
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        formGroup.appendChild(errorEl);
        input.style.borderColor = 'var(--accent-orange)';
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => input.style.animation = '', 500);
    },

    showError: (message) => {
        const formSubmitContainer = document.querySelector('.form-submit-container');
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        formSubmitContainer.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5000);
    },

    saveFormData: () => {
        const form = document.querySelector(DOM_SELECTORS.contactForm);
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        UTILS.saveToStorage('formData', data);
    },

    loadSavedFormData: () => {
        const savedData = UTILS.getFromStorage('formData');
        if (!savedData) return;
        
        const form = document.querySelector(DOM_SELECTORS.contactForm);
        if (!form) return;
        
        Object.keys(savedData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && savedData[key]) {
                input.value = savedData[key];
                input.parentElement.classList.add('has-value');
            }
        });
    },

    clearSavedFormData: () => {
        localStorage.removeItem('formData');
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// MÓDULO MODAL
const MODAL = {
    init: () => {
        const modal = document.querySelector(DOM_SELECTORS.successModal);
        if (!modal) return;

        MODAL.setupEventListeners(modal);
    },

    setupEventListeners: (modal) => {
        document.querySelector(DOM_SELECTORS.closeModal)?.addEventListener('click', MODAL.hide);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                MODAL.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                MODAL.hide();
            }
        });
    },

    show: () => {
        const modal = document.querySelector(DOM_SELECTORS.successModal);
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.querySelector(DOM_SELECTORS.closeModal)?.focus();
        
        APP_STATE.modalTimeout = setTimeout(() => {
            MODAL.hide();
        }, CONFIG.MODAL_TIMEOUT);
    },

    hide: () => {
        const modal = document.querySelector(DOM_SELECTORS.successModal);
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (APP_STATE.modalTimeout) {
            clearTimeout(APP_STATE.modalTimeout);
            APP_STATE.modalTimeout = null;
        }
    }
};

// MÓDULO DE SCROLL Y ANIMACIONES
const SCROLL_ANIMATIONS = {
    initIntersectionObserver: () => {
        const observerOptions = { 
            threshold: 0.1, 
            rootMargin: '0px 0px -50px 0px' 
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    },

    initSmoothScroll: () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({ 
                        top: offsetPosition, 
                        behavior: 'smooth' 
                    });
                }
            });
        });
    }
};

// MÓDULO DE DATOS DEL FOOTER
const FOOTER = {
    protectSensitiveData: () => {
        const footerEmail = document.getElementById('footer-email');
        const footerPhone = document.getElementById('footer-phone');
        
        if (footerEmail) {
            footerEmail.textContent = UTILS.sanitizeInput('email@bitnovastudio.com');
        }
        
        if (footerPhone) {
            footerPhone.textContent = UTILS.sanitizeInput('+34 123 456 789');
        }
    }
};

// INICIALIZACIÓN DE LA APLICACIÓN
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulos
    CAROUSEL.init();
    FORM.init();
    MODAL.init();
    SCROLL_ANIMATIONS.initIntersectionObserver();
    SCROLL_ANIMATIONS.initSmoothScroll();
    FOOTER.protectSensitiveData();

    // Cargar preferencias de usuario
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (userPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
});

// Manejar errores no capturados
window.addEventListener('error', (e) => {
    console.error('Error no capturado:', e.error);
});