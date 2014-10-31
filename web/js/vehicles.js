// Global map variable
var map;

// Set the center as Firebase HQ
var locations = {
  "Pittsburgh": [40.440876, -79.9497555]
};

var center = locations["Pittsburgh"];
var pittsburgh_bounds = new google.maps.LatLngBounds(new google.maps.LatLng(40.323977, -80.291903), new google.maps.LatLng(40.540356, -79.616930))

// Query radius
var radiusInKm = 1.5;
var vehiclesInQuery = {};
var geoQueries = [];

function addFirebaseRef(url) {
  // Get a reference to the Firebase public transit open data set
  var transitFirebaseRef = new Firebase(url)

  // Create a new GeoFire instance, pulling data from the public transit data
  var geoFire = new GeoFire(transitFirebaseRef.child("_geofire"));

  // Create a new GeoQuery instance
  var geoQuery = geoFire.query({
    center: center,
    radius: radiusInKm
  });
  geoQueries.push(geoQuery);

  /* Adds new vehicle markers to the map when they enter the query */
  geoQuery.on("key_entered", function(vehicleId, vehicleLocation) {
    // Specify that the vehicle has entered this query
    dataset = vehicleId.split(":")[0];
    vehicleIdWithoutDataset = vehicleId.split(":")[1];
    vehiclesInQuery[vehicleId] = true;

    // Look up the vehicle's data in the Transit Open Data Set
    transitFirebaseRef.child(dataset).child("vehicles").child(vehicleIdWithoutDataset).once("value", function(dataSnapshot) {
      // Get the vehicle data from the Open Data Set
      vehicle = dataSnapshot.val();

      // If the vehicle has not already exited this query in the time it took to look up its data in the Open Data
      // Set, add it to the map
      if (vehicle !== null && vehiclesInQuery[vehicleId] === true) {
        // Add the vehicle to the list of vehicles in the query
        vehiclesInQuery[vehicleId] = vehicle;

        // Create a new marker for the vehicle
        vehicle.marker = createVehicleMarker(vehicle, getVehicleColor(vehicle));
      }
    });
  });

  /* Moves vehicles markers on the map when their location within the query changes */
  geoQuery.on("key_moved", function(vehicleId, vehicleLocation) {
    // Get the vehicle from the list of vehicles in the query
    var vehicle = vehiclesInQuery[vehicleId];

    // Animate the vehicle's marker
    if (typeof vehicle !== "undefined" && typeof vehicle.marker !== "undefined") {
      vehicle.marker.animatedMoveTo(vehicleLocation);
    }
  });

  /* Removes vehicle markers from the map when they exit the query */
  geoQuery.on("key_exited", function(vehicleId, vehicleLocation) {
    // Get the vehicle from the list of vehicles in the query
    var vehicle = vehiclesInQuery[vehicleId];

    // If the vehicle's data has already been loaded from the Open Data Set, remove its marker from the map
    if (vehicle !== true) {
      vehicle.marker.setMap(null);
    }

    // Remove the vehicle from the list of vehicles in the query
    delete vehiclesInQuery[vehicleId];
  });
}

addFirebaseRef("https://publicdata-transit.firebaseio.com/");
addFirebaseRef("https://alpire.firebaseio.com/");

/*****************/
/*  GOOGLE MAPS  */
/*****************/
var location_overlay;

/* Initializes Google Maps */
function initializeMap() {

  if(typeof(Storage) !== "undefined") {
    var saved_loc = localStorage['center']
    if(typeof saved_loc !== "undefined" && saved_loc !== null) {
      center = saved_loc.slice(1, saved_loc.length - 1).split(',')
    }
  }

  // Get the location as a Google Maps latitude-longitude object
  var loc = new google.maps.LatLng(center[0], center[1]);

  if(!pittsburgh_bounds.contains(loc)) {
    loc = locations["Pittsburgh"];
  }

  // Create the Google Map
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: loc,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false
  });
  location_overlay = new LocationOverlay(map);

  var adUnitDiv = document.createElement('div');
  var ad = new google.maps.adsense.AdUnit(adUnitDiv, {publisherId: 'pub-2798335580942131', map: map, 'format': google.maps.adsense.AdFormat.LARGE_HORIZONTAL_LINK_UNIT, visible: true, position: google.maps.ControlPosition.TOP_CENTER});

  var updateCriteria = _.debounce(function() {
    var bounds = map.getBounds();
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("center", bounds.getCenter());
    }
    var criteria = {
      center: [bounds.getCenter().lat(), bounds.getCenter().lng()],
      radius: Math.min(getDistance(bounds.getNorthEast(), bounds.getSouthWest()) / 2 / 1000, 25)
    };
    for(geoQuery in geoQueries) {
      geoQueries[geoQuery].updateCriteria(criteria);
    }
  }, 10);

  google.maps.event.addListener(map, "bounds_changed", updateCriteria);
  google.maps.event.addDomListener(document.getElementById('mylocation'), 'click', function() {
    icon = this.childNodes[1];
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        icon.className = icon.className + ' widget-mylocation-button-blue'
        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(pos);
        location_overlay.updateLocation(pos, position.coords.accuracy);
        location_overlay.show(pos);
      });
    }
  });
}

/**********************/
/*  HELPER FUNCTIONS  */
/**********************/
/* Adds a marker for the inputted vehicle to the map */
function createVehicleMarker(vehicle, vehicleColor) {
  var icon_url;
  if(typeof vehicle.vtype !== "undefined") {
    icon_url = "https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=" + vehicle.vtype + "|bbT|" + vehicle.routeTag + "|" + vehicleColor + "|eee";
  } else {
    icon_url = "https://chart.googleapis.com/chart?chst=d_bubble_text_small&chld=bbT|" + vehicle.routeTag + "|" + vehicleColor + "|eee";
  }
  var marker = new google.maps.Marker({
    icon: icon_url,
    position: new google.maps.LatLng(vehicle.lat, vehicle.lon),
    optimized: true,
    map: map
  });

  return marker;
}

function getVehicleColor(vehicle) {
  return getColor(vehicle.routeTag);
}

/* Returns true if the two inputted coordinates are approximately equivalent */
function coordinatesAreEquivalent(coord1, coord2) {
  return (Math.abs(coord1 - coord2) < 0.000001);
}

/* Animates the Marker class (based on https://stackoverflow.com/a/10906464) */
google.maps.Marker.prototype.animatedMoveTo = function(newLocation) {
  var toLat = newLocation[0];
  var toLng = newLocation[1];

  var fromLat = this.getPosition().lat();
  var fromLng = this.getPosition().lng();

  if (!coordinatesAreEquivalent(fromLat, toLat) || !coordinatesAreEquivalent(fromLng, toLng)) {
    var percent = 0;
    var latDistance = toLat - fromLat;
    var lngDistance = toLng - fromLng;
    var interval = window.setInterval(function () {
      percent += 0.01;
      var curLat = fromLat + (percent * latDistance);
      var curLng = fromLng + (percent * lngDistance);
      var pos = new google.maps.LatLng(curLat, curLng);
      this.setPosition(pos);
      if (percent >= 1) {
        window.clearInterval(interval);
      }
    }.bind(this), 50);
  }
};

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};
