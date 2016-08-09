/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class CreateDonationView extends View<ICreateDonation, CreateDonationView, CreateDonationController> implements ICreateDonation {
        viewName(): string {
            return 'createDonation';
        }

        private _cancel: JQuery;

        constructor() {
            super(CreateDonationController);
        }

        protected onConnect(): void {
            this._cancel = super.connectAction(`a.coffeeBreakCancel`, () => super.close());
        }
    }

}