class CollectAllCommentsService {

    constructor() {

    }

    correctBoolean(value ) {

        if (value === true || value === false) {
            return value;
        } else if (value === '1' || value > 0 ) {
            return true;
        } else if (value === '0' || value < 1 ) {
            return false;
        } else {
            return false;
        }
    }

    init(posts,dataObject) {

        let comments = [];

        for (let post of posts) {

            if (post.interaction && post.interaction.nested_comments != null) {

                for (let thread of post.interaction.nested_comments) {

                    for (let comment of thread) {


                        // did niet via model doen?
                        // of helemaal via algolia?

                        comment.isEditor = this.correctBoolean(comment['is_editor']);
                        comment.type = 'comment';
                        comment.post = {};
                        comment.post.id = post._id;
                        comment.post.count = post.interaction.comment_count;
                        comment.post.title = post.title;
                        comment.post.url = post.url;
                        comment.thread = {};
                        comment.thread.id = thread[0].id;
                        comment.thread.count = thread.length;
                        comments.push(comment)

                    }
                }
            }
        }



        comments.sort(function (a, b) {

            if (a.date < b.date) {
                return 1;
            }
            if (a.date > b.date) {
                return -1;
            }
        }).slice(0,24);

        return {
            "items" : comments,
            "dataObject" : dataObject
        }
    }
}

module.exports = CollectAllCommentsService;
