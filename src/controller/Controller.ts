'use strict';

module CoffeeBreak {

    export abstract class Controller<TViewType extends IView> {
        private _model = new CoffeeType();

        constructor(protected view: TViewType) {
        }
    }
}