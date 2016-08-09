'use strict';

module CoffeeBreak {

    export abstract class Controller<TViewInterface> implements ITypedController<TViewInterface> {
        constructor(protected view: TViewInterface) {
        }

        abstract onConnect(): void;
    }
}