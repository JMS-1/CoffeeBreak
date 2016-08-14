/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    // Das Präsentationsmodell für die Startseite.
    export interface IDashboard extends IPresentation {
        // Meldet die Liste der neuesten Spenden.
        fillTable(donations: Donation[]): void;

        // Meldet die Auswertung der Spenden pro Zeiteinheit - im Beispiel auf die Minute genau, damit die Evaluation auch einfach getestet werden kann.
        fillTimeGroup(donations: TimeGroupDonation[]): void;

        // Legt die Methode fest die ausgelöst werden soll, wenn der Anwender eine Aktualisierung der Anzeige wünscht.
        setRefresh(callback: (forMe?: boolean) => void);
    }

    // Der Controller für die Startseite.
    export class DashboardController extends Controller<IDashboard> {
        // Auch hier verwenden wir ein (zugegebener Maßen sehr primitives) Modell. 
        private _model = new Dashboard();

        // Damit wird die Ergebnislisten auf den aktuellen Anwender einschränken können müssen wir den natürlich kennen.
        private _me: SP.User;

        // Wird ausgelöst, sobald der View zur Konfiguration bereit ist.
        protected onConnect(): void {
            // Legt die Methode zur erneuten Anfrage der Daten fest.
            this.presentationModel.setRefresh(forMe => {
                // Eventuell mit veränderter Einschränkung auf die Spenden.
                if (forMe !== undefined)
                    this._model.selfOnly = forMe;

                this.reload();
            });

            // Verbindung zu SharePoint aufbauen.
            var context = JMS.SharePoint.newExecutor();

            // Asynchron den Benutzer abfragen und dann die Spendenlisten laden - eigentlich müsste man auch das mit der Möglichkeit des Anwenders zur Aktualisierung der Anzeige synchronisieren.
            context.user().success(user => {
                this._me = user;

                this.reload();
            });

            context.startAsync();
        }

        // Lädt die Liste der Spenden neu.
        private reload(): void {
            // Verbindung zu SharePoint aufbauen.
            var context = JMS.SharePoint.newExecutor();

            // Wir wollen die 20 neuesten Spenden sehen.
            var query =
                JMS.SharePoint
                    .newQuery()
                    .limit(20)
                    .join(Donation.TypeProperty, Donation.CoffeeTypeJoinAlias)
                    .addProjection(CoffeeType.FullNameProperty)
                    .addProjection(CoffeeType.CoffeinProperty)
                    .query()
                    .order(Donation.CreatedProperty, false);

            // Eventuell sogar nur die des aktuellen Anwenders.
            if (this._model.selfOnly && this._me)
                query.equal(Donation.AuthorProperty, this._me.get_id(), true);

            // Die Liste wird dann direkt an den View übergeben.
            context.items(Donation, query).success(items => this.presentationModel.fillTable(items));

            // Aggregation über alle Spenden ermitteln.
            query =
                JMS.SharePoint
                    .newQuery()
                    .limit(0)
                    .group(TimeGroupDonation.TimeGranularityProperty, false)
                    .aggregate(Model.IDProperty, JMS.SharePoint.AggregationAlgorithms.Count)
                    .aggregate(Donation.WeightProperty, JMS.SharePoint.AggregationAlgorithms.Sum);

            // Aggregationen auswerten.
            context.pivot(TimeGroupDonation, query).success(data => {
                // Wir bringen das hier erst einmal in die richtige Ordnung.
                data.sort((l, r) => -l.segment.localeCompare(r.segment));

                this.presentationModel.fillTimeGroup(data);
            });

            // Die Ausführung erfolgt natürlich wieder asynchron.
            context.startAsync();
        }
    }
}