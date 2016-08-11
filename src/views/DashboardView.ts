/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class DashboardView extends View<IDashboard, DashboardView, DashboardController> implements IDashboard {
        viewName(): string {
            return 'dashboard';
        }

        private _table: JQuery;

        constructor() {
            super(DashboardController);
        }

        protected onConnect(): void {
            this._table = this.connectAny(`table.coffeeBreakDonationTable > tbody`);
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