/// <reference path="FormView.ts" />

'use strict';

module CoffeeBreak {

    export class CreateTypeView extends FormView<ICreateType, CreateTypeView, CreateTypeController> implements ICreateType {
        private _company: JQuery;

        private _companies: string[];

        private _companySelector: JQuery;

        private _name: JQuery;

        private _names: string[];

        private _nameSelector: JQuery;

        private _withCoffein: JQuery;

        private _dialog: JQuery;

        private _onCompanyChanged: (newValue: string) => void;

        private _onNameChanged: (newValue: string) => void;

        private _onCoffeinChanged: (newValue: boolean) => void;

        viewName(): string {
            return `createType`;
        }

        constructor() {
            super(CreateTypeController);
        }

        protected onConnect(): void {
            super.onConnect();

            this._dialog = this.connectDialog(`.coffeeBreakSelectionDialog`);

            this._company = this.connectText(`.coffeeBreakCompany > input`, newValue => this._onCompanyChanged && this._onCompanyChanged(newValue));
            this._companySelector = this.connectAction(`.coffeeBreakCompany > a`, () => this.openSelector(this._companies, this._company));

            this._name = this.connectText(`.coffeeBreakName > input`, newValue => this._onNameChanged && this._onNameChanged(newValue));
            this._nameSelector = this.connectAction(`.coffeeBreakName > a`, () => this.openSelector(this._names, this._name));

            this._withCoffein = this.connectFlag(`.coffeeBreakCoffein > input`, newValue => this._onCoffeinChanged && this._onCoffeinChanged(newValue));

            this._companySelector.button();
            this._nameSelector.button();

            this.setCompanies();
            this.setNames();
        }

        private openSelector(list: string[], input: JQuery): void {
            var outer = this._dialog.html(`<ul />`);
            var parent = outer.children().first();

            list.forEach(n => $(`<li />`, { text: n }).on(`click`, () => {
                input.val(n);
                input.trigger(`input`);

                this._dialog.dialog(`close`);
            }).appendTo(parent));

            this._dialog.dialog(<JQueryUI.DialogOptions>{
                closeText: Constants.text.cancelButton,
                title: Constants.text.selectFromList,
                closeOnEscape: true,
                resizable: false,
                draggable: true,
                autoOpen: true,
                modal: true
            });
        }

        activeDonation(): Donation {
            return App.activeDonation;
        }

        setCompany(company: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onCompanyChanged = onChange;

            this._company.val(company);
        }

        setCompanies(companies: string[] = []): void {
            this._companies = companies;

            if (companies.length > 0)
                this._companySelector.button(`enable`);
            else
                this._companySelector.button(`disable`);
        }

        setNames(names: string[] = []): void {
            this._names = names;

            if (names.length > 0)
                this._nameSelector.button(`enable`);
            else
                this._nameSelector.button(`disable`);
        }
        
        setNameError(error: string = ``): void {
            View.setError(this._name, error);
        }

        setCompanyError(error: string = ``): void {
            View.setError(this._company, error);
        }

        setName(name: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onNameChanged = onChange;

            this._name.val(name);
        }

        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void {
            if (onChange)
                this._onCoffeinChanged = onChange;

            this._withCoffein.prop(`checked`, withCoffein);
        }
    }

}