'use strict';

const Q = require('q'),
    logger = require('../config/winston'),
    Feed = require('feed'),
    BlogPersistence = require('../persistences/blog.persistence');

class RSSService {


    get() {
        let deferred = Q.defer();
        let self = this;


        let now = new Date();

        // let feed = {};
        let feed = new Feed({
            title: 'Zuidas houdt je op de hoogte',
            description: 'Dit is het platform van Amsterdam Zuidas. Hier vindt u alles over de ontwikkeling van het gebied Zuidas en de bouw van Zuidasdok. De gemeente Amsterdam werkt aan een prachtige stadswijk. Zuidasdok werkt aan betere bereikbaarheid van Zuidas en de noordelijke Randstad. Samen zijn we Amsterdam Zuidas',
            id: 'https://zuidas.nl',
            link: 'https://zuidas.nl',
            image: 'https://zuidas.nl/assets/images/android-icon-192x192.png',
            favicon: 'https://zuidas.nl/favicon.ico',
            updated: now, // optional, default = today
            feedLinks: {
                rss: 'https://zuidas.nl/rss'
            },
            author: {
                name: 'Zuidas',
                email: 'contact@zuidas.nl',
                link: 'https://zuidas.nl/over-ons'
            }
        });

        const blogPersistence = new BlogPersistence(); // create instance of blog persistence

        blogPersistence.getRecentAsPromise(10)
            .then( (posts) => {

                posts.forEach( post => {

                    feed.addItem({
                        title: post.title,
                        id: post.url,
                        link: post.url,
                        description: post.content,
                        content: post.content,
                        author: [{
                            name: post.author.name,
                            email: post.author.email
                        }],
                        date: post.date,
                        image: 'https://ucarecdn.com/' + post.main_image.external_id + '/-/resize/760x/' + post.main_image.filename
                    });

                    deferred.resolve(feed);
                });
            });

        return deferred.promise;
    }



}

module.exports = RSSService;