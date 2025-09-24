// MÓDULO DE ANIMACIONES DEL FOOTER
export const FOOTER_ANIMATIONS = {
    init: () => {
        FOOTER_ANIMATIONS.setupFooterAnimation();
        FOOTER_ANIMATIONS.setupHoverEffects();
        FOOTER_ANIMATIONS.protectSensitiveData();
    },

    setupFooterAnimation: () => {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        // NUEVO: Asegurar que los elementos tengan el estado inicial correcto
        FOOTER_ANIMATIONS.ensureInitialState();

        const observerOptions = {
            threshold: 0.3, // Cuando el 30% del footer es visible
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Añadir clase visible para activar las animaciones CSS
                    entry.target.classList.add('visible');
                    
                    // Animación adicional para los elementos hijos
                    FOOTER_ANIMATIONS.animateFooterElements();
                    
                    console.log('Footer animado con éxito');
                } else {
                    // Remover clase visible cuando sale de la vista
                    entry.target.classList.remove('visible');
                    
                    // Resetear elementos para la próxima animación
                    FOOTER_ANIMATIONS.resetFooterElements();
                    
                    console.log('Footer resetado para próxima animación');
                }
            });
        }, observerOptions);

        observer.observe(footer);
        
        // Fallback: si después de 3 segundos no se ha activado, forzar animación
        setTimeout(() => {
            if (!footer.classList.contains('visible')) {
                footer.classList.add('visible');
                FOOTER_ANIMATIONS.animateFooterElements();
                console.log('Animación de footer activada por fallback');
            }
        }, 3000);
    },

    // NUEVO MÉTODO para asegurar estado inicial correcto
    ensureInitialState: () => {
        const footerSections = document.querySelectorAll('.footer-info, .footer-links, .footer-contact, .footer-bottom');
        
        footerSections.forEach((section, index) => {
            // Forzar estado inicial inmediatamente
            section.style.opacity = "0";
            section.style.transition = "none"; // Sin transición inicial
            
            // Aplicar transforms iniciales según la clase
            if (section.classList.contains('footer-info')) {
                section.style.transform = "translateX(-30px)";
            } else if (section.classList.contains('footer-links')) {
                section.style.transform = "translateY(30px)";
            } else if (section.classList.contains('footer-contact')) {
                section.style.transform = "translateX(30px)";
            } else if (section.classList.contains('footer-bottom')) {
                section.style.transform = "translateY(20px)";
            }
        });
        
        // Restaurar transiciones después de un frame
        requestAnimationFrame(() => {
            footerSections.forEach(section => {
                section.style.transition = "";
            });
        });
        
        console.log('Estado inicial del footer asegurado');
    },

    animateFooterElements: () => {
        // Usar requestAnimationFrame para animaciones suaves
        requestAnimationFrame(() => {
            const footerSections = document.querySelectorAll('.footer-info, .footer-links, .footer-contact, .footer-bottom');
            
            footerSections.forEach((section, index) => {
                // Aplicar estilos directamente como fallback
                section.style.opacity = "1";
                section.style.transform = "translateX(0) translateY(0)";
                section.style.transition = "all 0.8s ease-out";
                
                // Aplicar delays escalonados
                section.style.transitionDelay = `${index * 0.2}s`;
            });
        });
    },

    // NUEVO MÉTODO para resetear elementos
    resetFooterElements: () => {
        requestAnimationFrame(() => {
            const footerSections = document.querySelectorAll('.footer-info, .footer-links, .footer-contact, .footer-bottom');
            
            footerSections.forEach((section, index) => {
                // Resetear a estado inicial
                section.style.opacity = "0";
                section.style.transition = "none"; // Sin transición para reset inmediato
                section.style.transitionDelay = "0s";
                
                // Aplicar transforms iniciales según la clase
                if (section.classList.contains('footer-info')) {
                    section.style.transform = "translateX(-30px)";
                } else if (section.classList.contains('footer-links')) {
                    section.style.transform = "translateY(30px)";
                } else if (section.classList.contains('footer-contact')) {
                    section.style.transform = "translateX(30px)";
                } else if (section.classList.contains('footer-bottom')) {
                    section.style.transform = "translateY(20px)";
                }
                
                // Restaurar transición después de un frame
                setTimeout(() => {
                    section.style.transition = "";
                }, 50);
            });
        });
    },

    setupHoverEffects: () => {
        // Efectos de hover para enlaces del footer
        const footerLinks = document.querySelectorAll('.footer a');
        footerLinks.forEach(link => {
            link.addEventListener('mouseenter', FOOTER_ANIMATIONS.animateLinkHover);
            link.addEventListener('mouseleave', FOOTER_ANIMATIONS.animateLinkLeave);
            link.addEventListener('focus', FOOTER_ANIMATIONS.animateLinkHover);
            link.addEventListener('blur', FOOTER_ANIMATIONS.animateLinkLeave);
        });

        // Efectos de hover para las secciones del footer
        const footerSections = document.querySelectorAll('.footer-info, .footer-links, .footer-contact');
        footerSections.forEach(section => {
            section.addEventListener('mouseenter', FOOTER_ANIMATIONS.animateSectionHover);
            section.addEventListener('mouseleave', FOOTER_ANIMATIONS.animateSectionLeave);
        });
    },

    animateLinkHover: (e) => {
        const link = e.target;
        link.style.transform = 'translateX(8px)';
        link.style.color = 'var(--white)';
    },

    animateLinkLeave: (e) => {
        const link = e.target;
        link.style.transform = '';
        link.style.color = '';
    },

    animateSectionHover: (e) => {
        const section = e.target;
        section.style.transform = 'translateY(-5px)';
    },

    animateSectionLeave: (e) => {
        const section = e.target;
        section.style.transform = '';
    },

    protectSensitiveData: () => {
        const footerEmail = document.getElementById('footer-email');
        const footerPhone = document.getElementById('footer-phone');
        
        if (footerEmail) {
            footerEmail.textContent = 'email@bitnovastudio.com';
        }
        
        if (footerPhone) {
            footerPhone.textContent = '+34 123 456 789';
        }
    },

    // Método para reiniciar animaciones (útil para desarrollo)
    resetAnimations: () => {
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.classList.remove('visible');
            FOOTER_ANIMATIONS.resetFooterElements();
            
            // Volver a observar después de un breve delay
            setTimeout(() => {
                FOOTER_ANIMATIONS.setupFooterAnimation();
            }, 100);
        }
    }
};

// Inicialización automática si se carga directamente
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Delay más largo para asegurar que la página esté completamente cargada
        setTimeout(() => {
            FOOTER_ANIMATIONS.init();
        }, 500); // Aumentado de 100ms a 500ms
    });
    
    // También inicializar después de que se cargue completamente la página
    window.addEventListener('load', () => {
        // Solo si no se ha inicializado ya
        const footer = document.querySelector('.footer');
        if (footer && !footer.hasAttribute('data-footer-initialized')) {
            footer.setAttribute('data-footer-initialized', 'true');
            setTimeout(() => {
                FOOTER_ANIMATIONS.init();
            }, 200);
        }
    });
}