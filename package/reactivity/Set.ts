// // setting tsconfig.ts
// const bocket: Set<any> = new Set();

// const data : object= {
//     text:'hello cp'
// }

// const obj : object = new Proxy(data,{
//     get(target , key){
//         bocket.add(SetEffect);
//         return target[key]
//     },
//     set(target, p, newValue, receiver) {
//         target[p] = newValue
//         bocket.forEach((fn :any) =>fn())
//         return true
//         // set function was return boolean 
//     },
// })

// function SetEffect():void{
//     document.body.innerText = obj.text   // 在ts中 这种该如何解决  ， 实际情况这种应该很少 ， 肯定是要传值进来 ， 所以 是可以进行泛型判断与约束的
// }

// SetEffect();

// setTimeout(() => {
//     obj.text = 'hello Vue'
// }, 1000);