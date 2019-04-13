# react-xstream-state
基于[xstream](https://github.com/staltz/xstream)封装的react响应式状态管理解决方案

### 前言
在react项目中，我们通常会根据具体的业务场景选择Redux或者Mbox来集中管理我们的状态，一是可以解决组件通信问题，二是状态与组件之间职责划分更加解耦清晰。但是存在以下几个问题：

>1. Redux、Mbox本身的功能有限，通过action -> state映射关系，适用于同步状态的管理，却无法优雅地处理异步数据，对于复杂的异步数据聚合、分发处理更是无能为力。
>2. Redux一般用于全局Model（Redux本身没有全局、局部的概念，但是我们一般搭配Provider在根组件注入Store此时就是全局状态，如果适用多个Provider在多处注入不同的Store，这就划分出局部Model了）。全局Model的一个缺点提升了局部状态的作用域，当其对应的组件卸载时我们需要手动清除状态，状态没有生命周期的概念。例如在SPA单页应用中页面进入/跳转时，需要手动初始化/清除状态。

react-xstream-state结合xstream响应式编程的优势，为组件更好地管理响应式状态。并且状态生命周期随组件生命周期。

### 安装
```bash
npm i react-xstream-state --save
```

### 使用
#### listMode.js
```js
import xs, { flattenSequentially } from 'xstream';
import { ProducerBase } from 'react-xstream-state';
class ListModel extends ProducerBase {
    // static initialState用于状态初始化
    static initialState = {
        pending: false,
        errorInfo: null,
        list: []
    };

    subscribe (stream$, hydrateState) {
        return stream$
            .map(({ userid }) => xs
                .fromPromise(getUserList(userid))
                .startWith({pending: true, errorInfo: null})
            })
            .compose(flattenSequentially)
            .map(response => ({list: response.list, errorInfo: null, pending: false}))
            .compose(flattenSequentially)
            .replaceError(err => xs.of({errorInfo: err, pending: false}))
            .subscribe({
                next: state => hydrateState(state),
                error: err => hydrateState({errorInfo: err, pending: false})
            })
    }
}
```

#### 通过props注入到组件中
```jsx
import { subscribeStreamToProps, autoBind } from 'react-xstream-state';
import listModel from './listModel';

@subscribeStreamToProps(listModel, state => ({
   hasError: state.errorInfo !== null,
   loading: state.pending,
   list: state.list,
   // 拉流
   pullStream: state.pullStream,
   // 流状态重置
   resetStream: state.resetStream
}))
class List extends React.Component {
    state = {
        userid: 12345;
    }
    componentDidMount () {
        this.props.pullStream({userid: this.state.userid});
    }

    @autoBind
    reset () {
        this.props.resetStream();
    }

    render () {
        const { loading, hasError, list } = this.props;
        if (hasError) {
            return <div>请求出错了</div>;
        }
        if (loading) {
            return <div>数据加载中...</div>;
        }
        return (
            <div>
                <ul>
                    {list.map((item, index) => <li key={index}>{item}</li>)}
                </ul>;
                <button onClick={this.reset}>清空数据</button>
            </div>
        )
    }
}
```

#### initialState
>model初始状态，subscribeStreamToProps订阅model时会自动使用initialState初始化状态

#### subscribe(stream$: Stream, hydrateState: Function): UnsubscribeHandle
>组件调用props.pullStream会执行subscribe中流的一系列操作，产生数据。通过hydrateState与初始状态融合分发到子组件

#### subscribeStreamToProps(model, mapStateToProps)
>订阅Model的装饰器，消费Model产生的数据并以props传入组件。本质上就是一个HOC