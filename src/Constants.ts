'use strict';

module CoffeeBreak {

    // Hier handelt es sich im Wesentlichen um Texte - in der Evaluation natürlich nicht internationalisierbar.
    export class Constants {
        // Die Namen der verwendeten SharePoint Listen.
        static listNames = {
            // Alle Arten von Kaffee.
            coffeeTypes: `CoffeeTypes`,

            // Alle Spenden.
            donations: `Donations`
        };

        // Prüfergebnisse.
        static validation = {
            // Zur Kennzeichnung eines HTML LABEL, das zu einer ungültigen Eingabe gehört.
            css: `coffeeBreakInvalid`,

            required: `Es muss ein Wert angegeben werden`,

            duplicateType: `Die Art von Kaffee existiert bereits`,

            badNumber: `Es handelt sich nicht um eine Zahl`,

            badRange: `Die Zahl muss zwischen 10 und 10.000 liegen (jeweils einschließlich)`,

            badCompany: `Der Name des Herstellers darf keinen Doppelpunkt enthalten`
        }

        // Sonstige Texte.
        static text = {
            // CSS Klasse zum sauberen Stylen eines jQueryUI Dialogs - hier gibt es Interferenzen mit dem SharePoint CSS.
            dialogCss: `coffeeBreakDialog`,

            // Beschriftung zum Schliessen des Dialogs.
            cancelButton: `Abbrechen`,

            // Überschrift eines Auswahldialogs.
            selectFromList: `Bitte auswählen`
        }
    }

}