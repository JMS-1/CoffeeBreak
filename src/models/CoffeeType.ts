/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    export class CoffeeType extends Model {
        private static _FullNameProperty = 'Title';

        private static _CoffeinProperty = 'WithCoffein';

        static listName = Constants.listNames.coffeeTypes;

        company: string;

        name: string;

        coffein: boolean = true;

        fullName(): string {
            var company = (this.company || '').trim();
            var name = (this.name || '').trim();

            if ((company.length > 0) || (name.length > 0))
                return `${company}: ${name}`;

            return undefined;
        }

        saveTo(item: SP.ListItem): void {
            super.saveTo(item);

            item.set_item(CoffeeType._FullNameProperty, this.fullName());
            item.set_item(CoffeeType._CoffeinProperty, this.coffein === true);
        }

        constructor(item?: SP.ListItem) {
            super(item);
        }

        loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            var fullName: string = item.get_item(CoffeeType._FullNameProperty);
            if (typeof fullName === "string") {
                var split = fullName.indexOf(':');
                if (split >= 0) {
                    this.company = fullName.substr(0, split).trim();
                    this.name = fullName.substr(split + 1).trim();
                }
            }

            var coffein: boolean = item.get_item(CoffeeType._CoffeinProperty);
            if (typeof coffein === "boolean")
                this.coffein = coffein;
        }

        validate(setCompany: (error?: string) => void, setName: (error?: string) => void): boolean {
            var isValid = true;

            if ((this.company || '').trim().length < 1) {
                setCompany(Constants.validation.required);

                isValid = false;
            }
            else
                setCompany();

            if ((this.name || '').trim().length < 1) {
                setName(Constants.validation.required);

                isValid = false;
            }
            else
                setName();

            return isValid;
        }
    }

}