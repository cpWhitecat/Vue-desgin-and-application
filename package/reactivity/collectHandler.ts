import { ITERATE_KEY, track, trigger } from "./effect"
import { toRaw ,reactive } from "./reactive"

// 下面是个例子，待会封装到函数中\
type Target = {
    'raw'?:any
}

type collectionTypes = Map<any,unknown> | Set<unknown> | WeakMap<any,any> | WeakSet<any>
type SetType = Set<any>
type MapType = Map<any,any>

const mutableInstrumentations = {
    'add':add,
    'delete':deleteEntry,
}
function add(this:SetType , p : unknown){
    const target = toRaw(this)
    const hadKey = target.has(p)
    const res = target.add(p)
    if(!hadKey){
        trigger(target,p,"ADD")
    }
    return res
}

function deleteEntry(this:SetType,p : unknown){
    const target = toRaw(this)
    const hadKey = target.has(p);
    const res = target.delete(p);
    if(hadKey){
        trigger(target,p,'DELETE')
    }

    return res
}


function get(this:MapType,p:any){  // 那类型又如何处理呢
    const target = toRaw(this);
    const had = target.has(p);
    if(had){
        track(target,p)
        const res = target.get(p)
        return typeof res === 'object' ? reactive(res) : res
    }


    console.log(`have not key for ${target}`)
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