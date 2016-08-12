/// <reference path="FormView.ts" />

'use strict';

module CoffeeBreak {

    // Formular zum Anlegen einer neuen Art von Kaffee.
    export class CreateTypeView extends FormView<ICreateType, CreateTypeView, CreateTypeController> implements ICreateType {
        // Das Eingabefeld mit dem Namen des Herstellers.
        private _company: JQuery;

        // Alle bekannten Hersteller.
        private _companies: string[];

        // Die Schaltfläche zur Auswahl des Herstellers.
        private _companySelector: JQuery;

        // Das Eingabefeld mit der Marke.
        private _name: JQuery;

        // Alle bekannten Marken des aktuellen Herstellers.
        private _names: string[];

        // Die Schaltfläche zur Auswahl der Marke.
        private _nameSelector: JQuery;

        // Der Schalter für den Koffeingehalt.
        private _withCoffein: JQuery;

        // Der Dialog zur Auswahl.
        private _dialog: JQuery;

        // Meldet eine Eingabeänderung des Herstellers.
        private _onCompanyChanged: (newValue: string) => void;

        // Meldet eine Eingabeänderung der Marke.
        private _onNameChanged: (newValue: string) => void;

        // Meldet eine Umschaltung des Koffeingehalts.
        private _onCoffeinChanged: (newValue: boolean) => void;

        // Meldet den Namen der HTML Datei des Formulars.
        viewName(): string {
            return `createType`;
        }

        // verbindet den View mit der Oberfläche.
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

        // Öffnet den Auswahldialog.
        private openSelector(list: string[], input: JQuery): void {
            // Der Dialog wird neu befüllt.
            var outer = this._dialog.html(`<ul />`);
            var parent = outer.children().first();

            // Alle Texte einfach eintragen.
            list.forEach(n => $(`<li />`, { text: n }).on(`click`, () => {
                // Schon eine Einfachauswahl eines Eintrags reicht zum Beenden.
                input.val(n);
                input.trigger(`input`);

                this._dialog.dialog(`close`);
            }).appendTo(parent));

            this._dialog.dialog(<JQueryUI.DialogOptions>{
                dialogClass: Constants.text.dialogCss,
                title: Constants.text.selectFromList,
                closeOnEscape: true,
                resizable: false,
                draggable: true,
                autoOpen: true,
                modal: true
            });
        }

        // Meldet die gerade bearbeitet Spende, aus deren Formular heraus dieses Formular aufgerufen wurde.
        activeDonation(): Donation {
            return App.activeDonation;
        }

        // Legt den Hersteller fest.
        setCompany(company: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onCompanyChanged = onChange;

            this._company.val(company);
        }

        // Legt die Liste der bekannten Hersteller fest.
        setCompanies(companies: string[] = []): void {
            this._companies = companies;

            if (companies.length > 0)
                this._companySelector.button(`enable`);
            else
                this._companySelector.button(`disable`);
        }

        // Legt die Liste der bekannten Marken des aktuellen Herstellers fest.
        setNames(names: string[] = []): void {
            this._names = names;

            if (names.length > 0)
                this._nameSelector.button(`enable`);
            else
                this._nameSelector.button(`disable`);
        }

        // Setzt die Prüfinformationen für die Marke.
        setNameError(error: string = ``): void {
            View.setError(this._name, error);
        }

        // Setzt die Prüfinformationen für den Hersteller.
        setCompanyError(error: string = ``): void {
            View.setError(this._company, error);
        }

        // Legt die Marke fest.
        setName(name: string, onChange?: (newValue: string) => void): void {
            if (onChange)
                this._onNameChanged = onChange;

            this._name.val(name);
        }

        // Legt den Koffeingehalt fest.
        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void {
            if (onChange)
                this._onCoffeinChanged = onChange;

            this._withCoffein.prop(`checked`, withCoffein);
        }
    }

}