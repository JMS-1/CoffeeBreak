﻿/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    export class CreateTypeView extends View<ICreateType, CreateTypeView, CreateTypeController> implements ICreateType {
        private _company: JQuery;

        private _companies: string[];

        private _companySelector: JQuery;

        private _name: JQuery;

        private _names: string[];

        private _nameSelector: JQuery;

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
            this._company = super.connectText(`.coffeeBreakCompany > input[type="TEXT"]`, newValue => this._onCompanyChanged && this._onCompanyChanged(newValue));
            this._companySelector = super.connectAction(`.coffeeBreakCompany > input[type="BUTTON"]`, () => { });

            this._name = super.connectText(`.coffeeBreakName > input[type="TEXT"]`, newValue => this._onNameChanged && this._onNameChanged(newValue));
            this._nameSelector = super.connectAction(`.coffeeBreakName > input[type="BUTTON"]`, () => { });

            this._withCoffein = super.connectFlag(`.coffeeBreakCoffein > input[type="CHECKBOX"]`, newValue => this._onCoffeinChanged && this._onCoffeinChanged(newValue));

            this._save = super.connectAction(`a.coffeeBreakSave`, () => { });
            this._cancel = super.connectAction(`a.coffeeBreakCancel`, () => { });

            this._companySelector.button();
            this._nameSelector.button();

            this.setCompanies();
            this.setNames();
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

        setCompanies(companies: string[] = []): void {
            this._companies = companies;

            if (companies.length > 0)
                this._companySelector.button('enable');
            else
                this._companySelector.button('disable');
        }

        setNames(names: string[] = []): void {
            this._names = names;

            if (names.length > 0)
                this._nameSelector.button('enable');
            else
                this._nameSelector.button('disable');
        }

        private static setError(input: JQuery, error: string) {
            if (error.length > 0) {
                input.parent().addClass(Constants.validation.css);
                input.attr('title', error);
            }
            else {
                input.parent().removeClass(Constants.validation.css);
                input.removeAttr('title');
            }
        }

        setNameError(error: string = ''): void {
            CreateTypeView.setError(this._name, error);
        }

        setCompanyError(error: string = ''): void {
            CreateTypeView.setError(this._company, error);
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