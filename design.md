How do I determine the approximate scale factors of things that I want to render? I need to avoid the whole issue of low resolution things getting rendered. I think I'll have the transformation stack be part of the actual program itself.

Programming language:

```
let vec3 = tuple [float float float]

fn normalize(vec: vec3) {
  x^2 + y^2 + z^2
}

fn normalize(vec: [float float float]) {

}

fn pair[t: type] [
  tuple [type type]
]

fn twoOf[T: type, x: T]: pair[T] [
  [x x]
]

```

```
let buffer: Array(T) = arr(
  (0 0)
  (0 1)
  (1 1)
  (0 1)
  (1 0)
  (1 1)
)

prog = (
  vs = "builtin:shader/basic-vertex.vert"
  fs = "builtin:shader/flat-color.frag"
)

draw(
  ...prog
  uniforms = (
    matrix = (
      1 0 0
      0 1 0
      0 0 1
    )
    color = (
      1.0 0.0 0.0 0.5
    )
  )
  attribs = (
    position = buffer
  )
)
```

```

buffer = arr[
  [0 0] [0 1] [1 1]
  [0 1] [1 0] [1 1]
]

prog = [
  vs = "builtin:shader/basic-vertex.vert"
  fs = "builtin:shader/flat-color.frag"
]

out = draw[
  ...prog,
  uniforms = [
    matrix = [
      1 0 0
      0 1 0
      0 0 1
    ]
    color = [ 1 0 0 .5 ]
  ]
  attribs = [
    position = array2buffer[buffer]
  ]
]

```

use backticks to denote macros (stretch goal)

possible issues: unary

https://blog.tomayac.com/2020/05/15/the-requestvideoframecallback-api/
