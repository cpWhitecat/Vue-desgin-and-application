

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


// cannot set tsconfig.json , too many error

const bocket  = new WeakMap();
const data : object= { foo: 1, bar: 2 }

let activeEffect;  // cache effect function

const effectStack:Function[] = [];

export type Options = {
    lazy?:boolean,
    scheduler:(...args:any[])=>any
}

export function effect(fn , option : Options){
    const effectfn = ()=>{
        cleanup(effectfn);  // 要先清除副作用 ， 在把副作用赋给activeEffect
        activeEffect = effectfn;
        

        effectStack.push(effectfn);
        const res = fn(); // 执行完副作用函数之后，再出堆，如果是嵌套effect , stack 又可以添加一个了副作用函数，逐渐出堆
        effectStack.pop();
        activeEffect = effectStack[effectStack.length -1];  // reset value

        return res
    }
    effectfn.option = option;
    effectfn.deps = []// 这边我感觉最好使用definePrototype()  ， 更加安全，规矩 ，先不讲究这些，待后续完善

    if(!option.lazy){
        effectfn()
    }

    return effectfn  //默认懒执行开启
    

}



export function track(target : object,p : string | symbol){
    // if 全是判断相应的值是否存在 ， 没有则 Recording
    if(!activeEffect) return;

    let depsMap = bocket.get(target);
    if(!depsMap){
        bocket.set(target,(depsMap = new Map()));
    };

    let deps : Set<unknown>= depsMap.get(p);  // 我知道这个deps , 可能是undefined ， 但是如何提醒编译器 
    if(!deps){
        depsMap.set(p,( deps = new Set()));
    }

    deps.add(activeEffect);

    activeEffect.deps.push(deps)  //当前副作用函数所关联的其他副作用的添加
}


class ReactiveEffect {
    public _dirty = false;
    constructor() {
        
    }
}

export function trigger(target,p):void{
    
        const depsMap : Map<unknown,Set<unknown>> = bocket.get(target);
        if(!depsMap) return ;
        const effects= depsMap.get(p) as Set<unknown>;

        // const effectsToRun = new Set(effects);// 新创建的set , 不会被依赖收集 毕竟这里没有被代理，响应式更改effects ，这样应该是不会被现在的响应式追踪的
        // // 所以可以安全遍历

        const effectsToRun : Set<unknown>= new Set();  // 副作用隔离 ， 安全遍历
        effects && effects.forEach(fn => {
            if (fn !== activeEffect) {
                effectsToRun.add(fn)
            }
        });


        effectsToRun.forEach((effectfn:any) =>{  // 这边到底填什么类型 ， 暂且any  , 为了让编译通过
            if(effectfn.option.scheduler ){    
                // 这边的scheduler 的key不知道是否有更加自由的选择 ， 而不是硬编码
                // 实际是硬编码 ， 判断是否存在 
                effectfn.option.scheduler(effectfn)
            }else{
                effectfn()
            }
        })

        // effects && effects.forEach(fn => {
        //     fn()   // 因为这里又执行了副作用函数 ， 所以又会被依赖给收集到 ，一直重复一个副作用被删除后添加 ， 但是如果把值重新添加到新的set 里面 就没事了
        // });
}

// const testObj = new Proxy(data,{})

const obj : object = new Proxy(data,{
    get(target, p, receiver) {

        track(target,p)

        return target[p]

    },

    set(target, p, newValue, receiver) {
        
        target[p] = newValue;
        
        trigger(target,p)

        return true
    },
})

// 为了避免执行多余的副作用
// https://github.com/cpWhitecat/Vue-core/blob/main/packages/reactivity/src/effect.ts

//   为了解决不必要的依赖收集 ， vue专门搞了个属性 来存储与之相关的依赖

// 不太明白 vue 的调度执行 ， 是先执行提供的函数 ， 如果函数是具有副作用的 ， 会又什么后果？？？// 这种细节不应该是框架考虑的 ， 而是开发者该考虑的

// 为了不多次执行相同的副作用 利用set数据结构去重的功能 ， 配合promise 可实现去只要结果的
// watch 的实现跟我想的一样 就是利用option.sch


const jobQueue:Set<any> = new Set();

let isFlushing = false;

const ing : Promise<void> = Promise.resolve();

function flushingJob(){
    if(isFlushing){
        return true
    }

    isFlushing = true;

    ing.then(()=>{
        jobQueue.forEach(job=>{
            job()
        })
    }).finally(()=>{
        isFlushing = false ;

    })
}

function cleanup(effectFn):void{
    for (let index = 0; index < effectFn.deps.length; index++) {
        const deps = effectFn.deps[index];
        deps.delete(effectFn)
    }

    effectFn.deps.length = 0
}

// 先如今会产生无限递归循环的问题

// a = a + 1
// 首先 get a value , 这时候会触发track函数 ， 把当前副作用函数放进桶里
/**
 * a 加完1 之后 再把值赋值给a ， 这时候触发trigger函数 ，把副作用函数从weakmap 取出来 ， 并且又执行了一遍
 * 但又触发了前面写的流程 ， 所以变成了无限递归循环的问题
 * 要避免的话 ，就是通过 用过判断 trigger函数执行的副作用函数 ， 是否跟当前副作用函数相同 ， 如果相同就return 
*/


// computed就是把函数返回的值lazy , 也就是需要手动执行 ， 