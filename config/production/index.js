const devConfig = {
    env: 'production',
    dist: 'dist',
    db: 'mongodb://localhost/manon',
    port: 8080,
    wordpressUrl: 'http://manon-sg.local',
    wordpressApiPath: 'wp-json/wp/v2/all',
    algoliaIndexNamePrefix: 'test_',
    algoliaApplicationId: 'ABLQBAQF04',
    algoliaApiKey: 'ae42b70689c1ec9f99ead26a257f16df',
    baseUrl: 'http://manon-sg.local',
    templateNameKey: 'type'
};

module.exports = devConfig;