
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.MomentTool = {

        formatPrefix: '__date',
        
        dayFormat:   'YYYYMMDD',
        weekFormat:  'YYYY[W]WW',
        monthFormat: 'YYYYMM',
        yearFormat:  'YYYY',

        currentPeriods: {},

        getCurrentDatePeriods: function(forMoment)
        {
            var formatPrefix = RembrContainer.MomentTool.formatPrefix; 
            var todayKey = moment().format('YYYYMMDD');
            if (!RembrContainer.MomentTool.currentPeriods.hasOwnProperty(todayKey)) {
                RembrContainer.MomentTool.currentPeriods = {};
                RembrContainer.MomentTool.currentPeriods[todayKey] = [
                    {
                        name: 'today',
                        //start: moment().startOf('day'),
                        //end: moment().endOf('day'),
                        format: RembrContainer.MomentTool.dayFormat,
                        uuid: formatPrefix + moment().startOf('day').format(RembrContainer.MomentTool.dayFormat),
                        order: 1
                    },
                    {
                        name: 'tomorrow',
                        //start: moment().add(1, 'days').startOf('day'),
                        //end: moment().add(1, 'days').endOf('day'),
                        format: RembrContainer.MomentTool.dayFormat,
                        uuid: formatPrefix + moment().add(1, 'days').format(RembrContainer.MomentTool.dayFormat),
                        order: 2
                    },
                    {
                        name: 'this week',
                        //start: moment().startOf('isoWeek'),
                        //end: moment().endOf('isoWeek'),
                        format: RembrContainer.MomentTool.weekFormat,
                        uuid: formatPrefix + moment().startOf('isoWeek').format(RembrContainer.MomentTool.weekFormat),
                        order: 3
                    },
                    {
                        name: 'next week',
                        //start: moment().add(1, 'week').startOf('isoWeek'),
                        //end: moment().add(1, 'week').endOf('isoWeek'),
                        format: RembrContainer.MomentTool.weekFormat,
                        uuid: formatPrefix + moment().add(1, 'week').format(RembrContainer.MomentTool.weekFormat),
                        order: 4
                    },
                    {
                        name: 'this month',
                        //start: moment().startOf('month'),
                        //end: moment().endOf('month'),
                        format: RembrContainer.MomentTool.monthFormat,
                        uuid: formatPrefix + moment().startOf('month').format(RembrContainer.MomentTool.monthFormat),
                        order: 5
                    },
                    {
                        name: 'next month',
                        //start: moment().add(1, 'months').startOf('month'),
                        //end: moment().add(1, 'months').endOf('month'),
                        format: RembrContainer.MomentTool.monthFormat,
                        uuid: formatPrefix + moment().add(1, 'months').startOf('month').format(RembrContainer.MomentTool.monthFormat),
                        order: 6
                    }
                ];
            }

            // if moment specified, return its periods
            if (forMoment) {
                return RembrContainer.MomentTool.currentPeriods[todayKey].filter(function (period) {
                    return period.uuid === formatPrefix + forMoment.format(period.format);
                });
            } else {
                // otherwise return all current periods
                return RembrContainer.MomentTool.currentPeriods[todayKey];
            }
        },

        getDayUuid(moment) {
            return RembrContainer.MomentTool.formatPrefix + moment.format(RembrContainer.MomentTool.dayFormat);
        },

        getWeekUuid(moment) {
            return RembrContainer.MomentTool.formatPrefix + moment.format(RembrContainer.MomentTool.weekFormat);
        },

        getMonthUuid(moment) {
            return RembrContainer.MomentTool.formatPrefix + moment.format(RembrContainer.MomentTool.monthFormat);
        }
    }
})();
