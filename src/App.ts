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

            executor
                .list(Constants.listNameTypes)
                .success(r => $('#message').text(`Loaded`));

            executor.startAsync();
        }
    }

    export var App: IApplication = new TheApplication();
}
