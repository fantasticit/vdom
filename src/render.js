export function setAttribute(target, key, value) {
  if (key === 'className') {
    key = 'class'
  }

  target.setAttribute(key, value)
}

export function removeAttribute(target, key) {
  if (key === 'className') {
    key = 'class'
  }

  target.removeAttribute(key)
}

function setAttributes(target, attrs) {
  Object.keys(attrs).forEach(key => {
    setAttribute(target, key, attrs[key])
  })
}

export function createElement(vnode) {
  if (typeof vnode !== 'object') {
    // 文本节点
    return document.createTextNode(vnode)
  }

  // 1. 根据 vnode.tagName 创建元素
  // 2. 根据 vnode.attrs 设置元素的 attributes
  // 3. 遍历 vnode.children 并将其创建为真正的元素，然后将真实子元素节点 append 到第1步创建的元素
  const el = document.createElement(vnode.tagName)
  setAttributes(el, vnode.attrs)
  vnode.children.map(createElement).forEach(el.appendChild.bind(el))
  return el
}

export default function render(vnode, parent) {
  parent = typeof parent === 'string' ? document.querySelector(parent) : parent
  return parent.appendChild(createElement(vnode))
}
