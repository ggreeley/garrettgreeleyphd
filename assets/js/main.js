/* ========================================
   Network Canvas Animation
   Draws an animated node-link network in
   the hero — a nod to memory network research
   ======================================== */
(function () {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, nodes, animationId;
    const NODE_COUNT = 55;
    const CONNECTION_DIST = 160;
    const MOUSE_RADIUS = 200;
    let mouse = { x: -9999, y: -9999 };

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1.5,
            });
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, width, height);

        // Update positions
        for (const node of nodes) {
            node.x += node.vx;
            node.y += node.vy;

            // Wrap around edges
            if (node.x < -20) node.x = width + 20;
            if (node.x > width + 20) node.x = -20;
            if (node.y < -20) node.y = height + 20;
            if (node.y > height + 20) node.y = -20;

            // Subtle mouse attraction
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.008;
                node.vx += dx * force;
                node.vy += dy * force;
            }

            // Damping
            node.vx *= 0.998;
            node.vy *= 0.998;
        }

        // Draw edges
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(58, 124, 165, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        for (const node of nodes) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(58, 124, 165, 0.7)';
            ctx.fill();
        }

        animationId = requestAnimationFrame(drawFrame);
    }

    // Throttled mouse handler
    let mouseTimeout;
    canvas.addEventListener('mousemove', (e) => {
        if (mouseTimeout) return;
        mouseTimeout = setTimeout(() => { mouseTimeout = null; }, 30);
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Reduce animation when not visible
    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                if (!animationId) drawFrame();
            } else {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        },
        { threshold: 0.1 }
    );

    window.addEventListener('resize', () => {
        resize();
        if (nodes) {
            // Keep existing nodes, just clamp positions
            for (const node of nodes) {
                node.x = Math.min(node.x, width);
                node.y = Math.min(node.y, height);
            }
        }
    });

    resize();
    createNodes();
    observer.observe(canvas);
    drawFrame();
})();

/* ========================================
   Scroll Reveal
   ======================================== */
(function () {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    reveals.forEach((el) => observer.observe(el));
})();

/* ========================================
   Navbar Scroll Behavior
   ======================================== */
(function () {
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('hero');
    let ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrolled = window.scrollY > 60;
            navbar.classList.toggle('scrolled', scrolled);
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Active nav link highlighting
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        link.classList.toggle(
                            'active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        },
        { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
})();

/* ========================================
   Mobile Navigation Toggle
   ======================================== */
(function () {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    const links = document.querySelectorAll('.nav-link');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.setAttribute(
            'aria-expanded',
            menu.classList.contains('open')
        );
    });

    // Close menu on link click
    links.forEach((link) => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('open');
        }
    });
})();

/* ========================================
   Counter Animation (About section stats)
   ======================================== */
(function () {
    const counters = document.querySelectorAll('.highlight-number[data-count]');
    let animated = false;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    counters.forEach((counter) => {
                        const target = parseInt(counter.dataset.count, 10);
                        const duration = 1200;
                        const start = performance.now();

                        function tick(now) {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease out cubic
                            const eased = 1 - Math.pow(1 - progress, 3);
                            counter.textContent = Math.round(eased * target);
                            if (progress < 1) {
                                requestAnimationFrame(tick);
                            }
                        }

                        requestAnimationFrame(tick);
                    });
                }
            });
        },
        { threshold: 0.3 }
    );

    const highlightSection = document.querySelector('.about-highlights');
    if (highlightSection) observer.observe(highlightSection);
})();

/* ========================================
   Smooth scroll for anchor links
   (fallback for browsers without CSS smooth)
   ======================================== */
(function () {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const navHeight = document.getElementById('navbar').offsetHeight;
            const top =
                target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
})();
