// When the user scrolls the page, execute myFunction
window.onscroll = function() {updateSticky()};

// Get the navtab
var navtab = document.getElementsByClassName("navtab")[0];

// Get the offset position of the navtab
var sticky = navtab.offsetTop;

// Add the sticky class to the navtab when you reach its scroll position. Remove "sticky" when you leave the scroll position
function updateSticky()  {
  if (window.pageYOffset >= sticky) {
    navtab.classList.add("sticky")
  } else {
    navtab.classList.remove("sticky");
  }
}