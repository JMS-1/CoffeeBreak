'use strict';

module CoffeeBreak {

    // Basisklasse zur Implementierung einer Seite in der SPA.
    export abstract class View<TPresenationType extends IPresentation, TViewType extends TPresenationType, TControllerType extends IController<TPresenationType>> implements IView, IPresentation {
        private _controllerConnect: () => void;

        private _view: JQuery;

        abstract viewName(): string;

        connect(html: JQuery): void {
            this._view = html;
            this.onConnect();

            if (this._controllerConnect)
                this._controllerConnect();
        }

        setConnect(callback: () => void): void {
            this._controllerConnect = callback;
        }

        protected abstract onConnect(): void;

        protected connectDialog(selector: string): JQuery {
            return this.connectAny(selector);
        }

        protected connectSelect(selector: string, onChange: (newValue: string) => void): JQuery {
            var select = this.connectAny(selector);

            select.prop(`disabled`, true);
            select.on(`change`, () => onChange(select.val()));

            return select;
        }

        protected connectAny(selector: string): JQuery {
            return this._view.find(selector);
        }

        protected connectText(selector: string, onChange: (newValue: string) => void): JQuery {
            var input = this.connectAny(selector);

            input.on(`input`, () => onChange(input.val()));

            return input;
        }

        protected connectNumber(selector: string, onChange: (newValue: number, isValid: boolean) => void): JQuery {
            return this.connectText(selector, newValue => {
                var number = parseFloat(newValue);
                var isValid = ((newValue || ``).length < 1) || $.isNumeric(newValue);

                onChange((isValid && !isNaN(number)) ? number : undefined, isValid);
            });
        }

        protected connectFlag(selector: string, onChange: (newValue: boolean) => void): JQuery {
            var input = this.connectAny(selector);

            input.on(`change`, () => onChange(input.prop(`checked`)));

            return input;
        }

        protected connectAction(selector: string, onExecute: () => void): JQuery {
            var button = this.connectAny(selector);

            button.on(`click`, () => onExecute());
            button.button();

            return button;
        }

        protected close(): void {
            App.closeView();
        }

        protected static setError(input: JQuery, error: string) {
            if (error.length > 0) {
                input.parent().addClass(Constants.validation.css);
                input.attr(`title`, error);
            }
            else {
                input.parent().removeClass(Constants.validation.css);
                input.removeAttr(`title`);
            }
        }
    }
}