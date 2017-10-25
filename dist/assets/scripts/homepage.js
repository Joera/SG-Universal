'use strict';

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