> Generate arcs routes as lines that does not coincide between two points.

## Install
npm
```shell
npm i arc-points -S
```
or yarn
```shell
yarn add arc-points
```

## Usage
Require the library in node.js like:

```javascript
var arc = require('arc-points');
arc.arcPoints.methodName()
```

Use in the browser like:

```html
<script src="./arc-points.js"></script>
arc.arcPoints.methodName()
```

ES2015:

```javascript
import { arcPoints } from '../lib/arc-points'
arcPoints.methodName()
```

## API

Methods:

- generateBezierPoints(start, end, npoints, options) => *array*
    > Generate arcs routes as lines that does not coincide between to points.
    > - **start**: Start point like [x, y]. **Note:** *x and y are both numbers. If in a map, x denotes a longitude, y denotes a latitude.*
    > - **end**: End point. The format is like **start**.
    > - **npoints**: The number of points to be generated.
    > - **options**: An object with three properties of *cph,cpv,direction*.
    > - **options.cph**: Horizontal position ratio of control point. Default: 0.5
    > - **options.cpv**: Vertical position ratio of control point. Default: 0.2
    > - **options.direction**: The location of the generated arc with respect to the two-point connection. It could be *up*, *down* or *ring*. *ring* indicates that the generated arc direction is clockwise. Default: *up*

- filterCoordinates
- getTheSameTrailVectorTimes
- getCphvFromIdenticTrailVectorTimes

## Example

You can download it and
```shell
cd example
yarn
yarn start
```
