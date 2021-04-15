
const moment = require('../moment');
moment.locale('nl');

class Custom  {

    constructor() {
        this.name = "formatDate";
    }

    helper(datetime, format) {
        const DateFormats = {
            short: "DD/MM/YYYY",
            long: "dddd D MMMM YYYY",
            time: "D MMMM hh:mm:ss",
            year: "YYYY",
            comment: "D MMMM YYYY | HH:mm",
            commentSmall: "D/M HH:mm"
        };

        if (moment) {


            // can use other formats like 'lll' too
            format = DateFormats[format] || format;
            return moment(datetime).format(format);
        } else {

            return datetime;
        }
    }
};

module.exports = Custom;

