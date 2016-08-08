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
                .user()
                .success(r => $('#message').text(`Loaded`))
                .failure(msg => alert(`Failed to get user name. Error: ${msg}`));

            executor.startAsync();
        }
    }

    export var App: IApplication = new TheApplication();
}
