'use strict';

module CoffeeBreak {

    // Methoden, die von jedem Controller unterstützt werden müssen.
    export interface IPresentation {
        // Meldet eine Methode zur Initialisierung an.
        setConnect(callback: () => void): void;
    }

    // Typsichere Bindung eines Controllers an sein Präsentationsmodell.
    export interface IController<TPresenationType extends IPresentation> {
    }

    // Basisklasse zur Implementierung eines Controllers.
    export abstract class Controller<TPresenationType extends IPresentation> implements IController<TPresenationType> {
        constructor(protected view: TPresenationType) {
            view.setConnect(() => this.onConnect());
        }

        // Wird aufgerufen, sobald der View zur Konfiguration bereit ist.
        protected abstract onConnect(): void;
    }
}