document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Smooth Scrolling (Lenis) --- */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* --- Parallax Floating Accents & Nav Email Fade --- */
    const parallaxAccents = document.querySelectorAll('.parallax-accent');
    const navEmail = document.querySelector('.nav-email');
    lenis.on('scroll', (e) => {
        const scrollY = e.animatedScroll || window.scrollY;
        parallaxAccents.forEach(accent => {
            const speed = accent.getAttribute('data-speed');
            accent.style.transform = `translateY(${scrollY * speed}px)`;
        });

        // Fade out nav-email as we scroll down to avoid text overlap
        if (navEmail) {
            const opacity = Math.max(0, 1 - (scrollY / 300));
            navEmail.style.opacity = opacity;
            navEmail.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        }
    });
    /* --- 1. Custom Cursor Implementation --- */
    const cursor = document.getElementById('cursor');
    // Select links, buttons, draggables AND all text elements (h1, h2, p, span, captions)
    const interactiveElements = document.querySelectorAll('a, button, .draggable, h1, h2, p, span, .polaroid-caption');

    document.addEventListener('mousemove', (e) => {
        // Use 3D transform for hardware acceleration to eliminate all cursor lag
        cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    });

    // Add visual feedback when hovering over links or buttons
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    /* --- 1.5 Magnetic Interactivity --- */
    const magneticElements = document.querySelectorAll('.nav-links a, .nav-email, .hand-drawn-link');
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none';
        });
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const h = rect.width / 2;
            const v = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - v;
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.transform = `translate(0px, 0px)`;
        });
    });

    /* --- 2. Draggable Polaroid in Footer --- */
    const draggable = document.getElementById('draggable-polaroid');
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    draggable.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        draggable.style.cursor = 'grabbing';
        cursor.style.display = 'none'; // hide custom cursor during drag
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        currentX = e.clientX - startX;
        currentY = e.clientY - startY;

        // Apply a slight extra rotation when dragging for physical feel
        const dragRotation = currentX * 0.05 + 12; // Base rotation was 12deg
        draggable.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${dragRotation}deg) scale(1.1)`;
        draggable.style.zIndex = '1000';
    });

    document.addEventListener('mouseup', () => {
        if(isDragging) {
            isDragging = false;
            draggable.style.cursor = 'grab';
            draggable.style.transform = `translate(${currentX}px, ${currentY}px) rotate(12deg) scale(1)`;
            cursor.style.display = 'block'; // show custom cursor again
        }
    });

    /* --- 3. Scroll Reveal Animations (Intersection Observer) --- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it's a polaroid, we animate it
                if (entry.target.classList.contains('polaroid')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = `rotate(${entry.target.style.getPropertyValue('--rotation') || '0deg'}) scale(1)`;
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial state for polaroids to be animated in
    const polaroids = document.querySelectorAll('.project-polaroid');
    polaroids.forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'translateY(50px) rotate(0deg) scale(0.9)';
        p.style.transition = 'opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(p);
    });

    /* --- 3.5 3D Hover Tilt on Work Projects --- */
    polaroids.forEach(card => {
        card.addEventListener('mouseenter', () => {
             card.style.transition = 'transform 0.1s ease-out'; /* Interpolate mouse tracking smoothly */
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;
            
            const tiltX = percentY * -15; 
            const tiltY = percentX * 15; 
            
            const baseRotation = card.style.getPropertyValue('--rotation') || '0deg';
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05) rotate(${baseRotation})`;
            card.style.zIndex = '50';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            const baseRotation = card.style.getPropertyValue('--rotation') || '0deg';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) rotate(${baseRotation})`;
            card.style.zIndex = '1';
        });
    });

    /* --- 4. Page Transition Animation --- */
    const navLinks = document.querySelectorAll('.nav-links a, .trophy-link');
    const transitionOverlay = document.getElementById('page-transition');
    const transitionText = document.getElementById('transition-text');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#achievements-modal') return; // Bypass transition for modal
            
            e.preventDefault();
            
            // Start "unloading" (slide up from bottom)
            transitionOverlay.style.transition = 'top 0.8s cubic-bezier(0.77, 0, 0.175, 1)';
            transitionOverlay.classList.remove('exit');
            transitionOverlay.classList.add('active');
            let textToShow = link.textContent.replace('🏆', '').trim().toUpperCase();
            transitionText.textContent = textToShow.length > 15 ? 'LOADING' : textToShow;
            
            setTimeout(() => {
                transitionText.style.opacity = '1';
                transitionText.style.transform = 'translateY(0)';
            }, 400);

            setTimeout(() => {
                if (targetId.startsWith('#')) {
                    // Scroll to target while screen is covered
                    lenis.scrollTo(targetId, { immediate: true });
                    
                    // Start "loading" (slide text out)
                    transitionText.style.opacity = '0';
                    transitionText.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        // Slide overlay up to exit
                        transitionOverlay.classList.replace('active', 'exit');
                        
                        setTimeout(() => {
                            // Reset overlay to bottom secretly
                            transitionOverlay.style.transition = 'none';
                            transitionOverlay.classList.remove('exit');
                            transitionText.style.transform = 'translateY(20px)';
                            void transitionOverlay.offsetWidth;
                            transitionOverlay.style.transition = 'top 0.8s cubic-bezier(0.77, 0, 0.175, 1)';
                        }, 800); 
                    }, 200);
                } else {
                    // Go to completely new page!
                    window.location.href = targetId;
                }
            }, 1200); 
        });
    });

    /* --- 5. Interactive Bubble Mini-Game --- */
    const bubbleZone = document.getElementById('bubble-zone');
    if (bubbleZone) {
        const MAX_BUBBLES = 10;
        
        function createBubble() {
            // Wrapper controls the upward floating animation
            const wrapper = document.createElement('div');
            wrapper.className = 'interactive-bubble-wrapper';
            
            // Random physics properties
            const size = Math.random() * 50 + 50; // 50px to 100px so text fits
            const leftPos = Math.random() * 70; // 0% to 70% of zone width
            const floatDuration = Math.random() * 10 + 8; // 8s to 18s float speed
            const delay = Math.random() * 10; // Negative delay starts them mid-float
            
            wrapper.style.width = `${size}px`;
            wrapper.style.height = `${size}px`;
            wrapper.style.left = `${leftPos}%`;
            wrapper.style.animationDuration = `${floatDuration}s`;
            wrapper.style.animationDelay = `-${delay}s`; 
            
            // Core bubble
            const bubble = document.createElement('div');
            bubble.className = 'interactive-bubble';
            
            // Creative guidance: occasionally add "POP ME!" or "POP!" text
            if (size > 80 && Math.random() > 0.4) {
                bubble.innerHTML = "<span class='bubble-text'>POP ME!</span>";
            } else if (size > 60 && Math.random() > 0.7) {
                bubble.innerHTML = "<span class='bubble-text'>POP!</span>";
            }
            
            // Pop routine
            const popBubble = () => {
                if (bubble.classList.contains('popped')) return; 
                
                bubble.classList.add('popped');
                wrapper.style.animationPlayState = 'paused'; // Stop floating instantly
                
                // Add pop feedback to real cursor
                cursor.style.transform += ' scale(1.5)';
                setTimeout(() => { cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '') }, 100);
                
                // Wait for the scale/fade pop animation to finish, then recycle
                setTimeout(() => {
                    wrapper.remove(); 
                    createBubble(); // Spawn a new one to keep the count at 10
                }, 250); 
            };
            
            // Triggers - REMOVED mouseenter so it only pops when clicked!
            bubble.addEventListener('mousedown', popBubble);
            
            wrapper.appendChild(bubble);
            bubbleZone.appendChild(wrapper);
        }

        // Initial Seed
        for (let i = 0; i < MAX_BUBBLES; i++) {
            createBubble();
        }
    }

    /* --- 6. Resume Modal Logic --- */
    const resumeLinks = document.querySelectorAll('a[href*="esume.pdf"]');
    const resumeModal = document.getElementById('resume-modal');
    const closeBtn = document.getElementById('close-resume-btn');
    const backdrop = document.getElementById('close-resume-backdrop');

    if (resumeModal) {
        const toggleModal = (state, e) => {
            // Intercept only standard nav/footer links, not the actual modal download button
            if (e && e.preventDefault && !e.target.classList.contains('resume-download-btn')) {
                e.preventDefault();
            }
            if (state) {
                resumeModal.classList.add('active');
                document.body.style.overflow = 'hidden'; /* Basic lock for background */
            } else {
                resumeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        // Open modal on click
        resumeLinks.forEach(link => {
            if (!link.classList.contains('resume-download-btn')) { 
                link.addEventListener('click', (e) => toggleModal(true, e));
            }
        });

        // Close via multiple methods
        if (closeBtn) closeBtn.addEventListener('click', () => toggleModal(false));
        if (backdrop) backdrop.addEventListener('click', () => toggleModal(false));

        // Close on global Escape key tap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
                toggleModal(false);
            }
        });
    }

    /* --- 7. Achievements Modal Logic --- */
    const achievementsBtn = document.getElementById('open-achievements-btn');
    const achievementsModal = document.getElementById('achievements-modal');
    const closeAchievementsBtn = document.getElementById('close-achievements-btn');
    const achievementsBackdrop = document.getElementById('close-achievements-backdrop');

    if (achievementsModal && achievementsBtn) {
        const toggleAchievementsModal = (state, e) => {
            if (e && e.preventDefault) e.preventDefault();
            if (state) {
                achievementsModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                achievementsModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        achievementsBtn.addEventListener('click', (e) => toggleAchievementsModal(true, e));
        if (closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', () => toggleAchievementsModal(false));
        if (achievementsBackdrop) achievementsBackdrop.addEventListener('click', () => toggleAchievementsModal(false));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && achievementsModal.classList.contains('active')) {
                toggleAchievementsModal(false);
            }
        });
    }

    /* --- 8. Project Image Modal Logic --- */
    const projectPolaroids = document.querySelectorAll('.project-polaroid');
    const projectModal = document.getElementById('project-modal');
    const projectModalImg = document.getElementById('project-modal-img');
    const projectModalCaption = document.getElementById('project-modal-caption');
    const closeProjectBtn = document.getElementById('close-project-btn');
    const closeProjectBackdrop = document.getElementById('close-project-backdrop');

    if (projectModal && projectPolaroids.length > 0) {
        const toggleProjectModal = (state, imgSrc, captionText) => {
            if (state) {
                if (imgSrc.includes('url(')) {
                    // Extract URL to show actual image naturally without cutting it
                    const match = imgSrc.match(/url\(["']?([^"']+)["']?\)/);
                    if (match && match[1]) {
                        projectModalImg.src = match[1];
                        projectModalImg.style.backgroundImage = 'none';
                    }
                } else {
                    // Fallback for CSS gradients
                    projectModalImg.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Transparent 1x1
                    projectModalImg.style.backgroundImage = imgSrc;
                }
                
                if (projectModalCaption) projectModalCaption.textContent = captionText;
                
                projectModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                projectModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };

        projectPolaroids.forEach(polaroid => {
            polaroid.style.cursor = 'pointer';
            
            // Allow custom cursor interaction
            polaroid.addEventListener('mouseenter', () => document.getElementById('cursor').classList.add('hovering'));
            polaroid.addEventListener('mouseleave', () => document.getElementById('cursor').classList.remove('hovering'));
            
            polaroid.addEventListener('click', () => {
                const imgDiv = polaroid.querySelector('.polaroid-image');
                const captionDiv = polaroid.querySelector('.polaroid-caption');
                let imgSrc = imgDiv ? getComputedStyle(imgDiv).backgroundImage : '';
                
                if(imgSrc && imgSrc !== 'none') {
                    toggleProjectModal(true, imgSrc, captionDiv ? captionDiv.textContent : '');
                }
            });
        });

        // Add specific image-hovering cursor for the big modal image so it doesn't disappear due to blend-modes
        if (projectModalImg) {
            projectModalImg.addEventListener('mouseenter', () => document.getElementById('cursor').classList.add('image-hovering'));
            projectModalImg.addEventListener('mouseleave', () => document.getElementById('cursor').classList.remove('image-hovering'));
        }

        if (closeProjectBtn) closeProjectBtn.addEventListener('click', () => toggleProjectModal(false));
        if (closeProjectBackdrop) closeProjectBackdrop.addEventListener('click', () => toggleProjectModal(false));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                toggleProjectModal(false);
            }
        });
    }

});
