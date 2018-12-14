# vdom

> A simple basic implement of virtual-dom algorithm

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
