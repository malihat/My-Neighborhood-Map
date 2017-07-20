//Array of all locations
var locations = [{
        title: 'Empire State College',
        location: {
            lat: 40.8075,
            lng: -73.9626
        }
    },
    {
        title: 'New York University',
        location: {
            lat: 40.7287132,
            lng: -73.9959727
        }
    },
    {
        title: 'Pace University',
        location: {
            lat: 40.7114914,
            lng: -74.0051396
        }
    },
    {
        title: 'City University of New York',
        location: {
            lat: 40.8200,
            lng: -73.9493
        }
    },
    {
        title: 'New York Law School',
        location: {
            lat: 40.7180,
            lng: -74.0070
        }
    },
    {
        title: 'Baruch College',
        location: {
            lat: 40.7402778,
            lng: -73.9844444
        }
    },
    {
        title: 'Cooper Union',
        location: {
            lat: 40.7281,
            lng: -73.9916
        }
    },
    {
        title: 'Marymount Manhattan College',
        location: {
            lat: 40.7687,
            lng: -73.9597
        }
    },
    {
        title: 'Berkeley College',
        location: {
            lat: 40.7539,
            lng: -73.9796
        }
    }
];




//Animates the marker when the item from list or the marker is clicked
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}



var markers = [];
var map;
var infoWindows, center;

function initMap() {
    //Add styles to map
    var styles = [{
            featureType: 'water',
            stylers: [{
                color: '#76bac1'
            }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#8f78db'
            }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{
                color: '#17263c'
            }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{
                color: '#f4cca8'
            }]
        },
        {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [{
                color: '#e2cab5'
            }]
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#f7a34a'
            }]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{
                color: '#bc955e'
            }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#c4731d'
            }]
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#994318'
            }]
        },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#961803'
            }]
        },

        {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{
                color: '#7dc471'
            }]
        }
    ];

    //Creates Google map  
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7831,
            lng: -73.9712
        },
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    var bound = new google.maps.LatLngBounds();

    //Create markers on map
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            icon: 'images/map_marker.png',
            title: title,
            animation: google.maps.Animation.DROP
        });

        markers.push(marker);
        var mark = marker;
        locations[i].marker = marker;

        //Create infowindow
        infoWindows = new google.maps.InfoWindow();

        clicked(marker);

        responsive();

        bound.extend(marker.position);
    }

    //Creates infowindow and shows some information about that place from wikipedia when marker is clicked
    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {

            //AJAX request to Wikipedia 
            var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&prop=image&iiprop=url&format=json&callback=wikiCallback';
            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                success: function(response) {
                    var articleList = response;
                    infowindow.setContent('<div class="infoWin">' + '<strong>' + marker.title + '</strong>' + '<br>' + articleList[2][0] + '  ' + '<i>' + "(Wikipedia)" + '</i>' + '</div>');
                    infowindow.open(map, marker);
                    clearTimeout(wikiTimeOut);
                }
            });
            //Displays error message if wikipedia doesn't work
            var wikiTimeOut = setTimeout(function() {
                alert("Wikipedia Loading Error");
            }, 3000);
        }
        toggleBounce(marker);
    }
    map.fitBounds(bound);

    //Opens infowindow when marker clicked
    function clicked(marker) {
        marker.addListener('click', function() {
            populateInfoWindow(marker, infoWindows);
        });
    }

    //Makes map responsive
    function responsive() {
        google.maps.event.addDomListener(window, "resize", function() {
            center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });
    }

}

//Shows error message when google maps does not show.
function maptimeout() {
    var maptimeout = setTimeout(function() {
        $('#error').append('Failed to Load Google Map :(');
    }, 3000);
}

var Locs = function(data) {
    this.title = ko.observable(data.title);
    this.marker = ko.observable(data.marker);
    this.location = ko.observable(data.location);
};

var ViewModel = function() {

    var self = this;
    self.filter = ko.observable("");
    self.locList = ko.observableArray(locations);

    //Toggles the nav when hamburger icon is clicked
    self.disappear = ko.observable(false);
    self.toggleDisappear = function() {
        self.disappear(!self.disappear());
    };

    //Opens infowindow on the marker and animates the marker when list item clicked
    self.clicker = function(marker) {
        google.maps.event.trigger(this.marker, 'click');
    };

    //Filters the list and markers when entered on the search bar
    self.filteredItems = ko.computed(function() {
        var filter = self.filter().toLowerCase();

        if (!filter) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible();
            }
            return self.locList();
        } else {
            return ko.utils.arrayFilter(self.locList(), function(id) {
                var same = id.title.toLowerCase().indexOf(filter) > -1;
                id.marker.setVisible(same);
                return same;
            });
        }
    });

};

ko.applyBindings(new ViewModel());
