export interface ContentOwner {
    MONGODB_DB: string,
    SESSION_SECRET : string,
    PREVIEW_AUTH_KEY : string,
    WP_URL_DOCKER : string,
    WP_URL_BROWSER : string,
    WP_API_PATH : string,
    TEMPLATE_NAME_KEY : string,
    CUSTOM_CONTENT: any[],
    CUSTOM_SEARCH_CONTENT: any[]
}

export interface RenderEnv {

    RENDER_ENVIRONMENT: string,
    BASE_URL: string,
    ASSETS_URL: string,
    REMOTE_HOST: string,
    REMOTE_PATH: string,
    RENDER_TASKS : string,
    RENDER_TYPES : string,
    ALGOLIA_INDEX_NAME_PREFIX: string,
    ALGOLIA_APP_ID: string,
    ALGOLIA_API_KEY: string,
    TEMPLATE_DATA: any [],
    CUSTOM_PATHS: any[],
    RIPPLES: any[]
}
