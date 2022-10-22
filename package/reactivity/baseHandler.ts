import { ITERATE_KEY, track, TrackToFalse, TrackToTrue, trigger } from "./effect";
import { reactive, readonly, toRaw } from "./reactive";

// array proxy handle  
// import导入的变量，不能直接修改，所以要封装个函数去修改shouldTrack
export const arrayInstrumentations:object = {};
// 需要重写的array方法集合
const changeLength = ['push','shift','pop','unshift','splice'];
const arrayFind = ['includes','indexOf','lastIndexOf'];

changeLength.forEach(method=>{
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method]=function(...args){   // 用箭头函数的时候this指向有问题,原来this是在上下文捕获的
        TrackToFalse()
        let res = originMethod.apply(this,args);

        if(res === false){  // 这边会不会有代码耦合
            
            res = originMethod.apply(toRaw(this),args)
        }
        TrackToTrue()
        return res
    }
})

arrayFind.forEach(method=>{
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method]=function(...args){   // 用箭头函数的时候this指向有问题,原来this是在上下文捕获的
        let res = originMethod.apply(this,args);

        if(res === false){
            
            res = originMethod.apply(toRaw(this),args)
        }

        return res
    }

    
})

export function SetChance(target:object,p:string | symbol){
    return Object.prototype.hasOwnProperty.call(target,p) ? 'SET' : 'ADD'
}
namespace SetType {
    export type ADD = 'ADD'
    export type SET = 'SET'
}

export type isShallowType<T extends boolean> = T
export type isReadonlyType<T extends boolean> = T
export function GetterHandler<T extends boolean>(target:object,p:string | symbol,receiver:unknown,isShallow?: T , isReadonly?:boolean):any{
    if(p === 'raw'){
        console.log(p);
        return target  //其实receiver[p] 也是可以的
    }
    
    if(Array.isArray(target) && arrayInstrumentations.hasOwnProperty(p)){
        return Reflect.get(arrayInstrumentations,p,receiver)
    }


    const res = Reflect.get(target,p,receiver);  // Reflect 是为了解决this问题

    if(isShallow){
        return res  //这里为什么不进行依赖添加？？？ 还是说有点咬文嚼字。。。或者我违背了响应式的思想 
                    // 完全就是我理解错了，一个不被深响应的object，如果被收集了，这样破坏了WeakMap数据结构,而且这只是get操作，所以
                    // 来个钻牛角尖的想法， 如果一个obj,被shallowReactive,同时又被深度reactive了，那weakMap的数据结构应该是怎么样的  //或者应该在vue中试一下
                    // 上面这个问题被后续的解决了，会有一个map，利用他的自动去重功能，防止被建立多次响应式reactive
                    // 没想错，所以需要考虑数据污染问题，在Setter函数中考虑
    }
    if(!isReadonly && typeof p !== 'symbol'){
        track(target,p)
    }
    
    if(typeof res === "object" || res !== null){
        return isReadonly ? readonly(res) : reactive(res)
    }
    return res
}

// maybe need to add the proxy property class
export function SetterHandler<T extends {raw:any}>(target:object,p:string | symbol,newValue:unknown,receiver:T,isReadonly?:isReadonlyType<boolean>){
    if(isReadonly){
        console.log('cannot set ')
        return true
    }
    const type : SetType.ADD | SetType.SET = Array.isArray(target) ? Number(p) < target.length ? "SET" : 'ADD' :SetChance(target,p)
    const res = Reflect.set(target,p,newValue,receiver)
    
    const oldValue :any = target[p];

    if(target === receiver.raw){  // 这里的receiver只想代理过原始值后的到的数，通过raw属性知道原型值是什么，判断是否为target,target就是原始值，确保没改错数值，更加严谨
        if(oldValue !== newValue && (oldValue === oldValue || newValue === newValue)){//We need to think about NaN issue , so that we should to know oldValue and newValue will been not NaN
            trigger(target,p,type,newValue)

        }
    }
    return res
}
// 或许要创建些函数签名，这样感觉才能在effect函数里把isReadonly一步到位 ， 不想在添加 args了
export function DeletePropertyHandler(target:object,p:symbol | string,isReadonly?:isReadonlyType<boolean>){
    if(isReadonly){
        console.log('this is readonly')
        return true
    }
    const Del_Property = Object.prototype.hasOwnProperty.call(target,p);
    const res = Reflect.deleteProperty(target,p);
    if(Del_Property && res){
        trigger(target,p,"DELETE",null)
    }
    

    return res
}

export function hasHandler(target:object,p:string | symbol){
    track(target,p);
     return Reflect.has(target,p)
}

export function ownKeysHandler(target){
    track(target,ITERATE_KEY)

    return Reflect.ownKeys(target)
}