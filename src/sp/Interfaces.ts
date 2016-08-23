'use strict';

module JMS.SharePoint {

    // Schnittstelle für einen Konstruktor ohne Parameter.
    export interface IFactory0<TType> {
        new (): TType;
    }

    // Schnittstelle für einen Konstruktor mit genau einem Parameter.
    export interface IFactory1<TType, TArgType> {
        new (arg?: TArgType): TType;
    }

    // Repräsentiert den asynchronen Aufruf einer Operation.
    export interface IResult<TResponseType> {
        // Wird im Erfolgsfall mit dem Ergebnis der Operation aufgerufen.
        success(callback: (response: TResponseType) => void): IResult<TResponseType>;

        // Wird im Fehlerfall mit der Fehlermeldung aufgerufen.
        failure(callback: (message: string) => void): IResult<TResponseType>;
    }

    // Repräsentiert den asynchronen Aufruf einer JSOM Operation.
    export interface IExecutionResult<TResponseType extends SP.ClientObject> {
        // Wird im Erfolgsfall mit dem Ergebnis der Operation aufgerufen.
        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType>;

        // Wird im Fehlerfall mit der Fehlermeldung aufgerufen.
        failure(callback: (message: string) => void): IExecutionResult<TResponseType>;
    }

    // Schnittstelle für ein Modell.
    export interface ISerializable {
        // Überführt das Modell aus der SharePoint Repräsentation.
        saveTo(item: SP.ListItem): void;
    }

    // Statische Konfiguration einer jeden Modellklasse.
    export interface IModelClass {
        // Der Name der zugehörigen SharePoint Liste.
        listName: string;
    }

    // Schnittstelle zum Erzeugen eines Modells aus einer SharePoint Repräsenation.
    export interface IModelFactory<TModelType extends ISerializable> extends IFactory1<TModelType, SP.ListItem>, IModelClass {
    }

    // Schnittstelle zum Erzeugen eines Aggregationsmodells aus einer SharePoint Repräsenation.
    export interface IPivotFactory<TAggregationType> extends IFactory1<TAggregationType, IPivotRow>, IModelClass {
    }

    // Eine Schnittstelle zum Erzeugen von Suchbedingungen.
    export interface IConditionFactory<TParentType> {
        // Ergänzt einen Vergleich auf Gleichheit und meldet die übergeordnete Suchbedingung - als Fluent Interface.
        equal(field: string, value: any, isLookup?: boolean): TParentType;

        // Ergänzt ein logisches UND und meldet dieses zur weitern Konfiguration.
        and(): IConditionPair<TParentType>;

        // Ergänzt ein logisches ODER und meldet dieses zur weitern Konfiguration.
        or(): IConditionPair<TParentType>;
    }

    // Schnittstelle für logische Operationen - SharePoint kennt UND und ODER nur als binäre Operatoren.
    export interface IConditionPair<TParentType> {
        // Die erste untergeordnete Suchbedingung.
        first(): IConditionFactory<IConditionPair<TParentType>>;

        // Die zweite untergeordnete Suchbedingung.
        second(): IConditionFactory<IConditionPair<TParentType>>;

        // Die übergeordnete Suchbedingung - vereinfacht die Konfiguration über das Fluent Interface.
        parent(): TParentType;
    }

    // Beschreibt eine Verbindung zu einer anderen Liste.
    export interface IJoin {
        // Meldet die zugehörige Suchbedingung zum Aufbau eines Fluent Interfaces.
        query(): IQuery;

        // Ergänzt ein aus der externen Liste auszulesendes Feld.
        addProjection(fieldName: string): IJoin;
    }

    // Beschreibt eine Suchbedingung.
    export interface IQuery extends IConditionFactory<IQuery> {
        // Legt die maximale Anzahl von Ergebnissen fest.
        limit(maxRows: number): IQuery;

        // Ergänzt ein Feld für die Sortierung.
        order(name: string, ascending?: boolean): IQuery;

        // Ergänzt ein Feld für die Gruppierung.
        group(name: string, ascending?: boolean): IQuery;

        // Ergänzt eine Aggregation.
        aggregate(name: string, algorithm: AggregationAlgorithms): IQuery;

        // Erstellt eine Verbindung mit einer anderen Liste.
        join<TModelType extends ISerializable>(foreignKey: string, alias: string): IJoin;

        // Meldet den CAML View zur Suche.
        createQuery(): SP.CamlQuery;
    }

    // Alle unterstützen Aggregationsalgorithmen.
    export enum AggregationAlgorithms {
        // Einfach nur Zählen.
        Count,

        // Numerische Werte aufaddieren.
        Sum,
    }

    // Beschreibt eine Zeile in einer aggregierten tabelle.
    export interface IPivotRow {
        // Ein einzelne Zelle der Zeile.
        [field: string]: string;
    }

    // Repräsentiert eine Verbindung zu SharePoint.
    export interface IExecutionContext {
        // Ermittelt den aktuellen Anwender.
        user(): IExecutionResult<SP.User>;

        // Meldet alle Listen.
        lists(): IExecutionResult<SP.ListCollection>;

        // Meldet eine konkrete Liste.
        list(listName: string): IExecutionResult<SP.List>;

        // Meldet den Inhalt einer Liste als Modellinstanzen - konfigurierbar mit Suchbedingung, Sortierung, Spaltenauswahl et al.
        items<TModelType extends ISerializable>(list: IModelFactory<TModelType>, query?: IQuery, ...refinements: string[]): IResult<TModelType[]>;

        // Aktualisiert ein einzelnes Modell - tatsächlich werden im Rahmen der Evaluation nur neue Modellinstanzen angelegt.
        update<TModelType extends ISerializable>(data: TModelType): IResult<TModelType>;

        // Sendet alle zur Verbindung registrierten Anfragen an SharePoint und wertet dann asynchron die Ergebnisse aus.
        startAsync(): void;

        // Erstellt eine Analyse mit Aggegationen.
        pivot<TAggregationType>(list: IPivotFactory<TAggregationType>, query?: IQuery): IResult<TAggregationType[]>;
    }
}