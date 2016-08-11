/// <reference path="FormController.ts" />

'use strict';

module CoffeeBreak {

    // Das Präsentationsmodell zum Anlegen einer neuen Spende.
    export interface ICreateDonation extends IForm {
        // Meldet alle zurzeit bekannten Arten von Kaffee.
        setTypes(types: CoffeeType[]): void;

        // Legt die aktuelle Art von Kaffee fest.
        setType(typeId: number, onChange?: (newValue: CoffeeType) => void): CoffeeType;

        // Meldet das Prüfergebnis zur aktuellen Art von Kaffee.
        setTypeError(error?: string): void;

        // Legt das aktuelle Gewicht der Spende fest.
        setWeight(weight: number, onChange?: (newValue: number, isValid: boolean) => void): void;

        // Meldet das Prüfergebnis zum aktuellen Gewicht der Spende.
        setWeightError(error?: string): void;

        // Meldet oder ändert die aktuell im Formular angezeigte oder anzuzeigende Spende.
        activeDonation(model?: Donation): Donation;
    }

    // Der Controller zum Anlegen einer Spende.
    export class CreateDonationController extends FormController<ICreateDonation, Donation> {
        // Gesetzt, solange die Texteingabe des Gewichts eine gültige Zahl ist - unabhängig davon, ob diese gemäß der Modellkonsistenz auch nutzbar ist.
        private _hasValidWeight = true;

        constructor(view: ICreateDonation) {
            super(view, Donation);
        }

        // Wird aufgerufen, sobald der View zur Konfiguration bereit ist.
        onConnect(): void {
            super.onConnect();

            // Eventuell wird bereits eine Spende neu angelegt oder bearbeitet, dann machen wir damit weiter - ansonsten wird das aktuelle Modell dafür registriert.
            var active = this.view.activeDonation();
            if (active)
                this.model = active;
            else
                this.view.activeDonation(this.model);

            // Meldet das aktuelle Gewicht sowie das Verhalten bei Eingabeänderung.
            this.view.setWeight(this.model.weight, (newValue, isValid) => {
                // Werte übernehmen und erneut prüfen - der zweite Parameter zeigt an, ob überhaupt eine gültige Zahl eingegeben wurde.
                this._hasValidWeight = isValid;
                this.model.weight = newValue;

                this.validate();
            });

            // Die aktuelle Liste aller Arten von Kaffee laden.
            this.loadTypes(items => {
                // Nach dem vollen Namen der Sorte sortieren und dann erst an die Oberfläche melden.
                items.sort((l, r) => l.fullName().localeCompare(r.fullName()));

                this.view.setTypes(items);

                // Die aktelle Sorte und das Verhalten bei Änderungen melden.
                var activeType = this.view.setType(this.model.typeId, newType => {
                    // Wir übernehmen hier nur den Primärschlüssel in den Fremdschlüssel und führen dann eine Prüfung durch.
                    this.model.typeId = newType.id;

                    this.validate();
                });

                // Wenn im View bereits eine Art ausgewählt ist, so nehmen wir diese - Hintergrund ist vor allem, dass HTML5 nur die DropDown-Liste, nicht aber die ComboBox kennt: es ist immer ein Wert ausgewählt!
                if (activeType)
                    this.model.typeId = activeType.id;

                // Und auch hier empfiehlt sich eine Prüfung.
                this.validate();
            });

            // Zeit für eine erste Vorabprüfung.
            this.validate();
        }

        // Prüft die aktuellen Modelldaten.
        private validate(): void {
            // Modellkonsistenz prüfen.
            var isValid = this.model.validate(error => this.view.setTypeError(error), error => this.view.setWeightError(error));

            // Wenn sicher ist, dass die Eingabe des Anwenders keine Zahl ist, dann hat dieses Prüfergebnis immer Vorrang vor der Modellkonsistenz.
            if (!this._hasValidWeight) {
                this.view.setWeightError(Constants.validation.badNumber);

                isValid = false;
            }

            // Der View muss nun nur noch wissen, ob der Anwender die aktuellen Daten speichern darf.
            this.view.setAllowSave(isValid);
        }
    }

}