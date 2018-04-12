const devConfig = {
    env: 'production',
    dist: 'dist',
    db: 'mongodb://localhost/lijnennet',
    port: 8080,
    wordpressUrl: 'http://lijnennet.local',
    wordpressApiPath: 'wp-json/wp/v2/all',
        algoliaIndexNamePrefix: 'Lijnennet_test',
        algoliaApplicationId: 'RLZJT7BFZT',
        algoliaApiKey: 'f0dc506dd42b55db93e55d28c3e667b5',
    baseUrl: 'http://lijnennet.local',
    templateNameKey: 'type'
};

module.exports = devConfig;
