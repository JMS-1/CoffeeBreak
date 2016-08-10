'use strict';

module CoffeeBreak {

    export abstract class View<TViewInterface, TViewType extends TViewInterface, TControllerType extends ITypedController<TViewInterface>> implements IView {
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

        protected connectDialog(selector: string): JQuery {
            return this._view.find(selector);
        }

        protected connectSelect(selector: string, onChange: (newValue: string) => void): JQuery {
            var select = this._view.find(selector);

            select.prop(`disabled`, true);
            select.on(`change`, () => onChange(select.val()));

            return select;
        }

        protected connectText(selector: string, onChange: (newValue: string) => void): JQuery {
            var input = this._view.find(selector);

            input.on(`input`, () => onChange(input.val()));

            return input;
        }

        protected connectFlag(selector: string, onChange: (newValue: boolean) => void): JQuery {
            var input = this._view.find(selector);

            input.on(`change`, () => onChange(input.prop('checked')));

            return input;
        }

        protected connectAction(selector: string, onExecute: () => void): JQuery {
            var button = this._view.find(selector);

            button.on(`click`, () => onExecute());
            button.button();

            return button;
        }

        protected close(): void {
            App.closeView();
        }
    }
}