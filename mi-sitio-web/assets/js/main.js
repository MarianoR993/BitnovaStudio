// Importar módulos
import { FORM, UTILS } from './modules/form.js';
import { MODAL } from './modules/modal.js';
import { SCROLL_ANIMATIONS } from './modules/scroll-animations.js';
import { FOOTER_ANIMATIONS } from './modules/footer-animations.js';
import { ANIMATIONS } from './modules/animations.js';
import { TEXT_SLIDER } from './modules/text-slider.js';

// CONSTANTES Y CONFIGURACIÓN
const CONFIG = {
    CAROUSEL_INTERVAL: 5000,
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// ESTADO DE LA APLICACIÓN
const APP_STATE = {
    isDarkMode: false,
    animationsEnabled: !CONFIG.REDUCED_MOTION,
    modulesLoaded: false
};

// MÓDULO ESPECÍFICO PARA TARJETAS DE PROCESO
// MÓDULO ESPECÍFICO PARA TARJETAS DE PROCESO CON SOPORTE TÁCTIL
const PROCESS_CARDS = {
    init() {
        this.initProcessCards();
        this.initTouchSupport(); // Nuevo método para soporte táctil
        console.log('✅ Tarjetas de proceso inicializadas con soporte táctil');
    },

    initProcessCards() {
        const processCards = document.querySelectorAll('.process-card');
        
        if (processCards.length === 0) {
            console.log('⚠️ No se encontraron tarjetas de proceso');
            return;
        }

        // Configurar Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const delay = parseInt(card.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        card.classList.add('visible');
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, delay);
                    
                    observer.unobserve(card);
                }
            });
        }, observerOptions);

        // Configurar cada tarjeta
        processCards.forEach((card, index) => {
            // Configurar estado inicial
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000)';
            card.dataset.delay = index * 150;
            
            // Observar la tarjeta
            observer.observe(card);
        });

        console.log(`✅ Configuradas ${processCards.length} tarjetas de proceso`);
    },

    // NUEVO: Soporte táctil para Safari y dispositivos móviles
    initTouchSupport() {
        const processCards = document.querySelectorAll('.process-card');
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (!isTouchDevice) {
            console.log('✅ Dispositivo no táctil - usando hover nativo');
            return;
        }

        console.log('📱 Dispositivo táctil detectado - activando soporte táctil');

        processCards.forEach(card => {
            let isExpanded = false;

            // Touch/Click para alternar estado
            card.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCard(card, !isExpanded);
                isExpanded = !isExpanded;
            });

            // Touch start para feedback inmediato
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });

            // Touch end para restaurar
            card.addEventListener('touchend', () => {
                setTimeout(() => {
                    if (!isExpanded) {
                        card.style.transform = '';
                    }
                }, 150);
            });
        });

        // Cerrar tarjetas cuando se toca fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.process-card')) {
                processCards.forEach(card => {
                    this.toggleCard(card, false);
                });
            }
        });

        // Cambiar el texto del hint para dispositivos táctiles
        const hint = document.querySelector('.process-hint');
        if (hint) {
            hint.textContent = 'Toca cada tarjeta para conocer más detalles';
        }
    },

    // Método para alternar estado de tarjeta
    toggleCard(card, expand) {
        if (expand) {
            card.classList.add('expanded');
        } else {
            card.classList.remove('expanded');
        }
    }
};


// INICIALIZACIÓN DE LA APLICACIÓN
function initApp() {
    try {
        // Inicializar módulos en orden de prioridad
        SCROLL_ANIMATIONS.initSmoothScroll();
        SCROLL_ANIMATIONS.initIntersectionObserver();
        
        ANIMATIONS.init();
        TEXT_SLIDER.init(); // Text slider para el hero
        PROCESS_CARDS.init();
        FORM.init();
        MODAL.init();
        FOOTER_ANIMATIONS.init();
        
        // Cargar preferencias de usuario
        loadUserPreferences();
        
        APP_STATE.modulesLoaded = true;
        console.log('✅ Todos los módulos se han inicializado correctamente');
        
        // Disparar evento personalizado para indicar que la app está lista
        window.dispatchEvent(new CustomEvent('appReady'));
        
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        handleInitError(error);
    }
}

// CARGAR PREFERENCIAS DE USUARIO
function loadUserPreferences() {
    // Modo oscuro
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    APP_STATE.isDarkMode = userPrefersDark;
    
    if (userPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        console.log('Modo oscuro activado');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        console.log('Modo claro activado');
    }
    
    // Preferencias de movimiento reducido
    if (CONFIG.REDUCED_MOTION) {
        document.documentElement.classList.add('reduced-motion');
        console.log('Movimiento reducido activado');
    }
}

// 🆕 CONTROLAR LLUVIA DE CÓDIGO SEGÚN VISIBILIDAD DE PÁGINA
function setupVisibilityControls() {
    // Función removida - sin lluvia de código
    console.log('Controles de visibilidad no necesarios');
}

// MANEJO DE ERRORES DE INICIALIZACIÓN
function handleInitError(error) {
    // Mostrar mensaje de error amigable en UI si es necesario
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    errorElement.textContent = 'Error al cargar la página. Por favor, recarga.';
    document.body.appendChild(errorElement);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 5000);
}

// MANEJAR ERRORES NO CAPTURADOS
window.addEventListener('error', (e) => {
    console.error('⚠️ Error no capturado:', e.error);
    
    // Ignorar errores específicos que no son críticos
    const ignoredErrors = [
        'ResizeObserver',
        'SCRIPT1002',
        'Loading CSS',
        'Canvas 2D Context', // 🆕 Ignorar errores de canvas
        'WebGL'
    ];
    
    const shouldIgnore = ignoredErrors.some(ignored => 
        e.message?.includes(ignored) || e.error?.message?.includes(ignored)
    );
    
    if (!shouldIgnore) {
        // Log error para analytics si está configurado
        if (window.gtag) {
            window.gtag('event', 'js_error', {
                error_message: e.error?.message || e.message,
                error_stack: e.error?.stack || 'No stack'
            });
        }
    }
});

// MANEJAR PROMESAS RECHAZADAS NO CAPTURADAS
window.addEventListener('unhandledrejection', (e) => {
    console.error('⚠️ Promesa rechazada no capturada:', e.reason);
    e.preventDefault();
});

// 🆕 UTILIDADES EXTENDIDAS
const EXTENDED_UTILS = {
    reload: () => window.location.reload(),
    getTheme: () => APP_STATE.isDarkMode ? 'dark' : 'light',
    toggleTheme: () => {
        APP_STATE.isDarkMode = !APP_STATE.isDarkMode;
        const newTheme = APP_STATE.isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        console.log(`Tema cambiado a: ${newTheme}`);
    }
};

// EXPORTAR PARA USO GLOBAL
window.APP = {
    // Módulos existentes
    FORM,
    MODAL,
    UTILS,
    ANIMATIONS,
    SCROLL_ANIMATIONS,
    FOOTER_ANIMATIONS,
    PROCESS_CARDS,
    TEXT_SLIDER, // Nuevo módulo
    
    // Configuración y estado
    CONFIG,
    STATE: APP_STATE,
    
    // Utilidades
    utils: EXTENDED_UTILS
};

// 🆕 INICIALIZAR CONTROLES DE VISIBILIDAD
setupVisibilityControls();

// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM ya está listo
    initApp();
}

// EXPORTAR PARA USO EN MÓDULOS (si es necesario)
export { APP_STATE, CONFIG };