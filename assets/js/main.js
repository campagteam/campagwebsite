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

	// Subtle, one-time reveals for standard content pages.
		(function() {

			if (!('IntersectionObserver' in window) ||
				window.matchMedia('(prefers-reduced-motion: reduce)').matches)
				return;

			var page = window.location.pathname.split('/').pop() || 'index.html',
				selectorsByPage = {
					'about-us.html': ['#history .inner > section > *', '#cta .inner', '#team-members header.major', '#team-members .features > li', '#team-members + .wrapper header.major', '#team-members + .wrapper .features > li'],
					'press.html': ['.press-section > h2', '.press-card', '.press-video'],
					'reviews.html': ['#three header.major', '#three .features > li'],
					'donate.html': ['.donation-content', '.donation-qr'],
					'ag-academy.html': ['#main .wrapper.style5 .inner > *', '#main .wrapper.style3 .inner'],
					'get-involved.html': ['.flex-container > *', '#three .inner'],
					'register.html': ['#main .wrapper.style5 .inner > section'],
					'waitlist.html': ['#main .wrapper.style5 .inner > section'],
					'faq.html': ['#faq header.major', '.faq-item']
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

			elements.forEach(function(element, index) {
				element.classList.add('campag-reveal');
				element.style.setProperty('--campag-reveal-delay', (index % 3) * 70 + 'ms');
				observer.observe(element);
			});

			// Enable the hidden state only after every element has an active observer.
			document.documentElement.classList.add('campag-reveal-enabled');

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
