LocationOverlay.prototype = new google.maps.OverlayView();

function LocationOverlay(map) {
  this.map_ = map;
  this.div_ = null;
  this.location_ = null;
  this.accuracy_ = null;
  this.setMap(map);
}

LocationOverlay.prototype.onAdd = function() {
  this.div_ = document.getElementById('location_overlay')

  var div = document.createElement('div');
  div.className = 'widget-mylocation-map-effect-holder';
  div.style.border = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';


  var div2 = document.createElement('div');
  div2.className = 'widget-mylocation-map-effect'

  var div3 = document.createElement('div');
  div3.className = 'widget-mylocation-map-effect-pulse'

  div.appendChild(div2);
  div.appendChild(div3);
  this.div_ = div;

  var panes = this.getPanes();
  panes.overlayImage.appendChild(this.div_);
};

LocationOverlay.prototype.updateLocation = function(location, accuracy) {
  this.location_ = location;
  this.accuracy_ = accuracy;
  this.draw();
}

LocationOverlay.prototype.draw = function() {
  if(this.location_ !== null) {
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.location_);
    var div = this.div_;
    div.style.left = (position.x) + 'px';
    div.style.top = (position.y) + 'px';

    var circle = new google.maps.Circle({
      center: this.location_,
      radius: this.accuracy_,
      map: this.map,
      fillOpacity: 0,
      strokeOpacity: 0
    });

    var length = Math.abs(overlayProjection.fromLatLngToDivPixel(circle.getBounds().getSouthWest()).x - overlayProjection.fromLatLngToDivPixel(circle.getBounds().getNorthEast()).x);

    var dot = this.div_.childNodes[0];
    dot.style.left = '-6.5px';
    dot.style.top = '-6.5px';
    dot.style.position = 'absolute';

    var pulse = this.div_.childNodes[1];
    pulse.style.width = length + 'px';
    pulse.style.height = length + 'px';
    pulse.style.borderRadius = length + 'px';
    pulse.style.left = -length / 2.0 + 'px';
    pulse.style.top = -length / 2.0 + 'px';

    this.map_.panTo(circle.getCenter());
  }
};

LocationOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
};


LocationOverlay.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.visibility = 'hidden';
  }
};

LocationOverlay.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = 'visible';
  }
};

LocationOverlay.prototype.toggle = function() {
  if (this.div_) {
    if (this.div_.style.visibility == 'hidden') {
      this.show();
    } else {
      this.hide();
    }
  }
};

// Detach the map from the DOM via toggleDOM().
// Note that if we later reattach the map, it will be visible again,
// because the containing <div> is recreated in the overlay's onAdd() method.
LocationOverlay.prototype.toggleDOM = function() {
  if (this.getMap()) {
    // Note: setMap(null) calls OverlayView.onRemove()
    this.setMap(null);
  } else {
    this.setMap(this.map_);
  }
};

