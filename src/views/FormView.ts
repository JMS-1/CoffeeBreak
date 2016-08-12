/// <reference path="View.ts" />

'use strict';

module CoffeeBreak {

    // Hilfsklasse zur Implementierung eines Views mit einem Formular zur Pflege einer Modellinszant.
    export abstract class FormView<TPresentationType extends IForm, TViewType extends TPresentationType, TControllerType extends IFormController<TPresentationType>> extends View<TPresentationType, TViewType, TControllerType> implements IForm {
        // Schaltfläche zum Speichern und Beenden.
        private _save: JQuery;

        // Schaltfläche zum Beenden ohne Speichern.
        private _cancel: JQuery;

        // Benachrichtigung zum Speichern.
        private _onSave: (done: (success: boolean) => void) => void;

        // Verbindet den View mit der Oberfläche.
        protected onConnect(): void {
            this._cancel = this.connectAction(`a.coffeeBreakCancel`, () => this.close());
            this._save = this.connectAction(`a.coffeeBreakSave`, () => this._onSave && this._onSave(success => {
                if (success)
                    this.close();
            }));

            // Speichern wird erst einmal verboten.
            this.setAllowSave(false);
        }

        // Legt die Methode zum Speichern fest.
        setSave(save: (done: (success: boolean) => void) => void): void {
            this._onSave = save;
        }

        // Erlaubt oder verbietet das Speichern durch den Anwender.
        setAllowSave(enable: boolean): void {
            if (enable)
                this._save.button(`enable`);
            else
                this._save.button(`disable`);
        }
    }

}