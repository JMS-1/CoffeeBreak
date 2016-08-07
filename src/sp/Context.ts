'use strict';

module JMS.SharePoint {
    export interface IPromise<TResponseType> {
        success(callback: (response: TResponseType) => void): IPromise<TResponseType>;

        failure(callback: (message: string) => void): IPromise<TResponseType>;
    }

    export interface IContext {
        loadUser(): IPromise<SP.User>;

        execute(): void;
    }

    class SomePromise<TResponseType> implements IPromise<TResponseType> {
        private _success: (response: TResponseType) => void;

        private _failure: (message: string) => void;

        constructor(private _response: TResponseType) {
        }

        success(callback: (response: TResponseType) => void): IPromise<TResponseType> {
            this._success = callback;

            return this;
        }

        failure(callback: (message: string) => void): IPromise<TResponseType> {
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

    class TheContext implements IContext {
        private promises: SomePromise<any>[] = [];

        loadUser(): IPromise<SP.User> {
            var context = SP.ClientContext.get_current();
            var user = context.get_web().get_currentUser();

            context.load(user);

            return this.addPromise(new SomePromise<SP.User>(user));
        }

        private addPromise<TResponseType>(promise: SomePromise<TResponseType>): SomePromise<TResponseType> {
            this.promises.push(promise);

            return promise;
        }

        execute(): void {
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

    export var Context: IContext = new TheContext();
}