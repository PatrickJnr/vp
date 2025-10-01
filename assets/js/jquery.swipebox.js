/*! Swipebox v1.5.2 | Constantin Saguin csag.co | MIT License | github.com/brutaldesign/swipebox */
(function(window, document, $) {

    'use strict'; // Enforce stricter parsing and error handling

    $.swipebox = function(elem, options) {

        // Use $() to ensure we have a jQuery object, and add the class for styling
        const $elem = $(elem).addClass('swipebox');

        // Default options, can be overridden by user-provided options
        const defaults = {
            useCSS: true,
            useSVG: true,
            initialIndexOnArray: 0,
            removeBarsOnMobile: true,
            hideCloseButtonOnMobile: false,
            hideBarsDelay: 3000,
            videoMaxWidth: 1140,
            vimeoColor: 'cccccc',
            beforeOpen: null, // Callbacks
            afterOpen: null,
            afterClose: null,
            afterMedia: null,
            nextSlide: null,
            prevSlide: null,
            loopAtEnd: false,
            autoplayVideos: false,
            queryStringData: {}, // Extra query string parameters for video URLs
            toggleClassOnLoad: '' // Class to toggle on inline content load
        };

        const plugin = this;
        let elements = []; // Array of slide objects: { href: '...', title: '...' }
        const selector = '.swipebox'; // Default selector
        const isMobile = /((iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo))/i.test(navigator.userAgent);
        const isTouch = isMobile || 'ontouchstart' in window || ('onmsgesturechange' in window) || navigator.msMaxTouchPoints > 0; // More reliable touch detection
        const supportSVG = document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect; // SVG support check
        const winWidth = window.innerWidth || $(window).width(); // Use logical OR for fallback
        const winHeight = window.innerHeight || $(window).height();
        let currentX = 0; // Current X position of the slider
        // Pre-build HTML structure for better performance and readability
        const html = `
				<div id="swipebox-overlay">
					<div id="swipebox-container">
						<div id="swipebox-slider"></div>
						<div id="swipebox-top-bar">
							<div id="swipebox-title"></div>
						</div>
						<div id="swipebox-bottom-bar">
							<div id="swipebox-arrows">
								<a id="swipebox-prev"></a>
								<a id="swipebox-next"></a>
							</div>
						</div>
						<a id="swipebox-close"></a>
					</div>
				</div>`;


        plugin.settings = {};

        // Expose public methods.  Better than exposing the whole 'ui' object.
        $.swipebox.close = function() {
            if (ui) { // Check if ui exists.
                ui.closeSlide();
            }
        };

        $.swipebox.extend = function() {
            return ui; // Allows extending the UI object (though generally discouraged)
        };

        // Initialization
        plugin.init = function() {

            plugin.settings = $.extend({}, defaults, options); // Merge user options with defaults

            if (Array.isArray(elem)) { // Handle array of elements directly
                elements = elem;
                ui.target = $(window);
                ui.init(plugin.settings.initialIndexOnArray);

            } else {
                // Click handler for elements matching the selector
                $(document).on('click', selector, function(event) {

                    event.preventDefault(); // Prevent default click behavior FIRST
                    event.stopPropagation(); // Stop event bubbling up the DOM

                    // Optimization:  Check current slide status first.
                    if ($(event.target).closest('.slide.current').length) {
                        return;
                    }


                    if (!Array.isArray(elem)) { // Re-initialize if necessary (dynamic content)
                        ui.destroy(); // Clean up previous instance
                        ui.actions(); // Re-bind actions.
                    }

                    elements = [];
                    const relVal = $(this).attr('data-rel') || $(this).attr('rel');

                    // Filter elements based on rel attribute if present
                    let $filteredElem;

                    if (relVal && relVal !== '' && relVal !== 'nofollow') {
                        $filteredElem = $elem.filter('[' + (relVal.startsWith('data-') ? 'data-rel' : 'rel') + '="' + relVal + '"]');
                    } else {
                        $filteredElem = $elem;
                    }

                    // Build the elements array
                    $filteredElem.each(function() {
                        elements.push({
                            href: $(this).attr('href'), // No need to check if it exists, can be undefined.
                            title: $(this).attr('title')
                        });
                    });

                    const index = $filteredElem.index($(this)); // Get index WITHIN filtered set

                    ui.target = $(event.target);
                    ui.init(index);
                });
            }
        };


        // UI object (internal methods) - Made const.
        const ui = {

            /**
             * Initiate Swipebox
             */
            init: function(index) {
                if (plugin.settings.beforeOpen) {
                    plugin.settings.beforeOpen();
                }
                this.target.trigger('swipebox-start'); // Trigger custom event
                $.swipebox.isOpen = true;
                this.build();
                this.openSlide(index);
                this.openMedia(index);
                this.preloadMedia(index + 1);
                this.preloadMedia(index - 1);
                if (plugin.settings.afterOpen) {
                    plugin.settings.afterOpen(index);
                }
            },

            /**
             * Built HTML containers and fire main functions
             */
            build: function() {
                // Append the HTML only once
                if (!$('#swipebox-overlay').length) { // Important optimization.
                    $('body').append(html);
                }


                // SVG fallback
                if (supportSVG && plugin.settings.useSVG === true) {
                    let bg = $('#swipebox-close').css('background-image');
                    bg = bg.replace('png', 'svg');
                    $('#swipebox-prev, #swipebox-next, #swipebox-close').css({
                        'background-image': bg
                    });
                }

                // Remove bars on mobile if option is set
                if (isMobile && plugin.settings.removeBarsOnMobile) {
                    $('#swipebox-bottom-bar, #swipebox-top-bar').remove();
                }

                // Add slides
                $.each(elements, function() {
                    $('#swipebox-slider').append('<div class="slide"></div>');
                });

                this.setDim();
                this.actions();

                if (isTouch) {
                    this.gesture();
                }

                // Always allow key events
                this.keyboard();

                this.animBars();
                this.resize();
            },

            /**
             * Set dimensions depending on windows width and height
             */
            setDim: function() {

                let width, height, sliderCss = {};

                // Use an event listener, so we only bind it once.
                if ('onorientationchange' in window) {
                    window.addEventListener('orientationchange', function() {
                        if (window.orientation === 0) {
                            width = winWidth;
                            height = winHeight;
                        } else if (window.orientation === 90 || window.orientation === -90) {
                            width = winHeight;
                            height = winWidth;
                        }
                        sliderCss = { // Update dimensions inside the event
                            width: width,
                            height: height
                        };
                        $('#swipebox-overlay').css(sliderCss);
                    }, false);
                } else { //for older devices.

                    width = window.innerWidth ? window.innerWidth : $(window).width();
                    height = window.innerHeight ? window.innerHeight : $(window).height();

                    sliderCss = {
                        width: width,
                        height: height
                    };
                    $('#swipebox-overlay').css(sliderCss);
                }

            },

            /**
             * Reset dimensions on window resize event
             */
            resize: function() {
                // Only bind the resize handler once.
                $(window).off('resize.swipebox').on('resize.swipebox', () => { // Added namespaced event
                    this.setDim();
                }).trigger('resize.swipebox'); // Trigger it immediately
            },

            /**
             * Check if device supports CSS transitions
             */
            supportTransition: function() {
                const prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split(' ');
                for (let i = 0; i < prefixes.length; i++) {
                    if (document.createElement('div').style[prefixes[i]] !== undefined) {
                        return prefixes[i];
                    }
                }
                return false;
            },

            /**
             * Check if CSS transitions are allowed (options + devicesupport)
             */
            doCssTrans: function() {
                return plugin.settings.useCSS && this.supportTransition();
            },

            /**
             * Touch navigation
             */
            gesture: function() {

                let index,
                    hDistance,
                    vDistance,
                    hDistanceLast,
                    vDistanceLast,
                    hDistancePercent,
                    vSwipe = false,
                    hSwipe = false;
                const hSwipMinDistance = 10;
                const vSwipMinDistance = 50;
                let startCoords = {};
                let endCoords = {};
                const bars = $('#swipebox-top-bar, #swipebox-bottom-bar');
                const slider = $('#swipebox-slider');

                bars.addClass('visible-bars');
                this.setTimeout();

                $('body')
                    .on('touchstart.swipebox', function(event) { // Namespaced events for easier unbinding

                        $(this).addClass('touching');
                        index = $('#swipebox-slider .slide.current').index();
                        const originalEvent = event.originalEvent; // Get to the original event
                        endCoords = originalEvent.targetTouches[0];
                        startCoords = {
                            pageX: originalEvent.targetTouches[0].pageX,
                            pageY: originalEvent.targetTouches[0].pageY
                        }

                        $('#swipebox-slider').css({
                            '-webkit-transform': 'translate3d(' + currentX + '%, 0, 0)',
                            'transform': 'translate3d(' + currentX + '%, 0, 0)'
                        });

                        $('.touching')
                            .on('touchmove.swipebox', function(event) {
                                event.preventDefault();
                                event.stopPropagation();
                                const originalEvent = event.originalEvent;
                                endCoords = originalEvent.targetTouches[0];

                                if (!hSwipe) {
                                    vDistanceLast = vDistance;
                                    vDistance = endCoords.pageY - startCoords.pageY;
                                    // Vertical Swiping
                                    if (Math.abs(vDistance) >= vSwipMinDistance || vSwipe) {
                                        const opacity = 0.75 - Math.abs(vDistance) / slider.height();

                                        slider.css({
                                            'top': vDistance + 'px'
                                        });
                                        slider.css({
                                            'opacity': opacity
                                        });

                                        vSwipe = true;
                                    }
                                }

                                hDistanceLast = hDistance;
                                hDistance = endCoords.pageX - startCoords.pageX;
                                hDistancePercent = hDistance * 100 / winWidth;

                                // Horizontal Swiping
                                if (!hSwipe && !vSwipe && Math.abs(hDistance) >= hSwipMinDistance) {
                                    $('#swipebox-slider').css({
                                        '-webkit-transition': '',
                                        'transition': ''
                                    });
                                    hSwipe = true;
                                }

                                if (hSwipe) {
                                    // swipe left
                                    if (0 < hDistance) {
                                        // first slide
                                        if (0 === index) {
                                            $('#swipebox-overlay').addClass('leftSpringTouch');
                                        } else {
                                            // Follow gesture
                                            $('#swipebox-overlay').removeClass('leftSpringTouch rightSpringTouch');
                                            $('#swipebox-slider').css({
                                                '-webkit-transform': 'translate3d(' + (currentX + hDistancePercent) + '%, 0, 0)',
                                                'transform': 'translate3d(' + (currentX + hDistancePercent) + '%, 0, 0)'
                                            });
                                        }
                                        // swipe right
                                    } else if (0 > hDistance) {
                                        // last Slide
                                        if (elements.length === index + 1) {
                                            $('#swipebox-overlay').addClass('rightSpringTouch');
                                        } else {
                                            $('#swipebox-overlay').removeClass('leftSpringTouch rightSpringTouch');
                                            $('#swipebox-slider').css({
                                                '-webkit-transform': 'translate3d(' + (currentX + hDistancePercent) + '%, 0, 0)',
                                                'transform': 'translate3d(' + (currentX + hDistancePercent) + '%, 0, 0)'
                                            });
                                        }
                                    }
                                }
                            });
                        return false;
                    })
                    .on('touchend.swipebox', function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        $('#swipebox-slider').css({
                            '-webkit-transition': '-webkit-transform 0.4s ease',
                            'transition': 'transform 0.4s ease'
                        });

                        vDistance = endCoords.pageY - startCoords.pageY;
                        hDistance = endCoords.pageX - startCoords.pageX;
                        hDistancePercent = hDistance * 100 / winWidth;

                        // Swipe to bottom to close
                        if (vSwipe) {
                            vSwipe = false;
                            if (Math.abs(vDistance) >= 2 * vSwipMinDistance && Math.abs(vDistance) > Math.abs(vDistanceLast)) {
                                const vOffset = vDistance > 0 ? slider.height() : -slider.height();
                                slider.animate({
                                        top: vOffset + 'px',
                                        'opacity': 0
                                    },
                                    300,
                                    () => { // Use arrow function for correct 'this' context
                                        this.closeSlide();
                                    });
                            } else {
                                slider.animate({
                                    top: 0,
                                    'opacity': 1
                                }, 300);
                            }
                        } else if (hSwipe) {
                            hSwipe = false;
                            // swipeLeft
                            if (hDistance >= hSwipMinDistance && hDistance >= hDistanceLast) {
                                this.getPrev();
                                // swipeRight
                            } else if (hDistance <= -hSwipMinDistance && hDistance <= hDistanceLast) {
                                this.getNext();
                            }
                        } else { // Tap
                            if (!bars.hasClass('visible-bars')) {
                                this.showBars();
                                this.setTimeout();
                            } else {
                                this.clearTimeout();
                                this.hideBars();
                            }
                        }

                        $('#swipebox-slider').css({
                            '-webkit-transform': 'translate3d(' + currentX + '%, 0, 0)',
                            'transform': 'translate3d(' + currentX + '%, 0, 0)'
                        });

                        $('#swipebox-overlay').removeClass('leftSpringTouch rightSpringTouch');
                        $('.touching').off('touchmove.swipebox').removeClass('touching'); // Remove namespaced event
                    });
            },

            /**
             * Set timer to hide the action bars
             */
            setTimeout: function() {
                if (plugin.settings.hideBarsDelay > 0) {
                    this.clearTimeout(); // Clear any existing timeout first
                    this.timeout = window.setTimeout(() => {
                            this.hideBars();
                        },
                        plugin.settings.hideBarsDelay
                    );
                }
            },

            /**
             * Clear timer
             */
            clearTimeout: function() {
                window.clearTimeout(this.timeout);
                this.timeout = null;
            },

            /**
             * Show navigation and title bars
             */
            showBars: function() {
                const bars = $('#swipebox-top-bar, #swipebox-bottom-bar');
                if (this.doCssTrans()) {
                    bars.addClass('visible-bars');
                } else {
                    $('#swipebox-top-bar').animate({
                        top: 0
                    }, 500);
                    $('#swipebox-bottom-bar').animate({
                        bottom: 0
                    }, 500);
                    setTimeout(function() {
                        bars.addClass('visible-bars');
                    }, 1000);
                }
            },

            /**
             * Hide navigation and title bars
             */
            hideBars: function() {
                const bars = $('#swipebox-top-bar, #swipebox-bottom-bar');
                if (this.doCssTrans()) {
                    bars.removeClass('visible-bars');
                } else {
                    $('#swipebox-top-bar').animate({
                        top: '-50px'
                    }, 500);
                    $('#swipebox-bottom-bar').animate({
                        bottom: '-50px'
                    }, 500);
                    setTimeout(function() {
                        bars.removeClass('visible-bars');
                    }, 1000);
                }
            },

            /**
             * Animate navigation and top bars
             */
            animBars: function() {
                const bars = $('#swipebox-top-bar, #swipebox-bottom-bar');

                bars.addClass('visible-bars');
                this.setTimeout();

                $('#swipebox-slider').on('click.swipebox', () => { // Namespaced event
                    if (!bars.hasClass('visible-bars')) {
                        this.showBars();
                        this.setTimeout();
                    }
                });

                $('#swipebox-bottom-bar').hover(() => {
                        this.showBars();
                        bars.addClass('visible-bars');
                        this.clearTimeout();
                    },
                    () => { // Mouseleave
                        if (plugin.settings.hideBarsDelay > 0) {
                            bars.removeClass('visible-bars');
                            this.setTimeout();
                        }
                    });
            },

            /**
             * Keyboard navigation
             */
            keyboard: function() {
                $(window).on('keyup.swipebox', (event) => { // Namespaced event
                    event.preventDefault();
                    event.stopPropagation();

                    switch (event.keyCode) {
                        case 37: // Left arrow
                            this.getPrev();
                            break;
                        case 39: // Right arrow
                            this.getNext();
                            break;
                        case 27: // Escape
                            this.closeSlide();
                            break;
                    }
                });
            },

            /**
             * Navigation events : go to next slide, go to prevous slide and close
             */
            actions: function() {
                const action = 'touchend.swipebox click.swipebox'; // Namespaced events

                if (elements.length < 2) {
                    $('#swipebox-bottom-bar').hide();
                    // Hide top bar too if there's only one element and no title
                    if (elements[0] === undefined || elements[0].title === undefined || elements[0].title === '') {
                        $('#swipebox-top-bar').hide();
                    }
                } else {
                    $('#swipebox-prev').on(action, (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.getPrev();
                        this.setTimeout();
                    });

                    $('#swipebox-next').on(action, (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        this.getNext();
                        this.setTimeout();
                    });
                }

                $('#swipebox-close').on(action, (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.closeSlide();
                });
            },

            /**
             * Set current slide
             */
            setSlide: function(index, isFirst) {

                isFirst = isFirst || false;

                const slider = $('#swipebox-slider');

                currentX = -index * 100;

                if (this.doCssTrans()) {
                    slider.css({
                        '-webkit-transform': 'translate3d(' + (-index * 100) + '%, 0, 0)',
                        'transform': 'translate3d(' + (-index * 100) + '%, 0, 0)'
                    });
                } else {
                    slider.animate({
                        left: (-index * 100) + '%'
                    });
                }

                $('#swipebox-slider .slide').removeClass('current');
                $('#swipebox-slider .slide').eq(index).addClass('current');
                this.setTitle(index);

                if (isFirst) {
                    slider.fadeIn();
                }

                $('#swipebox-prev, #swipebox-next').removeClass('disabled');

                if (index === 0) {
                    $('#swipebox-prev').addClass('disabled');
                } else if (index === elements.length - 1 && plugin.settings.loopAtEnd !== true) {
                    $('#swipebox-next').addClass('disabled');
                }
            },

            /**
             * Open slide
             */
            openSlide: function(index) {
                $('html').addClass('swipebox-html');
                if (isTouch) {
                    $('html').addClass('swipebox-touch');
                    if (plugin.settings.hideCloseButtonOnMobile) {
                        $('html').addClass('swipebox-no-close-button');
                    }
                } else {
                    $('html').addClass('swipebox-no-touch');
                }
                $(window).trigger('resize'); // Trigger resize to adjust scrollbar
                this.setSlide(index, true);
            },

            /**
             * Set a time out if the media is a video
             */
            preloadMedia: function(index) {

                if (elements[index] === undefined) {
                    return; // Prevent errors if index is out of bounds
                }

                const src = elements[index].href;

                if (!this.isVideo(src)) {
                    setTimeout(() => {
                        this.openMedia(index);
                    }, 1000);
                } else {
                    this.openMedia(index); // Open videos immediately
                }
            },

            /**
             * Open
             */
            openMedia: function(index) {
                if (index < 0 || index >= elements.length) { // index bounds check
                    return;
                }

                const src = elements[index] !== undefined ? elements[index].href : null;

                if (!src) { // If src is null or undefined.
                    return;
                }


                const slide = $('#swipebox-slider .slide').eq(index);

                if (!this.isVideo(src)) {
                    slide.addClass('slide-loading');
                    this.loadMedia(src, function() { // 'this' is bound to the image element in loadMedia
                        slide.removeClass('slide-loading');
                        slide.html(this);
                        if (plugin.settings.afterMedia) {
                            plugin.settings.afterMedia(index);
                        }
                    });
                } else {
                    slide.html(this.getVideo(src));
                    if (plugin.settings.afterMedia) {
                        plugin.settings.afterMedia(index);
                    }
                }

            },

            /**
             * Set link title attribute as caption
             */
            setTitle: function(index) {
                const title = elements[index] !== undefined ? elements[index].title : null; // Get title safely

                const titleContainer = $('#swipebox-title');
                titleContainer.empty(); // Clear previous title

                if (title) {
                    $('#swipebox-top-bar').show();
                    titleContainer.append(title);
                } else {
                    //Hide if no title _and_ single image.
                    if (elements.length < 2) {
                        $('#swipebox-top-bar').hide();
                    }
                }
            },

            /**
             * Check if the URL is a video
             */
            isVideo: function(src) {
                if (!src) return false; // If src is undefined.

                return src.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) ||
                    src.match(/vimeo\.com\/([0-9]*)/) ||
                    src.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/) ||
                    src.toLowerCase().indexOf('swipeboxvideo=1') >= 0;
            },

            /**
             * Parse URI querystring and:
             * - overrides value provided via dictionary
             * - rebuild it again returning a string
             */
            parseUri: function(uri, customData) {
                const a = document.createElement('a');
                let qs = {};

                // Decode the URI
                a.href = decodeURIComponent(uri);

                // QueryString to Object
                if (a.search) {
                    // Fix: decodeURIComponent the values as well.  Also handle + signs.
                    qs = JSON.parse('{"' + a.search.toLowerCase().replace('?', '').replace(/\+/g, ' ').replace(/&/g, '","').replace(/=/g, '":"') + '"}', (key, value) => value ? decodeURIComponent(value) : value); // Added replacer function.
                }

                // Extend with custom data, and settings.
                $.extend(qs, customData, plugin.settings.queryStringData); // The dev has the final word.

                // Return querystring as a string
                let qsString = '';
                for (const key in qs) { // Use a for...in loop for clarity
                    if (Object.prototype.hasOwnProperty.call(qs, key) && qs[key] !== null && qs[key] !== undefined && qs[key] !== '') {
                        qsString += (qsString ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(qs[key]);
                    }
                }
                return qsString;

            },

            /**
             * Get video iframe code from URL
             */
            getVideo: function(url) {
                let iframe = '';
                const youtubeUrl = url.match(/((?:www\.)?youtube\.com|(?:www\.)?youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/);
                const youtubeShortUrl = url.match(/(?:www\.)?youtu\.be\/([a-zA-Z0-9\-_]+)/);
                const vimeoUrl = url.match(/(?:www\.)?vimeo\.com\/([0-9]*)/);
                let qs = '';

                if (youtubeUrl || youtubeShortUrl) {
                    const videoId = youtubeUrl ? youtubeUrl[2] : youtubeShortUrl[1]; // Get correct video ID
                    const embedDomain = (url.indexOf('youtube-nocookie.com') > -1) ? 'youtube-nocookie.com' : 'youtube.com'; //correct embed domain

                    qs = this.parseUri(url, {
                        'autoplay': (plugin.settings.autoplayVideos ? '1' : '0'),
                        'v': undefined // Remove 'v' parameter, we already have video ID
                    });
                    iframe = `<iframe width="560" height="315" src="https://${embedDomain}/embed/${videoId}?${qs}" frameborder="0" allowfullscreen></iframe>`;

                } else if (vimeoUrl) {
                    qs = this.parseUri(url, {
                        'autoplay': (plugin.settings.autoplayVideos ? '1' : '0'),
                        'byline': '0',
                        'portrait': '0',
                        'color': plugin.settings.vimeoColor
                    });
                    iframe = `<iframe width="560" height="315"  src="//player.vimeo.com/video/${vimeoUrl[1]}?${qs}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>`;

                } else {
                    iframe = `<iframe width="560" height="315" src="${url}" frameborder="0" allowfullscreen></iframe>`;
                }

                return `<div class="swipebox-video-container" style="max-width:${plugin.settings.videoMaxWidth}px"><div class="swipebox-video">${iframe}</div></div>`;
            },

            /**
             * Load image
             */
            loadMedia: function(src, callback) {
                // Inline content
                if (src.trim().indexOf('#') === 0) {
                    callback.call( // Call in context of jQuery object
                        $('<div>', {
                            'class': 'swipebox-inline-container'
                        })
                        .append(
                            $(src)
                            .clone() // Clone to avoid moving the original element!
                            .toggleClass(plugin.settings.toggleClassOnLoad)
                        )
                    );
                }
                // Everything else
                else {
                    if (!this.isVideo(src)) {
                        const img = $('<img>').on('load', function() { // `this` will refer to the img element
                            callback.call(img);
                        }).on('error', function() { // added error handling for images
                            console.error("Error loading image:", src); // Proper error logging
                            // Optionally, display an error message to the user within the slide.
                            callback.call($('<div>', {
                                'class': 'swipebox-error'
                            }).text('Failed to load image.'));

                        });
                        img.attr('src', src);
                    }
                }
            },

            /**
             * Get next slide
             */
            getNext: function() {

                let index = $('#swipebox-slider .slide.current').index();
                if (index + 1 < elements.length) {
                    index++;
                    this.setSlide(index);
                    this.preloadMedia(index + 1);
                    if (plugin.settings.nextSlide) {
                        plugin.settings.nextSlide(index);
                    }
                } else {
                    if (plugin.settings.loopAtEnd === true) {
                        index = 0;
                        this.preloadMedia(index); // Preload *before* setting slide
                        this.setSlide(index);
                        this.preloadMedia(index + 1); // Preload the next slide
                        if (plugin.settings.nextSlide) {
                            plugin.settings.nextSlide(index);
                        }
                    } else {
                        $('#swipebox-overlay').addClass('rightSpring');
                        setTimeout(() => {
                            $('#swipebox-overlay').removeClass('rightSpring');
                        }, 500);
                    }
                }
            },

            /**
             * Get previous slide
             */
            getPrev: function() {
                let index = $('#swipebox-slider .slide.current').index();
                if (index > 0) {
                    index--;
                    this.setSlide(index);
                    this.preloadMedia(index - 1);
                    if (plugin.settings.prevSlide) {
                        plugin.settings.prevSlide(index);
                    }
                } else {
                    $('#swipebox-overlay').addClass('leftSpring');
                    setTimeout(() => {
                        $('#swipebox-overlay').removeClass('leftSpring');
                    }, 500);
                }
            },

            /* jshint unused:false */ //The following two functions can be overridden.  Keeping for backwards compat
            nextSlide: function() {
                // Callback for next slide
            },

            prevSlide: function() {
                // Callback for prev slide
            },

            /**
             * Close
             */
            closeSlide: function() {
                $('html').removeClass('swipebox-html swipebox-touch swipebox-no-close-button'); // Remove all classes at once
                $(window).trigger('resize'); // Trigger resize
                this.destroy();
            },

            /**
             * Destroy the whole thing
             */
            destroy: function() {
                $(window).off('.swipebox'); // Unbind all namespaced events!
                $('body').off('.swipebox');
                $('#swipebox-slider').off('.swipebox').empty(); //added .empty
                $('#swipebox-overlay').remove();

                if (!Array.isArray(elem)) {
                    $elem.removeData('_swipebox');
                }

                if (this.target) {
                    this.target.trigger('swipebox-destroy');
                }

                $.swipebox.isOpen = false;

                if (plugin.settings.afterClose) {
                    plugin.settings.afterClose();
                }
            }
        };

        plugin.init(); // Initialize on creation
    };

    // jQuery plugin wrapper
    $.fn.swipebox = function(options) {
        if (!$.data(this, '_swipebox')) {
            const swipebox = new $.swipebox(this, options);
            this.data('_swipebox', swipebox);
        }
        return this.data('_swipebox'); // always return the swipebox instance
    };

}(window, document, jQuery));
