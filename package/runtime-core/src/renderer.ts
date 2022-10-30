function renderer(domString:string , container:HTMLElement){
    container.innerHTML = domString
}

function patch(oldValue , newValue , container){

}

function createRenderer(){
    function render(vnode,container){
        if(vnode){
            patch(container._vnode,vnode,container)
        }else{  //vnode 不存在 ，_vnode也不存在，所以这是unmount操作
            if(container._vnode){
                container.innerHTML = ''
            }
        }

        container._vnode ? container._vnode = vnode : Object.defineProperty(container,'_vnode',vnode)

    }
    

    function hydrate(vnode,container){  // this is server renderer

    }


    return {
        render,
        hydrate
    }
}