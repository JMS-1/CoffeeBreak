'use strict';

module JMS.SharePoint {

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

    class QueryBody implements IQueryXml {
        private _order: Order;

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement('Query'));

            if (this._order)
                this._order.toXml(self);
        }

        addSort(name: string, ascending: boolean): void {
            if (!this._order)
                this._order = new Order();

            this._order.addField(name, ascending);
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
    }

}