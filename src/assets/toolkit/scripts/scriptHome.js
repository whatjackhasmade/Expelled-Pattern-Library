(function($, root, undefined) {
	$(function() {
		var arraySpots;
		var control__directions = $('[data-map-control="directions"]');
		var control__gps = $('[data-map-control="gps"]');
		var control__popular = $('[data-map-control="popular"]');
		var location__info = $('[data-title="location__info"]');
		var location__directions = $('[data-title="location__directions"]');
		var mapboxDirections = "";
		var restJSON = "/wp-json/wp/v2/skatespot?_embed&per_page=100";
		restJSON = "/wp-json/xJSON/v1/skatespot";
		var spotsjson = [];
		var geojson = {};
		geojson["type"] = "FeatureCollection";
		geojson["features"] = [];

		mapboxgl.accessToken =
			"pk.eyJ1IjoiamFja2Rhdmllczk1IiwiYSI6ImNqZDBtd3BjeDJobWIyeW81bHE4ZWgyZHoifQ.m3zW18z93RsqO3lxMCA-vg";

		$.getJSON(restJSON, function(data) {
			var i = 0;
			var featuredImage;

			for (i = 0; i < data.length; i++) {
				if (data[i].image_grid != false) {
					featuredImage = String(data[i].image_grid);
				} else {
					featuredImage =
						"/wp-content/themes/expelled_theme/img/placeholder.png";
				}

				spotsjson[i] = [
					parseFloat(data[i].location.lng),
					parseFloat(data[i].location.lat),
					String(data[i].post_title),
					String(data[i].post_name),
					featuredImage
				];
			}

			// Change source URL above to smaller image later

			var indexedDB =
				window.indexedDB ||
				window.mozIndexedDB ||
				window.webkitIndexedDB ||
				window.msIndexedDB ||
				window.shimIndexedDB;

			var open = indexedDB.open("ExpelledDatabase", 1);

			open.onupgradeneeded = function() {
				var db = open.result;
				var store = db.createObjectStore("LocalObjectStore", {
					keyPath: "id"
				});
				var index = store.createIndex("IndexKey", [
					"geometry.lat",
					"geometry.lng"
				]);
			};

			open.onsuccess = function() {
				var db = open.result;
				var tx = db.transaction("LocalObjectStore", "readwrite");
				var store = tx.objectStore("LocalObjectStore");
				var index = store.index("IndexKey");

				for (i = 0; i < data.length; i++) {
					store.put({
						id: i,
						type: "Feature",
						geometry: {
							lng: spotsjson[i][0],
							lat: spotsjson[i][1]
						},
						properties: {
							description: spotsjson[i][3],
							iconSize: [64, 64],
							message: spotsjson[i][2],
							title: spotsjson[i][2],
							url: spotsjson[i][3]
						}
					});
				}

				tx.oncomplete = function() {
					db.close();
				};
			};

			for (var i in spotsjson) {
				var newFeature = {
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [spotsjson[i][0], spotsjson[i][1]]
					},
					properties: {
						description: spotsjson[i][3],
						iconSize: [64, 64],
						message: spotsjson[i][2],
						title: spotsjson[i][2],
						url: spotsjson[i][3],
						image: spotsjson[i][4]
					}
				};
				geojson["features"].push(newFeature);
			}

			var map = new mapboxgl.Map({
				container: "map",
				style: "mapbox://styles/mapbox/dark-v9",
				center: [spotsjson[0][0], spotsjson[0][1]],
				zoom: 5
			});

			map.on("load", function() {
				// add markers to map
				geojson.features.forEach(function(marker) {
					// create a DOM element for the marker
					var el = document.createElement("div");
					el.className = "marker";
					el.addEventListener("click", function() {
						$(location__info).html(
							"><a href='" +
								marker.properties.url +
								"'><div class='background--cover' style='height: 200px; background-image:url(" +
								marker.properties.image +
								");'></div><input id='location__latitude' type='hidden' value='" +
								marker.geometry.coordinates[0] +
								"'><input id='location__longitutde' type='hidden' value='" +
								marker.geometry.coordinates[1] +
								"'><a href='" +
								marker.properties.url +
								"'><h2>" +
								marker.properties.message +
								"</h2></a><br>" +
								"<span class='' data-title='location__directions'><i class='far fa-compass'></i> Directions</a><br>" +
								"<a href='" +
								marker.properties.url +
								"'>View Spot</a>"
						);
						map.flyTo({
							zoom: 16,
							center: marker.geometry.coordinates
						});
					});
					// add marker to map
					new mapboxgl.Marker(el)
						.setLngLat(marker.geometry.coordinates)
						.addTo(map);
				});

				// Function to look up geolocation parameters using IP Address
				$.ajaxSetup({
					async: false
				});
				var ipLocation = (function() {
					var result;
					$.getJSON("//ipinfo.io/json", {}, function(data) {
						result = data;
					});
					return result;
				})();

				if (ipLocation) {
					userInfo = ipLocation;
					userLocation = userInfo["loc"];
					userLocation = userLocation.split(",");

					map.flyTo({
						center: [userLocation[1], userLocation[0]]
					});
				}

				var initDirections = false;

				if (control__directions) {
					mapboxDirections = new MapboxDirections({
						accessToken: mapboxgl.accessToken
					});

					control__directions.on("click", function() {
						if (initDirections == true) {
							map.removeControl(mapboxDirections);
							initDirections = false;
						} else {
							map.addControl(mapboxDirections, "bottom-left");
							initDirections = true;
						}
					});
				}

				if (control__gps) {
					control__gps.on("click", function() {
						var latitude, longitude;

						var geoOptions = {
							enableHighAccuracy: true
						};

						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(
								handle_geolocation_query,
								handle_errors,
								geoOptions
							);
						} else {
							alert("Device probably not ready.");
						}

						function handle_errors(error) {
							// error handling here
						}

						function handle_geolocation_query(position) {
							latitude = position.coords.latitude;
							longitude = position.coords.longitude;
							onPositionReady();
						}

						function onPositionReady() {
							map.flyTo({
								center: [longitude, latitude],
								zoom: 14
							});
						}
					});
				}

				$(location__info).on(
					"click",
					"[data-title='location__directions']",
					function() {
						if (initDirections == false) {
							map.addControl(mapboxDirections, "bottom-left");
							initDirections = true;
						}

						var latitude, longitude;

						var geoOptions = {
							enableHighAccuracy: true
						};

						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(
								handle_geolocation_query,
								handle_errors,
								geoOptions
							);
						} else {
							alert("Device probably not ready.");
						}

						function handle_errors(error) {
							console.log("There was an error");
						}

						function handle_geolocation_query(position) {
							latitude = position.coords.latitude;
							longitude = position.coords.longitude;
							onPositionReady(longitude, latitude);
						}

						function onPositionReady(longitude, latitude) {
							console.log(longitude + ", " + latitude);
							map.flyTo({
								center: [longitude, latitude],
								zoom: 14
							});
						}

						var locationLatitude = $("#location__latitude").val();
						var locationLongitutde = $("#location__longitutde").val();
						var locationGeometry = locationLatitude + ", " + locationLongitutde;
						console.log(locationGeometry);
					}
				);
			});
		});
	});
})(jQuery, this);
