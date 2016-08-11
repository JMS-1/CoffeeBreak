'use strict';

module CoffeeBreak {

    export class Constants {
        static listNames = {
            coffeeTypes: 'CoffeeTypes',

            donations: 'Donations'
        };

        static validation = {
            css: 'coffeeBreakInvalid',

            required: 'Es muss ein Wert angegeben werden',

            duplicateType: 'Die Art von Kaffee existiert bereits',

            badNumber: 'Es handelt sich nicht um eine Zahl',

            badRange: 'Die Zahl muss zwischen 10 und 10.000 liegen (jeweils einschließlich)',

            badCompany: 'Der Name des Herstellers darf keinen Doppelpunkt enthalten'
        }

        static text = {
            cancelButton: 'Abbrechen',

            selectFromList: 'Bitte auswählen'
        }
    }

}