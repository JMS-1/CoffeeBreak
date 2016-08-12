'use strict';

module JMS.SharePoint {

    // Interne Schnittstelle zum Aufbau der CAML View/Query XML.
    interface IQueryXml {
        // Ergänzt einen XML Konten mit Kindknoten.
        toXml(parent: Element): void;
    }

    // Verwaltet die Sortierung.
    class Order implements IQueryXml {
        // Die Felder, nach denen aktuell sortiert werden soll.
        private _fields: { name: string, ascending: boolean }[] = [];

        // Erzeugt CAML.
        toXml(parent: Element): void {
            // Der Knoten für die Feldliste.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`OrderBy`));

            // Darin eingetragen werden alle Feldinformationen.
            this._fields.forEach(f => {
                var field = <Element>self.appendChild(parent.ownerDocument.createElement(`FieldRef`));

                field.setAttribute(`Name`, f.name);
                field.setAttribute(`Ascending`, f.ascending ? `TRUE` : `FALSE`);
            });
        }

        // Ergänzt ein Feld, nach dem sortiert werden soll.
        addField(name: string, ascending: boolean): void {
            this._fields.push({ name: name, ascending: ascending });
        }
    }

    // Verwaltet die Gruppierung - in der Evaluation nicht wirklich benötigt, hier der Vollständigkeit halber.
    class Grouping implements IQueryXml {
        // Die Felder, nach denen gruppiert werden soll.
        private _fields: string[] = [];

        // Erzeugt CAML.
        toXml(parent: Element): void {
            // Der Knoten mit der Liste der Felder.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`GroupBy`));

            self.setAttribute(`Collapse`, `TRUE`);

            // Alle Felder als Kindknoten eintragen.
            this._fields.forEach(f => {
                var field = <Element>self.appendChild(parent.ownerDocument.createElement(`FieldRef`));

                field.setAttribute(`Name`, f);
            });
        }

        // Ergänzt ein Feld für die Gruppierung.
        addField(name: string): void {
            this._fields.push(name);
        }
    }

    // Basisklasse zur Implementierung einer Suchbedingung.
    abstract class Condition implements IQueryXml, ICondition {
        // Erzeugt die XAML Repräsentation der Suchbedingung.
        abstract toXml(parent: Element): void;
    }

    // Basisklasse für eine binäre Suchbedingung auf einem Feld mit einem konstanten Wert - da geht in CAML natürlich wesentlich mehr.
    abstract class Binary extends Condition {
        constructor(private _field: string, private _value: any, private _operation: string, private _isLookup?: boolean) {
            super();
        }

        // Erzeugt XAML.
        toXml(parent: Element): void {
            // Der Knoten für die Operation.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(this._operation));

            // Der Knoten für das Feld.
            var field = <Element>self.appendChild(parent.ownerDocument.createElement(`FieldRef`));
            field.setAttribute(`Name`, this._field);

            // Der Knoten für den Wert.
            var value = <Element>self.appendChild(parent.ownerDocument.createElement(`Value`));
            switch (typeof this._value) {
                case `number`:
                    value.textContent = this._value.toString();

                    // Konstante Zahlen könnenauch Fremdschlüssel sein.
                    if (this._isLookup) {
                        // Ein Frendschlüssel wird etwas anders behandelt.
                        field.setAttribute(`LookupId`, `TRUE`);
                        value.setAttribute(`Type`, `Lookup`);
                    }
                    else
                        value.setAttribute(`Type`, `Number`);

                    break;
                default:
                    // Hier fehlt dann atürlich fast alles - die Evaluation braucht aber nicht mehr.
                    throw `Unbekannter Datentyp ${typeof this._value}`;
            }
        }
    }

    // Suchoperation für einen vergleich eines Feldes auf einen exakten Wert.
    class Equal extends Binary {
        constructor(field: string, value: any, isLookup: boolean) {
            super(field, value, `Eq`, isLookup);
        }
    }

    // Klasse zur Repräsentation einer Untersuchbedingung.
    class ConditionPart implements IConditionFactory {
        // Die Untersuchbedingung.
        private _condition: Condition;

        // Legt bei der Erzeugung die konkrete übergeordnete Suchbedingung fest.
        constructor(private _pair: IConditionPair) {
        }

        // Legt die Untersuchbedingung einmalig fest und meldet die übergeordnete Suchbedingungen zur Nutzung als Fluent Interface.
        private setCondition(condition: Condition): IConditionPair {
            if (this._condition)
                throw `Suchbedingung darf nur einmal gesetzt werden`;

            this._condition = condition;

            return this._pair;
        }

        // Legt als Untersuchbedingungen eine Vergleich auf einen exakten Wert fest.
        equal(field: string, value: any, isLookup: boolean = false): IConditionPair {
            return this.setCondition(new Equal(field, value, isLookup));
        }

        // Legt als Untersuchbedingung eine Suchbedingung mit Untersuchbedingungen fest - der Rückgabewert ist hier die neue Suchbedingung.
        private setListCondition(factory: IFactory1<ConditionPair, IConditionPair>): IConditionPair {
            var condition = new factory(this._pair);

            this.setCondition(condition);

            return condition;
        }

        // Legt als Untersuchbedingung ein logisches UND fest.
        and(): IConditionPair {
            return this.setListCondition(And);
        }

        // Legt als Untersuchbedingung ein logisches ODER fest.
        or(): IConditionPair {
            return this.setListCondition(Or);
        }

        // Erzeugt das CAML der Untersuchbedingung.
        toXml(parent: Element): void {
            if (this._condition)
                this._condition.toXml(parent);
        }
    }

    // Hilfsklasse zur Implementierung einer Suchbedingung mit genau zwei Untersuchbedingungen.
    abstract class ConditionPair extends Condition implements IConditionPair {
        // Die erste Untersuchbedingung.
        private _first: ConditionPart;

        // Die zweite Untersuchbedingung.
        private _second: ConditionPart;

        // Bei der Erzeugung wird bereits eine möglicherweise übergeordnete Suchbedingung festgelegt, mit der dann das Fluent Interface einfacher zu bedienen ist.
        constructor(private _operation: string, private _parent: ConditionPair) {
            super();

            this._first = new ConditionPart(this);
            this._second = new ConditionPart(this);
        }

        // Erzeugt das CAML für die beiden Untersuchbedingungen.
        toXml(parent: Element): void {
            // Ein Knoten für die Suchbedingung selbst.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(this._operation));

            this._first.toXml(self);
            this._second.toXml(self);
        }

        // Meldet die erste Untersuchbedingung.
        first(): IConditionFactory {
            return this._first;
        }

        // Meldet die zweite Untersuchbedingung.
        second(): IConditionFactory {
            return this._second;
        }

        // Meldet die optionale übergeordnete Suchbedingung.
        parent(): IConditionPair {
            return this._parent;
        }
    }

    // Repräsentiert ein logisches UND.
    class And extends ConditionPair {
        constructor(parent: ConditionPair) {
            super(`And`, parent);
        }
    }

    // Repräsentiert ein logisches ODER.
    class Or extends ConditionPair {
        constructor(parent: ConditionPair) {
            super(`Or`, parent);
        }
    }

    // Verwaltet die eigentliche Suchbedingung.
    class Where extends Condition {
        constructor(private _inner: Condition) {
            super();
        }

        // Erzeugt das CAML für die Suchbedingung.
        toXml(parent: Element): void {
            // Erst einmal aber den Knoten für den WHERE Anteil der CAML Query.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`Where`));

            this._inner.toXml(self);
        }
    }

    // Repräsentiert eine CAML Query.
    class QueryBody implements IQueryXml {
        // Optional die Suchbedingung.
        private _where: Where;

        // Optional die Sortierung.
        private _order: Order;

        // Optional die Gruppierung.
        private _group: Grouping;

        // Erzeugt das CAML der Query.
        toXml(parent: Element): void {
            // Nach der Erzeugung des Wurzelknotens sind alle weiteren Konfigurationen optional.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`Query`));

            if (this._where)
                this._where.toXml(self);

            if (this._group)
                this._group.toXml(self);

            if (this._order)
                this._order.toXml(self);
        }

        // Ergänzt ein Feld zur Sortierung.
        addSort(name: string, ascending: boolean): void {
            if (!this._order)
                this._order = new Order();

            this._order.addField(name, ascending);
        }

        // Ergänzt ein Feld für die Gruppierung.
        addGroup(name: string): void {
            if (!this._group)
                this._group = new Grouping();

            this._group.addField(name);
        }

        // Legt die Suchbedingung einmalig fest.
        where(condition: Condition): ICondition {
            if (this._where)
                throw `Suchbedingung darf nicht überschrieben werden`;

            this._where = new Where(condition);

            return condition;
        }
    }

    // Verwaltet die maximale Anzahl von Ergebniselementen.
    class RowLimit implements IQueryXml {
        // Ohne weitere Konfiguration meldet die Evalualtion immer alle Ergebnisse.
        maxRows = 0;

        // Erzeugt CAML.
        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`RowLimit`));

            self.setAttribute(`Paged`, `FALSE`);
            self.textContent = this.maxRows.toString();
        }
    }

    // Repräsentiert eine CAML Suchbedingung.
    export class Query {
        // Die eigentliche Suchbedingung.
        private _root = new QueryBody();

        // Die Konfiguration der maximalen Anzahl von Ergebnissen.
        private _rowLimit = new RowLimit();

        // Meldet den CAML View zur Suche.
        getQuery(): SP.CamlQuery {
            // Erstelle ein XML Dokument.
            var xml = document.implementation.createDocument(null, `View`, null);

            // Konfiguriere den CAM View.
            var view = <Element>xml.firstChild;

            this._root.toXml(view);
            this._rowLimit.toXml(view);

            // Schließlich wird das XML Dokument als CAML View Zeichenkette in die SharePoint Repräsentation gewandelt.
            var query = new SP.CamlQuery();
            var ser = new XMLSerializer();

            query.set_viewXml(ser.serializeToString(xml));

            return query;
        }

        // Legt die maximale Anzahl von Ergebnissen fest.
        limit(maxRows: number): Query {
            this._rowLimit.maxRows = maxRows;

            return this;
        }

        // Ergänzt ein Feld für die Sortierung.
        order(name: string, ascending: boolean = true): Query {
            this._root.addSort(name, ascending);

            return this;
        }

        // Ergänzt ein Feld für die Gruppierung.
        group(name: string): Query {
            this._root.addGroup(name);

            return this;
        }

        // Legt die Suchbedingung fest.
        private setCondition(condition: Condition): ICondition {
            this._root.where(condition);

            return this;
        }

        // Legt als Suchbedingung den exakten Vergleich eines Feldes mit einer Konstanten fest.
        equal(field: string, value: any, isLookup: boolean = false): ICondition {
            return this.setCondition(new Equal(field, value, isLookup));
        }

        // Legt die Suchbedingung fest.
        private setListCondition(factory: IFactory1<ConditionPair, IConditionPair>): IConditionPair {
            var condition = new factory();

            this._root.where(condition);

            return condition;
        }

        // Legt ein logisches UND als Suchbedingung fest.
        and(): IConditionPair {
            return this.setListCondition(And);
        }

        // Legt ein logisches ODER als Suchbedingung fest.
        or(): IConditionPair {
            return this.setListCondition(Or);
        }
    }

}