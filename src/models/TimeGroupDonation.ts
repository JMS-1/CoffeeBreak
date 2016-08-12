/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    // Repräsentiert eine einfache Sicht auf eine Spende - tatsächlich sollte die Gruppierung im Backend erfolgen, aber das ist wohl nicht so direkt möglich und wenn doch: das wäre die Klasse dafür!
    export class TimeGroupDonation extends Model {
        // Der Name des Feldes mit der Granularität für die Gruppierung nach dem Zeitpunkt der Spende.
        static TimeGranularityProperty = `TimeGranularity`;

        // Der Name der zugehörigen SharePoint Liste.
        static /* JMS.SharePoint.ISerializableClass. */ listName = Constants.listNames.donations;

        // Der Schlüssel für die Gruppierung nach dem Zeitpunkt der Spende.
        segment: string;

        // Das Gewicht eine Spende - bei einer Gruppierung im Backend bräuchten wir das hier nicht.
        weight: number;

        // Die Anzahl der Spenden zum angegebenen Zeitpunkt.
        totalCount = 0;

        // Das Gesamtgewicht der Spenden zum angegebenen Zeitpunkt.
        totalWeight = 0;

        // Überträgt die SharePoint Repräsentation in die Modelldaten.
        protected loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            // Das sind nur die Rohdaten, die Aggregation wird leider im Client selbst ermittelt - siehe den DashboardController.
            this.segment = item.get_item(TimeGroupDonation.TimeGranularityProperty);
            this.weight = item.get_item(Donation.WeightProperty);
        }
    }

}