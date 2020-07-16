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

function changeNavtabActive (id) {
  if (document.getElementsByClassName('active-navtab-link').length) 
    old_active = document.getElementsByClassName('active-navtab-link')[0].classList.remove('active-navtab-link');

  active = document.getElementById(id);
 
  if( active != null)
    active.classList.add('active-navtab-link')
}

window.addEventListener("scroll", function() {
  var overviews = document.getElementsByClassName("sections")[0].children;
  for (var i = overviews.length -1 ; i>=0; i--){
    if (window.scrollY > overviews[i].offsetTop - document.getElementsByClassName('navtab')[0].offsetHeight ) {
      changeNavtabActive(overviews[i].id.replace('section', 'tab'));
      return;
    }
  }
  changeNavtabActive('none');
});

