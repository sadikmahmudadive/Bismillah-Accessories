"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const particlesContainer = containerRef.current;
    const particleCount = 15; // Slightly reduced for mobile performance
    
    // Create particles with a slight delay or idle callback to improve FCP/LCP
    const initParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        createParticle();
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initParticles());
    } else {
      setTimeout(initParticles, 2000);
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size (small)
        const size = Math.random() * 3 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Initial position
        resetParticle(particle);
        
        particlesContainer.appendChild(particle);
        
        // Animate
        animateParticle(particle);
    }
    
    function resetParticle(particle: HTMLDivElement) {
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.opacity = '0';
        
        return {
            x: posX,
            y: posY
        };
    }
    
    function animateParticle(particle: HTMLDivElement) {
        // Initial position
        const pos = resetParticle(particle);
        
        // Random animation properties
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        // Animate with GSAP-like timing
        setTimeout(() => {
            if (!particlesContainer.contains(particle)) return;
            particle.style.transition = `transform ${duration}s linear, opacity ${duration}s linear`;
            particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
            
            // Move in a slight direction using transform for performance
            const moveX = (Math.random() * 20 - 10);
            const moveY = - Math.random() * 30; // Move upwards
            
            particle.style.transform = `translate(${moveX}vw, ${moveY}vh)`;
            
            // Reset after animation completes
            setTimeout(() => {
                if (particlesContainer.contains(particle)) {
                  particle.style.transition = 'none';
                  particle.style.transform = 'translate(0,0)';
                  animateParticle(particle);
                }
            }, duration * 1000);
        }, delay * 1000);
    }
    
    // Mouse interaction with throttling and cached dimensions
    let lastTime = 0;
    const throttleDelay = 60; // ms
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
        const now = Date.now();
        
        // Update CSS variables for spheres (efficient)
        const moveX = (e.clientX / width - 0.5) * 50;
        const moveY = (e.clientY / height - 0.5) * 50;
        particlesContainer.style.setProperty('--mouse-x', `${moveX}px`);
        particlesContainer.style.setProperty('--mouse-y', `${moveY}px`);

        if (now - lastTime < throttleDelay) return;
        lastTime = now;
        
        const mouseX = (e.clientX / width) * 100;
        const mouseY = (e.clientY / height) * 100;
        
        requestAnimationFrame(() => {
          const particle = document.createElement('div');
          particle.className = 'particle';
          
          const size = Math.random() * 4 + 2;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${mouseX}%`;
          particle.style.top = `${mouseY}%`;
          particle.style.opacity = '0.4';
          
          particlesContainer.appendChild(particle);
          
          // Animate and remove
          setTimeout(() => {
              if (!particlesContainer.contains(particle)) return;
              particle.style.transition = 'all 1.5s ease-out';
              particle.style.transform = `translate(${(Math.random() * 60 - 30)}px, ${(Math.random() * 60 - 30)}px)`;
              particle.style.opacity = '0';
              
              setTimeout(() => {
                  if (particlesContainer.contains(particle)) {
                    particle.remove();
                  }
              }, 1500);
          }, 10);
        });
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (particlesContainer) {
        particlesContainer.innerHTML = ''; // Cleanup particles
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#fdfdfc]">
      {/* Container for particles */}
      <div 
        id="particles-container" 
        ref={containerRef} 
        className="absolute inset-0 pointer-events-none"
      />

      {/* Required CSS for the dynamically injected particles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .particle {
          position: absolute;
          border-radius: 50%;
          background-color: #2f9e74;
          pointer-events: none;
        }
        
        /* Optimized hardware-accelerated animations using transforms */
        @keyframes float1 {
          0%, 100% { transform: translate(-10%, -10%); }
          25% { transform: translate(-5%, -15%); }
          50% { transform: translate(0%, -10%); }
          75% { transform: translate(-15%, -5%); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0%, 40%); }
          33% { transform: translate(5%, 35%); }
          66% { transform: translate(-5%, 45%); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(20%, 80%); }
          50% { transform: translate(25%, 85%); }
        }
      `}} />

      {/* Using transform-based float animations */}
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'float1 25s infinite ease-in-out', willChange: 'transform' }}>
        <div className="gradient-sphere absolute h-[60vh] w-[60vw] rounded-full bg-[#2f9e74] opacity-[0.07] blur-[100px] transition-transform duration-500 ease-out will-change-transform" style={{ transform: 'translate(var(--mouse-x, 0px), var(--mouse-y, 0px))' }} />
      </div>
      
      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'float2 30s infinite ease-in-out', willChange: 'transform' }}>
        <div className="gradient-sphere absolute h-[70vh] w-[50vw] rounded-full bg-[#b8860b] opacity-[0.06] blur-[120px] transition-transform duration-500 ease-out will-change-transform" style={{ transform: 'translate(var(--mouse-x, 0px), var(--mouse-y, 0px))' }} />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ animation: 'float3 20s infinite ease-in-out', willChange: 'transform' }}>
        <div className="gradient-sphere absolute h-[50vh] w-[40vw] rounded-full bg-[#3b82f6] opacity-[0.04] blur-[100px] transition-transform duration-500 ease-out will-change-transform" style={{ transform: 'translate(var(--mouse-x, 0px), var(--mouse-y, 0px))' }} />
      </div>

      {/* Very Subtle Noise Overlay for premium matte feel */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
