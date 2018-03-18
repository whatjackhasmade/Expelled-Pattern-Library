(function ($, root, undefined) {

	$(function () {

		mapboxgl.accessToken = 'pk.eyJ1IjoiamFja2Rhdmllczk1IiwiYSI6ImNqZDBtd3BjeDJobWIyeW81bHE4ZWgyZHoifQ.m3zW18z93RsqO3lxMCA-vg';

		var lng = document.getElementById("lng").value;
		var lat = document.getElementById("lat").value;

		var map = new mapboxgl.Map({
			center: [lng, lat],
			container: 'map',
			interactive: false,
			style: 'mapbox://styles/mapbox/dark-v9',
			zoom: 16
		});

		var el = document.createElement('div');
		el.className = 'marker';

		new mapboxgl.Marker(el)
			.setLngLat([lng, lat])
			.addTo(map);
	});

})(jQuery, this);
