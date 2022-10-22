// 下面是个例子，待会封装到函数中
const setInstance = new Set()

const collectHandler = new Proxy(setInstance,{
    get(target, p, receiver) {
        if(p === 'size'){
            return Reflect.get(target,p,target)
        }
    },
})