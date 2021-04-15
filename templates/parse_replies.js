class Custom  {

    constructor() {
        this.name = "parseReplies";
    }

    helper(arr)  {
        if (arr) {
            const newArr = [];
            for (let i = 0; i < arr.length; i++) {
                if (i > 0 && newArr.indexOf(arr[i].name) < 0) {
                    newArr.push(arr[i].name);
                }
            }
            return newArr;
        } else {
            return;
        }
    }
};

module.exports = Custom;
