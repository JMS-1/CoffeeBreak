'use strict';

module JMS.SharePoint {

    // Interne Schnittstelle zum Aufbau der CAML View/Query XML.
    interface ICondition {
        // Ergänzt einen XML Konten mit Kindknoten.
        createNode(parent: Element): void;
    }

    // Verwaltet die Sortierung.
    class Order {
        // Die Felder, nach denen aktuell sortiert werden soll.
        private _fields: { name: string, ascending: boolean }[] = [];

        // Erzeugt CAML.
        createNode(parent: Element): void {
            if (this._fields.length < 1)
                return;

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
    class Grouping {
        // Die Felder, nach denen gruppiert werden soll.
        private _fields: string[] = [];

        // Erzeugt CAML.
        createNode(parent: Element): void {
            if (this._fields.length < 1)
                return;

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

    // Verwaltet Aggregationen.
    class Aggregations {
        // Die aggregierten Felder samt den zugehörigen Algorithmen.
        private _fields: { name: string, algorithm: AggregationAlgorithms }[] = [];

        // Erzeugt CAML.
        createNode(parent: Element): void {
            if (this._fields.length < 1)
                return;

            // Der Knoten mit der Liste der Felder.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`Aggregations`));

            // Alle Felder als Kindknoten eintragen.
            this._fields.forEach(f => {
                var field = <Element>self.appendChild(parent.ownerDocument.createElement(`FieldRef`));

                field.setAttribute(`Name`, f.name);
                field.setAttribute(`Type`, AggregationAlgorithms[f.algorithm]);
            });
        }

        // Ergänzt eine Aggregations.
        addAggregation(name: string, algorithm: AggregationAlgorithms): void {
            this._fields.push({ name: name, algorithm: algorithm });
        }
    }

    // Basisklasse für eine binäre Suchbedingung auf einem Feld mit einem konstanten Wert - da geht in CAML natürlich wesentlich mehr.
    abstract class Binary implements ICondition {
        constructor(private _field: string, private _value: any, private _operation: string, private _isLookup?: boolean) {
        }

        // Erzeugt XAML.
        createNode(parent: Element): void {
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
    class ConditionFactory<TParentType> implements IConditionFactory<TParentType> {
        // Die Untersuchbedingung.
        condition: ICondition;

        // Legt bei der Erzeugung die konkrete übergeordnete Suchbedingung fest.
        constructor(private _parent?: TParentType) {
        }

        // Meldet die übergeordnete Suchbedingung.
        protected getParent(): TParentType {
            return this._parent;
        }

        // Legt die Untersuchbedingung einmalig fest und meldet die übergeordnete Suchbedingungen zur Nutzung als Fluent Interface.
        protected setCondition(condition: ICondition): TParentType {
            if (this.condition)
                throw `Suchbedingung darf nur einmal gesetzt werden`;

            this.condition = condition;

            return this.getParent();
        }

        // Legt als Untersuchbedingungen eine Vergleich auf einen exakten Wert fest.
        equal(field: string, value: any, isLookup: boolean = false): TParentType {
            return this.setCondition(new Equal(field, value, isLookup));
        }

        // Legt als Untersuchbedingung eine Suchbedingung mit Untersuchbedingungen fest - der Rückgabewert ist hier die neue Suchbedingung.
        private setListCondition(factory: IFactory1<ConditionPair<TParentType>, TParentType>): IConditionPair<TParentType> {
            var condition = new factory(this.getParent());

            this.setCondition(condition);

            return condition;
        }

        // Legt als Untersuchbedingung ein logisches UND fest.
        and(): IConditionPair<TParentType> {
            return this.setListCondition(And);
        }

        // Legt als Untersuchbedingung ein logisches ODER fest.
        or(): IConditionPair<TParentType> {
            return this.setListCondition(Or);
        }

        // Erzeugt das CAML der Untersuchbedingung.
        createNode(parent: Element): void {
            if (this.condition)
                this.condition.createNode(parent);
        }
    }

    // Hilfsklasse zur Implementierung einer Suchbedingung mit genau zwei Untersuchbedingungen.
    abstract class ConditionPair<TParentType> implements ICondition, IConditionPair<TParentType> {
        // Die erste Untersuchbedingung.
        private _first: ConditionFactory<IConditionPair<TParentType>>;

        // Die zweite Untersuchbedingung.
        private _second: ConditionFactory<IConditionPair<TParentType>>;

        // Bei der Erzeugung wird bereits eine möglicherweise übergeordnete Suchbedingung festgelegt, mit der dann das Fluent Interface einfacher zu bedienen ist.
        constructor(private _operation: string, private _parent: TParentType) {
            this._first = new ConditionFactory<IConditionPair<TParentType>>(this);
            this._second = new ConditionFactory<IConditionPair<TParentType>>(this);
        }

        // Erzeugt das CAML für die beiden Untersuchbedingungen.
        createNode(parent: Element): void {
            // Ein Knoten für die Suchbedingung selbst.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(this._operation));

            this._first.createNode(self);
            this._second.createNode(self);
        }

        // Meldet die erste Untersuchbedingung.
        first(): IConditionFactory<IConditionPair<TParentType>> {
            return this._first;
        }

        // Meldet die zweite Untersuchbedingung.
        second(): IConditionFactory<IConditionPair<TParentType>> {
            return this._second;
        }

        // Meldet die optionale übergeordnete Suchbedingung.
        parent(): TParentType {
            return this._parent;
        }
    }

    // Repräsentiert ein logisches UND.
    class And<TParentType> extends ConditionPair<TParentType> {
        constructor(parent: TParentType) {
            super(`And`, parent);
        }
    }

    // Repräsentiert ein logisches ODER.
    class Or<TParentType> extends ConditionPair<TParentType> {
        constructor(parent: TParentType) {
            super(`Or`, parent);
        }
    }

    // Verwaltet die eigentliche Suchbedingung.
    class Where {
        constructor(private _query: Query) {
        }

        // Erzeugt das CAML für die Suchbedingung.
        createNode(parent: Element): void {
            if (!this._query.condition)
                return;

            // Erst einmal aber den Knoten für den WHERE Anteil der CAML Query.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`Where`));

            this._query.condition.createNode(self);
        }
    }

    // Repräsentiert eine CAML Query.
    class QueryBody {
        // Optional die Suchbedingung.
        private _where: Where;

        // Optional die Sortierung.
        private _order = new Order();

        // Optional die Gruppierung.
        private _group = new Grouping();

        constructor(query: Query) {
            this._where = new Where(query);
        }

        // Erzeugt das CAML der Query.
        createNode(parent: Element): void {
            // Nach der Erzeugung des Wurzelknotens sind alle weiteren Konfigurationen optional.
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`Query`));

            this._where.createNode(self);
            this._group.createNode(self);
            this._order.createNode(self);
        }

        // Ergänzt ein Feld zur Sortierung.
        addSort(name: string, ascending: boolean): void {
            this._order.addField(name, ascending);
        }

        // Ergänzt ein Feld für die Gruppierung.
        addGroup(name: string): void {
            this._group.addField(name);
        }
    }

    // Verwaltet die maximale Anzahl von Ergebniselementen.
    class RowLimit {
        // Ohne weitere Konfiguration meldet die Evalualtion immer alle Ergebnisse.
        maxRows = 0;

        // Erzeugt CAML.
        createNode(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(`RowLimit`));

            self.setAttribute(`Paged`, `FALSE`);
            self.textContent = this.maxRows.toString();
        }
    }

    // Beschreibt die Verbindung zu einer anderen Liste.
    class Join implements IJoin {
        // Alle zugehörigen Projektionen.
        private _fields: string[] = [];

        constructor(private _query: Query, private _foreignKey: string, private _alias) {
        }

        // Meldet die zugehörige Suchbedingung:
        query(): IQuery {
            return this._query;
        }

        // Ergänzt ein aus der externen Liste auszulesendes Feld.
        addProjection(fieldName: string): IJoin {
            this._fields.push(fieldName);

            return this;
        }

        // Erzeugt CAML.
        createNodes(joins: Element, fields: Element): void {
            // Der Knoten für die Konfiguration.
            var self = <Element>joins.appendChild(joins.ownerDocument.createElement(`Join`));

            self.setAttribute(`Type`, `Left`);
            self.setAttribute(`ListAlias`, this._alias);

            var match = <Element>self.appendChild(joins.ownerDocument.createElement(`Eq`));

            // Der Fremdschlüssel.
            var left = <Element>match.appendChild(joins.ownerDocument.createElement(`FieldRef`));
            left.setAttribute(`Name`, this._foreignKey);
            left.setAttribute(`RefType`, `Id`);

            // Der Primärschlüssel.
            var right = <Element>match.appendChild(joins.ownerDocument.createElement(`FieldRef`));
            right.setAttribute(`Name`, `ID`);
            right.setAttribute(`List`, this._alias);

            // Und die optional projizierten Felder.
            this._fields.forEach(f => {
                var self = <Element>fields.appendChild(fields.ownerDocument.createElement(`Field`));

                self.setAttribute(`Name`, `${this._alias}${f}`);
                self.setAttribute(`List`, this._alias);
                self.setAttribute(`Type`, `Lookup`);
                self.setAttribute(`ShowField`, f);
            });
        }
    }

    // Repräsentiert eine CAML Suchbedingung.
    class Query extends ConditionFactory<IQuery> implements IQuery {
        // Die eigentliche Suchbedingung.
        private _root: QueryBody;

        // Die Konfiguration der maximalen Anzahl von Ergebnissen.
        private _rowLimit = new RowLimit();

        // Die Aggregationen zur Suche.
        private _aggregations = new Aggregations();

        // Alle verbundenen Listen.
        private _joins: Join[] = [];

        constructor() {
            super();

            this._root = new QueryBody(this);
        }

        // Meldet die übergeordnete Suchbedingung.
        protected getParent(): IQuery {
            return this;
        }

        // Meldet den CAML View zur Suche.
        createQuery(): SP.CamlQuery {
            // Erstelle ein XML Dokument.
            var xml = document.implementation.createDocument(null, `View`, null);

            // Konfiguriere den CAM View.
            var view = <Element>xml.firstChild;
            var joins = <Element>view.appendChild(xml.createElement(`Joins`));
            var projections = <Element>view.appendChild(xml.createElement(`ProjectedFields`));

            this._joins.forEach(j => j.createNodes(joins, projections));
            this._root.createNode(view);
            this._rowLimit.createNode(view);
            this._aggregations.createNode(view);

            // Schließlich wird das XML Dokument als CAML View Zeichenkette in die SharePoint Repräsentation gewandelt.
            var query = new SP.CamlQuery();
            var ser = new XMLSerializer();

            query.set_viewXml(ser.serializeToString(xml));

            return query;
        }

        // Legt die maximale Anzahl von Ergebnissen fest.
        limit(maxRows: number): IQuery {
            this._rowLimit.maxRows = maxRows;

            return this;
        }

        // Ergänzt ein Feld für die Sortierung.
        order(name: string, ascending: boolean = true): IQuery {
            this._root.addSort(name, ascending);

            return this;
        }

        // Ergänzt ein Feld für die Gruppierung.
        group(name: string): IQuery {
            this._root.addGroup(name);

            return this;
        }

        // Ergänzt eine Aggregation.
        aggregate(name: string, algorithm: AggregationAlgorithms): IQuery {
            this._aggregations.addAggregation(name, algorithm);

            return this;
        }

        // Erstellt eine Verbindung mit einer anderen Liste.
        join<TModelType extends ISerializable>(foreignKey: string, alias: string): IJoin {
            // Verknüfung anlegen.
            var join = new Join(this, foreignKey, alias);

            this._joins.push(join);

            return join;
        }
    }

    // Erstellt eine neue Suchbedingung.
    export function newQuery(): IQuery {
        return new Query();
    }
}