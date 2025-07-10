
import { gsap } from 'gsap';

const categories = [
  "all",
  "bastardz",
  "photography",
  "custom",
  "painting",
  "illustration",
  "video"
];

// Create dynamic structure for the categories menu
const categoryMenu = document.querySelector('.category-menu');

categories.forEach((category) => {
  const menuItem = document.createElement('button');
  menuItem.classList.add('category-item');
  menuItem.innerHTML = category;

  menuItem.addEventListener('mouseenter', () => {
    gsap.to(menuItem, { scale: 1.1, ease: "power3.out" });
    // Optionally: add miniatures effect for each category
  });

  menuItem.addEventListener('mouseleave', () => {
    gsap.to(menuItem, { scale: 1, ease: "power3.out" });
  });

  menuItem.addEventListener('click', () => {
    window.location.href = `/project/${category}`;
  });

  categoryMenu.appendChild(menuItem);
});

// Initial setup to ensure animations are ready
gsap.set(".category-item", { opacity: 0 });
gsap.to(".category-item", { opacity: 1, duration: 0.8, stagger: 0.2 });
