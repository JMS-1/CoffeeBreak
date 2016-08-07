'use strict';

module JMS.SharePoint {
    export interface IExecutionResult<TResponseType> {
        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType>;

        failure(callback: (message: string) => void): IExecutionResult<TResponseType>;
    }

    export interface IExecutionContext {
        user(): IExecutionResult<SP.User>;

        startAsync(): void;
    }

    class ExecutionResult<TResponseType> implements IExecutionResult<TResponseType> {
        private _success: (response: TResponseType) => void;

        private _failure: (message: string) => void;

        constructor(private _response: TResponseType) {
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
                this._success(this._response);
        }

        fireFailure(message: string): void {
            if (this._failure)
                this._failure(message);
        }
    }

    class ExecutionContext implements IExecutionContext {
        private promises: ExecutionResult<any>[] = [];

        user(): IExecutionResult<SP.User> {
            var context = SP.ClientContext.get_current();
            var user = context.get_web().get_currentUser();

            context.load(user);

            return this.addPromise(new ExecutionResult<SP.User>(user));
        }

        private addPromise<TResponseType>(promise: ExecutionResult<TResponseType>): ExecutionResult<TResponseType> {
            this.promises.push(promise);

            return promise;
        }

        startAsync(): void {
            var context = SP.ClientContext.get_current();

            context.executeQueryAsync((s, a) => this.onSuccess(a), (s, a) => this.onFailure(a));
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