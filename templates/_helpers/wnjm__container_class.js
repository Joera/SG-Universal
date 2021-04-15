
class Custom  {


    constructor() {
        this.name = "wijnemenjemee__containerClass";
    }

    helper(type,images,orientation,format)  {
        if (type === 'documents' || type === 'form' || type === 'table-of-contents-heading') {
            return 'full-width';
        } else if (type === 'datavisplanning' || (type === 'image_and_text' && format === 'large')) {
            return 'large-container';
        } else if(

            type === 'streamer' ||
            (type == 'images' && format === 'large' && Array.isArray(images) && images.length > 1) ||
            (type == 'images' && format === 'large') ) {

            return 'large-container';

        } else {
            return 'small-container';
        }
    }
};

module.exports = Custom;
