import 'ol/ol.css'
import { get, transform } from 'ol/proj'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import Overlay from 'ol/Overlay'
import TileGrid from 'ol/tilegrid/TileGrid'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Fill, Stroke, Circle, Style } from 'ol/style'
import { LineString } from 'ol/geom'
import { defaults as defaultControls, Attribution } from 'ol/control.js'

import { OSM, Vector as VectorSource } from 'ol/source.js'
import Draw, { createBox } from 'ol/interaction/Draw'
import Icon from 'ol/style/Icon'
import Point from 'ol/geom/Point'
import { toSize } from 'ol/size'
import Select from 'ol/interaction/Select'
import { pointerMove } from 'ol/events/condition'
import DragBox from 'ol/interaction/DragBox'
import {getVectorContext} from 'ol/render';
import { arcPoints } from '../lib/arc-points'
import points from './mockData'

const locationIcon = require('./imgs/location.svg')
const redLocationIcon = require('./imgs/location-red.png')
const blueLocationIcon = require('./imgs/location-blue.png')

let map
let draw
let locationFeatureVectorSource
let locationFeatureVectorLayer
const ARCLINES = window.ARCLINES = [] // for debug

// mock data start
const timelineInfo = []
for (let i = 0; i < 20; i++) {
  let random = Math.floor(Math.random() * 5)
  const point = {...points[random]}
  if (timelineInfo.length > 0 && point.lnt === timelineInfo[timelineInfo.length - 1].lnt)  continue // 排除两个相同的点
  point.captureId = Math.random() + ''
  timelineInfo.push(point)
}
const mapPointsGroupByCoordinate = {}
for (let info of timelineInfo) {
  if (!(info.lnt && info.lat)) continue
  let key = info.lnt + '-' + info.lat
  if (mapPointsGroupByCoordinate[key]) {
    mapPointsGroupByCoordinate[key].infoList.push(info)
  } else {
    mapPointsGroupByCoordinate[key] = {
      coordinate: [info.lnt, info.lat],
      infoList: [info]
    }
  }
}
// mock data end

const trail = {
  mapPointsGroupByCoordinate,
  /**
   * 根据配置调用地图
   * @param { number } mapType 0：关闭地图；1：高德；100：OSM
   * */
  callMap (mapType) {
    if (mapType === 0) return
    let center = this.getCenterPoint()
    if (mapType === 1) {
      return this.callAMap(center)
    } else if (mapType === 2) {
      return this.callAnQingArcgis(center)
    }
  },

  /**
   * 获取地图中心点坐标
   * @param { object[] } points 点信息的集合
   * */
  getCenterPoint (points) {
    return [116.3427163, 39.8907257]
  },

  /**
   * 引用高德地图
   * @param { array } center 初始化时地图中心点坐标
   * */
  callAMap (center) {
    center = center || [116.397477, 39.908692] // 默认的地图中心的的坐标 北京市天安门
    let projection = get('EPSG:4326')

    let AMap = function (options) {
      // TODO: should have a default options and use Object.assign to cover it.
      options = options ? options : {} // eslint-disable-line

      let attributions
      if (options.attributions) {
        attributions = options.attributions
      } else {
        attributions = [AMap.ATTRIBUTION]
      }

      let url
      if (options.mapType === 'sat') {
        url = 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      } else {
        url = 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
      }

      return new XYZ({
        crossOrigin: 'anonymous', // 跨域
        cacheSize: options.cacheSize,
        projection: get('EPSG:3857'),
        attributions: attributions,
        url: url,
        wrapX: options.wrapX !== undefined ? options.wrapX : true
      })
    }

    AMap.ATTRIBUTION = new Attribution({
      tipLabels: '&copy; <a class="ol-attribution-amap" ' +
      'href="http://ditu.amap.com/">' +
      '高德地图</a>'
    })

    let map = new Map({
      controls: defaultControls({attribution: false}),
      target: 'map',
      layers: [
        new TileLayer({
          title: '高德地图卫星',
          source: AMap({mapType: ''})
        })
      ],
      view: new View({
        center: center,
        zoom: 12,
        projection: projection,
        maxZoom: 18
      })
    })
    return map
  },

  /**
   * 获取location图层的vectorSource
   */
  getLocationFeatureVectorSource () {
    if (!locationFeatureVectorSource) {
      // console.log('getLocationFeatureVectorSource.inner');
      locationFeatureVectorSource = new VectorSource({
        features: []
        // TODO: attributions
      })
      /**
       * 该VectorLayer仅需要添加一次，故只需判断cameraFeatureVectorLayer是否存在
       * 如不存在，则添加
       */
      if (!locationFeatureVectorLayer) {
        map.addLayer(this.getLocationFeatureVectorLayer())
      }
    }

    return locationFeatureVectorSource
  },

  /**
   * 获取location图层的vectorLayer
   */
  getLocationFeatureVectorLayer () {
    if (!locationFeatureVectorLayer) {
      locationFeatureVectorLayer = new VectorLayer({
        source: this.getLocationFeatureVectorSource()
      })
    }
    return locationFeatureVectorLayer
  },

  /**
   * 绘制 location (定位点)
   * */
  drawLocationFeatures (group) {
    let locationSvgIcon = new Image()
    locationSvgIcon.src = locationIcon
    for (let key in group) {
      let position = group[key].coordinate
      // add feature
      let locationFeature = new Feature({
        geometry: new Point(position),
        key: key,
        name: 'location'
      })
      locationFeature.setStyle(new Style({
        image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
          crossOrigin: 'anonymous',
          src: redLocationIcon
        }))
      }))
      this.getLocationFeatureVectorSource().addFeature(locationFeature)
    }
  },

  // 绘制轨迹
  drawTrajectory (points) {
    var pointsPerMs = 0.05
    // let that = this
    if (!points) return
    let coordinates = []
    // 过滤无效坐标点
    for (let point of points) {
      if (!(point.coordinate[0] && point.coordinate[1])) continue
      point.coordinate.metaData = point
      coordinates.push(point.coordinate)
    }
    const sameTrailVectorTimes = arcPoints.getTheSameTrailVectorTimes(coordinates)
    map.getLayers().array_[0].on('postrender', animateFlights)
    // map.on('postcompose', animateFlights)

    // 实例化一个矢量图层Vector作为绘制层
    let trailSource = new VectorSource()
    let style = new Style({
      stroke: new Stroke({
        color: '#EAE911',
        width: 4
      })
    })
    let periodIndex = 0
    var vectorLayer = new VectorLayer({
      source: trailSource,
      style: function (feature) {
        // console.log('feature.get(\'finished\'):', feature.get('finished') + periodIndex);
        // if the animation is still active for a feature, do not
        // render the feature with the layer style
        if (feature.get('finished')) {
          let color = feature.get('color')
          if (!color) {
            let r = Math.floor(Math.random() * 256)
            let g = Math.floor(Math.random() * 256)
            let b = Math.floor(Math.random() * 256)
            let color = '#' + r.toString(16) + g.toString(16) + b.toString(16)
            feature.set('color', color)
          }
          return new Style({
            stroke: new Stroke({
              color: color,
              width: 2
            })
          })
        } else {
          return null
        }
      }
    })
    map.addLayer(vectorLayer) // 将绘制层添加到地图容器中
    drawTrailPeriod(coordinates, periodIndex, trailSource)

    function animateFlights (event) {
      var vectorContext = getVectorContext(event)
      var frameState = event.frameState
      vectorContext.setStyle(style)

      // let features = trailSource.getFeatures()
      let feature = trailSource.trailLastLineFeature // 取最后一次添加的lineFeature
      if (!feature.get('finished')) {
        // only draw the lines for which the animation has not finished yet
        var coords = feature.getGeometry().getCoordinates()
        var elapsedTime = frameState.time - feature.get('start')
        // console.log(elapsedTime)
        var elapsedPoints = elapsedTime * pointsPerMs

        if (elapsedPoints >= coords.length) {
          feature.set('finished', true)
        }

        var maxIndex = Math.min(elapsedPoints, coords.length)
        var currentLine = new LineString(coords.slice(0, maxIndex))

        // directly draw the line with the vector context
        vectorContext.drawGeometry(currentLine)

        // tell OpenLayers to continue the animation
        map.render()
      } else {
        // TODO: next feature
        if (periodIndex < coordinates.length - 1 - 1) {
          drawTrailPeriod(coordinates, ++periodIndex, trailSource)
        }
      }
      /*for (var i = 0; i < features.length; i++) {
        console.log(features.length)
        var feature = features[i]
        if (!feature.get('finished')) {
          // only draw the lines for which the animation has not finished yet
          var coords = feature.getGeometry().getCoordinates()
          var elapsedTime = frameState.time - feature.get('start')
          // console.log(elapsedTime)
          var elapsedPoints = elapsedTime * pointsPerMs

          if (elapsedPoints >= coords.length) {
            feature.set('finished', true)
          }

          var maxIndex = Math.min(elapsedPoints, coords.length)
          var currentLine = new LineString(coords.slice(0, maxIndex))

          // directly draw the line with the vector context
          vectorContext.drawGeometry(currentLine)

          // tell OpenLayers to continue the animation
          map.render()
        } else {
          // TODO: next feature
          drawTrailPeriod(coordinates, ++periodIndex, trailSource)
        }
      }*/
    }

    /**
     * 绘制轨迹的第 n 段 (共有coordinates.length - 1 段)
     * @param { Array<array[lnt, lat]> } coordinates
     * @param { number } n 第 n 段, 从 0 开始
     * @param { object } vectorSourceInstance VectorSource实例，即feature将被添加到的source
     * @param { object } vectorContextStyle 轨迹绘制过程中的样式
     */
    function drawTrailPeriod (coordinates, n, vectorSourceInstance, vectorContextStyle) {
      vectorContextStyle = vectorContextStyle || new Style({
        stroke: new Stroke({
          color: '#EAE911',
          width: 4
        })
      })
      if (n >= coordinates.length - 1) {
        throw new Error('n is illegal!')
        return
      }
      let startPoint = coordinates[n]
      let endPoint = coordinates[n + 1]
      let {cph, cpv} = arcPoints.getCphvFromIdenticTrailVectorTimes(sameTrailVectorTimes, startPoint, endPoint, n, 0.45, 0.3, 0.15)
      let arcLine = arcPoints.bezierPoints(startPoint, endPoint, 100, {cph, cpv}) // cph: 0.5, cpv: 0.16
      ARCLINES.push(arcLine)
      let lineGeometry = new LineString(arcLine)
      let lineFeature = new Feature({
        geometry: lineGeometry,
        finished: false,
        test: false,
        name: 'arcLine' // custom name
      })
      lineFeature.set('start', new Date().getTime())
      lineFeature.set('started', true)
      vectorSourceInstance.addFeature(lineFeature)
      vectorSourceInstance.trailLastLineFeature = lineFeature // 仅仅为了取值方便
    }
  },

  // hover时选择feature
  trajectoryPointermoveSelectHandler () {
    // select interaction working on "pointermove"
    let select = new Select({
      condition: pointerMove,
      /**
       * A function that takes an module:ol/Feature and an module:ol/layer/Layer
       * and returns true if the feature may be selected or false otherwise.
       * */
      filter: function (feature, vectorLayer) {
        if (feature.get('name') === 'arcLine' || feature.get('name') === 'location') {
          return true
        }
      }
    })
    map.addInteraction(select)
    select.on('select', function (e) {
      if (e.selected.length > 0) {
        map.getTargetElement().style.cursor = 'pointer'
      } else {
        map.getTargetElement().style.cursor = 'auto'
      }
      let lastDeselectedFeatures = e.deselected
      let allSelectedFeatures = e.target.getFeatures().getArray()
      for (let deselectedFeature of lastDeselectedFeatures) {
        // 定位要素
        console.log(deselectedFeature.get('name'))
        if (deselectedFeature.get('name') === 'location') {
          deselectedFeature.setStyle(new Style({
            image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
              // color: '#F54336',
              crossOrigin: 'anonymous',
              src: redLocationIcon
            }))
          }))
        }
      }
      for (let selectedFeature of allSelectedFeatures) {
        console.log(selectedFeature.get('name'))
        if (selectedFeature.get('name') === 'location') {
          selectedFeature.setStyle(new Style({
            image: new Icon(/** @type {module:ol/style/Icon~Options} */ ({
              // color: '#2B81FF',
              crossOrigin: 'anonymous',
              src: blueLocationIcon
            }))
          }))
        }
      }
      /*document.getElementById('status').innerHTML = '&nbsp;' +
        e.target.getFeatures().getLength() +
        ' selected features (last operation selected ' + e.selected.length +
        ' and deselected ' + e.deselected.length + ' features)';*/
    })
  },

  createPopups (group) {
    let reg = /^\/mnt\/storage4\/dface\/.+/g
    for (let key in group) {
      let picUrl = group[key].infoList[0].picUrl
      if (reg.test(picUrl)) {
        picUrl = picUrl.replace('/mnt/storage4/dface', '/pic')
      }
      let htmlTemplate =
        `<div class="person-list-wrapper">
            <div class="personal-info clearfix">
                <div class="alarm-level alarm-level${group[key].infoList[0].deployLevel}"></div>
                <div class="avatar">
                    <img src="${picUrl}">
                    <span class="num-tip">${group[key].infoList.length}</span>
                </div>
                <div class="personal-contrail-tracking-info">
                    <div class="contrail-tracking-time">抓拍时间：${group[key].infoList[0].captureDate}</div>
                    <div class="contrail-tracking-position">抓拍位置：<span>${group[key].infoList[0].position}</span></div>
                </div>
            </div>
            <div class="person-list-content"></div>
          </div>
          <div class="person-list-footer">
            <div class="person-list-collapse">
                <span>共 ${group[key].infoList.length} 条</span>
                <span title="展开" onclick="window.spreadInfoList(event, 'spread')" class="fr collapse-button el-icon-arrow-down ${group[key].infoList.length === 1 ? 'hidden' : ''}"></span>
                <span title="展开" onclick="window.spreadInfoList(event, 'spread')" class="fr collapse-button el-icon-arrow-right ${group[key].infoList.length === 1 ? '' : 'hidden'}"></span>
                <span title="收起" onclick="window.spreadInfoList(event, 'collapse')" class="fr collapse-button el-icon-arrow-left ${group[key].infoList.length === 1 ? '' : 'hidden'}"></span>
                <span title="收起" onclick="window.spreadInfoList(event, 'collapse')" class="fr collapse-button el-icon-arrow-up ${group[key].infoList.length === 1 ? 'hidden' : ''}"></span>
            </div>
          </div>`
      let container = document.createElement('div')
      // container.id = 'popup' + key
      container.className = 'person-list collapsed'
      container.setAttribute('key', key)
      container.innerHTML = htmlTemplate

      let position = group[key].coordinate
      if (this.mapType === 2) {
        position = group[key].coordinate
      }
      let popup = new Overlay(/** @type {olx.OverlayOptions} */ {
        id: 'popup' + key,
        element: container,
        position: position,
        positioning: 'top-left'
      })

      map.addOverlay(popup)
    }
  },

  /**
   * 点击时的弹出框
   * @param {string} color            marker背景的颜色
   * @param {array} coordinate        'EPSG:4326'格式的坐标
   */
  addMarkers (group) {
    for (let key in group) {
      var markerContainer = document.createElement('div')
      markerContainer.className = 'markerContainer'

      var pin = document.createElement('div')
      pin.className = 'cssmarker-pin'
      pin.style.backgroundColor = '#F54336'

      var icon = document.createElement('span')
      icon.innerHTML = '<i class="num-tip"></i>'
      // icon.innerHTML = '<i class="num-tip">' + (points.length - index) + '</i>'

      pin.appendChild(icon)
      markerContainer.appendChild(pin)

      let position = group[key].coordinate
      if (this.mapType === 2) {
        position = group[key].coordinate
      }
      let marker = new Overlay({
        id: 'marker' + key,
        element: markerContainer,
        position: position,
        positioning: 'bottom-center'
      })

      map.addOverlay(marker)
    }
  },
  /* 清除Overlays */
  clearOverlays () {
    let overlays = map.getOverlays()
    overlays.clear()
  },
  /* 清除layer[type='VECTOR'] */
  removeLayer () {
    let indexArr = [] // 需要删除的索引正序排列
    let layersCollection = map.getLayers()
    let layers = layersCollection.array_
    layers.forEach((layer, index) => {
      if (layer.type === 'VECTOR') {
        indexArr.push(index)
      }
    })
    // 先倒叙indexArr,再依次删除
    indexArr.reverse().forEach(i => {
      layersCollection.removeAt(i)
    })
  }

}

window.map = map = trail.callMap(1)
trail.trajectoryPointermoveSelectHandler()
trail.drawLocationFeatures(mapPointsGroupByCoordinate)
trail.drawTrajectory(timelineInfo)

