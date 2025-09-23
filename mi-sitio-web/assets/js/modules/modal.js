// CONSTANTES Y CONFIGURACIÓN
const CONFIG = {
    MODAL_TIMEOUT: 4000
};

// MÓDULO MODAL
export const MODAL = {
    init: () => {
        const modal = document.querySelector('#successModal');
        if (!modal) return;

        MODAL.setupEventListeners(modal);
    },

    setupEventListeners: (modal) => {
        document.querySelector('#closeModal')?.addEventListener('click', MODAL.hide);
        
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
        const modal = document.querySelector('#successModal');
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        document.querySelector('#closeModal')?.focus();
        
        MODAL.modalTimeout = setTimeout(() => {
            MODAL.hide();
        }, CONFIG.MODAL_TIMEOUT);
    },

    hide: () => {
        const modal = document.querySelector('#successModal');
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (MODAL.modalTimeout) {
            clearTimeout(MODAL.modalTimeout);
            MODAL.modalTimeout = null;
        }
    }
};