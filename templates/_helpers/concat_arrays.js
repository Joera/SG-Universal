class Custom  {

    constructor() {
        this.name = "concatArrays";
    }

    helper(a, b, options) {

        if (Array.isArray(a) && Array.isArray(b)) {
            return a.concat(b);
        } else {
            return a;
        }
    }
};

module.exports = Custom;
