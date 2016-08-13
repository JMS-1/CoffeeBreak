/// <reference path="../Constants.ts" />

'use strict';

module CoffeeBreak {

    // Hilfsklasse zur Implementierung von Modellklassen.
    export abstract class Model implements JMS.SharePoint.ISerializable {
        // Der Name des SharePoint feldes mit der relativ eindeutigen Nummer der Modellinstanz.
        static IDProperty = `ID`;

        // Die relativ eindeutige Nummer der Modellinstanz.
        id: number;

        // Überträgt Modelldaten in die SharePoint Repräsentation.
        saveTo(item: SP.ListItem): void {
            if (this.id !== undefined)
                item.set_item(Model.IDProperty, this.id);
        }

        constructor(item?: SP.ListItem) {
            // Tatsächlich darf man das hier in vielen anderen Programmiersprachen nicht machen (virtuelle Funktionen im Konstruktor aufrufen), für JavaScript und in dieser Evaluation geht das aber in Ordnung.
            if (item)
                this.loadFrom(item);
        }

        // Rekonstruiert Modelldaten aus der SharePoint Repräsentation.
        protected loadFrom(item: SP.ListItem) {
            var id: number = item.get_item(Model.IDProperty);
            if (typeof id === `number`)
                this.id = id;
        }

    }

}