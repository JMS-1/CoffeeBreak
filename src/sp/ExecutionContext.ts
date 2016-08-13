'use strict';

module JMS.SharePoint {

    // Repräsentiert eine externe SharePoint Operation.
    class ExecutionResult<TResponseType extends SP.ClientObject> implements IExecutionResult<TResponseType> {
        // Diese Methoden werden im Erfolgsfall aufgerufen.
        private _success: ((response: TResponseType) => void)[] = [];

        // Diese Methoden werden im Fehlerfall aufgerufen.
        private _failure: ((message: string) => void)[] = [];

        // Bereits beim Erzeugen der Operation wird eine Abfrage an SharePoint vorgemerkt.
        constructor(private _request: TResponseType, ...refinement: string[]) {
            if (_request)
                _request.get_context().load(_request, ...refinement);
        }

        // Ergänzt eine Methode für den Erfolgsfall.
        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType> {
            this._success.push(callback);

            return this;
        }

        // Ergänzt eine Methode für den Fehlerfall.
        failure(callback: (message: string) => void): IExecutionResult<TResponseType> {
            this._failure.push(callback);

            return this;
        }

        // Wird nach erfolgreichem Abschluss der Operation aufgerufen.
        fireSuccess(): void {
            this._success.forEach(c => c(this._request));
        }

        // Wird bei fehlerhaften Abschluss der Operation aufgerufen.
        fireFailure(message: string): void {
            this._failure.forEach(c => c(message));
        }
    }

    // Repräsentiert eine asynchrone SharePoint Operation mit nachträglicher Wandlung des Ergebnisse in eine interne Repräsentation.
    class ResultProjector<TResponseType, TProtocolType extends SP.ClientObject> implements IResult<TResponseType> {
        // Diese Methoden werden im Erfolgsfall aufgerufen.
        private _success: ((response: TResponseType) => void)[] = [];

        // Diese Methoden werden im Fehlerfall aufgerufen.
        private _failure: ((message: string) => void)[] = [];

        // Bereits beim Erzeugen der Repräsentation erfolgt die Anmeldung der SharePoint Operation.
        constructor(promise: IExecutionResult<TProtocolType>, projector: (data: TProtocolType) => TResponseType) {
            promise.failure(m => this._failure.forEach(c => c(m)));
            promise.success(r => {
                // Die Weitergabe erfolgt mit der gewandelte Repräsentation.
                var projected = projector(r);

                this._success.forEach(c => c(projected));
            });
        }

        // Ergänzt eine Methode für den Erfolgsfall.
        success(callback: (response: TResponseType) => void): IResult<TResponseType> {
            this._success.push(callback);

            return this;
        }

        // Ergänzt eine Methode für den Fehlerfall.
        failure(callback: (message: string) => void): IResult<TResponseType> {
            this._failure.push(callback);

            return this;
        }
    }

    // Beschreibt eine einzelne Aufrufgruppe an SharePoint.
    class ExecutionContext implements IExecutionContext {
        // Alle zusammengehörenden SharePoint Operationen.
        private promises: ExecutionResult<any>[] = [];

        // Die zugehörige SharePoint Umgebung.
        private _web = new SP.ClientContext().get_web();

        // Ermittelt den aktuellen Anwender.
        user(): IExecutionResult<SP.User> {
            return this.addPromise(this._web.get_currentUser());
        }

        // Ermittelt alle bekannten SharePoint Listen.
        lists(): IExecutionResult<SP.ListCollection> {
            return this.addPromise(this._web.get_lists());
        }

        // Ermittelt eine konkrete SharePoint Liste.
        list(listName: string): IExecutionResult<SP.List> {
            return this.addPromise(this._web.get_lists().getByTitle(listName));
        }

        // Ermittelt Einträge in einer Liste.
        items<TModelType extends ISerializable>(factory: JMS.SharePoint.IModelFactory<TModelType>, query: Query = new Query(), ...refinements: string[]): IResult<TModelType[]> {
            // Statische Konfiguration der Modelklasse ermitteln.
            var factoryStatic: ISerializableClass = <any>factory;

            // Abfrage formulieren.
            var promise = this.addPromise(this._web.get_lists().getByTitle(factoryStatic.listName).getItems(query.createQuery()), ...refinements);

            // Projektion auf Modellelemente einrichten.
            return new ResultProjector<TModelType[], SP.ListItemCollection>(promise, items => {
                var modelItems: TModelType[] = [];

                // SharePoint Informationen in Modellinstanzen wandeln und diese als Ergebnis melden.
                for (var all = items.getEnumerator(); all.moveNext();)
                    modelItems.push(new factory(all.get_current()));

                return modelItems;
            });
        }

        // Erstellt eine Analyse mit Aggegationen.
        pivot<TAggregationType>(factory: IFactory1<TAggregationType, any>, query?: Query): IResult<TAggregationType[]> {
            // Statische Konfiguration der Modelklasse ermitteln.
            var factoryStatic: ISerializableClass = <any>factory;

            // Abfrage formulieren.
            var data = this._web.get_lists().getByTitle(factoryStatic.listName).renderListData(query.createQuery().get_viewXml());

            // Umsetzung anlegen.
            var promise = this.addPromise(null);

            // Projektion auf Modellelemente einrichten.
            return new ResultProjector<TAggregationType[], SP.ClientObject>(promise, () => {
                // Alle Ergebniszeilen ermitteln.
                var rows: any[] = JSON.parse(data.get_value()).Row;

                // Umwandeln.
                return rows.map(row => new factory(row));
            });
        }

        // Ändert oder erzeugt eine Modellinstanz.
        update<TModelType extends ISerializable>(data: TModelType): IResult<TModelType> {
            // Statische Konfiguration der Modellklasse ermitteln.
            var modelClass: ISerializableClass = Object.getPrototypeOf(data).constructor;
            var factory: IModelFactory<TModelType> = <any>modelClass;

            // SharePoint Operation anmelden und Daten aus dem Modell übernehmen.
            var newItem = this._web.get_lists().getByTitle(modelClass.listName).addItem(new SP.ListItemCreationInformation());

            data.saveTo(newItem);

            newItem.update();

            // Wir verwenden auch hier eine Rückprojektion - insbesondere werden die veränderten Daten als neue Modellinstanz gemeldet.
            return new ResultProjector<TModelType, SP.ListItem>(this.addPromise(newItem), item => new factory(item));
        }

        // Vermerkt eine SharePoint Operation.
        private addPromise<TResponseType extends SP.ClientObject>(request: TResponseType, ...refinement: string[]): ExecutionResult<TResponseType> {
            // Kapselung der asynchronen Operation erstellen und merken.
            var promise = new ExecutionResult<TResponseType>(request, ...refinement);

            this.promises.push(promise);

            return promise;
        }

        // Startet alle ausstehenden SharePoint Operationen.
        startAsync(): void {
            var context = this._web.get_context();

            context.executeQueryAsync(
                (s, info) => {
                    // Erfolgsmeldung durchreichen.
                    this.promises.forEach(p => p.fireSuccess());
                    this.promises = [];
                },
                (s, info) => {
                    // Fehlermeldung durchreichen - die Evaluation verwendet hier der Einfachheit halber nur den Fehlertext.
                    var message = info.get_message();

                    console.log(message);

                    this.promises.forEach(p => p.fireFailure(message));
                    this.promises = [];
                });
        }
    }

    // Erstellt eine neue Gruppe von SharePoint Operationen.
    export function newExecutor(): IExecutionContext {
        return new ExecutionContext();
    }
}