/// <reference path="FormController.ts" />

'use strict';

module CoffeeBreak {

    // Präsentationsmodell zum Ändern oder Anlegen einer Art von Kaffee.
    export interface ICreateType extends IForm {
        // Meldet alle bisher bekannten Hersteller.
        setCompanies(companies: string[]): void;

        // Legt den aktuellen Hersteller fest.
        setCompany(company: string, onChange?: (newValue: string) => void): void;

        // Legt das aktuelle Prüfergebnis für die Eingabe des Herstellers fest.
        setCompanyError(error?: string): void;

        // Meldet alle Sorten des aktuell ausgewählten Herstellers.
        setNames(names: string[]): void;

        // Legt die aktuelle Sorte fest.
        setName(name: string, onChange?: (newValue: string) => void): void;

        // Legt das aktuelle Prüfergebnis für die Eingabe der Sorte fest.
        setNameError(error?: string): void;

        // Legt die aktuelle Zusatzinformation über den Koffeingehalt fest.
        setCoffein(withCoffein: boolean, onChange?: (newValue: boolean) => void): void;

        // Meldet die Spende, zu der eine neue Art von Kaffee angelegt werden soll - gepflegt in einem Controller übergreifenden Zustand der Gesamtanwendung.
        activeDonation(): Donation;
    }

    // Controller zum Anlegen oder Ändern einer Art von Kaffee.
    export class CreateTypeController extends FormController<ICreateType, CoffeeType> {
        // Für alle bekannten Hersteller die Namen aller Sorten von Kaffee.
        private _companies: { [company: string]: string[] };

        // Die Liste aller bekannten Sorten - als Schlüsselfeld kombiniert aus Hersteller und Sorte.
        private _existing: string[];

        constructor(view: ICreateType) {
            super(view, CoffeeType);

            // Wir starten mal mit der Normaleinstellung.
            this.model.coffein = 1;
        }

        // Wird aufgerufen, sobald der View zur Konfiguration bereit ist.
        protected onConnect(): void {
            super.onConnect();

            // Legt den aktuellen Hersteller und die Eingabe desselben fest.
            this.presentationModel.setCompany(this.model.company, company => {
                // Neuen Wert übernehmen.
                this.model.company = company;

                // Liste der Sorten des Herstellers melden.
                this.refreshNames();

                // Modell prüfen.
                this.validate();
            });

            // Legt die aktuelle Sorte und die Eingabe derselben fest.
            this.presentationModel.setName(this.model.name, name => {
                this.model.name = name;

                this.validate();
            });

            // Legt den aktuellen Koffeingehalt und die Eingabe desselben fest.
            this.presentationModel.setCoffein(this.model.coffein === 1, withCoffein => {
                this.model.coffein = withCoffein ? 1 : 0;

                this.validate();
            });

            // Ermittelt alle bekannten Arten von Kaffee.
            this.loadTypes(items => {
                // Die vollen Namen aller Sorten einmach merken.
                this._existing = items.map(item => item.fullName().toLocaleLowerCase());

                // Die Gruppierung der Arten nach dem Hersteller.
                this._companies = {};

                // Die Namen aller Hersteller.
                var companyNames: string[] = [];

                // Die Liste aller Sorten gruppieren.
                items.forEach(item => {
                    // Nachsehen, ob wir den Hersteller schon kennen.
                    var names = this._companies[item.company];
                    if (!names) {
                        companyNames.push(item.company);

                        this._companies[item.company] = (names = []);
                    }

                    // Sorte zum Hersteller merken.
                    names.push(item.name);
                });

                // Pro Hersteller die Liste der Sorten sortieren.
                for (var company of companyNames)
                    this._companies[company].sort();

                // Und auch die Hersteller sortieren.
                companyNames.sort();

                // Die nun bekannten Listen an den View melden.
                this.presentationModel.setCompanies(companyNames);
                this.refreshNames();

                // Nun müssen wir zum Beispiel auf Dubletten prüfen.
                this.validate();
            });

            // Zeit für die erste prüfung.
            this.validate();
        }

        // Nach dem erfolgreichen Speichern einer neuen Art von Kaffee wird diese automatisch an die aktuelle Spende gebunden.
        protected onSaved(model: CoffeeType): void {
            this.presentationModel.activeDonation().typeId = model.id
        }

        // Meldet die Namen aller Sorten des aktuellen Herstellers an den View.
        private refreshNames(): void {
            this.presentationModel.setNames(this._companies[this.model.company || ``]);
        }

        // Führ eine Prüfung durch.
        private validate(): void {
            // Modellkonsistenz prüfen.
            var isValid = this.model.validate(error => this.presentationModel.setCompanyError(error), error => this.presentationModel.setNameError(error));

            // Wenn das Modell in Ordnung ist und die Liste aller Arten bereits geladen wurde, so erfolgt nun eine prüfung auf Dubletten - produktiv sollte das eigentlich das Backend machen.
            if (isValid)
                if (this._existing) {
                    var fullName = this.model.fullName().toLocaleLowerCase();

                    for (var item of this._existing)
                        if (item === fullName) {
                            this.presentationModel.setNameError(Constants.validation.duplicateType);

                            isValid = false;

                            break;
                        }
                }
                else
                    isValid = false;

            // Dem View mitteilen, ob der Anwender nun Speichern darf.
            this.presentationModel.setAllowSave(isValid);
        }
    }
}