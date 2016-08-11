/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class DashboardView extends View<IDashboard, DashboardView, DashboardController> implements IDashboard {
        viewName(): string {
            return 'dashboard';
        }

        private _newType: JQuery;

        private _newDonation: JQuery;

        constructor() {
            super(DashboardController);
        }

        protected onConnect(): void {
            this._newType = this.connectAction('a.coffeeBreakNewTypeButton', () => App.loadView(CreateTypeView));
            this._newDonation = this.connectAction('a.coffeeBreakNewDonationButton', () => App.loadView(CreateDonationView));
        }
    }

}