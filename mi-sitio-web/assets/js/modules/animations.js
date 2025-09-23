export const ANIMATIONS = {
    init: () => {
        ANIMATIONS.setupScrollHeader();
        ANIMATIONS.setupScrollAnimations();
        ANIMATIONS.setupHoverEffects();
    },

    setupScrollHeader: () => {
        const header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    },

    setupScrollAnimations: () => {
        // Configurar Intersection Observer para animaciones al hacer scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('process-card')) {
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, entry.target.dataset.delay || 0);
                    } else if (entry.target.classList.contains('service-card')) {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar tarjetas de proceso
        document.querySelectorAll('.process-card').forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(40px)";
            card.dataset.delay = index * 150; // Delay escalonado
            observer.observe(card);
        });

        // Observar tarjetas de servicios
        document.querySelectorAll('.service-card').forEach(card => {
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";
            card.style.transition = "all 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000)";
            observer.observe(card);
        });
    },

    setupHoverEffects: () => {
        // Efectos de hover para botones
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px)';
                btn.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = '';
            });
            
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(1px)';
                btn.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            });
            
            btn.addEventListener('mouseup', () => {
                btn.style.transform = 'translateY(-3px)';
                btn.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            });
        });
    }
};