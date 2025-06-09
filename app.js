// DOM elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const navLinks = document.querySelectorAll('.nav-link');
const statNumber = document.querySelector('.stat-number'); // Elemento para o contador
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null; // Verifica se canvas existe antes de pegar o contexto

// Elementos do Modal de Newsletter
const newsletterModal = document.getElementById('newsletter-modal');
const closeNewsletterModalBtn = document.querySelector('#newsletter-modal .close-modal-btn');
const openNewsletterModalBtns = document.querySelectorAll('.open-newsletter-modal'); // Botões que abrem o modal

// Mobile menu functionality
function toggleMobileMenu() {
    mobileMenuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Event listeners for mobile menu
if (mobileMenuBtn) { // Verifica se o botão existe
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}
if (mobileMenuOverlay) { // Verifica se o overlay existe
    mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === mobileMenuOverlay) { // Fecha apenas se clicar no overlay
            closeMobileMenu();
        }
    });
}

// Close mobile menu when clicking nav links
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Smooth scrolling for navigation links
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0; // Pega altura do header, 0 se não existir
        const elementPosition = element.offsetTop - headerHeight;
        
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
        if (target && target.startsWith('#')) { // Verifica se target existe e começa com '#'
            smoothScroll(target);
        }
    });
});

// Animated counter for streams
function animateCounter() {
    // Verifica se o elemento statNumber e o dataset.target existem
    if (!statNumber || !statNumber.dataset.target) {
        // console.warn("Elemento .stat-number ou data-target não encontrado para a animação do contador.");
        return;
    }
    const target = parseInt(statNumber.dataset.target);
    const duration = 2000; // 2 seconds
    const start = Date.now();
    const startValue = 0;

    function updateCounter() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
        
        statNumber.textContent = currentValue.toLocaleString('pt-BR');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            statNumber.textContent = target.toLocaleString('pt-BR');
        }
    }
    
    updateCounter();
}

// Particle system for background (apenas se canvas e contexto existirem)
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.connections = [];
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
        if (!ctx) return; // Garante que o contexto existe antes de desenhar
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.fill();
    }
}

let particles = [];
const particleCount = 50; // Mantido em 50 para boa performance padrão

function initParticles() {
    if (!canvas || !ctx) return;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    if (!canvas || !ctx) return;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const opacity = (100 - distance) / 100 * 0.1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    drawConnections();
    requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
    if (canvas && ctx) { // Verifica se canvas e ctx existem
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
}

// Scroll animations (ainda presente para elementos não observados pelo IntersectionObserver)
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.glass-card, .section-title');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-on-scroll', 'animated');
        }
    });
}

// Intersection Observer for better performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            
            // Trigger counter animation when hero section is visible
            if (entry.target.classList.contains('hero')) {
                // Apenas animar se ainda não foi animado para evitar repetições
                if (statNumber && !entry.target.dataset.animated) { // Verifica statNumber também
                    setTimeout(animateCounter, 500);
                    entry.target.dataset.animated = 'true'; // Marca como animado
                }
            }
        } else {
            // Opcional: remover a classe quando sai da visualização para permitir re-animação
            // entry.target.classList.remove('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animations
function initObserver() {
    const elementsToObserve = document.querySelectorAll('.service-card, .artist-card, .about-card, .hero, .composers-content, .tour-virtual-content');
    elementsToObserve.forEach(el => observer.observe(el));
}

// Header background opacity on scroll
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return; // Garante que o header existe
    const scrolled = window.pageYOffset;
    
    if (scrolled > 100) {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        header.style.background = 'rgba(10, 10, 15, 0.8)';
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
    });
}

// Lógica para abrir e fechar o modal de newsletter
function openNewsletterModal(e) {
    e.preventDefault(); // Previne o comportamento padrão do link
    if (newsletterModal) {
        newsletterModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede o scroll do body
    }
}

function closeNewsletterModal() {
    if (newsletterModal) {
        newsletterModal.classList.remove('active');
        document.body.style.overflow = ''; // Restaura o scroll do body
    }
}

// Event Listeners para o modal
if (newsletterModal && closeNewsletterModalBtn) {
    closeNewsletterModalBtn.addEventListener('click', closeNewsletterModal);
    newsletterModal.addEventListener('click', (e) => {
        if (e.target === newsletterModal) { // Fecha apenas se clicar no overlay
            closeNewsletterModal();
        }
    });
}

// Adiciona event listeners para os botões que abrem o modal
if (openNewsletterModalBtns.length > 0) {
    openNewsletterModalBtns.forEach(button => {
        button.addEventListener('click', openNewsletterModal);
    });
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas and particles only if canvas and ctx exist
    if (canvas && ctx) {
        resizeCanvas();
        animateParticles();
    } else {
        console.warn("Canvas ou contexto 2D não encontrados. Partículas não serão inicializadas.");
    }
    
    // Initialize scroll animations
    initObserver();
    
    // Add button glow effects
    addButtonGlowEffect();
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        handleScrollAnimations(); // Pode ser menos crítico com o IntersectionObserver, mas ainda útil para alguns elementos.
        handleHeaderScroll();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    // Add stagger animation to service cards (ainda relevante)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add parallax effect to hero section
function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.2; // Taxa de parallax ajustada para um efeito mais suave
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Initialize parallax
addParallaxEffect();
// fim
