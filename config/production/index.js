const devConfig = {
    env: 'production',
    dist: 'dist',
    db: 'mongodb://localhost/lijnennet',
    port: 8080,
    wordpressUrl: 'http://lijnennet.local',
    wordpressApiPath: 'wp-json/wp/v2/all',
    algoliaIndexNamePrefix: 'test_',
    algoliaApplicationId: 'ABLQBAQF04',
    algoliaApiKey: 'ae42b70689c1ec9f99ead26a257f16df',
    baseUrl: 'http://lijnennet.local',
    templateNameKey: 'type'
};

module.exports = devConfig;