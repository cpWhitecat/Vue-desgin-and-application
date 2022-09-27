import { effect } from "./full";

function computed(getter){
    let _value ;
    let _dirty = true;


    const effectFn = effect(getter,{
        lazy:true,
        scheduler(){
            _dirty = true
        }
    })

    const obj = {
        get value(){
            if(_dirty) {
                _value = effectFn();
                 
                _dirty = false
                return _value
            }


        }
    }


    return obj
}