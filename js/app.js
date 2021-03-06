// declare map variable
var map; 

// hard coded locations.  'marker' property left as blank object literal, and will
// get filled in by the initMap function
var locations = [
	{title: 'Bellagio', location: {lat: 36.1126, lng: -115.1767}, marker: {}},
	{title: 'Aria', location: {lat: 36.1073, lng: -115.1766}, marker: {}},
	{title: 'Cosmopolitan', location: {lat: 36.1098, lng: -115.1739}, marker: {}},
	{title: 'The Venetian', location: {lat: 36.1212, lng: -115.1697}, marker: {}},
	{title: 'The Palazzo', location: {lat: 36.1240, lng: -115.1679}, marker: {}},
	{title: 'Wynn', location: {lat: 36.1265, lng: -115.1657}, marker: {}},
	{title: 'Encore', location: {lat: 36.1291, lng: -115.1653}, marker: {}},
	{title: "Bally's", location: {lat: 36.1141, lng: -115.1706}, marker: {}},
	{title: "Planet Hollywood", location: {lat: 36.1100, lng: -115.1718}, marker: {}},
	{title: "Caesars Palace", location: {lat: 36.1162, lng: -115.1745}, marker: {}},
	{title: "Harrah's", location: {lat: 36.1195, lng: -115.1716}, marker: {}},
	{title: "The Cromwell", location: {lat: 36.1150, lng: -115.1718}, marker: {}},
	{title: "The Mirage", location: {lat: 36.1212, lng: -115.1741}, marker: {}},
	{title: "Luxor", location: {lat: 36.0955, lng: -115.1761}, marker: {}}, 
	{title: "Treasure Island", location: {lat: 36.1247, lng: -115.1721}, marker: {}},
	{title: "MGM Grand", location: {lat: 36.1026, lng: -115.1703}, marker: {}},
	{title: "New York-New York", location: {lat: 36.1024, lng: -115.1746}, marker: {}},
	{title: "Mandalay Bay", location: {lat: 36.0919, lng: -115.1752}, marker: {}},
	{title: "Paris", location: {lat: 36.1125, lng: -115.1707}, marker: {}}
];

// hide the options box on small screens when button is clicked
function hideOptions() {
	$('.options-box').css('transform', 'translate(-300px, 0)');
	$('#map').css('left', '50px');
	$('#hide-menu').css('display', 'none');
	$('#show-menu').css('display', 'block');
}

// show the options box on small screens when button is clicked
function showOptions() {
	$('.options-box').css('transform', 'translate(0, 0');
	$('#map').css('left', '290px');
	$('#hide-menu').css('display', 'block');
	$('#show-menu').css('display', 'none');
}

// initialize the google map object
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 36.1147, lng: -115.1728},
		zoom: 14
	});

	var largeInfoWindow = new google.maps.InfoWindow();

    // loop through the locations array and create markers for each location
	for (var i = 0; i < locations.length; i++) {
		var position = locations[i].location;
		var title = locations[i].title;
		var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: i
        });
        locations[i].marker = marker;
	}

	// activate the knockout.js bindings
	ko.applyBindings(new ViewModel());

}

// constructor for locations (hotels)
var Hotel = function(data) {
	this.title = data.title;
	this.location = data.location;
	this.marker = data.marker;
};

var ViewModel = function() {
	var self = this;

	// create hotelList observable array of all locations which will be used for future functions
	this.hotelList = ko.observableArray();

	// initiate empty info window to be popluated
	var infoWindow = new google.maps.InfoWindow();

	// loop through locations and make a new Hotel object from each ithem
	locations.forEach(function(hotel) {
		self.hotelList.push(new Hotel(hotel));
	});


	// grabs text input from the search-box 
	this.filter = ko.observable('');

	// uses search-box input to filter the list of locations/markers shown to user
	this.filteredLocations = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		// in nothing typed in search box, display all items in hotelList
		if (!filter) {
			ko.utils.arrayForEach(self.hotelList(), function(i) {
				i.marker.setVisible(true);
				i.marker.addListener('click', function() {
					self.infoWindow(i);
				});
			});
			return self.hotelList();
		} else {
			// if a filter is applied via the search-box, match items in hotelList to the search query
			// only show items that match the query, hide the rest
			return ko.utils.arrayFilter(self.hotelList(), function(i) {
				var result = (i.title.toLowerCase().indexOf(filter) >= 0);
				i.marker.setVisible(result);
				return result;
			});
		}
	}, self);


	// animates the markers with a 2.5s long bounce and open the infoWindow associated with
	// that marker

	this.infoWindow = function(location) {
		// 2.5s bounce 
		location.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			location.marker.setAnimation(null);
		}, 2500);
		infoWindow.open(map, location.marker);

		// url for wikipedia article on location
		var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + location.title + '&format=json&callback=wikiCallback';
		// error handling if wikipedia call fails after 8s
		var wikiRequestTimeout = setTimeout(function() {
			infoWindow.setContent('Wikipedia Article Unavailable');
		}, 8000);

		// ajax request for wikipedia data
		$.ajax({
			url: wikiURL,
			dataType: "jsonp",
			success: function(data) {
				console.log(data);
				var article = data[0];
				var url = 'http://en.wikipedia.org/wiki/' + article;
				// edge cases where wikipedia article does not include the 'Las Vegas' string at end
				if (article == "The Palazzo" || article == "Caesars Palace" || article == "The Mirage" || article == "New York-New York" || article =="Mandalay Bay") {
					infoWindow.setContent('<a href="' + url + '">' + 'Wikipedia: ' + article + '</a>');
				} else {
				// cases where wikipedia article does include 'Las Vegas' string at end
				infoWindow.setContent('<a href="' + url + ' Las Vegas">' + 'Wikipedia: ' + article + '</a>');
				// remove the timeout for a failed wikipedia AJAX call
				}
				clearTimeout(wikiRequestTimeout);
			}
		});
	};
};






