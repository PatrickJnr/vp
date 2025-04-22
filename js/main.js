document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.querySelector('.menu-icon');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const header = document.querySelector('.site-header');
  const menuLinks = dropdownMenu.querySelectorAll('a');
  let lastScrollY = window.scrollY;
  let isMenuOpen = false;

  // Function to toggle menu state
  const toggleMenu = (open) => {
    isMenuOpen = open;
    dropdownMenu.classList.toggle('active', open);
    menuIcon.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    
    if (open) {
      // Focus first menu item when opening
      menuLinks[0]?.focus();
    }
  };

  // Toggle mobile menu
  menuIcon.addEventListener('click', () => {
    toggleMenu(!isMenuOpen);
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && isMenuOpen) {
      toggleMenu(false);
    }
  });

  // Handle keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isMenuOpen) return;

    switch (e.key) {
      case 'Escape':
        toggleMenu(false);
        menuIcon.focus();
        break;
      case 'Tab':
        // Get all focusable elements in the menu
        const focusableElements = dropdownMenu.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // If shift+tab on first element, focus last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // If tab on last element, focus first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
        break;
    }
  });

  // Handle touch events
  let touchStartY = 0;
  dropdownMenu.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  dropdownMenu.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY;

    // If scrolled to top and pulling down, or scrolled to bottom and pulling up
    if ((dropdownMenu.scrollTop === 0 && touchDiff > 0) ||
        (dropdownMenu.scrollHeight - dropdownMenu.scrollTop === dropdownMenu.clientHeight && touchDiff < 0)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Handle scroll behavior
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Add shadow when scrolled
    if (currentScrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Auto-hide header when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isMenuOpen) {
      toggleMenu(false);
    }
  });
}); 