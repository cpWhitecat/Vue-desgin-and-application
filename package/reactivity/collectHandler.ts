import { ITERATE_KEY, track, trigger } from "./effect"
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
            // track(target,p) //是否需要确定key是否存在，再进行依赖追踪  ，或许这种行为不是框架改考虑的
            const res = target.get(p)
            return typeof res === 'object' ? reactive(res) : res
        }
    
    
        console.log(`not have key for ${target}`)
    },
    set(this:MapTypes,p : unknown){
        const target = toRaw(this);
        const had = target.has(p);
    }
}


const collectHandler = {
    get(target, p, receiver) {
        if(p === 'raw') return target  // or receiver[raw]
        if(p === 'size'){
            track(target,ITERATE_KEY)
            return Reflect.get(target,p,target)
        }

        return mutableInstrumentations[p]
    },
}