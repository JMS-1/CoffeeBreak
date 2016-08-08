'use strict';

module CoffeeBreak {
    export interface IApplication {
    }

    class TheApplication implements IApplication {
        constructor() {
            ExecuteOrDelayUntilScriptLoaded(() => $(() => this.startup()), "sp.js");
        }

        private startup(): void {
            var executor = JMS.SharePoint.newExecutor();

            var type = new CoffeeType();
            type.company = 'Senseo';
            type.name = 'Guten Morgen';
            type.coffein = true;

            executor
                .createItem(type)
                .success(r => $('#message').text(`Loaded`));

            executor.startAsync();
        }
    }

    export var App: IApplication = new TheApplication();
}
