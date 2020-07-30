
function is_iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
//Fix bakcgorund attachment bug on mobile(occurs on safari on mobile)
var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
var fixed_backgrounds = ['overview-wrapper','sustainability','passenger','innovation']
  if (isSafari && is_iOS()){
      for ( var i =0; i<fixed_backgrounds.length; i++){
      background =document.getElementsByClassName(fixed_backgrounds[i])
      if(background.length > 0)
        background[0].style.backgroundAttachment='initial'
      }
}