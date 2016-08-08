'use strict';

module CoffeeBreak {

    export abstract class Controller<TViewInterface> implements IController {
        constructor(protected view: TViewInterface) {
        }

        abstract onConnect(): void;
    }
}