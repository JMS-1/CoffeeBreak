/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    export class Donation extends Model {
        private static _WeightProperty = 'Weight';

        private static _TypeProperty = 'CoffeeTypeRelation';

        static listName = Constants.listNames.donations;

        weight: number;

        typeId: number;

        typeName: string;

        saveTo(item: SP.ListItem): void {
            super.saveTo(item);

            item.set_item(Donation._WeightProperty, this.weight);

            if (this.typeId === undefined)
                item.set_item(Donation._TypeProperty, null);
            else {
                var typeId = new SP.FieldLookupValue();

                typeId.set_lookupId(this.typeId);

                item.set_item(Donation._TypeProperty, typeId);
            }
        }

        constructor(item?: SP.ListItem) {
            super(item);
        }

        loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            var weight: number = item.get_item(Donation._WeightProperty);
            if (typeof weight === "number")
                this.weight = weight;

            var typeId: SP.FieldLookupValue = item.get_item(Donation._TypeProperty);
            if (typeId) {
                this.typeId = typeId.get_lookupId();
                this.typeName = typeId.get_lookupValue();
            }
        }
    }

}