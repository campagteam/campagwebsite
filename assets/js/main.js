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

			var storageKey = 'campagPendingAboutSection',
				isAboutPage = /(^|\/)about-us\.html$/.test(window.location.pathname),
				reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
				activeFrame = null,
				interruptEvents = ['wheel', 'touchstart', 'pointerdown'],
				scrollKeys = ['PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' '];

			function cancelScroll() {

				if (activeFrame)
					window.cancelAnimationFrame(activeFrame);
				activeFrame = null;
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
						Math.min(2000, Math.max(1050, 750 + Math.abs(distance) * 0.35)) :
						Math.min(1800, Math.max(750, 500 + Math.abs(distance) * 0.35)),
					startTime = null;

				cancelScroll();

				if (reducedMotion.matches) {
					window.scrollTo({ top: destination, behavior: 'instant' });
					if (hash === '#team-members')
						revealTeamMembers();
					return;
				}

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
						cancelScroll();
						if (hash === '#team-members')
							revealTeamMembers();
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
				$body.removeClass('is-menu-visible');
				$window.trigger('campag:closeDropdowns');

				if (isAboutPage && url.pathname === window.location.pathname) {
					if (window.location.hash !== url.hash)
						history.pushState(null, '', url.hash);
					scrollToSection(url.hash, window.scrollY, false);
				}
				else {
					sessionStorage.setItem(storageKey, url.hash.substring(1));
					window.location.assign(url.href.split('#')[0]);
				}

			}, true);

			if (isAboutPage) {
				var pendingSection = sessionStorage.getItem(storageKey);
				sessionStorage.removeItem(storageKey);

				if (pendingSection === 'history' || pendingSection === 'team-members') {
					var pendingHash = '#' + pendingSection,
						startPendingScroll = function() {
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
			}, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

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




	// Alumni preview reveals. Content is visible by default and only hidden when this script runs.
		(function() {

			var elements = document.querySelectorAll('.alumni-reveal'),
				reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!elements.length)
				return;

			document.documentElement.classList.add('js');

			if (reducedMotion || !('IntersectionObserver' in window)) {
				elements.forEach(function(element) { element.classList.add('is-visible'); });
				return;
			}

			var observer = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.12 });

			elements.forEach(function(element) { observer.observe(element); });

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
