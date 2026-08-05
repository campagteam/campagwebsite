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

			var scrollTargetIds = ['history', 'team-members'],
				isAboutPage = /(^|\/)about-us\.html$/.test(window.location.pathname),
				reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'),
				scrollDuration = 900,
				headerGap = 12,
				activeAnimation = null,
				isProgrammaticHashChange = false,
				initialHash = getSupportedHash(window.location.hash),
				initialScrollStart = window.CampAGHashScrollStart || 0,
				initialScrollStarted = false;

			if (!isAboutPage)
				return;

			function getSupportedHash(hash) {

				if (!hash)
					return null;

				var id = hash.charAt(0) === '#' ? hash.substring(1) : hash;

				return scrollTargetIds.indexOf(id) === -1 ? null : '#' + id;

			}

			function getTarget(hash) {

				var supportedHash = getSupportedHash(hash);

				return supportedHash ? document.getElementById(supportedHash.substring(1)) : null;

			}

			function getHeaderOffset() {

				if (!$header.length)
					return 0;

				var rect = $header[0].getBoundingClientRect(),
					style = window.getComputedStyle($header[0]),
					isVisible = rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
					isFixed = style.position === 'fixed' || style.position === 'sticky';

				return isVisible && isFixed ? Math.ceil(rect.height) : 0;

			}

			function getMaxScrollY() {

				return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

			}

			function getDestination(target) {

				var rawTop = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - headerGap;

				return Math.min(Math.max(0, rawTop), getMaxScrollY());

			}

			function easeInOutCubic(progress) {

				return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

			}

			function cancelActiveAnimation() {

				if (activeAnimation)
					activeAnimation.cancel();

			}

			function animateToTarget(target, options) {

				if (!target)
					return;

				options = options || {};
				cancelActiveAnimation();

				var destination = getDestination(target),
					start = typeof options.startY === 'number' ? options.startY : window.scrollY,
					distance = destination - start,
					cancelled = false,
					frame = null,
					interruptEvents = ['wheel', 'touchstart', 'pointerdown'],
					scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];

				function cleanup() {

					interruptEvents.forEach(function(type) {
						window.removeEventListener(type, onInterrupt, { passive: true });
					});
					window.removeEventListener('keydown', onKeydown);
					if (frame)
						window.cancelAnimationFrame(frame);
					if (activeAnimation && activeAnimation.cancel === cancel)
						activeAnimation = null;

				}

				function cancel() {

					cancelled = true;
					cleanup();

				}

				function onInterrupt() {

					cancel();

				}

				function onKeydown(event) {

					if (scrollKeys.indexOf(event.key) !== -1)
						cancel();

				}

				activeAnimation = { cancel: cancel };

				if (reducedMotionQuery.matches || Math.abs(distance) < 2) {
					window.scrollTo(0, destination);
					cleanup();
					return;
				}

				window.scrollTo(0, start);
				interruptEvents.forEach(function(type) {
					window.addEventListener(type, onInterrupt, { passive: true });
				});
				window.addEventListener('keydown', onKeydown);

				var startTime = null;

				function step(timestamp) {

					if (cancelled)
						return;

					if (startTime === null)
						startTime = timestamp;

					var progress = Math.min((timestamp - startTime) / scrollDuration, 1),
						position = start + distance * easeInOutCubic(progress);

					window.scrollTo(0, position);

					if (progress < 1)
						frame = window.requestAnimationFrame(step);
					else {
						window.scrollTo(0, getDestination(target));
						cleanup();
					}

				}

				frame = window.requestAnimationFrame(step);

			}

			function closeNavigation() {

				$window.trigger('campag:closeDropdowns');
				$body.removeClass('is-menu-visible');

			}

			function scrollForHash(hash, options) {

				var target = getTarget(hash);

				if (target)
					animateToTarget(target, options);

			}

			if (initialHash)
				window.scrollTo(0, initialScrollStart);

			$window.on('load', function() {
				if (!initialHash || initialScrollStarted)
					return;

				initialScrollStarted = true;
				window.scrollTo(0, initialScrollStart);
				window.requestAnimationFrame(function() {
					window.requestAnimationFrame(function() {
						window.setTimeout(function() {
							scrollForHash(initialHash, { startY: initialScrollStart });
						}, 75);
					});
				});
			});

			$(document).on('click', 'a[href$="about-us.html#history"], a[href$="about-us.html#team-members"]', function(event) {

				var url = new URL(this.href, window.location.href);

				if (url.pathname !== window.location.pathname)
					return;

				var target = getTarget(url.hash);

				if (!target)
					return;

				event.preventDefault();
				closeNavigation();

				if (window.location.hash !== url.hash) {
					isProgrammaticHashChange = true;
					history.pushState(null, '', url.hash);
					window.setTimeout(function() { isProgrammaticHashChange = false; }, 0);
				}

				animateToTarget(target);

			});

			$window.on('popstate hashchange', function() {
				if (isProgrammaticHashChange)
					return;

				var hash = getSupportedHash(window.location.hash);
				if (hash)
					scrollForHash(hash);
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
