

// let activeEffect ;
// function effect(fn){
//     activeEffect = fn
//     fn()
// }

// const fullObj : object = new Proxy(data,{
//     get(target, p, receiver) {
//         if(activeEffect){
//             bocket.add(activeEffect);
//             activeEffect = undefined;
//         }

//         return target[p]
//     },
//     set(target, p, newValue, receiver) {
//         target[p] = newValue;
//         bocket.forEach(fn=>fn())
//         return true 
//     },
    
// })


const bocket  = new WeakMap();
const data = {
    text:'hello'
}

let activeEffect;  // cache effect function

const obj =new Proxy(data,{
    get(target, p, receiver) {

        // if 全是判断相应的值是否存在 ， 没有则 Recording
        if(!activeEffect) return;

        let depsMap = bocket.get(target);

        if(!depsMap){
            bocket.set(target,(new Map()));
        };

        let deps : Set<unknown>= depsMap.get(p);

        if(!deps){
            depsMap.set(p,( deps = new Set()));
        }

        deps.add(activeEffect);

        return target[p]

    },

    set(target, p, newValue, receiver) {
        target[p] = newValue;

        const depsMap = bocket.get(target);

        if(!depsMap) return false

        const effects = depsMap.get(p);

        effects && effects.forEach(fn => {
            fn()
        });



        return true
    },
})

// 为了避免执行多余的副作用
// https://github.com/cpWhitecat/Vue-core/blob/main/packages/reactivity/src/effect.ts

//   为了解决不必要的依赖收集 ， vue专门搞了个属性 来存储与之相关的依赖

// 为了不多次执行相同的副作用 利用set数据结构去重的功能 ， 配合promise 可实现去只要结果的