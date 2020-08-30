const devConfig = {
    env: 'production',
    dist: '/var/www/html',
    db: 'mongodb://ssgs_user:ZJqg9L6nLCnb[A66@shared_mongo/eureka',
    port: 3713,
    wordpressUrl: 'https://wp.eurekarail.net',
    wordpressApiPath: 'api/get_posts',
    algoliaIndexNamePrefix: 'eureka-staging_',
    algoliaApplicationId: 'RLZJT7BFZT',
    algoliaApiKey: 'f0dc506dd42b55db93e55d28c3e667b5',
    baseUrl: 'https://eurekarail.net',
    templateNameKey: 'type',
    renderTasks: ['searchPosts','dataset','searchDocuments'],
};

module.exports = devConfig;