'use strict';


/**
 * Service for collecting data through hierarchical relations
 */

const logger = require('./logger.service');
const PagePersistence = require('../persistence/page.persistence');
const SearchService = require('./search.service');
const clone = require('clone');
const moment = require('moment');

class CalendarService {

    constructor () {

        this.searchService = new SearchService();
    }

    recurringEvents(data,correlationId) {

        const self = this;

        return new Promise((resolve, reject) => {

            let isUpdate =  true; // maakt dit wel uit?

            return self.searchService.deleteByKeyValue('parentID',data._id,correlationId).then( () => {

                if (data.calendar && data.calendar.recurrentDates && data.calendar.recurrentDates.length > 0) {

                    return self.createSnippets(data)
                        .then((extraActivities) => {
                            return self.updateSearch(extraActivities, isUpdate, correlationId)
                        }).then(() => {

                            resolve(data);

                        }).catch((error) => {
                            reject(error);
                        })
                } else {

                    resolve(data);
                }

            })
        });
    }

    createSnippets(data){

        const self = this;

        return new Promise((resolve, reject) => {

            let isUpdate = true; // maakt dit wel uit?


            // logger.info(data);
            let extraActivity,
                extraActivities = [],
                promiseGroup = [];


            for (let i = 0; i < data.calendar.recurrentDates.length; i++) {

                extraActivity = clone(data);

                extraActivity.calendar.startDate = data.calendar.recurrentDates[i]['date'];
                extraActivity.calendar.unix_startDate = moment(extraActivity.calendar.startDate).unix();
                extraActivity._id = data._id + '-' + i;
                extraActivity.objectID = data._id + '-' + i;
                extraActivity.parentID = data._id;
                extraActivity.calendar.month = moment(extraActivity.calendar.startDate).format('MMMM');
                extraActivity.calendar.year = moment(extraActivity.calendar.startDate).format('YYYY');
                extraActivities.push(extraActivity);
            }

            // logger.info('heeee?');

            Promise.all(extraActivities.map(self.searchService.getActivitySearchSnippet)).then((snippets) => { //))

                for (let i = 0; i < extraActivities.length; i++) {

                    extraActivities[i].searchSnippet = snippets[i];
                }

                resolve(extraActivities);

            }).catch( (error) => {
                reject(error);
            });
        });

    }

    updateSearch(extraActivities,isUpdate, correlationId) {

        const self = this;

        return new Promise((resolve, reject) => {

            // logger.info(extraActivities);
            const searchService = new SearchService();

            Promise.all(extraActivities.map(searchService.updateSearch)).then((data) => {

                resolve(data);

            }).catch( (error) => {
                reject(error);
            });
        });
    }

}


module.exports = CalendarService;