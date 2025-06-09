// DOM elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const navLinks = document.querySelectorAll('.nav-link');
const statNumber = document.querySelector('.stat-number');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Elementos do Modal de Newsletter
const newsletterModal = document.getElementById('newsletter-modal');
const closeNewsletterModalBtn = document.querySelector('#newsletter-modal .close-modal-btn');
const openNewsletterModalBtns = document.querySelectorAll('.open-newsletter-modal');

// Variáveis para o sistema de partículas
let particles = [];
const particleCount = 70; // Aumentado para mais partículas
const connectionDistance = 120; // Distância máxima para conectar partículas

// --- Funções de Funcionalidade Geral ---

// Toggle do Menu Mobile
function toggleMobileMenu() {
    mobileMenuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenuOverlay.classList.contains('active') ? 'hidden' : ''; // Impede o scroll do body
}

function closeMobileMenu() {
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Smooth scrolling para links de navegação
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Adiciona smooth scrolling a todos os links de navegação
[...navLinks, ...mobileNavLinks].forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (target && target.startsWith('#')) {
            smoothScroll(target);
            closeMobileMenu(); // Fecha o menu mobile após clicar em um link
        } else if (target && !target.startsWith('#')) {
            // Se for um link externo (como portifolio.html), apenas navega
            window.location.href = target;
        }
    });
});

// --- Animações e Efeitos Visuais ---

// Contador Animado para Streams
function animateCounter() {
    if (!statNumber || !statNumber.dataset.target) {
        // console.warn("Elemento .stat-number ou data-target não encontrado para a animação do contador.");
        return;
    }
    const target = parseInt(statNumber.dataset.target);
    const duration = 2000; // 2 segundos
    const start = Date.now();
    const startValue = 0;

    function updateCounter() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation (easeOutQuart)
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

// Classe para Partículas do Canvas
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // Tamanho entre 1 e 3
        this.speedX = (Math.random() - 0.5) * 0.5; // Velocidade lenta
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1; // Opacidade entre 0.1 e 0.5
        this.color = `rgba(0, 212, 255, ${this.opacity})`; // Cor ciano
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
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Inicializa as partículas
function initParticles() {
    if (!canvas || !ctx) return;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Desenha as conexões entre partículas próximas
function drawConnections() {
    if (!canvas || !ctx) return;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) { // Conecta se estiverem próximas
                const opacity = (1 - (distance / connectionDistance)) * 0.15; // Opacidade diminui com a distância
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`; // Cor ciano para as linhas
                ctx.lineWidth = 0.8; // Linhas mais finas
                ctx.stroke();
            }
        }
    }
}

// Loop de animação das partículas
function animateParticles() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    // Desenha e atualiza as partículas
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    drawConnections(); // Desenha as conexões
    requestAnimationFrame(animateParticles); // Chama a próxima animação
}

// Redimensiona o canvas e reinicia as partículas
function resizeCanvas() {
    if (canvas && ctx) {
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.scrollHeight; // Altura total da página
        initParticles(); // Reinicia as partículas ao redimensionar
    }
}

// Parallax Effect para a seção Hero
function addParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        // Ajuste a taxa de parallax para um efeito mais suave
        const rate = scrolled * -0.2; 
        // Aplica o transform diretamente ao pseudo-elemento ou a um elemento específico dentro do hero
        hero.style.setProperty('--parallax-offset', `${rate}px`);
    });
}

// Header background opacity on scroll
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    const scrolled = window.pageYOffset;
    
    if (scrolled > 50) { // Adiciona a classe 'scrolled' após 50px de rolagem
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Adiciona efeito de glow aos botões no movimento do mouse
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
    e.preventDefault();
    if (newsletterModal) {
        newsletterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeNewsletterModal() {
    if (newsletterModal) {
        newsletterModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// --- Intersection Observer para Animações de Scroll ---
const observerOptions = {
    threshold: 0.15, // Aumenta o threshold para acionar mais cedo
    rootMargin: '0px 0px -50px 0px' // Começa a animar 50px antes de entrar no viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            // Animar contador quando a seção hero se torna visível pela primeira vez
            if (entry.target.classList.contains('hero') && !entry.target.dataset.animated) {
                setTimeout(animateCounter, 500);
                entry.target.dataset.animated = 'true'; // Marca como animado
            }
            observer.unobserve(entry.target); // Deixa de observar após animar
        }
    });
}, observerOptions);

// Observa elementos para animações
function initObserver() {
    const elementsToObserve = document.querySelectorAll(
        '.service-card, .artist-card, .about-card, .composers-content, .tour-virtual-content, .footer-content, .portfolio-card'
    );
    elementsToObserve.forEach(el => observer.observe(el));
}


// --- Inicialização ao Carregar o DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa canvas e partículas apenas se canvas e contexto existirem
    if (canvas && ctx) {
        resizeCanvas(); // Ajusta o tamanho do canvas
        animateParticles(); // Inicia a animação das partículas
    } else {
        console.warn("Canvas ou contexto 2D não encontrados. Partículas não serão inicializadas.");
    }
    
    // Adiciona event listeners para o menu mobile
    if (mobileMenuBtn) { mobileMenuBtn.addEventListener('click', toggleMobileMenu); }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) { closeMobileMenu(); } // Fecha apenas se clicar no overlay
        });
    }

    // Inicializa o Intersection Observer para animações de scroll
    initObserver();
    
    // Adiciona efeitos de glow aos botões
    addButtonGlowEffect();
    
    // Adiciona event listeners de scroll
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
    });
    
    // Lidar com o redimensionamento da janela
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    
    // Inicializa o efeito de parallax
    addParallaxEffect();

    // Event Listeners para o modal de newsletter
    if (newsletterModal && closeNewsletterModalBtn) {
        closeNewsletterModalBtn.addEventListener('click', closeNewsletterModal);
        newsletterModal.addEventListener('click', (e) => {
            if (e.target === newsletterModal) { closeNewsletterModal(); }
        });
    }

    // Adiciona event listeners para os botões que abrem o modal
    if (openNewsletterModalBtns.length > 0) {
        openNewsletterModalBtns.forEach(button => {
            button.addEventListener('click', openNewsletterModal);
        });
    }

    // Marca o link de Portfólio como ativo se for a página atual
    if (window.location.pathname.includes('portifolio.html')) {
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            if (link.getAttribute('href') === 'portifolio.html') {
                link.classList.add('active');
            } else if (link.getAttribute('href') === 'index.html' && window.location.pathname === '/') {
                link.classList.remove('active'); // Garante que Home não esteja ativo se estiver no portfólio
            }
        });
    } else {
        // Para index.html, marca Home como ativo por padrão
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            if (link.getAttribute('href').endsWith('#home') || (link.getAttribute('href') === 'index.html' && window.location.pathname === '/')) {
                link.classList.add('active');
            }
        });
    }
});

// Animação de carregamento da página
window.addEventListener('load', () => {
    document.body.classList.add('loaded'); // Adiciona a classe 'loaded' para exibir o body
});
