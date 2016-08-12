/// <reference path="FormView.ts" />

'use strict';

module CoffeeBreak {

    // Formular zum Anlegen einer neuen Spende.
    export class CreateDonationView extends FormView<ICreateDonation, CreateDonationView, CreateDonationController> implements ICreateDonation {
        // Meldet den Namen der HTML Datei für das Formular.
        viewName(): string {
            return `createDonation`;
        }

        // Die Auswahl der Art des Kaffees.
        private _type: JQuery;

        // Das Eingabefeld für das Gewicht der Spende.
        private _weight: JQuery;

        // Die Schaltfläche zum Anlegen einer neuen Art von Kaffee.
        private _newType: JQuery;

        // Meldet eine veränderte Art von Kaffee.
        private _onTypeChanged: (selected: CoffeeType) => void;

        // Meldet ein verändertes Gewicht der Spende.
        private _onWeightChanged: (newValue: number, isValid: boolean) => void;

        // Alle bekannten Arten von Kaffee indiziert über die eindeutige SharePoint Kennung als Schlüssel.
        private _typeMap: { [id: string]: CoffeeType } = {};

        // Verbindet den View mit der Oberfläche.
        protected onConnect(): void {
            super.onConnect();

            this._type = this.connectSelect(`.coffeeBreakType > select`, selected => this._onTypeChanged && this._onTypeChanged(this._typeMap[selected]));
            this._newType = this.connectAction(`.coffeeBreakType > a`, () => App.loadView(CreateTypeController, CreateTypeView));
            this._newType.prop(`disabled`, true);

            this._weight = this.connectNumber(`.coffeeBreakWeight > input`, (newValue, isValid) => this._onWeightChanged && this._onWeightChanged(newValue, isValid));
        }

        // Schließt das Formular.
        protected close(): void {
            super.close();

            // Es ist nun keine Spende mehr aktiv.
            App.activeDonation = undefined;
        }

        // Meldet oder ändert die aktuell bearbeitete Spende.
        activeDonation(model?: Donation): Donation {
            var active = App.activeDonation;

            if (model !== undefined)
                App.activeDonation = model;

            return active;
        }

        // Legt das Gewicht der Spende fest.
        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void {
            if (onChange)
                this._onWeightChanged = onChange;

            if (weight === undefined)
                this._weight.val(``);
            else
                this._weight.val(weight);
        }

        // Setzt die Prüfinformationen für das Gewicht der Spende.
        setWeightError(error: string = ``): void {
            View.setError(this._weight, error);
        }

        // Legt alle Arten von Kaffee fest.
        setTypes(types: CoffeeType[]): void {
            this._newType.prop(`disabled`, false);

            if (types.length < 1)
                return;

            // Wir füllen daraus nicht nur die Auswahlliste, sondern merken uns passen zur VALUE Eigenschaft des HTML OPTION die Art von Kaffee.
            types.forEach((type, index) => {
                var id = type.id.toString();

                this._type.append(new Option(type.fullName(), id));
                this._typeMap[id] = type;
            });

            this._type.prop(`disabled`, false);
        }

        // Legt die Art von Kaffee fest.
        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType {
            this._onTypeChanged = onChange;

            if (typeId !== undefined)
                this._type.val(typeId);

            // Hier müssen wir etwas aufpassen und uns an das Verhalten des HTML SELECT anpassen, bei dem immer ein Wert ausgewählt ist.
            return this._typeMap[this._type.val()];
        }

        // Setzt die Prüfinformationen für die Art des Kaffees.
        setTypeError(error: string = ``): void {
            View.setError(this._type, error);
        }
    }
}