/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    // Die Einstiegsseite.
    export class DashboardView extends View<IDashboard, DashboardView, DashboardController> implements IDashboard {
        // Meldet den Namen der HTML Datei zur Einstiegsseite.
        viewName(): string {
            return `dashboard`;
        }

        // Die Tabelle mit den letzten Spenden.
        private _table: JQuery;

        // Die Tabelle mit der Spendenübersicht.
        private _timeGroup: JQuery;

        // Die Schaltfläche zum Anlegen einer neuen Spende.
        private _newDonation: JQuery;

        // Die Schaltfläche zur Aktualisierung der angezeigten Spenden.
        private _refresh: JQuery;

        // Die Methode zur Aktualisierung der angezeigten Spenden.
        private _reload: (forMe?: boolean) => void;

        // Verbindet den View mit der Oberfläche.
        protected onConnect(): void {
            this._table = this.connectAny(`table.coffeeBreakDonationTable > tbody`);
            this._timeGroup = this.connectAny(`table.coffeeBreakDonationTimeGroupTable > tbody`);

            this.connectFlag(`.coffeeBreakMeOnly > input`, newValue => this._reload && this._reload(newValue));

            this._newDonation = this.connectAction(`a.coffeeBreakNewButton`, () => App.loadView(CreateDonationController, CreateDonationView));
            this._refresh = this.connectAction(`a.coffeeBreakRefreshButton`, () => this._reload && this._reload());
        }

        // Legt die Methode zur Aktualisierung der angezeigten Spenden fest.
        setRefresh(callback: (forMe?: boolean) => void) {
            this._reload = callback;
        }

        // Aktualisiert die Tabelle mit den neuesten Spenden.
        fillTable(donations: Donation[]): void {
            this._table.html(``);

            donations.forEach(donation =>
                $(`<tr />`)
                    .append($(`<td />`, { text: donation.typeName }))
                    .append($(`<td />`, { text: donation.weight.toString() }))
                    .append($(`<td />`, { text: donation.created.toLocaleString() }))
                    .append($(`<td />`, { text: donation.author }))
                    .appendTo(this._table));
        }

        // Aktualisiert die Tabelle mit der Übersicht über alle Spenden.
        fillTimeGroup(donations: TimeGroupDonation[]): void {
            this._timeGroup.html(``);

            donations.forEach(donation =>
                $(`<tr />`)
                    .append($(`<td />`, { text: donation.segment }))
                    .append($(`<td />`, { text: donation.totalCount.toString() }))
                    .append($(`<td />`, { text: donation.totalWeight.toString() }))
                    .appendTo(this._timeGroup));
        }
    }

}