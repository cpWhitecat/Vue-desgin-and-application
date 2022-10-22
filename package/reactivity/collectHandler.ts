import { ITERATE_KEY, track, trigger } from "./effect"
import { toRaw } from "./reactive"

// 下面是个例子，待会封装到函数中\
type Target = {
    'raw'?:any
}

type collectionTypes = Map<any,unknown> | Set<unknown> | WeakMap<any,any> | WeakSet<any>
type SetType = Set<any>

const mutableInstrumentations = {}
function add(this:SetType , p : unknown){
    const target = toRaw(this)
    const hadKey = target.has(p)
    const res = target.add(p)
    if(!hadKey){
        trigger(target,p,"ADD")
    }
    return res
}


// this is test
const setInstance = new Set()

const collectHandler = new Proxy(setInstance,{
    get(target, p, receiver) {
        if(p === 'raw') return target  // or receiver[raw]
        if(p === 'size'){
            track(target,ITERATE_KEY)
            return Reflect.get(target,p,target)
        }

        return target[p].bind(target)
    },
})