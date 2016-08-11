/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    // Das Präsentationsmodell für die Startseite.
    export interface IDashboard {
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
        onConnect(): void {
            // Legt die Methode zur erneuten Anfrage der Daten fest.
            this.view.setRefresh(forMe => {
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
            var query = new JMS.SharePoint.Query();

            query.limit(20).order(Donation.CreatedProperty, false);

            // Eventuell sogar nur die des aktuellen Anwenders.
            if (this._model.selfOnly && this._me)
                query.equal(Donation.AuthorProperty, this._me.get_id(), true);

            // Die Liste wird dann direkt an den View übergeben.
            context.items(Donation, query).success(items => this.view.fillTable(items));

            // Dann brauchen wir diesmal wirklich alle Spenden - eine reine CAML Query scheint keine Gruppierung mit Aggregation zu können: schade wenn dem wirklich so ist.
            query = new JMS.SharePoint.Query();

            query.limit(0).group(TimeGroupDonation.TimeGranularityProperty);

            // Zumindest reduzieren wir die angeforderten Daten auf das Notwendigste - tatsächlich wäre es klug, das auch bei allen anderen Abfrage zu machen, aber in der Evaluation soll nur gezeigt werden, dass es überhaupt geht!
            context.items(TimeGroupDonation, query, `Include(ID, ${TimeGroupDonation.TimeGranularityProperty}, ${Donation.WeightProperty})`).success(items => {
                var segments: TimeGroupDonation[] = [];
                var aggregate: TimeGroupDonation;

                // Statt der Gruppierung kann hier natürlich auch eine Sortierung verwendet werden, wieder ist es einfach Sinn der Evaluation beides einmal auszuprobieren.
                items.forEach(donation => {
                    if (!aggregate || (donation.segment !== aggregate.segment))
                        segments.push(aggregate = donation);

                    aggregate.totalWeight += donation.weight;
                    aggregate.totalCount += 1;
                });

                // Der View erhält die Informationen mit der neuesten Gruppe von Spenden als erstes - aus Faulheit erfolgt eine Tabellendarstellen, bei einer Graphik wäre es wohl eher anders herum sinnvoll.
                segments.sort((l, r) => -l.segment.localeCompare(r.segment));

                this.view.fillTimeGroup(segments);
            });

            // Die Ausführung erfolgt natürlich wieder asynchron - schnelles Umschalten in der Oberfläche kann hier zu falschen Daten führen, aber für die Evaluation ist das erst einmal egal!
            context.startAsync();
        }
    }
}