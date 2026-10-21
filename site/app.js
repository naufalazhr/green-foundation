/* GREEN Foundation — interaksi ringan tanpa dependensi */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('siteHeader');
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');
  var yearEl = document.getElementById('year');
  var mobileQuery = window.matchMedia('(max-width: 980px)');
  var formatters = {};

  /* Tahun berjalan di footer */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Status header saat halaman digulir */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  function closeMenu() {
    if (!header || !navToggle) return;
    header.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Buka menu');
    document.body.classList.remove('no-scroll');
  }

  function openMenu() {
    if (!header || !navToggle) return;
    header.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Tutup menu');
    document.body.classList.add('no-scroll');
  }

  if (navToggle && header) {
    navToggle.addEventListener('click', function () {
      if (header.classList.contains('menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (navLinks) {
      navLinks.addEventListener('click', function (event) {
        if (event.target.closest('a')) closeMenu();
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (event) {
      if (!header.classList.contains('menu-open')) return;
      if (!header.contains(event.target)) closeMenu();
    });

    var onBreakpoint = function (event) {
      if (!event.matches) closeMenu();
    };
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onBreakpoint);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(onBreakpoint);
    }
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Counter animasi */
  function getFormatter(decimals) {
    if (!formatters[decimals]) {
      formatters[decimals] = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    return formatters[decimals];
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) return;

    var format = getFormatter(decimals);

    if (reduceMotion) {
      el.textContent = format.format(target);
      return;
    }

    var duration = 1500;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format.format(target * eased);
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = format.format(target);
      }
    }

    window.requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* Penanda tautan navigasi aktif */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  var sections = links
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.length > 1 ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
