# 如何实现 virtual-dom

## 0. 什么是 vnode

相信大部分前端同学之前早已无数次听过或了解过 `vnode`（虚拟节点），那么什么是 `vnode`? `vnode` 应该是什么样的？
如果不使用前端框架，我们可能会写出这样的页面：

```html
<html>
  <head>
    <title></title>
  </head>
  <body>
    <div></div>
    <script></script>
  </body>
</html>
```

不难发现，整个文档树的根节点只有一个 `html`，然后嵌套各种子标签，如果使用某种数据结构来表示这棵树，那么它可能是这样。

```javascript
{
  tagName: 'html',
  children: [
    {
      tagName: 'head',
      children: [
        {
          tagName: 'title'
        }
      ]
    },

    {
      tagName: 'body',
      children: [
        {
          tagName: 'div'
        },

        {
          tagName: 'script'
        }
      ]
    }
  ]
}
```

但是实际开发中，整个文档树中`head` 和 `script` 标签基本不会有太大的改动。频繁交互可能改动的应当是 `body` 里面的除 `script` 的部分，所以构建 虚拟节点树 应当是整个 HTML 文档树的一个子树，而这个子树应当保持和 HTML 文档树一致的数据结构。它可能是这样。

```html
<html>
  <head>
    <title></title>
  </head>
  <body>
    <div id="root">
      <div class="header"></div>
      <div class="main"></div>
      <div class="footer"></div>
    </div>
    <script></script>
  </body>
</html>
```

这里应当构建的 虚拟节点树 应当是 `div#root` 这棵子树：

```javascript
{
  tagName: 'div',
  children: [
    {
      tagName: 'div',
    },
    {
      tagName: 'div',
    },
    {
      tagName: 'div',
    },
  ]
}
```

到这里，vnode 的概念应当很清晰了，vnode 是用来表示实际 dom 节点的一种数据结构，其结构大概长这样。

```javascript
{
  tagName: 'div',
  attrs: {
    class: 'header'
  },
  children: []
}
```

一般，我们可能会这样定义 `vnode`。

```javascript
// vnode.js
export const vnode = function vnode() {}
```

## 1. 从 JSX 到 vnode

使用 `React` 会经常写 `JSX`，那么如何将 `JSX` 表示成 `vnode`？这里可以借助 `@babel/plugin-transform-react-jsx` 这个插件来自定义转换函数，
只需要在 `.babelrc` 中配置：

```javascript
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "window.h"
      }
    ]
  ]
}

```

然后在 `window` 对象上挂载一个 `h` 函数：

```javascript
// h.js
const flattern = arr => [].concat.apply([], arr)

window.h = function h(tagName, attrs, ...children) {
  const node = new vnode()
  node.tagName = tagName
  node.attrs = attrs || {}
  node.children = flattern(children)

  return node
}
```

测试一下：

![jsx->vnode](https://user-images.githubusercontent.com/26452939/49918605-beacf180-fede-11e8-80f7-541f02519a02.png)

## 2. 渲染 vnode

现在我们已经知道了如何构建 `vnode`，接下来就是将其渲染成真正的 dom 节点并挂载。

```javascript
// 将 vnode 创建为真正的 dom 节点
export function createElement(vnode) {
  if (typeof vnode !== 'object') {
    // 文本节点
    return document.createTextNode(vnode)
  }

  const el = document.createElement(vnode.tagName)
  setAttributes(el, vnode.attrs)
  vnode.children.map(createElement).forEach(el.appendChild.bind(el))
  return el
}

// render.js
export default function render(vnode, parent) {
  parent = typeof parent === 'string' ? document.querySelector(parent) : parent
  return parent.appendChild(createElement(vnode))
}
```

这里的逻辑主要为：

1. 根据 `vnode.tagName` 创建元素
2. 根据 `vnode.attrs` 设置元素的 `attributes`
3. 遍历 `vnode.children` 并将其创建为真正的元素，然后将真实子元素节点 append 到第 1 步创建的元素

## 3. diff vnode

 第 2 步已经实现了 vnode 到 dom 节点的转换与挂载，那么接下来某一个时刻 dom 节点发生了变化，如何更新 dom 树？显然不能无脑卸载整棵树，然后挂载新的树，最好的办法还是找出两棵树之间的差异，然后应用这些差异。

![diff-2-vnode](https://user-images.githubusercontent.com/26452939/49936056-d6e83500-ff0d-11e8-81ff-d1620acb31c4.png)

在写 `diff` 之前， 首先要定义好，要 `diff` 什么，明确 `diff` 的返回值。比较上图两个 vnode，可以得出：

1. 更换第 _1、2、3_ 个 `li` 的内容
2.  在 `ul` 下创建两个 `li`，这两个 li 为 *第 4 个*和 *第 5 个*子节点

那么可能得返回值为：

```javascript
{
  "type": "UPDATE",
  "children": [
    {
      "type": "UPDATE",
      "children": [
        {
          "type": "REPLACE",
          "newVNode": 0
        }
      ],
      "attrs": []
    },
    {
      "type": "UPDATE",
      "children": [
        {
          "type": "REPLACE",
          "newVNode": 1
        }
      ],
      "attrs": []
    },
    {
      "type": "UPDATE",
      "children": [
        {
          "type": "REPLACE",
          "newVNode": 2
        }
      ],
      "attrs": []
    },
    {
      "type": "CREATE",
      "newVNode": {
        "tagName": "li",
        "attrs": {},
        "children": [
          3
        ]
      }
    },
    {
      "type": "CREATE",
      "newVNode": {
        "tagName": "li",
        "attrs": {},
        "children": [
          4
        ]
      }
    }
  ],
  "attrs": []
}
```

`diff` 的过程中，要保证节点的父  节点正确，并要保证该节点在父节点  的子节点中的索引正确（保证节点内容正确，位置正确）。`diff` 的核心流程：

- case CREATE: 旧节点不存在，则应当新建新节点
- case REMOVE: 新节点不存在，则移出旧节点
- case REPLACE: 只比较新旧节点，不比较其子元素，新旧节点标签名或文本内容不一致，则应当替换旧节点
- case UPDATE: 到这里，新旧节点可能只剩下 attrs 和 子节点未进行 diff，所以直接循环 diffAttrs 和 diffChildren 即可

```javascript
/**
 * diff 新旧节点差异
 * @param {*} oldVNode
 * @param {*} newVNode
 */
export default function diff(oldVNode, newVNode) {
  if (isNull(oldVNode)) {
    return { type: CREATE, newVNode }
  }

  if (isNull(newVNode)) {
    return { type: REMOVE }
  }

  if (isDiffrentVNode(oldVNode, newVNode)) {
    return { type: REPLACE, newVNode }
  }

  if (newVNode.tagName) {
    return {
      type: UPDATE,
      children: diffVNodeChildren(oldVNode, newVNode),
      attrs: diffVNodeAttrs(oldVNode, newVNode)
    }
  }
}
```

## 4. patch 应用更新

知道了两棵树之前的差异，接下来如何应用这些更新？ 在文章开头部分我们提到  dom 节点树应当只有一个根节点，同时 `diff` 算法是保证了虚拟节点的位置和父节点是与 dom 树保持一致的，那么 patch 的入口也就很简单了，从 虚拟节点的挂载点开始递归应用更新即可。

```javascript
/**
 * 根据 diff 结果更新 dom 树
 * 这里为什么从 index = 0 开始？
 * 因为我们是使用树去表示整个 dom 树的，传入的 parent 即为 dom 挂载点
 * 从根节点的第一个节点开始应用更新，这是与整个dom树的结构保持一致的
 * @param {*} parent
 * @param {*} patches
 * @param {*} index
 */
export default function patch(parent, patches, index = 0) {
  if (!patches) {
    return
  }

  parent = typeof parent === 'string' ? document.querySelector(parent) : parent
  const el = parent.childNodes[index]

  /* eslint-disable indent */
  switch (patches.type) {
    case CREATE: {
      const { newVNode } = patches
      const newEl = createElement(newVNode)
      parent.appendChild(newEl)
      break
    }

    case REPLACE: {
      const { newVNode } = patches
      const newEl = createElement(newVNode)
      parent.replaceChild(newEl, el)
      break
    }

    case REMOVE: {
      parent.removeChild(el)
      break
    }

    case UPDATE: {
      const { attrs, children } = patches

      patchAttrs(el, attrs)

      for (let i = 0, len = children.length; i < len; i++) {
        patch(el, children[i], i)
      }

      break
    }
  }
}
```

## 总结

至此，`vdom` 的核心 `diff` 与 `patch`  都已基本实现。 在测试 demo 中，不难发现 `diff` 其实已经很快了，但是 `patch` 速度会比较慢，所以这里留下了一个待优化的点就是 `patch`。

本文完整代码均  在这个[仓库](https://github.com/justemit/vdom)。
