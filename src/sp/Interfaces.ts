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

    // Schnittstelle für eine Modellklasse.
    export interface ISerializableClass {
        // Der Name der zugehörigen SharePoint Liste (als static Feld der Klasse).
        listName: string;
    }

    // Schnittstelle für ein Modell.
    export interface ISerializable {
        // Überführt das Modell aus der SharePoint Repräsentation.
        saveTo(item: SP.ListItem): void;
    }

    // Schnittstelle zum Erzeugen eines Modells aus einer SharePoint Repräsenation.
    export interface IModelFactory<TModelType extends ISerializable> extends IFactory1<TModelType, SP.ListItem> {
    }

    // Beschreibt irgendeine Suchbedingung.
    export interface ICondition {
    }

    // Eine Schnittstelle zum Erzeugen von Suchbedingungen.
    export interface IConditionFactory {
        // Ergänzt einen Vergleich auf Gleichheit und meldet die übergeordnete Suchbedingung - als Fluent Interface.
        equal(field: string, value: any, isLookup?: boolean): IConditionPair;

        // Ergänzt ein logisches UND und meldet dieses zur weitern Konfiguration.
        and(): IConditionPair;

        // Ergänzt ein logisches ODER und meldet dieses zur weitern Konfiguration.
        or(): IConditionPair;
    }

    // Schnittstelle für logische Operationen - SharePoint kennt UND und ODER nur als binäre Operatoren.
    export interface IConditionPair {
        // Die erste untergeordnete Suchbedingung.
        first(): IConditionFactory;

        // Die zweite untergeordnete Suchbedingung.
        second(): IConditionFactory;

        // Die übergeordnete Suchbedingung - vereinfacht die Konfiguration über das Fluent Interface.
        parent(): IConditionPair;
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
        items<TModelType extends ISerializable>(factory: IModelFactory<TModelType>, query?: Query, ...refinements: string[]): IResult<TModelType[]>;

        // Aktualisiert ein einzelnes Modell - tatsächlich werden im Rahmen der Evaluation nur neue Modellinstanzen angelegt.
        update<TModelType extends ISerializable>(data: TModelType): IResult<TModelType>;

        // Sendet alle zur Verbindung registrierten Anfragen an SharePoint und wertet dann asynchron die Ergebnisse aus.
        startAsync(): void;
    }
}