/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    // Repräsentiert eine Art von Kaffee.
    export class CoffeeType extends Model {
        // Der Name des Feldes mit der Sort als Kombination aus Hersteller und Marke.
        static FullNameProperty = `Title`;

        // Der Name des Feldes mit dem Koffeingehalt.
        static CoffeinProperty = `WithCoffein`;

        // Der Name der Liste, in der Arten von Kaffee gespeichert werden.
        static listName = Constants.listNames.coffeeTypes;

        // Name des Herstellers.
        company: string;

        // Name der Marke.
        name: string;

        // Koffeingehalt.
        coffein: boolean;

        // Meldet den vollen Namen der Sorte.
        fullName(): string {
            var company = (this.company || ``).trim();
            var name = (this.name || ``).trim();

            // Das machen wir nicht, wenn weder Hersteller noch Marke gesetzt sind.
            if ((company.length > 0) || (name.length > 0))
                return `${company}: ${name}`;

            return undefined;
        }

        // Überträgt Modelldaten in die SharePoint Repräsentation.
        saveTo(item: SP.ListItem): void {
            super.saveTo(item);

            item.set_item(CoffeeType.FullNameProperty, this.fullName());
            item.set_item(CoffeeType.CoffeinProperty, this.coffein ? 1 : 0);
        }

        // Überträgt die SharePoint Repräsentation in Modelldaten.
        protected loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            // Den Namen der Sorte müssen wir zerlegen - tatsächlich ist das auch unser eindeutiger Schlüssel.
            var fullName: string = item.get_item(CoffeeType.FullNameProperty);
            if (typeof fullName === `string`) {
                var split = fullName.indexOf(`:`);
                if (split >= 0) {
                    this.company = fullName.substr(0, split).trim();
                    this.name = fullName.substr(split + 1).trim();
                }
            }

            // Auch beim Auslesen des Koffeingehalts sind wir lieber etwas vorsichtig.
            var coffein: number = item.get_item(CoffeeType.CoffeinProperty);
            if (typeof coffein === `number`)
                this.coffein = (coffein == 1);
        }

        // Prüft die Konsistenz der Modelldaten.
        validate(setCompany: (error?: string) => void, setName: (error?: string) => void): boolean {
            var isValid = true;

            // Der Herstellername darf nicht leer sein und auch keinen Doppelpunkt enthalten.
            if ((this.company || ``).trim().length < 1) {
                setCompany(Constants.validation.required);

                isValid = false;
            }
            else if (this.company.indexOf(`:`) >= 0) {
                setCompany(Constants.validation.badCompany);

                isValid = false;
            }
            else
                setCompany();

            // Die Marke darf nur nicht leer sein.
            if ((this.name || ``).trim().length < 1) {
                setName(Constants.validation.required);

                isValid = false;
            }
            else
                setName();

            return isValid;
        }
    }

}