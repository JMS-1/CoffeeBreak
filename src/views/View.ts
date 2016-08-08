'use strict';

module CoffeeBreak {

    export abstract class View<TViewType, TControllerType extends IController> implements IView {
        private _controller: TControllerType;

        private _view: JQuery;

        abstract viewName(): string;

        connect(html: JQuery): void {
            this._view = html;
            this.onConnect();
            this._controller.onConnect();
        }

        constructor(factory: { new (view: TViewType): TControllerType }) {
            this._controller = new factory(<TViewType><any>this);
        }

        protected abstract onConnect(): void;

        protected connectText(selector: string, onChange: (newValue: string) => void): JQuery {
            var input = this._view.find(selector);

            input.on(`input`, () => onChange(input.val()));

            return input;
        }
    }
}