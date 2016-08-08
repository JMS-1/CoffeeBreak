/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateTypeView {
        setCompany(company: string): void;

        onCompanyChanged: (newValue: string) => void;
    }

    export class CreateTypeView extends View<CreateTypeView, CreateTypeController> implements ICreateTypeView {
        private _company: JQuery;

        private _name: JQuery;

        private _withCoffein: JQuery;

        onCompanyChanged: (newValue: string) => void;

        viewName(): string {
            return 'createType';
        }

        constructor() {
            super(CreateTypeController);
        }

        protected onConnect(): void {
            this._company = super.connectText(`.coffeeBreakCompany > input`, this.onCompanyChanged);
            this._name = super.connectText(`.coffeeBreakName > input`, () => { });
            this._withCoffein = super.connectText(`.coffeeBreakCoffein > input`, () => { });
        }

        setCompany(company: string): void {
            this._company.val(company);
        }
    }

}