﻿/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export interface ICreateTypeView {
        setCompany(company: string, onChange?: (newValue: string) => void): void;

        setName(name: string, onChange?: (newValue: string) => void): void;

        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void;

        setSave(enable: boolean): void;
    }

    export class CreateTypeView extends View<ICreateTypeView, CreateTypeView, CreateTypeController> implements ICreateTypeView {
        private _company: JQuery;

        private _name: JQuery;

        private _withCoffein: JQuery;

        private _save: JQuery;

        private _cancel: JQuery;

        private _onCompanyChanged: (newValue: string) => void;

        private _onNameChanged: (newValue: string) => void;

        private _onCoffeinChanged: (newValue: boolean) => void;

        viewName(): string {
            return 'createType';
        }

        constructor() {
            super(CreateTypeController);
        }

        protected onConnect(): void {
            this._company = super.connectText(`.coffeeBreakCompany > input`, newValue => this._onCompanyChanged && this._onCompanyChanged(newValue));
            this._name = super.connectText(`.coffeeBreakName > input`, newValue => this._onNameChanged && this._onNameChanged(newValue));
            this._withCoffein = super.connectFlag(`.coffeeBreakCoffein > input`, newValue => this._onCoffeinChanged && this._onCoffeinChanged(newValue));
            this._cancel = super.connectAction(`a.coffeeBreakCancel`, () => { });
            this._save = super.connectAction(`a.coffeeBreakSave`, () => { });

            this.setSave(false);
        }

        setSave(enable: boolean): void {
            if (enable)
                this._save.button('enable');
            else
                this._save.button('disable');
        }

        setCompany(company: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onCompanyChanged = onChange;

            this._company.val(company);
        }

        setName(name: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onNameChanged = onChange;

            this._name.val(name);
        }

        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void {
            if (onChange)
                this._onCoffeinChanged = onChange;

            this._withCoffein.prop('checked', withCoffein);
        }
    }

}