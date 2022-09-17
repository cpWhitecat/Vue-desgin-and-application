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


// 为了避免执行多余的副作用
// https://github.com/cpWhitecat/Vue-core/blob/main/packages/reactivity/src/effect.ts

//   为了解决不必要的依赖收集 ， vue专门搞了个属性 来存储与之相关的依赖

// 为了不多次执行相同的副作用 利用set数据结构去重的功能 ， 配合promise 可实现去只要结果的