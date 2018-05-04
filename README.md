# Static Site Generator Core


### Bulk renderer
- you can add a type argument to the bulk render command. Only the pages of the profided type will be rendered. For example: `node tasks/bulkrender.js post` will render only pages of the type "post".



### Template definitions

- If template folder does not contain a .handlebars file, them the template will not be added to the render queue. The defined dependencies will be added to the render queue if they are defined in the definitions file.
- If the searchSnippetTemplate is not defined in the definitions file no search snippet will be rendered and data will not be pushed to Algolia search


name: 'home', // name of the template. Corresponds with the type property of the page object
template: 'home.handlebars', // filename of the handlebars template, template must be in the templates root folder
searchSnippetTemplate: '', // filename of the handlebars template
getSearchSnippetData: (data, correlationId)
getTemplateData: (data, correlationId)
getPath: (data, correlationId)
getDependencies: (data, correlationId)
getMapping: (data, correlationId)
preRender: (data, correlationId)
postRender: (data, correlationId)
preDelete: (data, correlationId)
postDelete: (data, correlationId)


### Handlebar helpers
