
const _bind = (fn: Function, ctx: any) => {
    if (fn.bind) {
        return fn.bind(ctx);
    } else {
        return function (...args: any[]) {
            fn.call(ctx, ...args);
        };
    }
};

interface BindCtx extends PropertyDescriptor {
    [key: string]: any;
}

export default function (
    _target: Record<string, any>,
    name: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    let method: Function | null = null;
    const redefineName = `$$in_proto_${name}`;
    if (descriptor.hasOwnProperty('value')) {
        method = descriptor.value as Function;
    } else {
        method = descriptor.get as Function;
    }
    if (typeof method !== 'function') {
        throw new TypeError(`@bindContext decorator can only be applied to methods not: ${typeof method}`);
    }
    return {
        configurable: descriptor.configurable,
        // target是class.prototype, 此时class还没有实例化，
        // 在getter触发时获取到上下文进行绑定
        get (): Function {
            // 保证每次获取时返回的method是同一个
            if (!this.hasOwnProperty(redefineName)) {
                (this as BindCtx)[redefineName] = _bind(method as Function, this);
            }
            return (this as BindCtx)[redefineName];
        },
        set (method: any) {
            (this as BindCtx)[redefineName] = method;
        }
    };
}
