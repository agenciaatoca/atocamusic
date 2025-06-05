// DOM elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const navLinks = document.querySelectorAll('.nav-link');
const statNumber = document.querySelector('.stat-number');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null; // Verifica se canvas existe
const contactForm = document.querySelector('.contact-form');

// Novo: Elementos do Modal de Newsletter
const newsletterModal = document.getElementById('newsletter-modal');
const openNewsletterModalBtns = document.querySelectorAll('.open-newsletter-modal');
const closeNewsletterModalBtn = document.querySelector('.close-modal-btn');

// Mobile menu functionality
function toggleMobileMenu() {
    mobileMenuOverlay.classList.toggle('active');
    // Adicionado aria-expanded para acessibilidade
    mobileMenuBtn.setAttribute('aria-expanded', mobileMenuOverlay.classList.contains('active'));
    document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileMenuOverlay.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Event listeners for mobile menu
mobileMenuBtn.addEventListener('click', toggleMobileMenu);
mobileMenuOverlay.addEventListener('click', (e) => {
    if (e.target === mobileMenuOverlay) { // Clica no overlay para fechar
        closeMobileMenu();
    }
});

// Close mobile menu when clicking nav links
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Smooth scrolling for navigation links
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        // Ajusta a posição de scroll para compensar o header fixo e um pouco de padding
        const elementPosition = element.offsetTop - headerHeight - 20; // -20px para um visual melhor
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Add smooth scrolling to all nav links
[...navLinks, ...mobileNavLinks].forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (target.startsWith('#')) {
            smoothScroll(target);
            // Marcar link ativo para destaque visual
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// Animated counter for streams
function animateCounter() {
    if (!statNumber || !statNumber.dataset.target) {
        console.warn("Elemento .stat-number ou data-target não encontrado para a animação do contador.");
        return;
    }
    const target = parseInt(statNumber.dataset.target);
    const duration = 2500; // 2.5 seconds para mais suavidade
    const start = Date.now();
    const startValue = 0;

    function updateCounter() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (easeOutQuart já é bom)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        let currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
        
        // Formatação do número com pontos (milhões)
        statNumber.textContent = currentValue.toLocaleString('pt-BR');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            statNumber.textContent = target.toLocaleString('pt-BR');
        }
    }
    
    updateCounter();
}

// Particle system for background (Refinado)
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5; // Partículas ligeiramente menores
        this.speedX = (Math.random() - 0.5) * 0.3; // Mais lentas
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1; // Menos opacas
        this.color = `rgba(0, 212, 255, ${this.opacity})`; // Cor base do tema
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

let particles = [];
// Ajuste de particleCount baseado na tela para melhor performance UX
const getParticleCount = () => {
    if (window.innerWidth < 768) return 30; // Mobile
    if (window.innerWidth < 1200) return 60; // Tablets e notebooks menores
    return 100; // Desktop (aumentado para mais densidade no "melhor site")
};

function initParticles() {
    if (!canvas || !ctx) return; // Garante que canvas e ctx existem
    particles = [];
    const currentParticleCount = getParticleCount();
    for (let i = 0; i < currentParticleCount; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    if (!ctx) return;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) { // Distância de conexão ligeiramente maior
                const opacity = (120 - distance) / 120 * 0.08; // Conexões menos opacas
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                ctx.lineWidth = 0.8; // Linhas mais finas
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    drawConnections();
    requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(); // Re-inicializa partículas ao redimensionar
    }
}

// Intersection Observer for better performance and animations
const observerOptions = {
    threshold: 0.1, // Elemento visível em 10%
    rootMargin: '0px 0px -80px 0px' // Começa a animar 80px antes do final da viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Trigger counter animation when hero section is visible
            if (entry.target.classList.contains('hero')) {
                if (!entry.target.dataset.animated) {
                    setTimeout(animateCounter, 600); // Atraso levemente maior para melhor UX
                    entry.target.dataset.animated = 'true';
                }
            }
        } else {
            // Opcional: remover a classe quando sai da visualização para permitir re-animação
            // entry.target.classList.remove('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animations (Atualizado para incluir novas seções)
function initObserver() {
    const elementsToObserve = document.querySelectorAll(
        '.service-card, .artist-card, .about-card, .hero, .composers-content, .tour-virtual-content, .testimonial-card, .section-title, .footer-content'
    );
    elementsToObserve.forEach(el => observer.observe(el));
}

// Header background opacity on scroll
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    const scrolled = window.pageYOffset;
    
    if (scrolled > 80) { // Menor scroll para escurecer o header mais rápido
        header.style.background = 'rgba(10, 10, 15, 0.95)';
        header.style.backdropFilter = 'blur(15px)';
        header.style.webkitBackdropFilter = 'blur(15px)';
    } else {
        header.style.background = 'rgba(10, 10, 15, 0.8)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.webkitBackdropFilter = 'blur(10px)';
    }
}

// Add glow effect to buttons on mouse move
function addButtonGlowEffect() {
    const buttons = document.querySelectorAll('.btn--primary');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            button.style.setProperty('--mouse-x', `${x}px`);
            button.style.setProperty('--mouse-y', `${y}px`);
        });
        // Reset glow on mouse leave
        button.addEventListener('mouseleave', () => {
            button.style.setProperty('--mouse-x', `50%`);
            button.style.setProperty('--mouse-y', `50%`);
            button.style.setProperty('opacity', `0`);
        });
    });
}

// Modal de Newsletter (Nova funcionalidade)
function openNewsletter() {
    if (newsletterModal) {
        newsletterModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita scroll do background
        // Opcional: focar no primeiro campo do formulário
        const firstInput = newsletterModal.querySelector('input');
        if (firstInput) firstInput.focus();
    }
}

function closeNewsletter() {
    if (newsletterModal) {
        newsletterModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Event Listeners para o Modal de Newsletter
openNewsletterModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openNewsletter();
    });
});

if (closeNewsletterModalBtn) {
    closeNewsletterModalBtn.addEventListener('click', closeNewsletter);
}

// Fecha modal com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && newsletterModal && newsletterModal.classList.contains('active')) {
        closeNewsletter();
    }
});


// Add parallax effect to hero section (melhorado para mais suavidade)
function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let requestId;
    const updateParallax = () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.2; // Taxa de parallax ajustada
        
        hero.style.transform = `translateY(${rate}px)`;
        requestId = null; // Limpa o ID da requisição
    };

    window.addEventListener('scroll', () => {
        if (!requestId) {
            requestId = requestAnimationFrame(updateParallax); // Otimiza para usar requestAnimationFrame
        }
    }, { passive: true }); // Usar passive: true para melhor performance de scroll
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas and particles
    if (canvas && ctx) { // Só inicializa se o canvas for encontrado
        resizeCanvas();
        animateParticles();
        window.addEventListener('resize', resizeCanvas); // Escuta resize do canvas
    } else {
        console.warn("Canvas ou contexto 2D não encontrado. Sistema de partículas desativado.");
    }
    
    // Initialize scroll animations
    initObserver();
    
    // Add button glow effects
    addButtonGlowEffect();
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        // handleScrollAnimations(); // Removido, pois IntersectionObserver é mais eficiente para a maioria
        handleHeaderScroll();
    });
    
    // Add stagger animation to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        // A animação já está sendo cuidada pelo IntersectionObserver com 'fade-in-up'
        // Mas o delay pode ser mantido para um efeito cascata se a animação não for no scroll
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Initialize parallax
    addParallaxEffect();
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Marca o link de navegação ativo no carregamento inicial
document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.pageYOffset + document.querySelector('.header').offsetHeight + 50; // Ajuste para header e padding

    sections.forEach(section => {
        if (section.offsetTop <= scrollPosition && section.offsetTop + section.offsetHeight > scrollPosition) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.id) {
                    link.classList.add('active');
                }
            });
            mobileNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
});
// Trigger inicial para a classe ativa
document.dispatchEvent(new Event('scroll'));
