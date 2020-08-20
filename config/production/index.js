const devConfig = {
    env: 'development',
    dist: '/var/www/html',
    db: 'mongodb://shared_mongo/eurekarail',
    port: 3713,
    wordpressUrl: 'https://eureka-wp.publikaan.nl',
    wordpressApiPath: 'api/get_posts',
    algoliaIndexNamePrefix: 'eureka-staging_',
    algoliaApplicationId: 'RLZJT7BFZT',
    algoliaApiKey: 'f0dc506dd42b55db93e55d28c3e667b5',
    baseUrl: 'https://eureka.publikaan.nl',
    templateNameKey: 'type',
    renderTasks: ['searchPosts','dataset','searchDocuments'],
};

module.exports = devConfig;