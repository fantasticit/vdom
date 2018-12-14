import h from './h'
import diff from './diff'
import patch from './patch'
import render from './render'

const vdom = {
  h,
  diff,
  patch,
  render
}

if (window && typeof window !== 'undefined') {
  window.vdom = vdom
}

export { h, diff, patch, render }

export default vdom
