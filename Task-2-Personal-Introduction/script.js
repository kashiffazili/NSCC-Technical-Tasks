// ============================================================
    // Personal Introduction Page — vanilla JavaScript
    // Concepts demonstrated (easy to explain in viva):
    // 1. DOM selection (getElementById, querySelectorAll)
    // 2. Event listeners (click, scroll)
    // 3. localStorage for theme persistence
    // 4. IntersectionObserver for scroll-reveal animations
    // 5. Responsive hamburger menu toggle
    // ============================================================

    (function () {
      'use strict';

      var THEME_KEY = 'kashif-theme'; // localStorage key

      var themeToggle = document.getElementById('themeToggle');
      var themeLabel = document.getElementById('themeLabel');
      var iconMoon = document.getElementById('iconMoon');
      var iconSun = document.getElementById('iconSun');
      var menuBtn = document.getElementById('menuBtn');
      var navLinks = document.getElementById('navLinks');
      var header = document.querySelector('header.nav');

      // ---------- Theme: apply + save ----------
      function applyTheme(theme) {
        // 1. Set theme on <html> so CSS variables switch instantly
        document.documentElement.setAttribute('data-theme', theme);

        // 2. Save choice so it survives page reload (theme persistence)
        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch (e) { /* private mode: ignore */ }

        // 3. Update button icon, label and accessibility state
        var isDark = theme === 'dark';
        iconMoon.style.display = isDark ? 'block' : 'none';
        iconSun.style.display = isDark ? 'none' : 'block';
        themeLabel.textContent = isDark ? 'Dark' : 'Light';
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggle.setAttribute('aria-pressed', String(!isDark));

        // Update browser chrome color on mobile
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', isDark ? '#05070f' : '#f5f7fd');
      }

      function getSavedTheme() {
        try {
          var saved = localStorage.getItem(THEME_KEY);
          if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) {}
        return 'dark'; // default theme is dark
      }

      // Initialise theme on load
      applyTheme(getSavedTheme());

      // Toggle on click
      themeToggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });

      // ---------- Mobile menu ----------
      function closeMenu() {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open menu');
      }

      menuBtn.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('open');
        menuBtn.classList.toggle('open', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      });

      // Close menu when a link is clicked (mobile UX)
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      // Close menu with Escape key (accessibility)
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      // ---------- Navbar shadow on scroll ----------
      function onScroll() {
        if (window.scrollY > 10) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // ---------- Scroll-reveal animations ----------
      var revealEls = document.querySelectorAll('.reveal');

      // If user prefers reduced motion, show everything immediately
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target); // animate once
            }
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { observer.observe(el); });
      }

      // ---------- Skill bars animate when visible ----------
      var bars = document.querySelectorAll('.skill-bar i');
      if ('IntersectionObserver' in window && !prefersReduced) {
        var barObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.width = entry.target.getAttribute('data-level') || '50%';
              barObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });
        bars.forEach(function (b) { barObserver.observe(b); });
      } else {
        bars.forEach(function (b) { b.style.width = b.getAttribute('data-level') || '50%'; });
      }

      // ---------- Highlight active nav link while scrolling ----------
      var sections = document.querySelectorAll('main section[id]');
      var navAnchors = document.querySelectorAll('.nav-links a');

      function setActive(id) {
        navAnchors.forEach(function (a) {
          var match = a.getAttribute('href') === '#' + id;
          if (match) a.classList.add('active');
          else a.classList.remove('active');
        });
      }

      if ('IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(function (s) { sectionObserver.observe(s); });
      }

      // ---------- Profile photo fallback ----------
  var profilePhoto = document.querySelector('.photo-inner img');
  var photoFallback = document.getElementById('photoFallback');
  if (profilePhoto && photoFallback) {
    profilePhoto.addEventListener('error', function () {
      profilePhoto.style.display = 'none';
      photoFallback.style.display = 'grid';
    });
  }

  // ---------- Footer year ----------
      document.getElementById('year').textContent = new Date().getFullYear();
    })();
