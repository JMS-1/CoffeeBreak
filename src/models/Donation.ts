﻿/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    export class Donation extends Model {
        private static _WeightProperty = 'Weight';

        private static _TypeProperty = 'CoffeeTypeRelation';

        static listName = Constants.listNames.donations;

        weight: number;

        typeId: number;

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
            if (typeId)
                this.typeId = typeId.get_lookupId();
        }

        validate(setType: (error?: string) => void, setWeight: (error?: string) => void): boolean {
            var isValid = true;

            if (this.typeId === undefined) {
                setType(Constants.validation.required);

                isValid = false;
            }
            else
                setType();

            if (this.weight === undefined) {
                setWeight(Constants.validation.required);

                isValid = false;
            }
            else if ((this.weight < 10) || (this.weight > 10000)) {
                setWeight(Constants.validation.badRange);

                isValid = false;
            }
            else
                setWeight();

            return isValid;
        }
    }

}