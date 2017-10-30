//selected locations to providing information
var places = [{
        title: 'Sahara Mall',
        location: {
            lat: 24.738611,
            lng: 46.682778
        }
    },
    {
        title: 'Granada Center',
        location: {
            lat: 24.71167,
            lng: 46.72417
        }
    },
    {
        title: 'Kingdom Centre',
        location: {
            lat: 24.711389,
            lng: 46.674444
        }
    },
    {
        title: 'Al Faisaliyah Center',
        location: {
            lat: 24.69554,
            lng: 46.68502
        }
    },
    {
        title: 'Centria Mall',
        location: {
            lat: 24.69727,
            lng: 46.68397
        }
    },

];

var map,
    largeInfowindow;
var markers = [];

// Initialize google map API and Determine lat/lng of area

function initMap() {
    var myLatLng = {
        lat: 24.716667,
        lng: 46.633333
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: myLatLng
    });


    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    //create a marker for every location

    for (var x = 0; x < places.length; x++) {
        var markPos = places[x].location;
        var title = places[x].title;
        var marker = new google.maps.Marker({
            position: markPos,
            map: map,
            icon: MarkerPin.image,
            shape: MarkerPin.shape,
            title: title,
        });
        markers.push(marker);
        // Animation icons when clicked
        marker.addListener('click', mAnimation);
        //for each marker, extend the boundaries of the map
        bounds.extend(marker.position);
        // when clicked on the marker , thus open infowindow
        marker.addListener('click', clickMarker);

    }

    function mAnimation() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
        bounceMarker(this);
    }

    function clickMarker() {
        populateInfoWindow(this, largeInfowindow);
    }

    ko.applyBindings(new VieModel());

    map.fitBounds(bounds);
}

// function to Animation 

function bounceMarker(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 2000);
    }
}

// function to open infowindow for more info

function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;

        // wikipedia url to more info
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

        $.ajax({
                url: wikiUrl,
                dataType: "jsonp"
            })
            .done(function(response) {
                var article = response[3][0];
                infowindow.setContent('<div><h3>' + marker.title + '</h3><a href="' + article + '" target="blank" style="display: block;">Click here for more info</a></div>');
                infowindow.open(map, marker);
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            })
            .fail(function() {
                alert("An Error Occured");
            });
    }
}


// make icons of marker for location

var MarkerPin = function() {
    if (window.google && window.google.maps) {
        image: {
            url = 'img/marker-50.png',
            size = new google.maps.Size(14, 30),
            origin = new google.maps.Point(0, 0),
            anchor = new google.maps.Point(6, 28)
        }
        shape: {
            coords = [1, 1, 13, 1, 13, 29, 1, 29],
            type = 'poly'
        }
    }
};

// show, hide options-box by click on humbrger

var menu = document.querySelector('#menu');
var map = document.querySelector('#map');
var box = document.querySelector('.options-box');

menu.addEventListener('click', function(e) {
    box.classList.toggle('close');
    e.stopPropagation();
});



var VieModel = function() {
    var that = this;

    that.locationList = ko.observableArray(places);

    that.locationList().forEach(function(location, place) {
        location.marker = markers[place];
    });

    // used to filter the list and marker of locations shown.
    that.query = ko.observable('');
    that.filterLocations = ko.computed(function() {
        console.log(location);
        return ko.utils.arrayFilter(that.locationList(), function(location) {
            console.log(location);
            if (location.title.toLowerCase().indexOf(that.query().toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                return true;
            } else {
                location.marker.setVisible(false);
                largeInfowindow.close();
                return false;
            }
        });
    }, that);

    // when clicked list, marker will do animation and open infowindow
    that.clickMarker = function(loc) {
        var markerId = loc.markerId;
        google.maps.event.trigger(loc.marker, "click");
    };

    that.listToggle = function() {
        if (that.open()) {
            that.open(false);
        } else {
            that.open(true);
        }
    };
};

// functino to pop alert when map not work
var mapError = function() {
    alert('404 Error Not Found');
};