import { effect, Options } from "./effect";
type watchOptions = {immediate?:boolean , flush?:'pre' | 'post' | 'sync'}

function watch(effect , call_back:(...args:any[])=>any , option:watchOptions){
    let getter ;
    if (typeof effect === 'function'){
        getter = effect
    }else{
        getter = ()=>traverse(effect)
    }

    let newValue,oldValue;
    let cleanup;

    function onInvalidate(fn){
        cleanup = fn
    }
    const job = ()=>{
        newValue = effectFn();
        if(cleanup){
            cleanup()
        }
        call_back(oldValue , newValue , onInvalidate);
        oldValue = newValue
    }

    const effectFn = effect(()=>getter,{  // effect function was trigger
        lazy:true,  //因为这是懒执行  ， 所以 newValue 没有立刻又结果 ， 必须要手动调动
        scheduler:()=>{
            if(option.flush === 'post'){
                const p = Promise.resolve();
                p.then(job)
            }else{
                job()
            }
        }  //job and job() is diff? Yep , one is result , and other one is function
    })

   if(option.immediate){
        job()
   }else{
        oldValue = effectFn()  //这是第一次调用  得到的是旧值
   }
}

function traverse(source , Cache = new Set()){
    if(typeof source !== 'object' || Cache  == null || Cache.has(source) ) return ;

    Cache.add(source);

    for(const k in source){
        traverse(source[k],Cache)
    }

    return source
}

// 一些总结
// 我们通过promise 来控制执行时机
// 刚开始对于watch新旧值的理解根本不透彻 ,有点楞， 所以需要我之后再好好理解其中的思想 


// 解决竞态问题，主要还是需要交给用户，毕竟vue只是给用户提供更加方便和完善的体验