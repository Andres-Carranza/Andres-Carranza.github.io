//Show menu when you click toggle button

const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navBarLinks = document.getElementsByClassName('navbar-links')[0];

toggleButton.addEventListener('click', () => {
  console.log(navBarLinks);
  navBarLinks.classList.toggle('active');
});