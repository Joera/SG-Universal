'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Appreciation = function () {
    function Appreciation() {
        _classCallCheck(this, Appreciation);

        this.ip = null;
        this.appreciationRow = null;
        this.arc = null;
        this.positiveButton = null;
        this.negativeButton = null;
        this.percentage = 0;
    }

    _createClass(Appreciation, [{
        key: 'init',
        value: function init() {

            var self = this,
                findIP = new Promise(function (r) {
                var w = window,
                    a = new (w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection)({ iceServers: [] }),
                    b = function b() {};a.createDataChannel("");a.createOffer(function (c) {
                    return a.setLocalDescription(c, b, b);
                }, b);a.onicecandidate = function (c) {
                    try {
                        c.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g).forEach(r);
                    } catch (e) {}
                };
            });

            findIP.then(function (ip) {
                self.ip = ip;
                console.log(self.ip);
            });

            this.postID = document.querySelector('#post-id');

            this.appreciationRow = document.querySelector('#appreciation-row');
            this.arc = this.appreciationRow.querySelector('.circle-foreground');
            this.percentageValue = this.appreciationRow.querySelector('#appreciation-percentage');
            this.textPositiveCount = this.appreciationRow.querySelector('#text-positive-count');
            this.textTotalCount = this.appreciationRow.querySelector('#text-total-count');
            this.percentage = this.appreciationRow.getAttribute("data-appreciation-percentage");
            this.totalCount = parseInt(this.appreciationRow.getAttribute("data-total-count"));
            this.positiveCount = parseInt(this.appreciationRow.getAttribute("data-positive-count"));

            this.apprecationPuppet = document.querySelector('#appreciation-puppet');
            this.manArc = this.apprecationPuppet.querySelector('.circle-foreground');
            this.puppetPercentageValue = this.apprecationPuppet.querySelector('#appreciation-percentage');
            this.puppetPercentage = this.apprecationPuppet.getAttribute("data-appreciation-percentage");

            this.drawCircle(this.percentage);
        }
    }, {
        key: 'ratePositive',
        value: function ratePositive(postID) {

            var self = this,
                newPercentage = void 0,
                url = WP_URL + '/api/appreciation/rate_post?post_id=' + postID + '&value=positive';

            axios.post(url).then(function (response) {
                if (response.status !== 200) {
                    console.log('foutje bedankt');
                }
            });

            this.positiveCount = this.positiveCount + 1;
            this.totalCount = this.totalCount + 1;

            this.appreciationRow.style.opacity = 1;
            this.percentage = Math.round(this.positiveCount / this.totalCount * 100);
            this.puppetPercentage = Math.round(this.positiveCount / this.totalCount * 100);

            setTimeout(function () {
                self.drawCircle(self.percentage);
            }, 800);
        }
    }, {
        key: 'rateNegative',
        value: function rateNegative(postID) {

            var self = this,
                url = WP_URL + '/api/appreciation/rate_post?post_id=' + postID + '&value=negative';

            axios.post(url).then(function (response) {

                if (response.status !== 200) {
                    console.log('foutje bedankt');
                }
            });

            this.totalCount = this.totalCount + 1;

            this.appreciationRow.style.opacity = 1;
            this.percentage = Math.round(this.positiveCount / this.totalCount * 100);
            this.puppetPercentage = Math.round(this.positiveCount / this.totalCount * 100);

            setTimeout(function () {
                self.drawCircle(self.percentage);
            }, 800);
        }
    }, {
        key: 'drawCircle',
        value: function drawCircle(percentage) {

            var c = (100 - 16) * 3.14;
            var arcOffset = percentage / 100 * c;

            this.arc.style.strokeDasharray = arcOffset + ' ' + c;
            this.arc.style.strokeDashoffset = arcOffset;

            this.manArc.style.strokeDasharray = arcOffset + ' ' + c;
            this.manArc.style.strokeDashoffset = arcOffset;

            this.puppetPercentageValue.innerHTML = percentage;

            this.percentageValue.innerHTML = percentage;
            // this.textPositiveCount.innerHTML = this.positiveCount;
            // this.textTotalCount.innerHTML = this.totalCount;
        }
    }]);

    return Appreciation;
}();

var appreciation = new Appreciation();
appreciation.init();

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

var Commenting = function () {
    function Commenting() {
        _classCallCheck(this, Commenting);

        this.threadIndex = null;
        this.commentParent = null;
    }

    _createClass(Commenting, [{
        key: 'init',
        value: function init() {}
    }]);

    return Commenting;
}();

var Respond = function (_Commenting) {
    _inherits(Respond, _Commenting);

    function Respond() {
        _classCallCheck(this, Respond);

        var _this = _possibleConstructorReturn(this, (Respond.__proto__ || Object.getPrototypeOf(Respond)).call(this));

        _this.response = {};
        return _this;
    }

    _createClass(Respond, [{
        key: 'init',
        value: function init() {

            var self = this;

            this.respondForm = document.getElementById("respondform");
            this.formTextArea = this.respondForm.querySelector('textarea');
            this.formInputFields = this.respondForm.querySelectorAll('input');
            this.theRestofForm = this.respondForm.querySelectorAll('.half');
            this.formSubmitButton = this.respondForm.querySelector('button');
            // this.formSubmitWarning = this.respondForm.querySelector('#warning');
            this.commentTemplateNew = document.getElementById("comment-template-new");
            this.commentTemplateReply = document.getElementById("comment-template-reply");
            this.commentsWrapper = document.getElementById("comments-wrapper");
            this.respondPencil = document.getElementById("respond-pencil");
            this.validateForm();
        }
    }, {
        key: 'openThread',
        value: function openThread(el) {

            var self = this;

            this.commentParent = el.parentNode.getAttribute('data-thread-id');
            this.threadElement = document.querySelector('.thread[data-thread-id="' + self.commentParent + '"]');

            var newForm = self.respondForm.cloneNode(true);
            this.respondForm.remove();
            newForm.style.display = 'flex';
            this.threadElement.insertBefore(newForm, this.threadElement.children[1]);
            this.onFocusOut();
            this.respondPencil.style.display = 'none';
            this.init();
        }
    }, {
        key: 'onFocus',
        value: function onFocus() {

            if (this.theRestofForm) {
                this.theRestofForm.forEach(function (el) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                });
            }
            this.respondForm.style.height = 'auto';
            this.respondForm.style.overflow = 'visible';
            this.formTextArea.style.height = '8rem';
        }
    }, {
        key: 'onFocusOut',
        value: function onFocusOut() {

            if (this.theRestofForm) {
                this.theRestofForm.forEach(function (el) {
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                });
            }
            this.formTextArea.style.height = 'auto';
            this.respondForm.style.overflow = 'hidden';
            this.respondForm.style.height = '4.5rem';
        }
    }, {
        key: 'hideButtonTemporarilyAfterSubmit',
        value: function hideButtonTemporarilyAfterSubmit() {

            var self = this;
            this.formSubmitButton.style.display = 'none';
            // this.formSubmitWarning.style.display = 'block';
            setTimeout(function () {
                self.formSubmitButton.style.display = 'block';
                // self.formSubmitWarning.style.display = 'none';
            }, 15000);
        }
    }, {
        key: 'validateForm',
        value: function validateForm() {

            var self = this;

            this.respondForm.addEventListener('submit', function (event, errors) {
                event.preventDefault();
                if (errors) {
                    document.getElementById('formerror').textContent = 'Wilt u alle drie de velden invullen?';
                } else {
                    self.submitNewComment();
                }
            });
        }
    }, {
        key: 'submitNewComment',
        value: function submitNewComment() {

            // console.log(this.commentParent );

            var self = this;

            this.response.author = document.getElementById("respondAuthor").value;
            this.response.email = document.getElementById("respondEmail").value;
            this.response.content = document.getElementById("respondMessage").value;
            this.response.postId = document.getElementById("respondPostId").value;
            this.response.commentParent = this.commentParent;

            if (self.response.author === '') {
                self.response.author = 'anoniem';
            }
            if (self.response.email === '') {
                self.response.email = 'anoniem@anoniem.nl';
            }

            document.getElementById("respondMessage").value = '';

            if (this.commentParent === null) {
                this.insertNewThread();
            } else {
                this.insertReply();
            }

            var url = WP_URL + '/api/respond/submit_comment?post_id=' + self.response.postId + '&name=' + encodeURIComponent(self.response.author) + '&email=' + self.response.email + '&content=' + encodeURIComponent(self.response.content) + '&comment_parent=' + self.response.commentParent;
            axios.post(url).then(function (response) {

                //self.logToNode(response.status,response.request.response,response.request.responseURL);

                if (response.status !== 200) {

                    // DO SOMETHING!!! HELP !!!!!!
                    console.log('foutje bedankt');
                }
            });

            this.hideButtonTemporarilyAfterSubmit();
        }
    }, {
        key: 'insertNewThread',
        value: function insertNewThread() {

            var self = this;
            var tempComment = self.commentTemplateNew.cloneNode(true);
            tempComment.querySelector('h4').innerHTML = this.response.author;
            tempComment.querySelector('.datetime').innerHTML = moment().format('D/MM/YYYY | HH:mm');
            tempComment.querySelector('#commment-template-text').innerHTML = this.response.content;
            tempComment.removeAttribute('id');
            this.commentsWrapper.insertBefore(tempComment, this.commentsWrapper.firstChild);
            this.onFocusOut();
            // this.init();

            setTimeout(function () {
                tempComment.classList.add('visible');
            }, 100);
        }
    }, {
        key: 'insertReply',
        value: function insertReply() {
            var self = this;
            var tempComment = self.commentTemplateReply.cloneNode(true);
            tempComment.querySelector('.datetime').innerHTML = moment().format('D/MM/YYYY | HH:mm');
            tempComment.querySelector('h4').innerHTML = this.response.author;
            tempComment.querySelector('#commment-template-text').innerHTML = this.response.content;
            tempComment.style.display = 'flex';
            // return respondForm to top
            var newForm = self.respondForm.cloneNode(true);
            this.respondForm.remove();
            document.getElementById('respondcontainer').appendChild(newForm);
            this.onFocusOut();
            this.init();
            this.commentParent = null;
            this.threadElement.insertBefore(tempComment, this.threadElement.children[1]);

            setTimeout(function () {
                tempComment.classList.add('visible');
            }, 100);
        }
    }, {
        key: 'rate',
        value: function rate(el, commentID) {

            var self = this,
                newPercentage = void 0,
                url = WP_URL + '/api/respond/rate_comment?comment_id=' + commentID;

            axios.post(url).then(function (response) {

                if (response.status !== 200) {
                    console.log('foutje bedankt');
                }
            });

            // console.log(el);
            // let valueContainer= el.parentNode.querySelector('.rating-value');
            // console.log(commentID);

            // this.positiveCount = this.positiveCount + 1;
            // this.totalCount = this.totalCount + 1;
            //
            // this.percentage = Math.round((this.positiveCount / this.totalCount) * 100);
            // this.drawCircle(self.percentage);
        }
    }, {
        key: 'subscribeToComments',
        value: function subscribeToComments() {}

        // switchCommentsOrder() {

        // 	if (this.commentsOrder ==='desc') { this.commentsOrder = 'asc'; } else { this.commentsOrder = 'desc'; }

        // 	if (window.localStorage) { localStorage.setItem('commentsOrder'); }

        // 	this.getCommentStreamList(this.commentsOrder);

        // }

    }]);

    return Respond;
}(Commenting);

var commenting = new Commenting();
commenting.init();

var respond = new Respond();
respond.init();

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