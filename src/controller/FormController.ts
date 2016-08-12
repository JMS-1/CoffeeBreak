/// <reference path="Controller.ts" />

'use strict';

module CoffeeBreak {

    // Das Präsentationsmodell für ein Formular muss zumindest das Speichern unterstützen.
    export interface IForm extends IPresentation {
        // Teilt dem View mit, ob ein Speichern überhaupt erlaubt ist.
        setAllowSave(enable: boolean): void;

        // Legt die Methode fest, die aufzurufen ist, wenn der Anwender das Formular speichern möchte.
        setSave(save: (done: (success: boolean) => void) => void): void;
    }

    // Identifiert einen Controller für ein Formular.
    export interface IFormController<TPresentationType extends IForm> extends IController<TPresentationType> {
    }

    // Basisklasse zur Implementierung von Controllern zu Formularen.
    export abstract class FormController<TPresentationType extends IForm, TModelType extends Model> extends Controller<TPresentationType> implements IFormController<TPresentationType> {
        // Die Modelldaten, die auf dem Formular gepflegt werden sollen.
        protected model: TModelType;

        // Leider kann TypeScript kein new TModelType(), daher die explizite Angabe eines Konstruktors.
        constructor(view: TPresentationType, factory: JMS.SharePoint.IModelFactory<TModelType>) {
            super(view);

            this.model = new factory();
        }

        // Wird aufgerufen, sobald der View zur Konfiguration bereit ist.
        protected onConnect(): void {
            // Meldet die Methode an, die beim Speichern durch den Anwender aufzurufen ist.
            this.view.setSave(done => {
                // Speichern ist ohne folgende Änderung immer nur einmal möglich - tatsächlich ist das nicht ganz sauber: das Speicher müsste verboten werden, bis der aktuelle Vorgang abgeschlossen ist.
                this.view.setAllowSave(false);

                // Verbindung zu SharePoint herstellen.
                var executor = JMS.SharePoint.newExecutor();

                // Wir versuchen nun, die Änderung (oder das Anlegen) der Modelldaten durchzuführen.
                executor
                    .update(this.model)
                    .success(model => this.onSaved(model))
                    .success(model => done(true))
                    .failure(message => done(false));

                // Das passiert natürlich asynchon - tatsächlich müsste man in einer produktiven Anwendung nun den View erst einmal sperren.
                executor.startAsync();
            });
        }

        // Wird nach dem erfolgreichen Speichern aufgerufen, bevor der View darüber informiert wird.
        protected onSaved(model: TModelType): void {
        }

        // In diesem einfachen Bespiel benötigen alle Formular Controller die Arten von Kaffee, daher das Laden dieser hier in der Basisklasse.
        protected loadTypes(process: (types: CoffeeType[]) => void): void {
            // Verbindung zu SharePoint herstellen.
            var context = JMS.SharePoint.newExecutor();

            // Und die aktuelle Liste aller Arten von Kaffee laden - auch hier könnte man im produktiven Betrieb mit etwas Datenvorhaltung in der Web Anwendung die benötigte Bandbreite reduzieren.
            context.items(CoffeeType).success(process);

            context.startAsync();
        }
    }

}