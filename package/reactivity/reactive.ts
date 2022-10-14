// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler, isShallowType, isReadonlyType } from "./effect"

interface reactiveType {
    raw?:any,
    isReadonly?:boolean,
    isShallow?:boolean
} 
function createReactive<T extends object>(obj:T , isShallow?: isShallowType,isReadonly?:isReadonlyType){
 return new Proxy(obj,{   //maybe need to create a class to 封装 those API
    get(target, p:string, receiver:object) {
        return GetterHandler(target,p,receiver)
    },

    set(target, p, newValue, receiver) {
        return SetterHandler(target,p,newValue,receiver)
    },

    // apply(target, thisArg, argArray) {
    //     target.call()
    // },
    deleteProperty(target, p) {
        return DeletePropertyHandler(target,p)
    },

    has(target, p) {
        return hasHandler(target,p) 
    },

    ownKeys(target) {
        return ownKeysHandler(target)
    },
})
}

export function reactive<T extends object>(obj:T){
    return createReactive(obj)
}

export function ShallowReactive<T extends object>(obj: T){
    return createReactive(obj,true)
}
const Test1 = reactive({foo:1})
// Test1.raw  test was pass