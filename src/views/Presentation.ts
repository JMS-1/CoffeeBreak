'use strict';

module CoffeeBreak {

    // Basisklasse für Präsentationen - obwohl im Controller getrennt verwendet die Evaluation Präsentation und View jeweils in einer einzigen Klasse zusammengeführt.
    export abstract class Presentation<TPresentationType extends IPresentation> implements IPresentation {
        // Optionale Benachrichtigung des Controllers wenn der View bereit zur Konfiguration ist.
        private _controllerConnect: () => void;

        // Legt die Methode zur Benachrichtigung für die Konfiguration des Views fest.
        setConnect(callback: () => void): void {
            this._controllerConnect = callback;
        }

        // Wird ausgelöst sobald der View zur Konfiguration bereit steht.
        protected onViewReady(): void {
            if (this._controllerConnect)
                this._controllerConnect();
        }
    }
}