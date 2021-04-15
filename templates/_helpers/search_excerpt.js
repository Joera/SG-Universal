class Custom  {

    constructor() {
        this.name = "searchExcerpt";
    }

    helper(content)  {

        if (content !== null && content !== undefined) {
            const strippedFromHtml = content.toString().replace(/(&nbsp;|<([^>]+)>)/ig, "");
            let newContent = strippedFromHtml.slice(0, 140);
            newContent = newContent + " ...";
            return newContent;
        } else {
            return "";
        }
    }
};

module.exports = Custom;
