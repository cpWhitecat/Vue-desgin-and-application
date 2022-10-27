import { ITERATE_KEY, MAP_KEY_ITERATE_KEY, track, trigger } from "./effect"
import { toRaw ,reactive } from "./reactive"

// 下面是个例子，待会封装到函数中\
type Target = {
    'raw'?:any
}

export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>
type MapTypes = Map<any, any> | WeakMap<any, any>
type SetTypes = Set<any> | WeakSet<any>

function iteratorMethods(this:MapTypes | SetTypes){
    const target = toRaw(this);
    const itr = target[Symbol.iterator]();

    const warp = (val)=> typeof val === 'object' && val !== null ? reactive(val) : val;
    track(target,ITERATE_KEY);

    return {
        next(){
            const {value , done} = itr.next();
            return {
                value:value ? [warp(value[0]),warp(value[1])] : value,  //迭代器value的行为会返回一个数组？  // 知道为什么了，这是因为用于迭代的有两个值，一个是key,一个是value
                done
            }
        },
        [Symbol.iterator](){
            return this
        }
    }

    
}

function valuesIteratorMethods(this:Map<any,any> | Set<any>){
    const target = toRaw(this);
    const itr = target.values();

    const warp = (val)=> typeof val === 'object' ? reactive(val) : val;
    track(target,ITERATE_KEY);

    return {
        next(){
            const {value , done} = itr.next();
            return {
                value:warp(value),  //迭代器value的行为会返回一个数组？  // 知道为什么了，这是因为用于迭代的有两个值，一个是key,一个是value
                done
            }
        },
        [Symbol.iterator](){
            return this
        }
    }
}

function keysIteratorMethods(this:Map<any,any> | Set<any>){
    const target = toRaw(this);
    const itr = target.keys();

    const warp = (val)=> typeof val === 'object' ? reactive(val) : val;
    track(target,MAP_KEY_ITERATE_KEY);

    return {
        next(){
            const {value , done} = itr.next();
            return {
                value:warp(value),  //迭代器value的行为会返回一个数组？  // 知道为什么了，这是因为用于迭代的有两个值，一个是key,一个是value
                done
            }
        },
        [Symbol.iterator](){
            return this
        }
    }
}

const mutableInstrumentations = {
    add(this:SetTypes , p : unknown){
        const target = toRaw(this)
        const hadKey = target.has(p)
        const res = target.add(p)
        if(!hadKey){
            trigger(target,p,"ADD")
        }
        return res
    },
    delete(this:CollectionTypes,p : unknown){
        const target = toRaw(this)
        const hadKey = target.has(p);
        const res = target.delete(p);
        if(hadKey){
            trigger(target,p,'DELETE')
        }
    
        return res
    },
    get(this:MapTypes,p:any){  // 那类型又如何处理呢
        const target = toRaw(this);
        const had = target.has(p);
        track(target,p)
        if(had){
            // track(target,p) //是否需要确定key是否存在，再进行依赖追踪 //我这是站在用户的角度，但框架作者不需要考虑，给key了就收集依赖
            const res = target.get(p)
            return typeof res === 'object' ? reactive(res) : res
        }
    
    
        console.log(`not have key for ${target}`)
    },
    set<T extends {raw?:any}>(this:MapTypes,p : unknown ,value: T){
        const target = toRaw(this);
        const had = target.has(p);
        const oldValue = target.get(p);
        const rawValue = value.raw || value
        target.set(p,rawValue)
        if(!had){
            trigger(target,p,'ADD')
        }else if (oldValue !== value || (oldValue === oldValue && value === value)) {
            trigger(target,p,'SET')
        }
    },
    forEach(callback:Function,thisArg?:unknown){//是thisArg 没加问号的缘故
        const target = toRaw(this);

        track(target,ITERATE_KEY);

        const warp = (val)=> typeof val === 'object' ? reactive(val) : val;

        target.forEach((value,key)=>{  
            callback.call(thisArg,warp(value),warp(key),this)   
        })      
    },
    [Symbol.iterator]:iteratorMethods,
    'entries':iteratorMethods,
    'keys':keysIteratorMethods,
    'values':valuesIteratorMethods
}


const collectHandler = {
    get(target:MapTypes | SetTypes, p:string | symbol, receiver:unknown) {
        if(p === 'raw') return target  // or receiver[raw]
        if(p === 'size'){
            track(target,ITERATE_KEY)
            return Reflect.get(target,p,target)
        }

        return mutableInstrumentations[p]
    },
}