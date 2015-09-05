
var RembrContainer = RembrContainer || {};

(function () {
    'use strict';

    RembrContainer.MomentRefiner = {
        refine: function(data, storage)
        {
            var i, c,
                momentjs,
                currentPeriods;

            c = data.moments.length;
            for (i = 0; i < c; i++) {
                momentjs = moment([
                    data.moments[i].year,
                    data.moments[i].month - 1,
                    data.moments[i].day,
                    data.moments[i].hour,
                    data.moments[i].minute
                ]);
                data.tags.push({
                    name: RembrContainer.MomentTool.getDayUuid(momentjs),
                    uuid: RembrContainer.MomentTool.getDayUuid(momentjs),
                    system: 1,
                    type: 'period'
                });
                data.tags.push({
                    name: RembrContainer.MomentTool.getWeekUuid(momentjs),
                    uuid: RembrContainer.MomentTool.getWeekUuid(momentjs),
                    system: 1,
                    type: 'period'
                });
                data.tags.push({
                    name: RembrContainer.MomentTool.getMonthUuid(momentjs),
                    uuid: RembrContainer.MomentTool.getMonthUuid(momentjs),
                    system: 1,
                    type: 'period'
                });

                currentPeriods = RembrContainer.MomentTool.getCurrentDatePeriods(momentjs);
                c = currentPeriods.length;
                for (i = 0; i < c; i++) {
                    console.log('added to storage:');
                    console.log({
                        name: currentPeriods[i].name,
                        uuid: currentPeriods[i].uuid,
                        system: 1,
                        type: 'period'
                    });
                    storage.addTagAsObject({
                        name: currentPeriods[i].name,
                        uuid: currentPeriods[i].uuid,
                        system: 1,
                        type: 'period'
                    });
                }
            }
        }
    }
})();
