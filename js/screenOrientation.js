//window.orientation supported in iphones and almost all browsers

window.addEventListener('orientationchange', checkOrientationChange);

function checkOrientationChange()
{
  let screenOrientation = window.orientation;
  switch(screenOrientation){
    case 0: console.log('you are in portrait-primary mode');
      break;
    case 90: goFullScreen();
      break;
    case 180: goFullScreen();
      break;
    case 270: goFullScreen();
      break;
    default: console.log('implementation of screen orientation');
  }
}

// function to request full screen of device browser

function goFullScreen () {
var elem = document.getElementById("myContent");
  if (elem.requestFullscreen) {
    elem.requestFullscreen().then(data=> {
    lockScreenOrientation();
    }, err => {
    console.log('no');
    });
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen().then(data=> {
    lockScreenOrientation();
    }, err => {
    console.log('Full Screen request failed');
    });
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen().then(data=> {
    lockScreenOrientation();
    }, err => {
    console.log('Full Screen request failed');
    });
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen().then(data=> {
    lockScreenOrientation();
    }, err => {
    console.log('Full Screen request failed');
    });
  }
}

//function to lock the screen. in this case the screen will be locked in portrait-primary mode.

function lockScreenOrientation () {
        screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;

    if (screen.lockOrientationUniversal("landscape-primary")) {
      // Orientation was locked
    } else {
      // Orientation lock failed
}
}
