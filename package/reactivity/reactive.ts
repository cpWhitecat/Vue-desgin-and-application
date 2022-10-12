// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler } from "./effect"
export function reactive(obj){
    return new Proxy(obj,{   //maybe need to create a class to 封装 those API
        get(target, p, receiver) {
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

