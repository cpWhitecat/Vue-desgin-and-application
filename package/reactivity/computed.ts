import { effect, track, trigger } from "./effect";

function computed(getter:object){
    let _value:any ;
    let _dirty = true;


    const effectFn = effect(getter,{
        lazy:true,
        scheduler(){
            if(!_dirty){
                _dirty = true
                trigger(obj,'_value',"SET")
            }
            
        }
    })

    const obj = {
        get value(){
            if(_dirty) {
                _value = effectFn();
                 
                _dirty = false
            }

            track(obj,"_value")
            return _value


        }
    }


    return obj
}