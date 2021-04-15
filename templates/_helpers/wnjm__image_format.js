class Custom  {


    constructor() {
        this.name = "wijnemenjemee__imageFormat";
    }

    helper(index, count, orientation)  {

        if (count === 'single') {

            return '';

        } else if (count === 'duo') {

        if ((orientation === 'left' && index === 0) || (orientation === 'right' && index === 1) || orientation === 'center') {

            return 'camera';

        } else {

            return 'camera';
        }
        } else if (count === 'trio') {

            return 'camera';

        } else {
            return 'camera';
        }
    }
};

module.exports = Custom;
