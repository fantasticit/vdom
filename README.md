# vdom

> A simple basic implement of virtual-dom algorithm

文章说明：[vdom 原理解析与简单实现](https://github.com/justemit/coding-note/issues/23)

实际应用：[qcharts](https://github.com/spritejs/q-charts)

## Usage

```javascript
let node1 = (
  <div>
    <ul>
      {[1, 2, 3].map(i => (
        <li>{i}</li>
      ))}
    </ul>
  </div>
)

let node2 = (
  <div className="test">
    <ul>
      {[...Array(1000).keys()].map(i => (
        <li>{i}</li>
      ))}
    </ul>
  </div>
)

render(node1, '#app')

document.querySelector('.btn').onclick = () => {
  const patches = diff(node1, node2)
  patch('#app', patches)
}
```

![vdom-gif](https://user-images.githubusercontent.com/26452939/49984490-41978000-ffa3-11e8-9112-9d20e606013f.gif)

## LICENSE

MIT
