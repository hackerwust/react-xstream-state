import React from 'react';
import autoBind from '../utils/autobind';
import StreamModel, { IModelConstructor } from '../producer/Base';

type IMapStreamToProps = (state: AnyObject) => AnyObject;
type subscirbeStreamToPropsHoc = (Component: React.ComponentClass) => React.ComponentClass;

const subscirbeStreamToProps = (
    model: StreamModel,
    mapStreamToProps: IMapStreamToProps
): subscirbeStreamToPropsHoc => (Component: React.ComponentClass) => {

    class ModelWrapperComponent extends React.PureComponent {
        private hasBindListener = false;
        public state = {
            ...((model.constructor as IModelConstructor).initialState || {}),
            pullStream: this.pullStream,
            resetStream: model.resetStream
        };

        public componentWillUnmount () {
            model.unsubscribe();
            this.hasBindListener = false;
        }

        public bindListener () {
            if (this.hasBindListener) {
                return;
            }
            model.bindListenerWithNewStream(this.updateState);
            this.hasBindListener = true;
        }

        @autoBind
        public updateState (state = {}) {
            if (!this.hasBindListener) {
                return;
            }
            this.setState(state);
        }

        @autoBind
        public pullStream (payload: AnyObject = {}) {
            if (this.hasBindListener) {
                model.pullStream(payload);
            } else {
                // 如果没有绑定则异步等待一下
                setTimeout(() => model.pullStream(payload));
            }
        }

        // 绑定listener的操作需在render中进行
        // 1.在constructor绑定中可能导致`setState in unmount Component warning`
        // 2.componentDidMount也不太合适，父组件的componentDidMount是
        //   在子组件的componentDidMount之后执行的, 如果子组件在didMount发起拉流的行为，就会导致一些问题
        public render (): React.ReactElement<Component> {
            this.bindListener();
            const injectProps = mapStreamToProps(this.state) || {};
            return <Component
                {...this.props}
                {...injectProps}
            />;
        }
    }

    return ModelWrapperComponent;
};

export default subscirbeStreamToProps;