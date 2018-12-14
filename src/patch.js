import {
  CREATE,
  REPLACE,
  UPDATE,
  REMOVE,
  SET_PROP,
  REMOVE_PROP
} from './consts'
import { createElement, setAttribute, removeAttribute } from './render'

const patchAttrs = (el, patches) => {
  for (const patch of patches) {
    const { type, key } = patch

    if (type === SET_PROP) {
      setAttribute(el, key, patch.value)
    }

    if (type === REMOVE_PROP) {
      removeAttribute(el, key)
    }
  }
}

/**
 * 根据 diff 结果更新 dom 树
 * 这里为什么从 index = 0 开始？
 * 因为我们是使用树去表示整个 dom 树的，传入的 parent 即为 dom 树的根节点
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

      const sliceLen = 1000
      // 这里做了一个简单优化，但是效果也很明显
      // 待完善
      if (children.length > sliceLen) {
        let timer = null
        const step = start => {
          const label = `切片-${start}: `
          console.time(label)
          let nodes = children.slice(start * sliceLen, (start + 1) * sliceLen)
          for (let i = 0, len = sliceLen; i < len; i++) {
            patch(el, nodes[i], i + start * sliceLen)
          }
          console.timeEnd(label)

          if (start >= Math.ceil(children.length / sliceLen)) {
            return cancelIdleCallback(timer)
          }

          start++
          timer = window.requestIdleCallback(() => step(start))
        }

        step(0)
      } else {
        for (let i = 0, len = children.length; i < len; i++) {
          patch(el, children[i], i)
        }
      }

      break
    }
  }
}
