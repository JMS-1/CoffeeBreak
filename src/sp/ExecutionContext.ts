'use strict';

module JMS.SharePoint {
    export interface IResult<TResponseType> {
        success(callback: (response: TResponseType) => void): IResult<TResponseType>;

        failure(callback: (message: string) => void): IResult<TResponseType>;
    }

    export interface IExecutionResult<TResponseType extends SP.ClientObject> {
        request: TResponseType;

        success(callback: (response: TResponseType) => void): IExecutionResult<TResponseType>;

        failure(callback: (message: string) => void): IExecutionResult<TResponseType>;
    }

    export interface ISerializableClass {
        listName: string;

        contentTypeId: string;

        listColumns: string[];
    }

    export interface ISerializable {
        saveTo(item: SP.ListItem): void;
    }

    export interface IFactory<TModelType extends ISerializable> {
        new (item: SP.ListItem): TModelType;
    }

    export interface IExecutionContext {
        user(): IExecutionResult<SP.User>;

        lists(): IExecutionResult<SP.ListCollection>;

        list(listName: string): IExecutionResult<SP.List>;

        items<TModelType extends ISerializable>(factory: IFactory<TModelType>, query?: SP.CamlQuery): IResult<TModelType[]>;

        createItem<TModelType extends ISerializable>(data: TModelType): IExecutionResult<SP.ListItem>;

        startAsync(): void;
    }

    class ExecutionResult<TResponseType extends SP.ClientObject> implements IExecutionResult<TResponseType> {
        private _success: (response: TResponseType) => void;

        private _failure: (message: string) => void;

        constructor(public request: TResponseType, ...refinement: string[]) {
            request.get_context().load(request, ...refinement);
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

    class Result<TResponseType, TProtocolType extends SP.ClientObject> implements IResult<TResponseType> {
        private _success: (response: TResponseType) => void;

        private _failure: (message: string) => void;

        constructor(promise: IExecutionResult<TProtocolType>, private _projector: (data: TProtocolType) => TResponseType) {
            promise.success(r => this.fireSuccess(r));
            promise.failure(m => this.fireFailure(m));
        }

        success(callback: (response: TResponseType) => void): IResult<TResponseType> {
            this._success = callback;

            return this;
        }

        failure(callback: (message: string) => void): IResult<TResponseType> {
            this._failure = callback;

            return this;
        }

        private fireSuccess(data: TProtocolType): void {
            if (this._success)
                this._success(this._projector(data));
        }

        private fireFailure(message: string): void {
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
            return this.addPromise(ExecutionContext.web().get_currentUser());
        }

        lists(): IExecutionResult<SP.ListCollection> {
            return this.addPromise(ExecutionContext.web().get_lists());
        }

        list(listName: string): IExecutionResult<SP.List> {
            return this.addPromise(ExecutionContext.web().get_lists().getByTitle(listName));
        }

        items<TModelType extends ISerializable>(factory: IFactory<TModelType>, query: SP.CamlQuery = new SP.CamlQuery()): IResult<TModelType[]> {
            var factoryStatic: ISerializableClass = <any>factory;
            var columns: string[] = factoryStatic.listColumns;
            var properties = `Include(ID, ${columns.join(", ")})`;

            var promise = this.addPromise(ExecutionContext.web().get_lists().getByTitle(factoryStatic.listName).getItems(query), properties);

            return new Result<TModelType[], SP.ListItemCollection>(promise, items => {
                var modelItems: TModelType[] = [];

                for (var all = items.getEnumerator(); all.moveNext();)
                    modelItems.push(new factory(all.get_current()));

                return modelItems;
            });
        }

        createItem<TModelType extends ISerializable>(data: TModelType): IExecutionResult<SP.ListItem> {
            var dataStatic: ISerializableClass = Object.getPrototypeOf(data).constructor;
            var newItem = ExecutionContext.web().get_lists().getByTitle(dataStatic.listName).addItem(new SP.ListItemCreationInformation());

            newItem.set_item('ContentTypeId', dataStatic.contentTypeId);

            data.saveTo(newItem);

            newItem.update();

            return this.addPromise(newItem);
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