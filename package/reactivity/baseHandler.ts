import { TrackToFalse, TrackToTrue } from "./effect";
import { toRaw } from "./reactive";

// array proxy handle  
// import导入的变量，不能直接修改，所以要封装个函数去修改shouldTrack
export const arrayInstrumentations:object = {};
// 需要重写的array方法集合
const changeLength = ['push','shift','pop','unshift','splice'];
const arrayFind = ['includes','indexOf','lastIndexOf'];

changeLength.forEach(method=>{
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method]=function(...args){   // 用箭头函数的时候this指向有问题,原来this是在上下文捕获的
        TrackToFalse()
        let res = originMethod.apply(this,args);

        if(res === false){  // 这边会不会有代码耦合
            
            res = originMethod.apply(toRaw(this),args)
        }
        TrackToTrue()
        return res
    }
})

arrayFind.forEach(method=>{
    const originMethod = Array.prototype[method];
    arrayInstrumentations[method]=function(...args){   // 用箭头函数的时候this指向有问题,原来this是在上下文捕获的
        let res = originMethod.apply(this,args);

        if(res === false){
            
            res = originMethod.apply(toRaw(this),args)
        }

        return res
    }

    
})
