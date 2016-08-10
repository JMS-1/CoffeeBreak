'use strict';

module CoffeeBreak {

    export class Constants {
        static listNames = {
            coffeeTypes: 'CoffeeTypes',

            donations: 'DonationTypes'
        };

        static contentTypeIds = {
            coffeeTypes: '0x01003F6C67E72F454C9B967266935FC81C2A',

            donations: '0x01000ACCEA4070694F2D9626A6668ED27E1C'
        };

        static validation = {
            css: 'coffeeBreakInvalid',

            required: 'Es muss ein Wert angegeben werden',

            duplicateType: 'Die Art von Kaffee existiert bereits'
        }

        static text = {
            cancelButton: 'Abbrechen',

            selectFromList: 'Bitte auswählen'
        }
    }

}