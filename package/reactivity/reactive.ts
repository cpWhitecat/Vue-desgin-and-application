// import {ProxyInstance} from 'package/reactivity/effect'
import { GetterHandler , SetterHandler , DeletePropertyHandler , hasHandler , ownKeysHandler } from "./effect"
export function reactive(obj:{raw?:any,foo:any}){
    return new Proxy(obj,{   //maybe need to create a class to 封装 those API
        get(target, p, receiver) {
            if(p === 'raw'){
                console.log(p);
                return receiver
            }

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

const Test1 = reactive({foo:1})
// Test1.raw  test was pass