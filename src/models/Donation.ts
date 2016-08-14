/// <reference path="Model.ts" />

'use strict';

module CoffeeBreak {

    // Repräsentiert eine Spende.
    export class Donation extends Model {
        // Der Name des Feldes für den Erzeuger einer Spende.
        static AuthorProperty = `Author`;

        // Der Name des Feldes mit dem Zeitpunkt an dem die Spende erstellt wurde.
        static CreatedProperty = `Created`;

        // Der Name des Feldes mit dem Gewicht der Spende.
        static WeightProperty = `Weight`;

        // Der Name des Feldes zum Nachschlagen der Art des Kaffees.
        static TypeProperty = `CoffeeTypeRelation`;

        // Der Name der zugehörigen SharePoint Liste.
        static  /* JMS.SharePoint.ISerializableClass. */ listName = Constants.listNames.donations;

        // Das Gewicht der Spende (in Gramm, aber das spielt im Code keine Rolle).
        weight: number;

        // Der Fremdschlüssel für die Art des Kaffees.
        typeId: number;

        // Die Sorte des Kaffees.
        typeName: string;

        // Zusatzinformationen der Sorte.
        hasCoffein: boolean;

        // Der Name des Spenders.
        author: string;

        // Der Zeitpunkt der Spende.
        created: Date;

        // Überträgt die Modelldaten in die SharePoint Repräsentation.
        saveTo(item: SP.ListItem): void {
            super.saveTo(item);

            item.set_item(Donation.WeightProperty, this.weight);

            // Den Fremdschlüssel muss man auf eine besondere Art festlegen.
            if (this.typeId === undefined)
                item.set_item(Donation.TypeProperty, null);
            else {
                var typeId = new SP.FieldLookupValue();

                typeId.set_lookupId(this.typeId);

                item.set_item(Donation.TypeProperty, typeId);
            }
        }

        // Überträgt die SharePoint Repräsentation in die Modelldaten.
        protected loadFrom(item: SP.ListItem) {
            super.loadFrom(item);

            var weight: number = item.get_item(Donation.WeightProperty);
            if (typeof weight === `number`)
                this.weight = weight;

            // Fremdschlüssel.
            var typeId = Model.getProjectedField(item, Donation.TypeProperty);
            if (typeId)
                this.typeId = typeId.get_lookupId();

            // Kaffeesorte zur Demonstration über den JOIN mit einer anderen Liste.
            var typeName = Model.getProjectedField(item, `${CoffeeType.listName}${CoffeeType.FullNameProperty}`);
            if (typeName)
                this.typeName = typeName.get_lookupValue();

            // Dito der Koffeingehalt.
            var withCoffein = Model.getProjectedField(item, `${CoffeeType.listName}${CoffeeType.CoffeinProperty}`);
            if (withCoffein)
                this.hasCoffein = (withCoffein.get_lookupValue() === "1");

            // Auch der Name des Spenders wird über einen Fremdschlüssel aufgelöst, hier interessiert aber nur der Name des Anwenders.
            var author = Model.getProjectedField(item, Donation.AuthorProperty);
            if (author)
                this.author = author.get_lookupValue();

            this.created = <Date>item.get_item(Donation.CreatedProperty);
        }

        // Prüft die Konsistenz der Modelldaten.
        validate(setType: (error?: string) => void, setWeight: (error?: string) => void): boolean {
            var isValid = true;

            // Die Art des Kaffees muss über den Fremdschlüssel angegeben sein.
            if (this.typeId === undefined) {
                setType(Constants.validation.required);

                isValid = false;
            }
            else
                setType();

            // Das Gewicht der Spende muss angegeben sein und zwischen 10 und 10000 (jeweils einschließlich) liegen.
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