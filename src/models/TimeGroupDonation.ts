/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    // Repräsentiert eine einfache Sicht auf eine Spende.
    export class TimeGroupDonation extends Aggregation {
        // Der Name des Feldes mit der Granularität für die Gruppierung nach dem Zeitpunkt der Spende.
        static TimeGranularityProperty = `TimeGranularity`;

        // Der Name der zugehörigen SharePoint Liste.
        static /* JMS.SharePoint.ISerializableClass. */ listName = Constants.listNames.donations;

        // Der Schlüssel für die Gruppierung nach dem Zeitpunkt der Spende.
        segment: string;

        // Die Anzahl der Spenden zum angegebenen Zeitpunkt.
        totalCount: number;

        // Das Gesamtgewicht der Spenden zum angegebenen Zeitpunkt.
        totalWeight: number;

        // Überträgt die SharePoint Repräsentation in die Modelldaten.
        protected loadFrom(row: any) {
            this.segment = row[TimeGroupDonation.TimeGranularityProperty];
            this.totalCount = parseInt(row[`${Model.IDProperty}.Count.agg`]);
            this.totalWeight = parseFloat(row[`${Donation.WeightProperty}.Sum.agg`]);
        }
    }

}