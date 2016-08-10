'use strict';

module JMS.SharePoint {

    interface IQueryXml {
        toXml(parent: Element): void;
    }

    class QueryRoot implements IQueryXml {
        toXml(parent: Element): void {
            parent.appendChild(parent.ownerDocument.createElement("Query"));
        }
    }

    class RowLimit implements IQueryXml {
        maxRows = 0;

        toXml(parent: Element): void {
            var self = <Element>parent.appendChild(parent.ownerDocument.createElement("RowLimit"));

            self.setAttribute("Paged", "FALSE");
            self.textContent = this.maxRows.toString();
        }
    }

    export class Query {
        private _root = new QueryRoot();

        private _rowLimit = new RowLimit();

        getQuery(): SP.CamlQuery {
            var xml = document.implementation.createDocument(null, "View", null);
            var view = <Element>xml.firstChild;

            this._root.toXml(view);
            this._rowLimit.toXml(view);

            var query = new SP.CamlQuery();
            var ser = new XMLSerializer();

            query.set_viewXml(ser.serializeToString(xml));

            return query;
        }

        set_maxRows(maxRows: number): Query {
            this._rowLimit.maxRows = maxRows;

            return this;
        }
    }

}