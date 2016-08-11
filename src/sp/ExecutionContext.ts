'use strict';

module JMS.SharePoint {

    class ExecutionResult<TResponseType extends SP.ClientObject> implements IExecutionResult<TResponseType> {
        private _success: ((response: TResponseType) => void)[] = [];

        private _failure: ((message: string) => void)[] = [];

        constructor(public request: TResponseType, ...refinement: string[]) {
            request.get_context().load(request, ...refinement);
        }

        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType> {
            this._success.push(callback);

            return this;
        }

        failure(callback: (message: string) => void): IExecutionResult<TResponseType> {
            this._failure.push(callback);

            return this;
        }

        fireSuccess(): void {
            this._success.forEach(c => c(this.request));
        }

        fireFailure(message: string): void {
            this._failure.forEach(c => c(message));
        }
    }

    class Result<TResponseType, TProtocolType extends SP.ClientObject> implements IResult<TResponseType> {
        private _success: ((response: TResponseType) => void)[] = [];

        private _failure: ((message: string) => void)[] = [];

        constructor(promise: IExecutionResult<TProtocolType>, projector: (data: TProtocolType) => TResponseType) {
            promise.failure(m => this._failure.forEach(c => c(m)));
            promise.success(r => {
                var projected = projector(r);

                this._success.forEach(c => c(projected));
            });
        }

        success(callback: (response: TResponseType) => void): IResult<TResponseType> {
            this._success.push(callback);

            return this;
        }

        failure(callback: (message: string) => void): IResult<TResponseType> {
            this._failure.push(callback);

            return this;
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
            return this.addPromise(ExecutionContext.web().get_currentUser());
        }

        lists(): IExecutionResult<SP.ListCollection> {
            return this.addPromise(ExecutionContext.web().get_lists());
        }

        list(listName: string): IExecutionResult<SP.List> {
            return this.addPromise(ExecutionContext.web().get_lists().getByTitle(listName));
        }

        items<TModelType extends ISerializable>(factory: JMS.SharePoint.IModelFactory<TModelType>, query: Query = new Query(), ...refinements: string[]): IResult<TModelType[]> {
            var factoryStatic: ISerializableClass = <any>factory;
            var promise = this.addPromise(ExecutionContext.web().get_lists().getByTitle(factoryStatic.listName).getItems(query.getQuery()), ...refinements);

            return new Result<TModelType[], SP.ListItemCollection>(promise, items => {
                var modelItems: TModelType[] = [];

                for (var all = items.getEnumerator(); all.moveNext();)
                    modelItems.push(new factory(all.get_current()));

                return modelItems;
            });
        }

        createItem<TModelType extends ISerializable>(data: TModelType): IResult<TModelType> {
            var factoryStatic: ISerializableClass = Object.getPrototypeOf(data).constructor;
            var newItem = ExecutionContext.web().get_lists().getByTitle(factoryStatic.listName).addItem(new SP.ListItemCreationInformation());

            data.saveTo(newItem);

            newItem.update();

            return new Result<TModelType, SP.ListItem>(this.addPromise(newItem), item => {
                data.loadFrom(item);

                return data;
            });
        }

        private addPromise<TResponseType extends SP.ClientObject>(request: TResponseType, ...refinement: string[]): ExecutionResult<TResponseType> {
            var promise = new ExecutionResult<TResponseType>(request, ...refinement);

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
            var message = info.get_message();

            console.log(message);

            this.promises.forEach(p => p.fireFailure(message));
            this.promises = [];
        }
    }

    export function newExecutor(): IExecutionContext {
        return new ExecutionContext();
    }
}