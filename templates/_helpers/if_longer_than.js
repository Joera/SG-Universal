class Custom  {

    constructor() {
        this.name = "ifLongerThan";
    }

    helper(a, b, options) {

        if (Array.isArray(a) && a.length > parseInt(b)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }
};

module.exports = Custom;
