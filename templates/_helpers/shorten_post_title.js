class Custom  {

    constructor() {
        this.name = "shortenPostTitle";
    }

    helper(content)  {
        if (content !== null && content !== undefined) {
            let strippedFromHtml = content.toString().replace(/(&nbsp;|<([^>]+)>)/ig, "");
            return strippedFromHtml.slice(0, 20) + '...';
        } else {
            return '';
        }
    }
};

module.exports = Custom;
