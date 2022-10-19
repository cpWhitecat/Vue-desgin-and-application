// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler, isShallowType, isReadonlyType } from "./effect"
interface reactiveType {
    raw?:any,
    isReadonly?:boolean,
    isShallow?:boolean
} 


const reactiveMap:Map<unknown,unknown> = new Map();
export const arrayInstrumentations:object = {};
// 需要重写的array方法集合
const changeLength = ['push','shift','pop','unshift','splice']
const arrayFind = ['includes','indexOf','lastIndexOf']


export function toRaw<T>(observed: T): T {  // 有这个完全就是可以不需要Obeject.defineProperty  先不管这些了
    const raw = observed && (observed)['raw']
    return raw ? toRaw(raw) : observed
  }
export let shouldTrack:boolean = true;


changeLength.forEach(method=>{
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method]=function(...args){   // 用箭头函数的时候this指向有问题,原来this是在上下文捕获的
        shouldTrack =false
        let res = originMethod.apply(this,args);

        if(res === false){  // 这边会不会有代码耦合
            
            res = originMethod.apply(toRaw(this),args)
        }
        shouldTrack = true
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





function createReactive<T extends object>(obj:T , isShallow?:boolean ,isReadonly?:isReadonlyType<boolean>){
    const existionProxy = reactiveMap.get(obj)
    if(existionProxy){
        return existionProxy
    }

    const reactiveInstance = new Proxy(obj,{   //maybe need to create a class to 封装 those API
        get(target : object, p:string, receiver:object ) {  
            return GetterHandler(target,p,receiver,isShallow,isReadonly)
        },
    
        set(target, p, newValue, receiver) {
            return SetterHandler(target,p,newValue,receiver,isShallow)  // 类型还是不会写，我还是缺少ts经验
        },
    
        // apply(target, thisArg, argArray) {
        //     target.call()
        // },
        deleteProperty(target, p) {
            return DeletePropertyHandler(target,p,isReadonly)
        },
    
        has(target, p) {
            return hasHandler(target,p) 
        },
    
        ownKeys(target) {
            return ownKeysHandler(target)
        },
        defineProperty(target, property, attributes) { // 是否要对defineProperty进行响应式追踪
            if(property === 'raw'){
                return true
            }
            return true
        },
    })


 return Object.defineProperty(reactiveInstance,"raw",obj)  // 增加了一层包装，add raw property
}

export function reactive<T extends object>(obj:T){
    return createReactive(obj,false)
}

export function ShallowReactive<T extends object>(obj: T){
    return createReactive(obj,true)
}

export function readonly(obj:object){
    return createReactive(obj,false,true)
}

export function ShallowReadonly(obj:object){
    return createReactive(obj,true,true)
}


const Test1 = reactive({foo:1})
// Test1.raw  test was pass




// 有些问题不必过于钻牛角尖，那是用户改解决的， 而不是框架开发者