'use strict';

module CoffeeBreak {

    // Methoden, die von jedem Controller unterstützt werden müssen.
    export interface IViewBase {
        // Meldet eine Methode zur Initialisierung an.
        setConnect(callback: () => void): void;
    }

    // Typsichere Bindung eines Controllers an sein Präsentationsmodell.
    export interface ITypedController<TViewInterface extends IViewBase> {
    }

    // Basisklasse zur Implementierung eines Controllers.
    export abstract class Controller<TViewInterface extends IViewBase> implements ITypedController<TViewInterface> {
        constructor(protected view: TViewInterface) {
            view.setConnect(() => this.onConnect());
        }

        // Wird aufgerufen, sobald der View zur Konfiguration bereit ist.
        protected abstract onConnect(): void;
    }
}