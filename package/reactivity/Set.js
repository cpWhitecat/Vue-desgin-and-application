// var bocket = new Set();
// var data = {
//     text: 'hello cp'
// };
// var obj = new Proxy(data, {
//     get: function (target, key) {
//         bocket.add(effect);
//         return target[key];
//     },
//     set: function (target, p, newValue, receiver) {
//         target[p] = newValue;
//         bocket.forEach(function (fn) { return fn(); });
//         return true;
//         // set function was return boolean 
//     }
// });
// function effect() {
//     document.body.innerText = obj.text; // 在ts中 这种该如何解决  ， 实际情况这种应该很少 ， 肯定是要传值进来 ， 所以 是可以进行泛型判断与约束的
// }
// effect();
// setTimeout(function () {
//     obj.text = 'hello Vue';
// }, 1000);
const p = new Map();
const instance = {
    forEach(callback,thisArg){
        p.forEach((v,k)=>{
            callback.call(thisArg,v,k,this)
        })
    }
}