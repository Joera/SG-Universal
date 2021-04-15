class Custom  {

    constructor() {
        this.name = "excerpt";
    }

    helper(content) {
        if (content !== null && content !== undefined) {
            const strippedFromHtml = content.toString().replace(/(&nbsp;|<([^>]+)>)/ig, "");
            const sentences = strippedFromHtml.match( /[^\.!\?]+[\.!\?]+/g );
            let newContent;
            if (sentences !== null) {
            if (sentences[0].length > 140) {
            newContent = sentences[0];
            } else if (sentences[1] && sentences[0].length + sentences[1].length > 140) {
                newContent = sentences[0] + sentences[1];
            } else if (sentences[1] && sentences[2] && sentences[0].length + sentences[1].length + sentences[2].length > 140) {
                newContent = sentences[0] + sentences[1] + sentences[2];
            } else {
                newContent = sentences[0] + sentences[1];
            }
            } else {
                newContent = strippedFromHtml;
            }

            return newContent;

        } else {

            return "";
        }
    }
};

module.exports = Custom;
