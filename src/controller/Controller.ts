'use strict';

module CoffeeBreak {

    // Methoden, die von jedem Controller unterstützt werden müssen.
    export interface IController {
        // Wird aufgerufen, wenn der View bereit zur Konfiguration ist.
        onConnect(): void;
    }

    // Typsichere Bindung eines Controllers an sein Präsentationsmodell.
    export interface ITypedController<TViewInterface> extends IController {
    }

    // Basisklasse zur Implementierung eines Controllers.
    export abstract class Controller<TViewInterface> implements ITypedController<TViewInterface> {
        constructor(protected view: TViewInterface) {
        }

        abstract onConnect(): void;
    }
}