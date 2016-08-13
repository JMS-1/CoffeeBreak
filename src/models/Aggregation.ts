/// <reference path="../Constants.ts" />

'use strict';

module CoffeeBreak {

    // Hilfsklasse für alle Aggregationen.
    export abstract class Aggregation {
        constructor(row: JMS.SharePoint.IPivotRow) {
            // Tatsächlich darf man das hier in vielen anderen Programmiersprachen nicht machen (virtuelle Funktionen im Konstruktor aufrufen), für JavaScript und in dieser Evaluation geht das aber in Ordnung.
            this.loadFrom(row);
        }

        // Rekonstruiert Modelldaten aus der SharePoint Repräsentation.
        protected abstract loadFrom(row: JMS.SharePoint.IPivotRow);

        // Ermittelt eine Aggregation.
        protected static getAggregationResultString(row: JMS.SharePoint.IPivotRow, fieldName: string, algorithm: JMS.SharePoint.AggregationAlgorithms): string {
            return row[`${fieldName}.${JMS.SharePoint.AggregationAlgorithms[algorithm]}.agg`];
        }

        // Ermittelt eine Aggregation.
        protected static getAggregationResultInteger(row: JMS.SharePoint.IPivotRow, fieldName: string, algorithm: JMS.SharePoint.AggregationAlgorithms): number {
            return parseFloat(Aggregation.getAggregationResultString(row, fieldName, algorithm).replace(`,`, ``).replace(`.`, ``));
        }
    }

}