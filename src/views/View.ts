/// <reference path="Presentation.ts" />

'use strict';

module CoffeeBreak {

    // Basisklasse zur Implementierung einer Seite in der SPA.
    export abstract class View<TPresentationType extends IPresentation, TViewType extends TPresentationType, TControllerType extends IController<TPresentationType>> extends Presentation<TPresentationType> implements IView {
        // Der gesamte Inhalt des Views, dynamisch in die SPA geladen.
        private _view: JQuery;

        // Meldet den Namen der zugehörigen HTML Datei.
        abstract viewName(): string;

        // Wird nach dem Laden der HTML Datei aufgerufen.
        connect(html: JQuery): void {
            // View mit dem HTML verbinden.
            this._view = html;
            this.onConnect();

            // Nun können die Modelldaten geladen werden.
            this.onViewReady();
        }

        // Individuelle Initialisierung des Views.
        protected abstract onConnect(): void;

        // Verbindung mit einem jQueryUI Dialog herstellen.
        protected connectDialog(selector: string): JQuery {
            return this.connectAny(selector);
        }

        // Verbindung mit einem HTML SELECT herstellen.
        protected connectSelect(selector: string, onChange: (newValue: string) => void): JQuery {
            var select = this.connectAny(selector);

            // Man beachte, dass die Auswahlliste erst einmal deaktiviert wird.
            select.prop(`disabled`, true);
            select.on(`change`, () => onChange(select.val()));

            return select;
        }

        // Verbindung mit einem beliebigen HTML Element herstellen.
        protected connectAny(selector: string): JQuery {
            return this._view.find(selector);
        }

        // Verbindung mit einem HTML INPUT der Art TEXT herstellen.
        protected connectText(selector: string, onChange: (newValue: string) => void): JQuery {
            var input = this.connectAny(selector);

            input.on(`input`, () => onChange(input.val()));

            return input;
        }

        // Verbindung mit einem HTML INPUT der Art TEXT herstellen, wobei aber nur Zahlen als Eingabe erlaubt sind.
        protected connectNumber(selector: string, onChange: (newValue: number, isValid: boolean) => void): JQuery {
            return this.connectText(selector, newValue => {
                var number = parseFloat(newValue);
                var isValid = ((newValue || ``).length < 1) || $.isNumeric(newValue);

                onChange((isValid && !isNaN(number)) ? number : undefined, isValid);
            });
        }

        // Verbindung mit einem HTML INPUT der Art CHECKBOX herstellen.
        protected connectFlag(selector: string, onChange: (newValue: boolean) => void): JQuery {
            var input = this.connectAny(selector);

            input.on(`change`, () => onChange(input.prop(`checked`)));

            return input;
        }

        // Verbindung mit einem HTML INPUT der Art BUTTON, einem HTML BUTTON oder einem HTML A herstellen.
        protected connectAction(selector: string, onExecute: () => void): JQuery {
            var button = this.connectAny(selector);

            button.on(`click`, () => onExecute());
            button.button();

            return button;
        }

        // Beendet den View und zeigt den vorherigen an - dieser wird dabei ganz neu geladen.
        protected close(): void {
            App.closeView();
        }

        // Hilfsklasse zur Anzeige eines Prüfergebnisses auf einem HTML Element und dem zugehörigen HTML LABEL Vaterelement.
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