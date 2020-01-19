var element = document.getElementById('forceMe');
var forceValueOutput = document.getElementById('forceValue');
var background = document.getElementById('background');
var touch = null;
var forceValue = 0;

function onTouchStart(e) {
  e.preventDefault();
  checkForce(e);
}

function onTouchMove(e) {
  e.preventDefault();
  checkForce(e);
}

function onTouchEnd(e) {
  e.preventDefault();
  setTimeout(renderElement.bind(null, 0), 10);
  touch = null;
}

// use timeout-based method only on devices lower than iOS 10
function checkForce(e) {
  if(getiOSVersion() < 10) {
    touch = e.touches[0];
    setTimeout(refreshForceValue.bind(touch), 10);
  }
}

// the maximum force value of a touch event is 1
function onTouchForceChange(e) {
  forceValue = e.changedTouches[0].force; //ios10 fix
  renderElement(forceValue); // ios10

  // renderElement(e.changedTouches[0].force); // ios10
}

// the maximum force value of a click event is 3
function onClickForceChange(e) {
  renderElement(e.webkitForce / 3);
}

// iOS versions lower than iOS 10 do not support the touchforcechange event, so refresh manually
function refreshForceValue() {
  var touchEvent = this;
  var forceValue = 0;
  if(touchEvent) {
    forceValue = touchEvent.force || 0;
    setTimeout(refreshForceValue.bind(touch), 10);
  }else{
    forceValue = 0;
  }

  renderElement(forceValue); // ios < 10
}

// update the element according to the force value (between 0 and 1)
function renderElement(forceValue) {
  // element.style.webkitTransform = 'translateX(-50%) translateY(-50%) scale(' + (1 + forceValue * 1.5) + ')';
  // background.style.webkitFilter = 'blur(' + forceValue * 30 + 'px)';
  
  forceValueOutput.innerHTML = 'Force: ' + forceValue.toFixed(4);
}

// add event listeners
function addForceTouchToElement(elem) {
  elem.addEventListener('touchstart', onTouchStart, false);
  elem.addEventListener('touchmove', onTouchMove, false);
  elem.addEventListener('touchend', onTouchEnd, false);
  elem.addEventListener('webkitmouseforcechanged', onClickForceChange, false);
  elem.addEventListener('touchforcechange', onTouchForceChange, false);
}

// get iOS version number
function getiOSVersion() {
  if(window.navigator.userAgent.match( /iP(hone|od|ad)/)){
    var iOSVersion = parseFloat(String(window.navigator.userAgent.match(/[0-9]*_[0-9]/)).split('_')[0]+'.'+String(window.navigator.userAgent.match(/[0-9]_[0-9]/)).split('_')[1]);
    return iOSVersion;
  }

  return false;
}


/* TOUCH FORCE LISTENERRRR !!! */
// addForceTouchToElement(element);
addForceTouchToElement(document.body);









// CANVAS
// get the canvas element and its context globally
var canvas = document.getElementById('sketchpad');
var context = canvas.getContext('2d');
window.addEventListener('load', function () {
    // NOTICE !
    alert("For best use, rotate phone to landscape");

    // HD
    context.canvas.width  = 4 * window.innerWidth;
    context.canvas.height = 4 * window.innerHeight; 
    // forceValueOutput.innerHTML = 'Force: ' + context.canvas.width ;
    context.lineCap = "round";
    context.lineWidth = 26;

  var drawer = {
      isDrawing: false,
      touchstart: function (coors) {
          context.beginPath();
          context.arc(4*coors.x, 4*coors.y, 50, 0, 2 * Math.PI);
          //context.moveTo(4*coors.x, 4*coors.y);
          context.fill();
          context.closePath();
          this.isDrawing = true;

      },
      touchmove: function (coors) {
          if (this.isDrawing) {
              //context.lineTo(4*coors.x, 4*coors.y);
              context.beginPath();
              context.arc(4*coors.x, 4*coors.y, 50, 0, 2 * Math.PI);
              context.fill();
              context.closePath();
          }
      },
      touchend: function (coors) {
          if (this.isDrawing) {
              this.touchmove(coors);
              this.isDrawing = false;
          }
      }
  };
  // create a function to pass touch events and coordinates to drawer
  function draw(event) { 
      var type = null;
      // map mouse events to touch events
      switch(event.type){
          case "mousedown":
                  event.touches = [];
                  event.touches[0] = { 
                      pageX: event.pageX,
                      pageY: event.pageY
                  };
                  type = "touchstart";                  
          break;
          case "mousemove":                
                  event.touches = [];
                  event.touches[0] = { 
                      pageX: event.pageX,
                      pageY: event.pageY
                  };
                  type = "touchmove";                
          break;
          case "mouseup":                
                  event.touches = [];
                  event.touches[0] = { 
                      pageX: event.pageX,
                      pageY: event.pageY
                  };
                  type = "touchend";
          break;
      }    
      
      // touchend clear the touches[0], so we need to use changedTouches[0]
      var coors;
      if(event.type === "touchend") {
          coors = {
              x: event.changedTouches[0].pageX,
              y: event.changedTouches[0].pageY
          };
      }
      else {
          // get the touch coordinates
          coors = {
              x: event.touches[0].pageX,
              y: event.touches[0].pageY
          };
      }
      type = type || event.type


      /* ** CHANGE THE COLOUR ** */
      // console.log( forceValue.toFixed(4) );
      context.strokeStyle = String( rainbow(forceValue.toFixed(4)) ) ;
      context.fillStyle   = String( rainbow(forceValue.toFixed(4)) ) ; // this is actually the color 

      // pass the coordinates to the appropriate handler
      drawer[type](coors);
  }
  
  // detect touch capabilities
  var touchAvailable = ('createTouch' in document) || ('ontouchstart' in window);
  
  // attach the touchstart, touchmove, touchend event listeners.
  if(touchAvailable){
      canvas.addEventListener('touchstart', draw, false);
      canvas.addEventListener('touchmove', draw, false);
      canvas.addEventListener('touchend', draw, false);        
  }    
  // attach the mousedown, mousemove, mouseup event listeners.
  else {
      canvas.addEventListener('mousedown', draw, false);
      canvas.addEventListener('mousemove', draw, false);
      canvas.addEventListener('mouseup', draw, false);
  }

  // prevent elastic scrolling
  document.body.addEventListener('touchmove', function (event) {
      event.preventDefault();
  }, false); // end body.onTouchMove

}, false); // end window.onLoad


// RESIZE sketchpad
window.addEventListener('resize', function () {
  // new widths and heights
  context.canvas.width  = 4 * window.innerWidth;
  context.canvas.height = 4 * window.innerHeight; 
  // re-establish settings 
  context.lineCap = "round";
  context.lineWidth = 26;
}, false);


// double
function rainbow(n) {
    n = n * 255 ;
    return 'hsl(' + n + ', 75%, 50%)';
}


