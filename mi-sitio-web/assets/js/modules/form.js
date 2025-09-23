// MÓDULO DE UTILIDADES
export const UTILS = {
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

// MÓDULO DE FORMULARIO
export const FORM = {
    init: () => {
        const contactForm = document.querySelector('#contactForm');
        if (!contactForm) return;

        FORM.setupEventListeners(contactForm);
        FORM.loadSavedFormData();
    },

    setupEventListeners: (form) => {
        form.addEventListener('submit', FORM.handleSubmit);
        
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // CORRECCIÓN: Usar UTILS.debounce en lugar de FORM.debounce
            input.addEventListener('input', UTILS.debounce(() => {
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
                // Importar dinámicamente el módulo modal
                const { MODAL } = await import('./modal.js');
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
        const form = document.querySelector('#contactForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        UTILS.saveToStorage('formData', data);
    },

    loadSavedFormData: () => {
        const savedData = UTILS.getFromStorage('formData');
        if (!savedData) return;
        
        const form = document.querySelector('#contactForm');
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
    }
};