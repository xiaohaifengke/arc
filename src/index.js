export const arc = {
  /**
   * 计算控制点坐标 (二次贝塞尔曲线需要三个控制点，除起点和终点外，还需要另外一个点。
   * 假定起点为P0,终点分别为P2, 所求的控制点为P1, 计算时需要先计算过度点T )
   * @param { Array<number> } start 弧形起点坐标
   * @param { Array<number> } end 弧形终点坐标
   * @param { number } cph 第三个控制点横向偏离比例，取值范围：[0,1]. default: 0.5
   * @param { number } cpv 第三个控制点纵向偏离比例，取值范围：[0,1]. default: 0.2
   */
  calcControlPoint (start, end, cph = 0.5, cpv = 0.2) {
    if (end[1] === start[1]) {

    } else {
      let k1 = -(end[0] - start[0]) / (end[1] - start[1])
      // 过度点到P1的长度
      let lTP1 = cpv * Math.sqrt(Math.pow(end[1] - start[1], 2) + Math.pow(end[0] - start[0], 2))
      let Tx = cph * end[0] + (1 - cph) * start[0]
      let Ty = cph * end[1] + (1 - cph) * start[1]
      // P1和_P1为满足条件的两个点，取y坐标大者
      let P1x = Tx + lTP1 / Math.sqrt(1 + Math.pow(k1, 2))
      let P1y = Ty + k1 * lTP1 / Math.sqrt(1 + Math.pow(k1, 2))
      let _P1x = Tx - lTP1 / Math.sqrt(1 + Math.pow(k1, 2))
      let _P1y = Ty - k1 * lTP1 / Math.sqrt(1 + Math.pow(k1, 2))
      if (P1y > _P1y) {
        return [P1x, P1y]
      }
      return [_P1x, _P1y]
    }
  },
  /**
   * 二次贝赛尔曲线方程
   * @param p0
   * @param p1
   * @param p2
   * @param t
   * @returns {number}
   */
  quadraticBezier (p0, p1, p2, t) {
    var k = 1 - t
    return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2 // 二次贝赛尔曲线方程
  },

  bezierPoints (start, end, npoints, options) {
    options = options || {cph: 0.5, cpv: 0.2}
    let cph = options.cph || 0.5
    let cpv = options.cpv || 0.2
    let cp = this.calcControlPoint(start, end, cph, cpv)

    var points = [] // start, cp, end
    if (!npoints || npoints <= 2) {
      points.push(start)
      points.push(end)
    } else {
      var delta = 1.0 / (npoints - 1)
      for (var i = 0; i < npoints; i++) {
        var step = delta * i
        var Bx = this.quadraticBezier(start[0], cp[0], end[0], step)
        let By = this.quadraticBezier(start[1], cp[1], end[1], step)
        points.push([Bx, By])
      }
    }
    return points
  },

  /**
   * 计算cph, cpv的值
   * @param {Array<number, number>} startPoint 该轨迹矢量的起点
   * @param {Array<number, number>} endPoint 该轨迹矢量的终点
   * @param {number} startPointIndex 该轨迹矢量在所有轨迹中的索引
   * @param {number} initCph 轨迹最高点的位置比例（默认为轨迹中点） default: 0.5
   * */
  getCphvFromIdenticTrailVectorTimes (startPoint, endPoint, startPointIndex, initCph = 0.45, initCpv = 0.16) {
    let minCph = 0.1
    let key = `${startPoint[0]},${startPoint[1]}--${endPoint[0]},${endPoint[1]}`
    let times = this.iIdenticTrailVectorTimes[key].length
    // 该轨迹矢量在重复轨迹中的索引
    let index = this.iIdenticTrailVectorTimes[key].indexOf(startPointIndex)
    // TODO: config dimensionSize
    let dimensionSize = 2 // 每个维度的轨迹图形最多显示的个数，超出之后的轨迹的cph值会更大
    let cphStep = ((initCph - minCph) / dimensionSize).toFixed(2)
    let cpvStep = 0.05
    let cpvIndex = parseInt(index / dimensionSize) // 维度索引
    let cphIndex = index % dimensionSize // 同个维度下的轨迹索引
    let cph = (initCph - cphIndex * cphStep).toFixed(2)
    let cpv = (initCpv + cpvIndex * cpvStep).toFixed(2)
    return {cph, cpv}
  },

  /**
   * 过滤掉无效坐标点
   * @param {Array<Array<number, number>>} coors 坐标点集合
   * @return {Array<Array<number, number>>}
   * */
  filterCoordinates (coors) {
    let coordinates = []
    // 过滤无效坐标点
    for (let point of coors) {
      if (!(point[0] && point[1])) continue
      coordinates.push(point)
    }
    return coordinates
  },

  // 计算相同两点相同方向的轨迹（相同矢量）出现的矢量起点索引
  getTheSameTrailVectorTimes (coordinates) {
    let times = {}
    for (let i = 0, len = coordinates.length; i < len - 1; i++) {
      let startPoint = coordinates[i]
      let endPoint = coordinates[i + 1]
      let key = `${startPoint[0]},${startPoint[1]}--${endPoint[0]},${endPoint[1]}`
      if (times[key]) {
        times[key].push(i)
      } else {
        times[key] = [i]
      }
    }
    return times
  }
}