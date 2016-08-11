/// <reference path="../Constants.ts" />

'use strict';

module CoffeeBreak {

    export abstract class Model implements JMS.SharePoint.ISerializable {
        private static _IDProperty = 'ID';

        id: number;

        saveTo(item: SP.ListItem): void {
            if (this.id !== undefined)
                item.set_item(Model._IDProperty, this.id);
        }

        constructor(item?: SP.ListItem) {
            if (item)
                this.loadFrom(item);
        }

        protected loadFrom(item: SP.ListItem) {
            var id: number = item.get_item(Model._IDProperty);
            if (typeof id === "number")
                this.id = id;
        }

    }

}