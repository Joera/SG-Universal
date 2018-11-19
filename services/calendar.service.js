'use strict';


/**
 * Service for collecting data through hierarchical relations
 */

const logger = require('./logger.service');
const PagePersistence = require('../persistence/page.persistence');
const SearchService = require('./search.service');
const clone = require('clone');

class CalendarService {

    constructor () {

        this.searchService = new SearchService();
    }

    recurringEvents(data,correlationId) {

        let self = this;
        // const pagePersistence = new PagePersistence();

        return new Promise((resolve, reject) => {

            let isUpdate =  true; // maakt dit wel uit?

            if (data.calendar.recurrentDates && data.calendar.recurrentDates.length > 0) {

                    return self.createSnippets(data)
                        .then((extraActivities) => {
                        //     return self.updateSearch(extraActivities, isUpdate, correlationId)
                        // }).then(() => {

                            resolve(data);

                        }).catch((error) => {
                            reject(error);
                        })

            } else {

                resolve(data);
            }
        });
    }

    createSnippets(data){

        let self = this;

        return new Promise((resolve, reject) => {

            let isUpdate = true; // maakt dit wel uit?


            // logger.info(data);
            let extraActivity,
                extraActivities = [],
                promiseGroup = [];


            for (let i = 0; i < data.calendar.recurrentDates.length - 1; i++) {

                extraActivity = clone(data);
                extraActivity.calendar.startDate = data.calendar.recurrentDates[i];
                extraActivity.ObjectID = data._id + '-' + i;
                extraActivities.push(extraActivity);
            }

            Promise.all(extraActivities.map(self.searchService.getActivitySearchSnippet)).then((snippets) => { //))

                logger.info('snippets');
                logger.info(snippets);


                for (let i = 0; i < extraActivities - 1; i++) {

                    extraActivities[i].searchSnippet = snippets[i];
                }

                resolve(extraActivities);
            }).catch( (error) {
                reject(error);
            });
        });

    }

    updateSearch(extraActivities,isUpdate, correlationId) {

        let self = this;

        return new Promise((resolve, reject) => {

            Promise.all(extraActivities.map(self.searchService.updateSearch)).then((data) => {

                resolve(data);

            }).catch( (error) {
                reject(error);
            });;
        });
    }

}


module.exports = CalendarService;