'use strict';

module JMS.SharePoint {

    export interface ICondition {
    }

    export interface IConditionPart {
        equal(field: string, value: any, isLookup?: boolean): IConditionPair;

        and(): IConditionPair;

        or(): IConditionPair;
    }

    export interface IConditionPair {
        first(): IConditionPart;

        second(): IConditionPart;

        parent(): IConditionPair;
    }

    interface IQueryXml {
        toXml(parent: Element): void;
    }

    class Order implements IQueryXml {
        private _fields: { name: string, ascending: boolean }[] = [];

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('OrderBy'));

            this._fields.forEach(f => {
                var field = <Element>self.appendChild(parent.ownerDocument.createElement('FieldRef'));

                field.setAttribute('Name', f.name);
                field.setAttribute('Ascending', f.ascending ? 'TRUE' : 'FALSE');
            });
        }

        addField(name: string, ascending: boolean): void {
            this._fields.push({ name: name, ascending: ascending });
        }
    }

    class Grouping implements IQueryXml {
        private _fields: string[] = [];

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('GroupBy'));

            self.setAttribute('Collapse', 'TRUE');

            this._fields.forEach(f => {
                var field = <Element>self.appendChild(parent.ownerDocument.createElement('FieldRef'));

                field.setAttribute('Name', f);
            });
        }

        addField(name: string): void {
            this._fields.push(name);
        }
    }

    abstract class Condition implements IQueryXml, ICondition {
        abstract toXml(parent: Element): void;
    }

    abstract class Binary extends Condition {
        constructor(private _field: string, private _value: any, private _operation: string, private _isLookup?: boolean) {
            super();
        }

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(this._operation));

            var field = <Element>self.appendChild(parent.ownerDocument.createElement('FieldRef'));
            field.setAttribute('Name', this._field);

            var value = <Element>self.appendChild(parent.ownerDocument.createElement('Value'));
            switch (typeof this._value) {
                case 'number':
                    value.textContent = this._value.toString();

                    if (this._isLookup) {
                        field.setAttribute('LookupId', 'TRUE');
                        value.setAttribute('Type', 'Lookup');
                    }
                    else
                        value.setAttribute('Type', 'Number');

                    break;
                default:
                    throw `Unbekannter Datentyp ${typeof this._value}`;
            }
        }
    }

    class Equal extends Binary {
        constructor(field: string, value: any, isLookup: boolean) {
            super(field, value, `Eq`, isLookup);
        }
    }

    class ConditionPart implements IConditionPart {
        private _condition: Condition;

        constructor(private _pair: IConditionPair) {
        }

        private setCondition(condition: Condition): IConditionPair {
            if (this._condition)
                throw 'Suchbedingung darf nur einmal gesetzt werden';

            this._condition = condition;

            return this._pair;
        }

        equal(field: string, value: any, isLookup: boolean = false): IConditionPair {
            return this.setCondition(new Equal(field, value, isLookup));
        }

        private setListCondition(factory: IFactory1<ConditionPair, IConditionPair>): IConditionPair {
            var condition = new factory(this._pair);

            this.setCondition(condition);

            return condition;
        }

        and(): IConditionPair {
            return this.setListCondition(And);
        }

        or(): IConditionPair {
            return this.setListCondition(Or);
        }

        toXml(parent: Element): void {
            if (this._condition)
                this._condition.toXml(parent);
        }
    }

    abstract class ConditionPair extends Condition implements IConditionPair {
        private _first: ConditionPart;

        private _second: ConditionPart;

        constructor(private _operation: string, private _parent: ConditionPair) {
            super();

            this._first = new ConditionPart(this);
            this._second = new ConditionPart(this);
        }

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement(this._operation));

            this._first.toXml(self);
            this._second.toXml(self);
        }

        first(): IConditionPart {
            return this._first;
        }

        second(): IConditionPart {
            return this._second;
        }

        parent(): IConditionPair {
            return this._parent;
        }
    }

    class And extends ConditionPair {
        constructor(parent: ConditionPair) {
            super('And', parent);
        }
    }

    class Or extends ConditionPair {
        constructor(parent: ConditionPair) {
            super('Or', parent);
        }
    }

    class Where extends Condition {
        constructor(private _inner: Condition) {
            super();
        }

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('Where'));

            this._inner.toXml(self);
        }
    }

    class QueryBody implements IQueryXml {
        private _where: Where;

        private _order: Order;

        private _group: Grouping;

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('Query'));

            if (this._where)
                this._where.toXml(self);

            if (this._group)
                this._group.toXml(self);

            if (this._order)
                this._order.toXml(self);
        }

        addSort(name: string, ascending: boolean): void {
            if (!this._order)
                this._order = new Order();

            this._order.addField(name, ascending);
        }

        addGroup(name: string): void {
            if (!this._group)
                this._group = new Grouping();

            this._group.addField(name);
        }

        where(condition: Condition): ICondition {
            if (this._where)
                throw `Suchbedingung darf nicht überschrieben werden`;

            this._where = new Where(condition);

            return condition;
        }
    }

    class RowLimit implements IQueryXml {
        maxRows = 0;

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('RowLimit'));

            self.setAttribute('Paged', 'FALSE');
            self.textContent = this.maxRows.toString();
        }
    }

    export class Query {
        private _root = new QueryBody();

        private _rowLimit = new RowLimit();

        getQuery(): SP.CamlQuery {
            var xml = document.implementation.createDocument(null, 'View', null);
            var view = <Element>xml.firstChild;

            this._root.toXml(view);
            this._rowLimit.toXml(view);

            var query = new SP.CamlQuery();
            var ser = new XMLSerializer();

            query.set_viewXml(ser.serializeToString(xml));

            return query;
        }

        limit(maxRows: number): Query {
            this._rowLimit.maxRows = maxRows;

            return this;
        }

        order(name: string, ascending: boolean = true): Query {
            this._root.addSort(name, ascending);

            return this;
        }

        group(name: string): Query {
            this._root.addGroup(name);

            return this;
        }

        private setCondition(condition: Condition): ICondition {
            this._root.where(condition);

            return this;
        }

        equal(field: string, value: any, isLookup: boolean = false): ICondition {
            return this.setCondition(new Equal(field, value, isLookup));
        }

        private setListCondition(factory: IFactory1<ConditionPair, IConditionPair>): IConditionPair {
            var condition = new factory();

            this._root.where(condition);

            return condition;
        }

        and(): IConditionPair {
            return this.setListCondition(And);
        }

        or(): IConditionPair {
            return this.setListCondition(Or);
        }
    }

}