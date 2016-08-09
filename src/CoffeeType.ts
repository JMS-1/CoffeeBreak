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

        saveTo(item: SP.ListItem): void {
            var company = (this.company || '').trim();
            var name = (this.name || '').trim();

            if ((company.length > 0) || (name.length > 0))
                item.set_item(CoffeeType._FullNameProperty, `${company}: ${name}`);

            item.set_item(CoffeeType._CoffeinProperty, this.coffein === true);
        }

        constructor(item?: SP.ListItem) {
            if (!item)
                return;

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
    }

}