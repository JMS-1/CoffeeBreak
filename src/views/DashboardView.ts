/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class DashboardView extends View<IDashboard, DashboardView, DashboardController> implements IDashboard {
        viewName(): string {
            return 'dashboard';
        }

        private _newType: JQuery;

        constructor() {
            super(DashboardController);
        }

        protected onConnect(): void {
            this._newType = super.connectAction('a.coffeeBreakNewTypeButton', () => App.loadView(CreateTypeView));
        }
    }

}