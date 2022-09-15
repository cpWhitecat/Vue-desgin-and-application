import { bocket, data } from "./Set";

let activeEffect ;
function effect(fn){
    activeEffect = fn
    fn()
}

const fullObj : object = new Proxy(data,{
    get(target, p, receiver) {
        if(activeEffect){
            bocket.add(activeEffect);
            activeEffect = undefined;
        }

        return target[p]
    },
    set(target, p, newValue, receiver) {
        target[p] = newValue;
        bocket.forEach(fn=>fn())
        return true 
    },
})