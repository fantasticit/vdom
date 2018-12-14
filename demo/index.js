import { diff, patch, render } from '../src'

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
  const label = '耗时：'
  console.time(label)
  const patches = diff(node1, node2)
  console.timeEnd(label)
  console.log(patches)

  console.time(label)
  patch('#app', patches)
  console.timeEnd(label)
}
