function renderer(domString:string , container:HTMLElement){
    container.innerHTML = domString
}

type vnodeType<T> = T extends any[] ? T : T; 


// this is a test instance

const vnode = {
    type:'div',
    props:{
        id:'foo'
    },
    children:[
        {
            type:'p',
            children:'hello'
        }
    ]
}



function createRenderer(options){
    const {
        createElement,
        insert,
        setElementText,
        setAttribute,
    } = options  //need to 抽离同样的逻辑

    function mountElement<T extends {type?:unknown,props?:{},children?:any[]}>(vnode: T, container:HTMLElement){

        const el :HTMLElement = createElement(vnode.type);
        if(typeof vnode.children === 'string'){
           setElementText(el,vnode.children)
        }else if(Array.isArray(vnode.children)){
            vnode.children.forEach(node => {
                patch(null,node ,el)
            });
        }

        // handle props
        if(vnode.props){
            for(const key in vnode.props){

            }
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