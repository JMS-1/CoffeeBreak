'use strict';

module CoffeeBreak {

    export class CreateTypeView implements IView {
        private _controller: CreateViewController;

        viewName(): string {
            return 'createType';
        }

        constructor() {
            this._controller = new CreateViewController(this);
        }
    }

}