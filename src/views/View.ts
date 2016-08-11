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

        constructor(factory: JMS.SharePoint.IFactory1<TControllerType, TViewType>) {
            this._controller = new factory(<TViewType><any>this);
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

            input.on(`change`, () => onChange(input.prop('checked')));

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
                input.attr('title', error);
            }
            else {
                input.parent().removeClass(Constants.validation.css);
                input.removeAttr('title');
            }
        }
    }
}