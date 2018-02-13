const devConfig = {
    env: 'production',
    dist: '/var/www/html',
    db: 'mongodb://localhost/amstelveenlijn',
    port: 8080,
    wordpressUrl: 'http://amstelveenlijn.nl',
    algoliaIndexNamePrefix: 'AVL_core',
    algoliaApplicationId: 'RLZJT7BFZT',
    algoliaApiKey: 'f0dc506dd42b55db93e55d28c3e667b5',
    baseUrl: 'http://amstelveenlijn.nl',
    templateNameKey: 'type'
};

module.exports = devConfig;
