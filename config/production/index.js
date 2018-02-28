const devConfig = {
    env: 'production',
    dist: '/var/www/html',
    db: 'mongodb://localhost/eureka',
    port: 8080,
    wordpressUrl: 'http://wp.eurekarail.net',
    algoliaIndexNamePrefix: 'eureka-staging_',
    algoliaApplicationId: 'RLZJT7BFZT',
    algoliaApiKey: 'f0dc506dd42b55db93e55d28c3e667b5',
    baseUrl: 'http://eurekarail.net',
    templateNameKey: 'type'
};

module.exports = devConfig;
