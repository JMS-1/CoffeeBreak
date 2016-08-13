/// <reference path="../Constants.ts" />

'use strict';

module CoffeeBreak {

    // Hilfsklasse für alle Aggregationen.
    export abstract class Aggregation {
        constructor(row: any) {
            // Tatsächlich darf man das hier in vielen anderen Programmiersprachen nicht machen (virtuelle Funktionen im Konstruktor aufrufen), für JavaScript und in dieser Evaluation geht das aber in Ordnung.
            this.loadFrom(row);
        }

        // Rekonstruiert Modelldaten aus der SharePoint Repräsentation.
        protected abstract loadFrom(row: any);
    }

}