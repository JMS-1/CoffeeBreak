'use strict';

module JMS.SharePoint {
    export interface IExecutionResult<TResponseType extends SP.ClientObject> {
        request: TResponseType;

        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType>;

        failure(callback: (message: string) => void): IExecutionResult<TResponseType>;
    }

    export interface IExecutionContext {
        user(): IExecutionResult<SP.User>;

        lists(): IExecutionResult<SP.ListCollection>;

        list(listName: string): IExecutionResult<SP.List>;

        items(listName: string, query?: SP.CamlQuery): IExecutionResult<SP.ListItemCollection>;

        startAsync(): void;
    }

    class ExecutionResult<TResponseType extends SP.ClientObject> implements IExecutionResult<TResponseType> {
        private _success: (response: TResponseType) => void;

        private _failure: (message: string) => void;

        constructor(public request: TResponseType) {
            request.get_context().load(request);
        }

        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType> {
            this._success = callback;

            return this;
        }

        failure(callback: (message: string) => void): IExecutionResult<TResponseType> {
            this._failure = callback;

            return this;
        }

        fireSuccess(): void {
            if (this._success)
                this._success(this.request);
        }

        fireFailure(message: string): void {
            if (this._failure)
                this._failure(message);
        }
    }

    class ExecutionContext implements IExecutionContext {
        private promises: ExecutionResult<any>[] = [];

        private static _context: SP.ClientContext;

        private static context(): SP.ClientContext {
            if (!ExecutionContext._context)
                ExecutionContext._context = SP.ClientContext.get_current();

            return ExecutionContext._context;
        }

        private static web(): SP.Web {
            return ExecutionContext.context().get_web();
        }

        user(): IExecutionResult<SP.User> {
            return this.addPromise(new ExecutionResult<SP.User>(ExecutionContext.web().get_currentUser()));
        }

        lists(): IExecutionResult<SP.ListCollection> {
            return this.addPromise(new ExecutionResult<SP.ListCollection>(ExecutionContext.web().get_lists()));
        }

        list(listName: string): IExecutionResult<SP.List> {
            return this.addPromise(new ExecutionResult<SP.List>(ExecutionContext.web().get_lists().getByTitle(listName)));
        }

        items(listName: string, query: SP.CamlQuery = new SP.CamlQuery()): IExecutionResult<SP.ListItemCollection> {
            return this.addPromise(new ExecutionResult<SP.ListItemCollection>(ExecutionContext.web().get_lists().getByTitle(listName).getItems(query)));
        }

        private addPromise<TResponseType extends SP.ClientObject>(promise: ExecutionResult<TResponseType>): ExecutionResult<TResponseType> {
            this.promises.push(promise);

            return promise;
        }

        startAsync(): void {
            ExecutionContext.context().executeQueryAsync((s, a) => this.onSuccess(a), (s, a) => this.onFailure(a));
        }

        private onSuccess(info: SP.ClientRequestSucceededEventArgs): void {
            this.promises.forEach(p => p.fireSuccess());
            this.promises = [];
        }

        private onFailure(info: SP.ClientRequestFailedEventArgs): void {
            this.promises.forEach(p => p.fireFailure(info.get_message()));
            this.promises = [];
        }
    }

    export function newExecutor(): IExecutionContext {
        return new ExecutionContext();
    }
}