(function($, root, undefined) {
	$(function() {
		// // Quick Add Post AJAX
		// var quickAddButton = $("#create-post-button");

		// if (quickAddButton) {
		// 	quickAddButton.on("click", function() {
		// 		var ourPostData = {
		// 			title: $("#postTitle").value,
		// 			content: $("#postContent").value,
		// 			status: "publish"
		// 		};

		// 		var postURL = window.location.hostname + "/wp-json/wp/v2/posts";

		// 		var createPost = new XMLHttpRequest();
		// 		createPost.open("POST", postURL);
		// 		createPost.setRequestHeader(
		// 			"Content-Type",
		// 			"application/json;charset=UTF-8"
		// 		);
		// 		createPost.send(JSON.stringify(ourPostData));
		// 	});
		// }

		var toggleHeaderNav = $(".header__burger");
		var toggleChild = $('*[data-click="toggleChild"]');

		if (toggleChild) {
			$(toggleChild).on("click", function() {
				$(this)
					.children(".header__actions")
					.toggleClass("display--none");
				$("#site-search-results").html("");
			});
		}

		if (toggleHeaderNav) {
			$(toggleHeaderNav).on("click", function() {
				$(this)
					.next()
					.toggleClass("show");

				$("body").toggleClass("menu-mobile");
			});
		}

		$.ajaxSetup({ cache: false });
		$("#site-search").keypress(function(e) {
			if (e.which == 13) {
				$('[data-title="location__info"]').html("");
				$(".header__actions").addClass("display--none");

				e.preventDefault();
				$("#site-search-results").html("");
				var searchField = $("#site-search").val();
				var expression = new RegExp(searchField, "i");
				$.getJSON("/wp-json/wp/v2/skatespot?_embed", function(data) {
					$.each(data, function(key, value) {
						if (value.title.rendered.search(expression) != -1) {
							$("#site-search-results").append(
								'<li class="list-group-item link-class"><a href="' +
									value.link +
									'">' +
									value.title.rendered +
									"</a></li>"
							);
						}
					});
				});
			}
		});
	});
})(jQuery, this);
