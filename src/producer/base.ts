import { Stream, InternalListener, Subscription } from 'xstream';
import autoBind from '../utils/autobind';

/* xstream流Class，构造流Model需要继承这个基类
实现参考
```
import fromEvent from 'xstream/extra/fromEvent'
```

这个基类的主要作用是为Model统一提供
    1.绑定（bindListenerWithNewStream）、
    2.解绑（unsubscribe）、
    3.流状态重置（resetStream）
的能力，让父类只关注具体流数据的产生
*/
export interface IModelConstructor extends Function {
    initialState?: AnyObject;
}

type IPayload = any;
type IStream = Stream<IPayload>;

abstract class StreamProducerBase {
    // subscribeStreamToProps Hoc中的pullStream会触发这个方法，间接启动流的分发行为
    private _dispatchStream: Function | null = null;
    // 订阅者, 如subscribeStreamToProps Hoc中的updateState
    private _receiver: Function | null = null;
    // 流句柄，会调用父类的subscribe，将句柄以及高
    private _stream$: IStream | null = null;
    // 解除绑定的句柄
    private _unsubscribeHandle: Subscription | null = null;
    public abstract subscribe(stream: IStream, receiver: Function): Subscription;


    // 流初始化先，重新构流造然后再调用父类subscribe method进行订阅
    @autoBind
    public resetStream () {
        const { _receiver } = this;
        if (_receiver) {
            this.bindListenerWithNewStream(_receiver);
        }
    }

    @autoBind
    public unsubscribe () {
        if (this._unsubscribeHandle) {
            this._unsubscribeHandle.unsubscribe();
        }
    }

    // 先重新构流造然后再调用父类subscribe method进行订阅
    @autoBind
    public bindListenerWithNewStream (receiver: Function) {
        this._createStream();
        this._receiver = receiver;
        this._unsubscribeHandle = this.subscribe(this._stream$ as IStream, this._receiver);
        this._receiver((this.constructor as IModelConstructor).initialState || {});
    }

    @autoBind
    public pullStream (payload: AnyObject) {
        if (this._dispatchStream) {
            this._dispatchStream(payload);
        }
    }

    private _createStream () {
        // 先解绑之前的订阅
        this.unsubscribe();
        this._stream$ = new Stream({
            _start: this._start.bind(this),
            _stop: this._stop.bind(this)
        });
    }

    private _start (streamSource: InternalListener<IPayload>) {
        this._dispatchStream = (data: AnyObject) => streamSource._n(data);
    }

    private _stop () {}
}
export default StreamProducerBase;