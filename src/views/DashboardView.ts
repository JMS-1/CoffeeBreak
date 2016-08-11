/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class DashboardView extends View<IDashboard, DashboardView, DashboardController> implements IDashboard {
        viewName(): string {
            return 'dashboard';
        }

        private _table: JQuery;

        private _newDonation: JQuery;

        private _refresh: JQuery;

        private _reload: (forMe?: boolean) => void;

        constructor() {
            super(DashboardController);
        }

        protected onConnect(): void {
            this._table = this.connectAny(`table.coffeeBreakDonationTable > tbody`);

            this.connectFlag(`.coffeeBreakMeOnly > input`, newValue => this._reload && this._reload(newValue));

            this._newDonation = this.connectAction(`a.coffeeBreakNewButton`, () => App.loadView(CreateDonationView));
            this._refresh = this.connectAction(`a.coffeeBreakRefreshButton`, () => this._reload && this._reload());
        }

        setRefresh(callback: (forMe?: boolean) => void) {
            this._reload = callback;
        }

        fillTable(donations: Donation[]): void {
            this._table.html('');

            donations.forEach(donation =>
                $('<tr />')
                    .append($('<td />', { text: donation.typeName }))
                    .append($('<td />', { text: donation.weight.toString() }))
                    .append($('<td />', { text: donation.created.toLocaleString() }))
                    .append($('<td />', { text: donation.author }))
                    .appendTo(this._table));
        }
    }

}