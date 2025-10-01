document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.querySelector('.menu-icon');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;
  let isMenuOpen = false;

  // Check if elements exist
  if (!menuIcon || !dropdownMenu || !header) {
    console.error('Hamburger menu elements not found!');
    console.log('menuIcon:', menuIcon);
    console.log('dropdownMenu:', dropdownMenu);
    console.log('header:', header);
    return;
  }

  console.log('Hamburger menu elements found, initializing...');
  console.log('Menu icon classes:', menuIcon.className);
  console.log('Dropdown menu classes:', dropdownMenu.className);

  // Get menu links after DOM is loaded
  const getMenuLinks = () => dropdownMenu.querySelectorAll('a');

  // Function to toggle menu state
  const toggleMenu = (open) => {
    console.log('toggleMenu called with:', open);
    console.log('isMenuOpen was:', isMenuOpen);

    isMenuOpen = open;
    dropdownMenu.classList.toggle('active', open);
    menuIcon.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';

    console.log('Menu is now:', isMenuOpen ? 'open' : 'closed');
    console.log('dropdown-menu has active class:', dropdownMenu.classList.contains('active'));

    if (open) {
      // Focus first menu item when opening
      const menuLinks = getMenuLinks();
      console.log('Found menu links:', menuLinks.length);
      menuLinks[0]?.focus();
    }
  };

  // Toggle mobile menu
  menuIcon.addEventListener('click', (e) => {
    console.log('Menu icon clicked!');
    e.preventDefault();
    e.stopPropagation();
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
      case 'Escape': {
        toggleMenu(false);
        menuIcon.focus();
        break;
      }
      case 'Tab': {
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
      default: {
        // Handle any other keys if needed
        break;
      }
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
