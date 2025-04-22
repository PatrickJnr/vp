document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.querySelector('.menu-icon');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  // Toggle mobile menu
  menuIcon.addEventListener('click', () => {
    dropdownMenu.classList.toggle('active');
    menuIcon.setAttribute('aria-expanded', dropdownMenu.classList.contains('active'));
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    }
  });

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
    if (window.innerWidth > 768 && dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active');
      menuIcon.setAttribute('aria-expanded', 'false');
    }
  });
}); 