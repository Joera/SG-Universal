'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lightbox = function Lightbox(galleryElement) {

    // const galleryElement = galleryElement;
    var lightboxElement = document.getElementsByClassName('lightbox')[0];
    var miniaturesElement = document.getElementsByClassName('lightbox-miniatures')[0];
    var miniaturesElementInfo = miniaturesElement.getBoundingClientRect();;
    var outerMiniaturesElement = document.getElementsByClassName('lightbox-miniatures-outer')[0];
    var outerMiniaturesElementInfo = outerMiniaturesElement.getBoundingClientRect();
    var bodyElement = document.getElementsByTagName('body')[0];
    var lightboxElementInner = lightboxElement.children[0];
    var currentMiniatureImageElement = null;
    var currentImageElement = document.getElementsByClassName('lightbox-current-image')[0];
    var closeElement = document.getElementsByClassName('lightbox-close')[0];
    var previousButton = document.getElementsByClassName('lightbox-previous')[0];
    var nextButton = document.getElementsByClassName('lightbox-next')[0];
    var toBeginButton = document.getElementsByClassName('lightbox-to-begin')[0];
    var toEndButton = document.getElementsByClassName('lightbox-to-end')[0];

    var showLightbox = function showLightbox(event) {

        lightboxElement.style.display = "block";
        bodyElement.classList.add('fixed');

        var clickedElement = event.target || event.srcElement;

        var miniature = getCurrentMiniature(clickedElement);
        setCurrentImage(miniature);
    };

    var getCurrentMiniature = function getCurrentMiniature(clickedElement) {
        var currentMiniature = null;
        for (var i = 0; i < miniaturesElement.children.length; i++) {
            var miniature = miniaturesElement.children[i];
            var miniatureSrc = miniature.children[0].src.split('/').pop();
            var clickedElementSrc = clickedElement.src.split('/').pop();
            if (miniatureSrc === clickedElementSrc) {
                currentMiniature = miniature.children[0];
            }
        }
        return currentMiniature;
    };

    var addToMiniatures = function addToMiniatures(miniature) {
        setOnClick(miniature, clickedMiniature);
        var overlay = document.createElement("div");
        overlay.setAttribute("class", "overlay");
        miniature.appendChild(overlay);
        miniaturesElement.appendChild(miniature);
    };

    var clickedMiniature = function clickedMiniature(event) {
        var clickedElement = event.target || event.srcElement;
        setCurrentImage(clickedElement);
    };

    var centerMiniature = function centerMiniature(element) {

        var miniatureWidth = 170;

        outerMiniaturesElementInfo = outerMiniaturesElement.getBoundingClientRect();
        var halfOfContainer = outerMiniaturesElementInfo.width / 2;

        miniaturesElementInfo = miniaturesElement.getBoundingClientRect();

        var numberOfMiniatures = Array.from(element.parentElement.parentElement.children).length;
        var indexOfMiniature = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);

        if (indexOfMiniature === 0) {
            hideElement(previousButton);
        } else if (indexOfMiniature === numberOfMiniatures - 1) {
            hideElement(nextButton);
        } else {
            showElement(previousButton);
            showElement(nextButton);
        }

        var numberOfMiniaturesHalf = halfOfContainer / miniatureWidth;
        numberOfMiniaturesHalf = Math.floor(numberOfMiniaturesHalf);

        var limitLeft = numberOfMiniaturesHalf + 1;
        var limitRight = numberOfMiniatures - numberOfMiniaturesHalf - 1;

        if (indexOfMiniature >= limitLeft && indexOfMiniature < limitRight) {
            var left = -170 * indexOfMiniature + halfOfContainer - 85;
            miniaturesElement.style.left = left + 'px';
        } else if (indexOfMiniature <= limitLeft) {
            var _left = 0;
            miniaturesElement.style.left = _left + 'px';
        } else if (indexOfMiniature >= limitRight) {
            var _left2 = -(miniaturesElementInfo.width - outerMiniaturesElementInfo.width);
            miniaturesElement.style.left = _left2 + 'px';
        } else {
            //
        }
    };

    var setCurrentImage = function setCurrentImage(clickedElement) {

        if (clickedElement !== null) {

            var imageElement = null;

            if (clickedElement.className === 'overlay') {
                imageElement = clickedElement.previousSibling;
            } else if (clickedElement.className === 'img-container') {
                imageElement = clickedElement.children[0];
            } else if (clickedElement.nodeName === 'IMG') {
                imageElement = clickedElement;
            } else {
                imageElement = clickedElement;
            }

            imageElement.parentElement.classList.add('active');

            if (currentMiniatureImageElement) {
                currentMiniatureImageElement.parentElement.classList.remove('active');
            };

            currentMiniatureImageElement = imageElement;

            var clone = imageElement.cloneNode(true);
            clone.className = 'img-container lazyload lightbox-current-image';
            clone.removeAttribute('sizes');
            currentImageElement.replaceWith(clone);

            currentImageElement = document.getElementsByClassName('lightbox-current-image')[0];

            centerMiniature(imageElement);
        }
    };

    var hideElement = function hideElement(element) {
        element.style.display = "none";
    };

    var showElement = function showElement(element) {
        element.style.display = "flex";
    };

    var toNextImage = function toNextImage(clickedImage) {
        var nextImageContainer = currentMiniatureImageElement.parentElement.nextSibling;
        if (nextImageContainer) {
            var nextImage = nextImageContainer.children[0];
            setCurrentImage(nextImage);
        }
    };

    var toPreviousImage = function toPreviousImage(clickedImage) {
        var previousImageContainer = currentMiniatureImageElement.parentElement.previousSibling;
        if (previousImageContainer) {
            var previousImage = previousImageContainer.children[0];
            setCurrentImage(previousImage);
        }
    };

    var toBegin = function toBegin() {
        var left = 0;
        miniaturesElement.style.left = left + 'px';
    };

    var toEnd = function toEnd() {
        var left = -(miniaturesElementInfo.width - outerMiniaturesElementInfo.width);
        miniaturesElement.style.left = left + 'px';
    };

    var hideLightbox = function hideLightbox() {
        lightboxElement.style.display = "none";
        bodyElement.classList.remove('fixed');
    };

    var setOnClick = function setOnClick(element, triggerFunction) {
        element.onclick = triggerFunction;
    };

    return {
        init: function init() {
            for (var i = 0; i < galleryElement.children.length; i++) {
                var imageElement = galleryElement.children[i];
                var clone = imageElement.children[1].cloneNode(true);
                var imageParentElement = imageElement.parentElement;
                addToMiniatures(clone);
                setOnClick(imageParentElement, showLightbox);
                setOnClick(closeElement, hideLightbox);
                setOnClick(nextButton, toNextImage);
                setOnClick(previousButton, toPreviousImage);
                setOnClick(toBeginButton, toBegin);
                setOnClick(toEndButton, toEnd);
            }
        }
    };
};

var galleries = document.getElementsByClassName('lightbox-gallery');

if (galleries) {
    for (var i = 0; i < galleries.length; i++) {
        var galleryElement = galleries[i];
        var lightbox = Lightbox(galleryElement);
        lightbox.init();
    }
}

function newsletterSubscribe() {
    var email = document.querySelector('#footer-subscribe').value;
    var url = WP_URL + "/api/subscribe/add_subscriber/";
    var body = 'name=-&subscription=monthly&email=' + email;
    var config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    axios.post(url, body, config).then(function (response) {
        document.querySelector('#footer-subscribe').value = null;
        document.querySelector('#subscribe-msg').innerHTML = 'U ontvangt over enige ogenblikken een bevestiging per email.';
    }).catch(function (error) {
        console.log(error);
    });
}

var SocialDialogue = function () {
    function SocialDialogue() {
        _classCallCheck(this, SocialDialogue);
    }

    _createClass(SocialDialogue, [{
        key: 'windowpop',
        value: function windowpop(url, width, height) {

            var leftPosition = void 0,
                topPosition = void 0;
            //Allow for borders.
            leftPosition = window.screen.width / 2 - (width / 2 + 10);
            //Allow for title and status bars.
            topPosition = window.screen.height / 2 - (height / 2 + 50);
            //Open the window.
            window.open(url, "Window2", "status=no,height=" + height + ",width=" + width + ",resizable=yes,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no");
        }
    }]);

    return SocialDialogue;
}();

var socialDialogue = new SocialDialogue();

// get subscriber info from remote host
function getSubscriber() {
    var url = WP_URL + "/api/subscribe/get_subscriber_by_token/?token=" + token,
        config = {};
    // sent http request for getting subscriber details
    axios.get(url, config).then(function (response) {
        if (response.data.status === 'ok') {
            subscriber = response.data.subscriber; // set subscriber
            document.querySelector('.newsletter-settings > .newsletter-settings-header > .newsletter-settings-email').innerHTML = response.data.subscriber.email; // set emailaddress
            document.querySelector('.newsletter-settings > .newsletter-settings-content input[value=' + subscriber.subscription + ']').checked = true; // set selected option
            document.querySelector('.newsletter-settings > .newsletter-settings-content input[value=' + subscriber.theme + ']').checked = true; // set selected option
            document.querySelector('.newsletter-settings-container').classList.add('show'); // show newsletter subscription modal
            document.querySelector('body').classList.add('noscroll'); // disable scrolling
        } else {
            document.querySelector('.newsletter-settings > .newsletter-settings-content').innerHTML = 'Gegevens niet gevonden';
        }
    }).catch(function (error) {
        document.querySelector('.newsletter-settings > .newsletter-settings-content').innerHTML = 'Gegevens niet gevonden';
    });
}

// update subscriber info
function updateSubscriber() {
    // set the subscription value
    subscriber.subscription = document.querySelector('.newsletter-settings > .newsletter-settings-content input[name="subscription"]:checked').value;
    subscriber.theme = document.querySelector('.newsletter-settings > .newsletter-settings-content input[name="theme"]:checked').value;

    var url = WP_URL + "/api/subscribe/update_subscriber/",
        body = 'name=-&id=' + subscriber.id + '&subscription=' + subscriber.subscription + '&theme=' + subscriber.theme + '&email=' + subscriber.email,
        config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    // make call
    axios.post(url, body, config).then(function (response) {
        navigateHome();
    }).catch(function (error) {
        console.log(error);
    });
}

// get token from url
function getToken() {
    var t = '',
        url = window.location.href;
    // get token from url
    if (url.split('newsletter-token=').length === 2) {
        t = url.split('newsletter-token=')[1];
    }
    return t;
}

// navigate to the home page
function navigateHome() {
    var url = BASE_URL + "/heerlen-landgraaf";
    window.location.href = url;
}

//
var token = getToken(),
    subscriber = null;

// get subscriber data
if (token !== '') {
    getSubscriber(token);
}