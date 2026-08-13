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
					$submenuShell = $dropdown.find('.sidebar-submenu-shell').first(),
					$submenu = $dropdown.find('.sidebar-submenu').first(),
					$links = $dropdown.find('.sidebar-submenu a');

				$dropdown.toggleClass('is-open', open);
				$toggle.attr('aria-expanded', open ? 'true' : 'false');
				$submenuShell.attr('aria-hidden', open ? 'false' : 'true');
				$submenu.prop('hidden', false);

				$links.each(function() {
					if (open) {
						if ($(this).attr('data-campag-tabindex') !== undefined)
							$(this).attr('tabindex', $(this).attr('data-campag-tabindex')).removeAttr('data-campag-tabindex');
						else
							$(this).removeAttr('tabindex');
					}
					else {
						if ($(this).attr('tabindex') !== undefined && $(this).attr('data-campag-tabindex') === undefined)
							$(this).attr('data-campag-tabindex', $(this).attr('tabindex'));
						$(this).attr('tabindex', '-1');
					}
				});

				if ($submenuShell.length && 'inert' in $submenuShell[0])
					$submenuShell[0].inert = !open;

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
					window.setTimeout(function() {
						setDropdown($dropdown, false);
					}, 0);
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
				scrollDuration = 1200,
				headerGap = 12,
				activeAnimation = null,
				isProgrammaticHashChange = false,
				initialHash = getSupportedHash(window.campAgPendingSection || window.location.hash),
				initialScrollStarted = false,
				lastNavigationToken = 0;

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

			function afterLayoutChange(callback, options) {

				options = options || {};
				var delay = options.crossPage ? 75 : (reducedMotionQuery.matches ? 0 : 380);

				window.setTimeout(function() {
					window.requestAnimationFrame(function() {
						window.requestAnimationFrame(callback);
					});
				}, delay);

			}

			function scrollForHash(hash, options) {

				var target = getTarget(hash);

				if (target)
					animateToTarget(target, options);

			}

			function runInitialScroll() {

				if (!initialHash || initialScrollStarted)
					return;

				initialScrollStarted = true;
				window.scrollTo(0, 0);
				history.replaceState(history.state, document.title, initialHash);
				afterLayoutChange(function() {
					scrollForHash(initialHash, { startY: 0 });
					if ('scrollRestoration' in history && window.CampAGPreviousScrollRestoration)
						history.scrollRestoration = window.CampAGPreviousScrollRestoration;
				}, { crossPage: true });

			}

			if (initialHash)
				window.scrollTo(0, 0);

			$window.on('load', runInitialScroll);

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

				var navigationToken = ++lastNavigationToken;
				window.scrollTo(0, 0);
				afterLayoutChange(function() {
					if (navigationToken === lastNavigationToken)
						animateToTarget(target, { startY: 0 });
				});

			});

			$window.on('popstate', function() {
				if (isProgrammaticHashChange)
					return;

				var hash = getSupportedHash(window.location.hash);
				if (hash) {
					var navigationToken = ++lastNavigationToken;
					window.scrollTo(0, 0);
					afterLayoutChange(function() {
						if (navigationToken === lastNavigationToken)
							scrollForHash(hash, { startY: 0 });
					});
				}
			});

		})();


	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close" aria-label="Close menu"></a>')
			.appendTo($body)
			.panel({
				delay: 500,
				hideOnClick: false,
				hideOnSwipe: true,
				resetScroll: true,
				resetForms: true,
				side: 'right',
				target: $body,
				visibleClass: 'is-menu-visible'
			});

		$('#menu').on('click', 'a', function() {
			var href = $(this).attr('href');

			if (href && href !== '#' && href !== '#menu')
				window.setTimeout(function() {
					$body.removeClass('is-menu-visible');
					$window.trigger('campag:closeDropdowns');
				}, 0);
			});

	// Restrained, progressive-enhancement reveal for major content groups.
		(function() {

			var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
				$revealItems = $('.interior-page .wrapper > .inner, .interior-page .press-section, .interior-page .features > li, .landing #one .major, .landing .spotlight, .landing #three .major');

			if (!$revealItems.length || reducedMotion.matches || !('IntersectionObserver' in window))
				return;

			$body.addClass('reveal-ready');
			$revealItems.addClass('camp-reveal');

			var observer = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-revealed');
						observer.unobserve(entry.target);
					}
				});
			}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

			$revealItems.each(function() { observer.observe(this); });

		})();

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
