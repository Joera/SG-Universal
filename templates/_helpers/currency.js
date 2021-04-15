class Custom  {

    constructor() {
        this.name = "currency";
    }

    helper(string) {

        if(isNaN(parseInt(string))) { return ; }

        let formatted = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(string);

        formatted = formatted.replace('.','?');
        formatted = formatted.replace(',','.');
        formatted = formatted.replace('?',',');

        return formatted;
    }
};

module.exports = Custom;
