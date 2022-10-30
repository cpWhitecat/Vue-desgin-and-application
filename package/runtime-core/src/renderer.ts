function renderer(domString:string , container:HTMLElement){
    container.innerHTML = domString
}




function createRenderer(options){
    const {
        createElement,
        insert,
        setElementText
    } = options  //need to 抽离同样的逻辑

    function mountElement(vnode , container:HTMLElement){
        const el :HTMLElement = createElement(vnode.type);
        if(typeof vnode.children === 'string'){
           setElementText(el,vnode.children)
        }
    
        insert(el,container)
    }

    function patch(n1 , n2 , container){
        if(!n1){
            mountElement(n2,container)
        }
    }


    function render(vnode,container){
        if(vnode){
            patch(container._vnode,vnode,container)
        }else{  //vnode 不存在 ，_vnode也不存在，所以这是unmount操作
            if(container._vnode){
                container.innerHTML = ''
            }
        }

        container._vnode ? container._vnode = vnode : Object.defineProperty(container,'_vnode',vnode)  // 两次判断我估计有点多余

    }
    

    function hydrate(vnode,container){  // this is server renderer

    }


    return {
        render,
        hydrate
    }
}