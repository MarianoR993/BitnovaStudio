// MÓDULO DE SCROLL Y ANIMACIONES
export const SCROLL_ANIMATIONS = {
    // Método init principal que faltaba
    init() {
        this.initIntersectionObserver();
        this.initSmoothScroll();
        console.log('✅ Scroll Animations inicializado');
        return true;
    },

    initIntersectionObserver() {
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

    initSmoothScroll() {
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