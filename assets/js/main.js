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
				$window.trigger('campag:preloadComplete');
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

	// Controlled navigation for the About Us section links.
		(function() {
			console.log('[CAMPAG SCROLL DEBUG] About navigation diagnostic version 1');

			var storageKey = 'campagPendingAboutSection',
				isAboutPage = /(^|\/)about-us\.html$/.test(window.location.pathname),
				reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
				activeFrame = null,
				interruptEvents = ['wheel', 'touchstart', 'pointerdown'],
				scrollKeys = ['PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' '],
				activeScroll = null;

			function debug(message, details) {

				console.log('[CAMPAG SCROLL DEBUG] ' + message, details || '');

			}

			function cancelScroll(reason) {

				if (activeFrame)
					window.cancelAnimationFrame(activeFrame);
				if (activeScroll)
					debug('Controlled scroll ended', {
						reason: reason,
						expectedDuration: activeScroll.duration,
						actualElapsed: performance.now() - activeScroll.startedAt,
						expectedDestination: activeScroll.destination,
						finalScrollY: window.scrollY,
						destinationDifference: window.scrollY - activeScroll.destination
					});
				activeFrame = null;
				activeScroll = null;
				interruptEvents.forEach(function(type) {
					window.removeEventListener(type, cancelOnInteraction);
				});
				window.removeEventListener('keydown', cancelOnScrollKey);

			}

			function cancelOnInteraction(event) {

				cancelScroll(event.type);

			}

			function cancelOnScrollKey(event) {

				if (scrollKeys.indexOf(event.key) !== -1)
					cancelScroll('keydown:' + event.key);

			}

			function revealTeamMembers() {

				$('#team-members header.major, #team-members .features').addClass('is-visible');
				$window.trigger('campag:teamMembersVisible');

			}

			function logTeamMembersGeometry() {

				var selectors = ['#team-members', '#team-members header.major', '#team-members .features', '#team-members .features > li:first-child', '#team-members .features > li:first-child > a', '#team-members .features > li:first-child img'];

				selectors.forEach(function(selector) {
					var element = document.querySelector(selector);

					if (!element) {
						debug('Team Members geometry: element not found', { selector: selector });
						return;
					}

					var rect = element.getBoundingClientRect(),
						styles = window.getComputedStyle(element),
						details = { selector: selector, top: rect.top, bottom: rect.bottom, viewportHeight: window.innerHeight };

					if (selector === '#team-members header.major' || selector === '#team-members .features') {
						details.hasRevealClass = element.classList.contains('campag-reveal');
						details.isVisible = element.classList.contains('is-visible');
						details.opacity = styles.opacity;
						details.transform = styles.transform;
						details.display = styles.display;
						details.visibility = styles.visibility;
					}

					debug('Team Members geometry', details);
				});

			}

			function scrollToSection(hash, start, crossPage) {

				var target = document.getElementById(hash.substring(1));

				if (!target)
					return;

				var headerHeight = $header.length ? $header.outerHeight() : 0,
					teamHeader = hash === '#team-members' ? target.querySelector('header.major') : null,
					teamFeatures = hash === '#team-members' ? target.querySelector('.features') : null,
					destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 12);

				if (teamHeader && teamFeatures) {
					var teamHeaderTop = teamHeader.getBoundingClientRect().top + window.scrollY,
						featuresTop = teamFeatures.getBoundingClientRect().top + window.scrollY,
						usableViewportHeight = Math.max(0, window.innerHeight - headerHeight),
						desiredFeaturesY = headerHeight + usableViewportHeight * 0.65,
						minimumVisibleHeader = Math.min(80, teamHeader.offsetHeight * 0.6),
						latestHeadingSafeDestination = teamHeaderTop + teamHeader.offsetHeight - headerHeight - minimumVisibleHeader;

					destination = Math.max(0, Math.min(featuresTop - desiredFeaturesY, latestHeadingSafeDestination));
				}

				var distance = destination - start,
					duration = crossPage ?
						Math.min(3200, Math.max(1800, 1200 + Math.abs(distance) * 0.65)) :
						Math.min(2800, Math.max(1000, 800 + Math.abs(distance) * 0.7)),
					startTime = null;

				cancelScroll('replacement-animation');
				debug('Controlled scroll starting', {
					pathname: window.location.pathname,
					hash: hash,
					navigationType: crossPage ? 'CROSS-PAGE' : 'SAME-PAGE',
					actualWindowScrollY: window.scrollY,
					start: start,
					destination: destination,
					distance: distance,
					duration: duration,
					reducedMotion: reducedMotion.matches,
					timestamp: performance.now()
				});

				if (reducedMotion.matches) {
					window.scrollTo({ top: destination, behavior: 'instant' });
					if (hash === '#team-members') {
						revealTeamMembers();
						logTeamMembersGeometry();
					}
					debug('Reduced-motion navigation completed', { expectedDestination: destination, finalScrollY: window.scrollY, destinationDifference: window.scrollY - destination });
					return;
				}

				activeScroll = { duration: duration, destination: destination, startedAt: performance.now() };

				interruptEvents.forEach(function(type) {
					window.addEventListener(type, cancelOnInteraction, { passive: true });
				});
				window.addEventListener('keydown', cancelOnScrollKey);

				function step(timestamp) {

					if (!activeFrame)
						return;

					if (startTime === null)
						startTime = timestamp;

					var progress = Math.min((timestamp - startTime) / duration, 1),
						eased = -(Math.cos(Math.PI * progress) - 1) / 2;

					window.scrollTo({ top: start + distance * eased, behavior: 'instant' });

					if (progress < 1)
						activeFrame = window.requestAnimationFrame(step);
					else {
						cancelScroll('completed');
						if (hash === '#team-members') {
							revealTeamMembers();
							window.requestAnimationFrame(logTeamMembersGeometry);
						}
					}

				}

				activeFrame = window.requestAnimationFrame(step);

			}

			document.addEventListener('click', function(event) {

				var anchor = event.target.closest && event.target.closest('a');

				if (!anchor)
					return;

				var url = new URL(anchor.href, window.location.href),
					isAboutDestination = /\/about-us\.html$/.test(url.pathname),
					isSupportedSection = url.hash === '#history' || url.hash === '#team-members';

				if (url.origin !== window.location.origin || !isAboutDestination || !isSupportedSection)
					return;

				event.preventDefault();
				debug('Click intercepted', {
					pathname: window.location.pathname,
					requestedUrl: url.href,
					targetHash: url.hash,
					navigationType: isAboutPage && url.pathname === window.location.pathname ? 'SAME-PAGE' : 'CROSS-PAGE'
				});
				$body.removeClass('is-menu-visible');
				$window.trigger('campag:closeDropdowns');

				if (isAboutPage && url.pathname === window.location.pathname) {
					if (window.location.hash !== url.hash)
						history.pushState(null, '', url.hash);
					scrollToSection(url.hash, window.scrollY, false);
				}
				else {
					sessionStorage.setItem(storageKey, url.hash.substring(1));
					debug('Pending navigation stored', { key: storageKey, value: url.hash.substring(1), destination: url.href.split('#')[0] });
					window.location.assign(url.href.split('#')[0]);
				}

			}, true);

			if (isAboutPage) {
				var pendingSection = sessionStorage.getItem(storageKey);
				sessionStorage.removeItem(storageKey);
				debug('Pending navigation consumed on About Us', { value: pendingSection, removedImmediately: true, pathname: window.location.pathname });

				if (pendingSection === 'history' || pendingSection === 'team-members') {
					var pendingHash = '#' + pendingSection,
						startPendingScroll = function() {
							debug('Spectral preload complete; starting pending navigation', { pendingSection: pendingSection, actualWindowScrollY: window.scrollY });
							history.replaceState(history.state, '', pendingHash);
							scrollToSection(pendingHash, 0, true);
						};

					if ($body.hasClass('is-preload'))
						$window.one('campag:preloadComplete', startPendingScroll);
					else
						startPendingScroll();
				}
			}

		})();

	// Subtle, one-time reveals for standard content pages.
		(function() {

			if (!('IntersectionObserver' in window) ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches)
				return;

			var page = window.location.pathname.split('/').pop() || 'index.html',
				selectorsByPage = {
					'about-us.html': ['#history .inner > section > *', '#cta .inner', '#team-members header.major', '#team-members .features', '#team-members + .wrapper header.major', '#team-members + .wrapper .features'],
					'press.html': ['.press-section:not(.press-video) > h3', '.press-section > .press-card', '.press-grid', '.press-video'],
					'reviews.html': ['#three header.major', '#three .features > li'],
					'get-involved.html': ['#three .inner'],
					'waitlist.html': ['#main .wrapper.style5 .inner > section']
				},
				selectors = selectorsByPage[page];

			if (!selectors)
				return;

			var elements = document.querySelectorAll(selectors.join(','));

			if (!elements.length)
				return;

			var observer = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					if (!entry.isIntersecting)
						return;

					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				});
			}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

			$window.on('campag:teamMembersVisible', function() {
				document.querySelectorAll('#team-members header.major, #team-members .features').forEach(function(element) {
					element.classList.add('is-visible');
					observer.unobserve(element);
				});
			});

			var initialViewportLimit = window.innerHeight * 0.9;

			elements.forEach(function(element) {
				element.classList.add('campag-reveal');

				if (element.getBoundingClientRect().top <= initialViewportLimit)
					element.classList.add('is-visible');
				else
					observer.observe(element);
			});

			// Enable the hidden state only after every element has an active observer.
			document.documentElement.classList.add('campag-reveal-enabled');

		})();

	// One cohesive load reveal for short-page and initial interactive content.
		(function() {

			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
				return;

			var page = window.location.pathname.split('/').pop() || 'index.html',
				selectorsByPage = {
					'ag-academy.html': '#main .wrapper.style5 .inner > section',
					'donate.html': '.donation-panel',
					'get-involved.html': '.flex-container'
				},
				selector = selectorsByPage[page],
				element = selector ? document.querySelector(selector) : null;

			if (!element)
				return;

			element.classList.add('campag-load-reveal');
			document.documentElement.classList.add('campag-load-reveal-enabled');

			function revealAfterPreload() {
				window.setTimeout(function() {
					window.requestAnimationFrame(function() {
						element.classList.add('is-visible');
					});
				}, 100);
			}

			if ($body.hasClass('is-preload'))
				$window.one('campag:preloadComplete', revealAfterPreload);
			else
				revealAfterPreload();

		})();


	// Menu.
		$('#menu')
			.append('<a href="#menu" class="close"></a>')
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
