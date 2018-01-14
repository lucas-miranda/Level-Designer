import { join } from './Util/Helper';

interface IEventCallback {
    function: Function;
    context: any;
}

export abstract class Event {
    public _events: Map<string, Array<IEventCallback>> = new Map<string, Array<IEventCallback>>();

    constructor(...eventNames: string[]) {
        for (let eventName of eventNames) {
            this._events.set(eventName, new Array<IEventCallback>());
        }
    }

    public update(delta: number) {
    }

    public fire(eventName: string, ...args: any[]): boolean {
        if (!this._events.has(eventName)) {
            console.error(`Unexpected event named '${eventName}'.`);
            return false;
        }

        let stdArgs = new Array<any>(this);
        args = args.concat(stdArgs, args);

        let events = this._events.get(eventName);
        for (let callback of events) {
            callback.function.call(callback.context, ...args);
        }

        return events.length > 0;
    }

    public addListener(eventName: string, callback: Function, context?: any): Event {
        if (!this._events.has(eventName)) {
            console.error(`Unexpected event named '${eventName}'.`);
            return undefined;
        }

        this._events.get(eventName).push({ function: callback, context: context });
        return this;
    }

    public removeListener(eventName: string, callback: Function): Event {
        if (!this._events.has(eventName)) {
            console.error(`Unexpected event named '${eventName}'.`);
            return undefined;
        }

        let events = this._events.get(eventName);
        let index = events.findIndex((eventCallback: IEventCallback) => eventCallback.function === callback);
        if (index < 0) {
            return this;
        }

        events.splice(index, 1);
        return this;
    }

    public removeAllListeners() {
        for (let event of this._events) {
            event[1] = new Array<IEventCallback>();
        }
    }
}

export class EventEmitter<K, E extends Event> implements Iterable<[K, E]> {
    public _events: Map<K, E> = new Map<K, E>();

    public get(key: K): E {
        return this._events.get(key);
    }

    public set(key: K, event: E): void {
        this._events.set(key, event);
    }

    public has(key: K): boolean {
        return this._events.has(key);
    }

    public fire(eventName: string, key: K): E {
        if (!this.has(key)) {
            return undefined;
        }

        let event = this.get(key);
        event.fire(eventName);
        return event;
    }

    public keys(): IterableIterator<K> {
        return this._events.keys();
    }

    public values(): IterableIterator<E> {
        return this._events.values();
    }

    public entries(): IterableIterator<[K, E]> {
        return this._events.entries();
    }

    public [Symbol.iterator]() {
        return this.entries();
    }
}
