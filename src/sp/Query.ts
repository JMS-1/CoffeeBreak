'use strict';

module JMS.SharePoint {

    export class Query {
        private _query = new SP.CamlQuery();

        getQuery(): SP.CamlQuery {
            return this._query;
        }
    }

}