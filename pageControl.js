window.loadTemplate = {};

class Render {
    constructor(config) {
        let { baseURI, el } = config;
        this.url = baseURI;
        this.el = document.querySelector(el);
    }

    create(templateName, toEle, config = {}) {
        return new Promise(resolve => {
            let url = `${ this.url }/${ templateName }.html`;
            let { animate, mode, load } = config;
            fetch(url).then(async result => {
                let htmlTemplate = await result.text();
                let virtualDom = document.createElement('div');
                virtualDom.innerHTML = htmlTemplate;
                let renderTree = virtualDom.querySelector('template').content.children[0];
                let styleList = virtualDom.querySelectorAll('style');
                let scenarioList = virtualDom.querySelectorAll('script');
                let elementId = Math.random().toString(36).slice(-10);
                renderTree.setAttribute('ros-id', elementId);
                renderTree.classList.add('animated', animate);
                switch (mode) {
                    case 'add': {
                        toEle.append(renderTree);
                        break;
                    }
                    case 'cover': {
                        toEle.innerHTML = ''
                        toEle.append(renderTree)
                        break;
                    }
                    case 'load': {
                        window[load] = type => {
                            type == 'add' ? toEle.append(renderTree) : (() => {
                                toEle.innerHTML = '';
                                toEle.append(renderTree)
                            })();
                        }
                        break;
                    }
                    default: {
                        toEle.append(renderTree);
                        break;
                    }
                }
                let head = document.head;
                styleList.forEach(item => {
                    head.append(item);
                    item.setAttribute('ros-id', elementId);
                });
                scenarioList.forEach((item, index) => {
                    eval(item.innerHTML)
                })
                resolve(renderTree);
            })
        })
    }

    // 移除相关组件的所有内容
    remove(ele, config = {}) {
        let { animate } = config;
        let id = ele.getAttribute('ros-id');
        if (!id) return ele.remove();
        let elements = document.querySelectorAll(`*[ros-id='${ id }']`);
        elements.forEach(item => {
            if (animate) item.classList.add('animated', animate);
            item.style.display = 'none';
            setTimeout(() => {
                item.remove();
            }, 1000)
        })
    }

    // 获取当前所有加载的模块
    installs() {
        return document.querySelectorAll('*[ros-id]');
    }
}


