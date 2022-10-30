// import { track } from "./effect"
import { reactive } from "./reactive"


interface Ref {
    isRef:true
}

export function ref(val:string | boolean | number | HTMLElement){
    const wrapper = {
        value:val
    }

    Object.defineProperty(wrapper,'isRef',{value:true})

    return reactive(wrapper)
}

export function toRef(obj,key){
    return {
        get value(){
            return obj[key]
        },
        set value(val){
            obj[key]= val
        }
    }
}

export function toRefs(obj){
    const result = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = toRef(obj,key);
            
        }
    }

    return result
}


export function proxyRefs(ref:Ref){   //这里的ref was tracked
    return new Proxy(ref,{
        get(target, p, receiver) {
            const refValue = Reflect.get(target,p,receiver);

            return refValue.isRef ? refValue.value : refValue
        },
        set(target, p, newValue, receiver) {

            const oldValue = target[p];

            if(target.isRef){
                oldValue.value = newValue
                return true
            }

            return Reflect.set(target,p,newValue,receiver);

            
        },
    })
}