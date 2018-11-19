'use strict';


/**
 * Service for collecting data through hierarchical relations
 */

const logger = require('./logger.service');
const PagePersistence = require('../persistence/page.persistence');
const SearchService = require('./search.service');
const clone = require('clone');

class CalendarService {

    recurringEvents(data,correlationId) {

        let self = this;
        const searchService = new SearchService();
        // const pagePersistence = new PagePersistence();

        return new Promise((resolve, reject) => {

            let isUpdate =  true; // maakt dit wel uit?

            if (data.calendar.recurrentDates && data.calendar.recurrentDates.length > 0) {

                    return self.createSnippets(data)
                        .then((extraActivities) => {

                        //     return self.updateSearch(extraActivities, isUpdate, correlationId)
                        //
                        // }).then(() => {

                            resolve(data);

                        }).catch((error) => {
                    })

            } else {

                resolve(data);
            }
        });
    }

    createSnippets(data){

        return new Promise((resolve, reject) => {

            let isUpdate = true; // maakt dit wel uit?

            // logger.info(data);
            let extraActivity,
                extraActivities = [],
                promiseGroup = [];

            resolve(extraActivities);

            for (let i = 0; i < data.calendar.recurrentDates.length - 1; i++) {

                extraActivity = clone(data);
                extraActivity.calendar.startDate = data.calendar.recurrentDates[i];
                extraActivity.ObjectID = data._id + '-' + i;
                extraActivities.push(extraActivity);
                promiseGroup.push(return searchService.getSearchSnippet({searchSnippetTemplate: 'activity-snippet'}, extraActivity, correlationId))
            }




            Promise.all(promiseGroup).then((snippets) => {

                for (let i = 0; i < extraActivities -1; i++) {

                    extraActivities[i].searchSnippet = snippets[i];
                }

                resolve(extraActivities);

            });
        });

    }

    updateSearch(extraActivities,isUpdate, correlationId) {

        return new Promise((resolve, reject) => {

            let promiseGroup = [];

            for (let i = 0; i < extraActivities.length - 1; i++) {

                promiseGroup.push(return searchService.updateSearch({searchSnippetTemplate: 'activity-snippet'}, extraActivities[i], correlationId))

            }

            Promise.all(promiseGroup).then((data) => {

                resolve(data);

            });

        });
    }

}


module.exports = CalendarService;