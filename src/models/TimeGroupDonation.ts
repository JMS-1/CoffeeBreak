/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    export class TimeGroupDonation extends Model {
        static TimeGranularityProperty = 'TimeGranularity';

        static listName = Constants.listNames.donations;

        segment: string;

        weight: number;

        totalCount = 0;

        totalWeight = 0;

        protected loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            this.segment = item.get_item(TimeGroupDonation.TimeGranularityProperty);
            this.weight = item.get_item(Donation.WeightProperty);
        }
    }

}