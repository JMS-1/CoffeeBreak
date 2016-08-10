'use strict';

module CoffeeBreak {

    export interface IController {
        onConnect(): void;
    }

    export interface ITypedController<TViewInterface> extends IController {
    }

    export abstract class Controller<TViewInterface> implements ITypedController<TViewInterface> {
        constructor(protected view: TViewInterface) {
        }

        abstract onConnect(): void;
    }
}