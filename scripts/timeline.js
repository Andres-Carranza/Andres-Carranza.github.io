window.addEventListener("scroll", function() {
    var timelineContent = document.getElementsByClassName("timeline-content")[0];
    var overviews = timelineContent.children

    var pos = window.scrollY 
    var current = -1;

    for(i = overviews.length - 1; i >= 0; i--){
        if ( pos >  overviews[i].offsetTop){
            summary = overviews[i].getElementsByClassName('summary')[0]
            if(!summary.classList.contains('visible-summary')){
                summary.classList.add('visible-summary');
            }
            current = i;
            break;
        }
    }

    for(i = 0; i < overviews.length; i++){
        if (i != current) {
            summary = overviews[i].getElementsByClassName('summary')[0]
            if(summary.classList.contains('visible-summary')){
                summary.classList.remove('visible-summary');
            }
        }
    }


  });