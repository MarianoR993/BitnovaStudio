// MÓDULO DE TEXT SLIDER PARA HERO
export const TEXT_SLIDER = {
    slider: null,
    texts: [],
    currentIndex: 0,
    intervalId: null,
    isActive: false,
    
    // Configuración
    config: {
        interval: 3500,      // 3.5 segundos entre cambios (un poco más tiempo)
        transitionDuration: 400, // Transición más rápida y precisa
        pauseOnHover: true   // Pausar al hacer hover
    },

    init() {
        this.slider = document.querySelector('.text-slider');
        if (!this.slider) {
            console.log('⚠️ Text slider no encontrado');
            return;
        }

        this.texts = this.slider.querySelectorAll('.slider-text');
        if (this.texts.length === 0) {
            console.log('⚠️ No se encontraron textos para el slider');
            return;
        }

        this.setupEventListeners();
        this.start();
        
        console.log(`✅ Text slider inicializado con ${this.texts.length} elementos`);
    },

    setupEventListeners() {
        if (this.config.pauseOnHover) {
            this.slider.addEventListener('mouseenter', () => this.pause());
            this.slider.addEventListener('mouseleave', () => this.resume());
        }

        // Pausar cuando la página no está visible (ahorro de recursos)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else if (this.isActive) {
                this.resume();
            }
        });

        // Pausar si el usuario prefiere movimiento reducido
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            this.config.interval = 5000; // Más lento si prefiere movimiento reducido
        }
    },

    start() {
        if (this.texts.length <= 1) return;
        
        this.isActive = true;
        this.currentIndex = 0;
        this.showText(0);
        
        this.intervalId = setInterval(() => {
            this.nextSlide();
        }, this.config.interval);
    },

    nextSlide() {
        if (!this.isActive) return;
        
        const nextIndex = (this.currentIndex + 1) % this.texts.length;
        this.transitionToText(nextIndex);
    },

    transitionToText(nextIndex) {
        const currentText = this.texts[this.currentIndex];
        const nextText = this.texts[nextIndex];
        
        // 1. Aplicar animación de salida al texto actual
        currentText.classList.add('slide-out');
        currentText.classList.remove('active', 'slide-in');
        
        // 2. Esperar a que termine la animación de salida COMPLETAMENTE
        setTimeout(() => {
            // Remover completamente el texto actual
            currentText.classList.remove('slide-out');
            
            // 3. Solo DESPUÉS mostrar el nuevo texto
            setTimeout(() => {
                nextText.classList.add('slide-in', 'active');
                this.currentIndex = nextIndex;
                
                // 4. Limpiar clases después de la animación de entrada
                setTimeout(() => {
                    nextText.classList.remove('slide-in');
                }, this.config.transitionDuration);
                
            }, 100); // Pequeño delay para asegurar separación
            
        }, this.config.transitionDuration); // Esperar TODO el tiempo de salida
    },

    showText(index) {
        // Ocultar todos los textos
        this.texts.forEach(text => {
            text.classList.remove('active', 'slide-in', 'slide-out');
        });
        
        // Mostrar el texto seleccionado
        this.texts[index].classList.add('active');
        this.currentIndex = index;
    },

    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    resume() {
        if (this.isActive && !this.intervalId) {
            this.intervalId = setInterval(() => {
                this.nextSlide();
            }, this.config.interval);
        }
    },

    stop() {
        this.pause();
        this.isActive = false;
        
        // Mostrar solo el primer texto
        this.showText(0);
    },

    // Método para cambiar configuración
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Reiniciar con nueva configuración
        if (this.isActive) {
            this.stop();
            this.start();
        }
    },

    // Método para ir a un texto específico
    goToSlide(index) {
        if (index >= 0 && index < this.texts.length) {
            this.pause();
            this.transitionToText(index);
            
            // Reanudar después de la transición
            setTimeout(() => {
                if (this.isActive) this.resume();
            }, this.config.transitionDuration);
        }
    },

    destroy() {
        this.stop();
        
        // Remover event listeners
        if (this.slider) {
            this.slider.removeEventListener('mouseenter', () => this.pause());
            this.slider.removeEventListener('mouseleave', () => this.resume());
        }
        
        this.slider = null;
        this.texts = [];
        this.currentIndex = 0;
        
        console.log('🗑️ Text slider destruido');
    }
};

// Auto-inicialización
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Delay para que se cargue después de otros elementos
        setTimeout(() => {
            TEXT_SLIDER.init();
        }, 800);
    });
}