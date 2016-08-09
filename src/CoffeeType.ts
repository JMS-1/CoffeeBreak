/// <reference path="Constants.ts" />

'use strict';

module CoffeeBreak {

    export class CoffeeType implements JMS.SharePoint.ISerializable {
        private static _FullNameProperty = 'Title';

        private static _CoffeinProperty = 'WithCoffein';

        static listName = Constants.listNames.coffeeTypes;

        static contentTypeId = Constants.contentTypeIds.coffeeTypes;

        static listColumns = [CoffeeType._FullNameProperty, CoffeeType._CoffeinProperty];

        company: string;

        name: string;

        coffein: boolean = true;

        id: number;

        fullName(): string {
            var company = (this.company || '').trim();
            var name = (this.name || '').trim();

            if ((company.length > 0) || (name.length > 0))
                return `${company}: ${name}`;

            return undefined;
        }

        saveTo(item: SP.ListItem): void {
            if (this.id !== undefined)
                item.set_item("ID", this.id);

            item.set_item(CoffeeType._FullNameProperty, this.fullName());
            item.set_item(CoffeeType._CoffeinProperty, this.coffein === true);
        }

        constructor(item?: SP.ListItem) {
            if (item)
                this.loadFrom(item);
        }

        loadFrom(item: SP.ListItem) {
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

            var id: number = item.get_item("ID");
            if (typeof id === "number")
                this.id = id;
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