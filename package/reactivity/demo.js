function effect(fn, option) {
  var effectfn =  ()=> {
      activeEffect = effectfn;
      cleanup(effectfn);
      effectStack.push(effectfn);
      var res = fn(); // 执行完副作用函数之后，再出堆，如果是嵌套effect , stack 又可以添加一个了副作用函数，逐渐出堆
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1]; // reset value
      return res;
  };
  effectfn.option = option;
  effectfn.deps = []; // 这边我感觉最好使用definePrototype()  ， 更加安全，规矩 ，先不讲究这些，待后续完善
  if (!option.lazy) {
      effectfn();
  }
  return effectfn;
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    // 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压栈
    effectStack.push(effectFn)
    const res = fn()
    // 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res
  }
  // 将 options 挂在到 effectFn 上
  effectFn.options = options
  // activeEffect.deps 用来存储所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}