var height = document.getElementsByClassName('timeline-content')[0].offsetHeight - 125 * 2
document.getElementsByClassName('vl')[0].style.height = height+'px'


// Get the timeline
var timeline = document.getElementsByClassName("timeline")[0];

// Get the offset position of the navtab
var sticky = timeline.offsetTop;

// Add the sticky class to the navtab when you reach its scroll position. Remove "sticky" when you leave the scroll position
function updateSticky()  {
  if (window.pageYOffset >= sticky) {
    timline.classList.add("sticky")
  } else {
    timeline.classList.remove("sticky");
  }
}


window.addEventListener('scroll', function () {
    content = document.getElementsByClassName('timeline-content')[0]
    lineWidth = document.getElementsByClassName('ul')[0].offsetWidth
    pos = 0;

    sections = document.getElementsByClassName('section')

    for (var i = sections.length -1 ; i>=0; i--){
        if (window.scrollY + window.innerHeight / 2 > sections[i].offsetTop  ) {
          pos = i + 1;
          break;
        }
    }

    console.log(pos * lineWidth / 6 +'px')

    document.getElementsByClassName('progress-bar')[0].style.width = pos * lineWidth / 6 +'px'
})