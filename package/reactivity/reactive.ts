// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler, isShallowType, isReadonlyType } from "./effect"

interface reactiveType {
    raw?:any,
    isReadonly?:boolean,
    isShallow?:boolean
} 
function createReactive<T extends object>(obj:T , isShallow?:boolean ,isReadonly?:isReadonlyType<boolean>){
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