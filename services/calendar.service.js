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
        const pagePersistence = new PagePersistence();

        return new Promise((resolve, reject) => {

            let isUpdate =  true; // maakt dit wel uit?

            logger.info(data);

            if (data.calendar.recurrentDates && data.calendar.recurrentDates.length > 0) {

                let extraActivity;

                for (let i = 0; i < data.calendar.recurrentDates.length - 1; i++) {

                    logger.info(data.calendar.recurrentDates[i]);

                    extraActivity = clone(data);

                    extraActivity.calendar.startDate = data.calendar.recurrentDates[i];
                    extraActivity.ObjectID = data_id + '-' + i;

                    searchService.getSearchSnippet({searchSnippetTemplate: 'activity-snippet'}, extraActivity, correlationId)

                        .then((searchSnippetHtml) => {
                            return new Promise((res, rej) => {
                                extraActivity.searchSnippet = searchSnippetHtml;
                                res({});
                            })
                        })

                        .then(() => {

                            return searchService.updateSearch(extraActivity, isUpdate, correlationId)

                        }).then(() => {

                            resolve(data);

                        }).catch((error) => {
                    })
                }

            } else {

                resolve(data);
            }
        });
    }
}


module.exports = CalendarService;