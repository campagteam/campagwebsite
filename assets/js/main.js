/*
	Spectral by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#page-wrapper'),
		$banner = $('#banner'),
		$header = $('#header');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Mobile?
		if (browser.mobile)
			$body.addClass('is-mobile');
		else {

			breakpoints.on('>medium', function() {
				$body.removeClass('is-mobile');
			});

			breakpoints.on('<=medium', function() {
				$body.addClass('is-mobile');
			});

		}

	// Scrolly.
		$('.scrolly')
			.scrolly({
				speed: 1500,
				offset: $header.outerHeight()
			});


	// Sidebar About Us dropdown.
		(function() {

			var $dropdowns = $('#menu .sidebar-dropdown');

			if (!$dropdowns.length)
				return;

			function setDropdown($dropdown, open) {

				var $toggle = $dropdown.find('.sidebar-dropdown__toggle').first(),
					$links = $dropdown.find('.sidebar-submenu a');

				$dropdown.toggleClass('is-open', open);
				$toggle.attr('aria-expanded', open ? 'true' : 'false');
				$links.attr('tabindex', open ? '0' : '-1');

			}

			function closeDropdowns() {

				$dropdowns.each(function() {
					setDropdown($(this), false);
				});

			}

			$dropdowns.each(function() {

				var $dropdown = $(this),
					$toggle = $dropdown.find('.sidebar-dropdown__toggle').first(),
					$submenu = $dropdown.find('.sidebar-submenu').first();

				setDropdown($dropdown, false);

				$toggle.on('click', function(event) {
					event.preventDefault();
					event.stopPropagation();
					setDropdown($dropdown, !$dropdown.hasClass('is-open'));
				});

				$dropdown.on('focusin mouseenter', function() {
					setDropdown($dropdown, true);
				});

				$dropdown.on('mouseleave', function() {
					if (!$dropdown.is(':focus-within'))
						setDropdown($dropdown, false);
				});

				$dropdown.on('focusout', function() {
					window.setTimeout(function() {
						if (!$dropdown.is(':focus-within'))
							setDropdown($dropdown, false);
					}, 0);
				});

				$submenu.on('click', 'a', function() {
					setDropdown($dropdown, false);
				});

			});

			$(document).on('click', function(event) {
				if (!$(event.target).closest('#menu .sidebar-dropdown').length)
					closeDropdowns();
			});

			$window.on('campag:closeDropdowns', closeDropdowns);

			if (window.MutationObserver) {
				new MutationObserver(function() {
					if (!$body.hasClass('is-menu-visible'))
						closeDropdowns();
				}).observe(document.body, { attributes: true, attributeFilter: ['class'] });
			}

		})();

	// About page hash navigation.
		(function() {

			var scrollTargets = ['history', 'team-members'],
				isAboutPage = /(^|\/)about-us\.html$/.test(window.location.pathname),
				reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

			if (!isAboutPage)
				return;

			function getTarget(hash) {

				if (!hash)
					return null;

				var id = hash.charAt(0) === '#' ? hash.substring(1) : hash;

				if (scrollTargets.indexOf(id) === -1)
					return null;

				return document.getElementById(id);

			}

			function getHeaderOffset() {

				return $header.length ? Math.ceil($header.outerHeight()) : 0;

			}

			function scrollToTarget(target, replaceFocus) {

				if (!target)
					return;

				var top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset() - 8;

				window.scrollTo({
					top: Math.max(top, 0),
					behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
				});

				if (replaceFocus) {
					target.setAttribute('tabindex', '-1');
					target.focus({ preventScroll: true });
				}

			}

			if (getTarget(window.location.hash))
				window.scrollTo(0, 0);

			$window.on('load', function() {
				window.setTimeout(function() {
					scrollToTarget(getTarget(window.location.hash), false);
				}, 125);
			});

			$(document).on('click', 'a[href$="about-us.html#history"], a[href$="about-us.html#team-members"]', function(event) {

				var url = new URL(this.href, window.location.href);

				if (url.pathname !== window.location.pathname)
					return;

				var target = getTarget(url.hash);

				if (!target)
					return;

				event.preventDefault();
				$window.trigger('campag:closeDropdowns');
				$body.removeClass('is-menu-visible');

				if (window.location.hash !== url.hash)
					history.pushState(null, '', url.hash);

				scrollToTarget(target, true);

			});

			$window.on('popstate hashchange', function() {
				scrollToTarget(getTarget(window.location.hash), false);
			});

		})();


	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: true,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right',
				target: $body,
				visibleClass: 'is-menu-visible'
			});

	// Header.
		if ($banner.length > 0
		&&	$header.hasClass('alt')) {

			$window.on('resize', function() { $window.trigger('scroll'); });

			$banner.scrollex({
				bottom:		$header.outerHeight() + 1,
				terminate:	function() { $header.removeClass('alt'); },
				enter:		function() { $header.addClass('alt'); },
				leave:		function() { $header.removeClass('alt'); }
			});

		}

})(jQuery);
