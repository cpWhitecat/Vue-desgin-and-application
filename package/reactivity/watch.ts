import { effect, Options } from "./full";

function watch(effect , call_back){
    let getter ;
    if (typeof effect === 'function'){
        getter = effect
    }else{
        getter = ()=>traverse(effect)
    }


    effect(()=>getter,{
        lazy:true,
        scheduler(){
            call_back()
        }
    })
}

function traverse(source , Cache = new Set()){
    if(typeof source !== 'object' || Cache  == null || Cache.has(source) ) return ;

    Cache.add(source);

    for(const k in source){
        traverse(source[k],Cache)
    }

    return source
}