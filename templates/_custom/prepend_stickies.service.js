class PrependStickiesService {

    constructor() {

    }

    init(stickies,dataObject) {

        if (stickies && stickies.length > 0) {
            dataObject.posts = stickies.concat(dataObject.posts);
        }

        return {

            "items" : stickies,
            "dataObject" : dataObject
        }
    }

}

module.exports = PrependStickiesService;
