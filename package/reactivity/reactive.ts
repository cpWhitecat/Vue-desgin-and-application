// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler, isShallowType, isReadonlyType, trigger, SetChance } from "./effect"
interface reactiveType {
    raw?:any,
    isReadonly?:boolean,
    isShallow?:boolean
} 

const reactiveMap = new Map();

export function toRaw<T>(observed: T): T {  // 有这个完全就是可以不需要Obeject.defineProperty  先不管这些了
    const raw = observed && (observed)['raw']
    return raw ? toRaw(raw) : observed
  }

function createReactive(obj , isShallow?:boolean ,isReadonly?:isReadonlyType<boolean>){
    const existionProxy = reactiveMap.get(obj)
    if(existionProxy){
        return existionProxy
    }
//在vue中代理set and Map 是特殊的一个handler ，有个类型判断是否
    const reactiveInstance = new Proxy(obj,{   //maybe need to create a class to 封装 those API
        get(target, p:string | symbol, receiver) {  
            return GetterHandler(target,p,receiver,isShallow,isReadonly)
        },
    
        set(target, p, newValue, receiver) {
            return SetterHandler(target,p,newValue,receiver,isShallow)  // 类型还是不会写，我还是缺少ts经验
            // if(isReadonly){
            //     console.log('cannot set ')
            //     return true
            // }
            // const type : "ADD" | "SET" = Array.isArray(target) ? Number(p) < target.length ? "SET" : 'ADD' :SetChance(target,p)
            // const res = Reflect.set(target,p,newValue,receiver)
            
            // const oldValue :any = target[p];
        
            // if(target === receiver.raw){  // 这里的receiver只想代理过原始值后的到的数，通过raw属性知道原型值是什么，判断是否为target,target就是原始值，确保没改错数值，更加严谨
            //     if(oldValue !== newValue && (oldValue === oldValue || newValue === newValue)){//We need to think about NaN issue , so that we should to know oldValue and newValue will been not NaN
            //         trigger(target,p,type,newValue)
        
            //     }
            // }
            // return res
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

    return reactiveInstance
//  return Object.defineProperty(reactiveInstance,"raw",obj)  // 增加了一层包装，add raw property
}

export function reactive(obj:unknown){
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