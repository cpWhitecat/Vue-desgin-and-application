import { reactive } from "./reactive"

export function ref(val:string | boolean | number | HTMLElement){
    const wrapper = {
        value:val
    }

    Object.defineProperty(wrapper,'isRef',{value:true})

    return reactive(wrapper)
}