var height = document.getElementsByClassName('timeline-content')[0].offsetHeight - 125 * 2
document.getElementsByClassName('vl')[0].style.height = height+'px'


function goTo(id){
  window.scrollTo(0,document.getElementById(id).offsetTop - 180)
}

// Get the timeline
var timeline = document.getElementsByClassName("timeline")[0];

// Get the offset position of the navtab
var sticky = timeline.offsetTop;

// Add the sticky class to the navtab when you reach its scroll position. Remove "sticky" when you leave the scroll position
function updateSticky()  {
  if (window.pageYOffset >= sticky) {
    timeline.classList.add("sticky")
  } else {
    timeline.classList.remove("sticky");
  }
}


function changeActive (id) {
    if (document.getElementsByClassName('active').length) 
      document.getElementsByClassName('active')[0].classList.remove('active');
  
    active = document.getElementById(id);
    if( active != null)
      active.classList.add('active')
  }

window.addEventListener('scroll', function () {
    updateSticky()

    var content = document.getElementsByClassName('timeline-content')[0]
    var pos = -1;
    var relPos = window.scrollY + 190
    var sections = document.getElementsByClassName('section')

    for (var i = sections.length -1 ; i>=0; i--){
        if ( relPos> sections[i].offsetTop  ) {
          pos = i;
          changeActive(i);
          break;
        }
        if(i == 0 )
            changeActive('none')
    }

    var width = 0
    var line_width = 0

    var ticks = document.querySelectorAll('._1,._2')

    Array.from(ticks).forEach( function (element, index) {
        if( index  < pos){
            width+= element.offsetWidth
        }
        else if (index == pos){
            width += element.offsetWidth / 2
            if(index == 5){
                line_width = ticks[index].offsetWidth /2
            }
        }
       else if(index - 1 == pos){
            if(index == 0 )
                line_width = ticks[index].offsetWidth /2
            else{
                line_width = ticks[index].offsetWidth /2 + ticks[index-1].offsetWidth / 2
            }
        }
    })

    var secPos = [content.offsetTop]

    Array.from(sections).forEach(element =>{
        secPos.push(element.offsetTop)
    })

    secPos.push(content.offsetTop + content.offsetHeight)

    var progress = 0

    progress = (relPos - secPos[pos + 1]) / (secPos[pos+2] - secPos[pos+1])

    progress = Math.max(progress, 0)

    var progressBar = document.getElementsByClassName('progress-bar')[0]


    progressBar.style.width = width + line_width * progress +'px'
})