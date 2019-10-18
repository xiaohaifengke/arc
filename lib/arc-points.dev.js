(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["arc"] = factory();
	else
		root["arc"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: arcPoints */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "arcPoints", function() { return arcPoints; });
var arcPoints = {
  /**
   * 计算控制点坐标 (二次贝塞尔曲线需要三个控制点，除起点和终点外，还需要另外一个点。
   * 假定起点为P0,终点分别为P2, 所求的控制点为P1, 计算时需要先计算过度点T )
   * @param { Array<number> } start 弧形起点坐标
   * @param { Array<number> } end 弧形终点坐标
   * @param { string } direction 轨迹的方向 'up'|'down'|'ring'
   * @param { number } cph 第三个控制点横向偏离比例，取值范围：[0,1]. default: 0.5
   * @param { number } cpv 第三个控制点纵向偏离比例，取值范围：[0,1]. default: 0.2
   */
  calcControlPoint(_ref) {
    var start = _ref.start,
        end = _ref.end,
        _ref$direction = _ref.direction,
        direction = _ref$direction === void 0 ? 'up' : _ref$direction,
        _ref$cph = _ref.cph,
        cph = _ref$cph === void 0 ? 0.5 : _ref$cph,
        _ref$cpv = _ref.cpv,
        cpv = _ref$cpv === void 0 ? 0.2 : _ref$cpv;

    if (end[1] === start[1]) {} else {
      var k1 = -(end[0] - start[0]) / (end[1] - start[1]); // 过度点到P1的长度

      var lTP1 = cpv * Math.sqrt(Math.pow(end[1] - start[1], 2) + Math.pow(end[0] - start[0], 2));
      var Tx = cph * end[0] + (1 - cph) * start[0];
      var Ty = cph * end[1] + (1 - cph) * start[1]; // P1和_P1为满足条件的两个点，取y坐标大者

      var P1x = Tx + lTP1 / Math.sqrt(1 + Math.pow(k1, 2));
      var P1y = Ty + k1 * lTP1 / Math.sqrt(1 + Math.pow(k1, 2));

      var _P1x = Tx - lTP1 / Math.sqrt(1 + Math.pow(k1, 2));

      var _P1y = Ty - k1 * lTP1 / Math.sqrt(1 + Math.pow(k1, 2));

      if (direction === 'down') {
        return P1y > _P1y ? [_P1x, _P1y] : [P1x, P1y];
      } else if (direction === 'ring') {
        return end[0] > start[0] ? P1y > _P1y ? [P1x, P1y] : [_P1x, _P1y] : P1y > _P1y ? [_P1x, _P1y] : [P1x, P1y];
      } else {
        // 'up'
        return P1y > _P1y ? [P1x, P1y] : [_P1x, _P1y];
      }
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
  quadraticBezier(p0, p1, p2, t) {
    var k = 1 - t;
    return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2; // 二次贝赛尔曲线方程
  },

  generateBezierPoints(start, end, npoints, options) {
    options = options || {
      cph: 0.5,
      cpv: 0.2,
      direction: 'up'
    };
    var cph = options.cph || 0.5;
    var cpv = options.cpv || 0.2;
    var direction = options.direction || 'up';
    var cp = this.calcControlPoint({
      start,
      end,
      direction,
      cph,
      cpv
    });
    var points = []; // start, cp, end

    if (!npoints || npoints <= 2) {
      points.push(start);
      points.push(end);
    } else {
      var delta = 1.0 / (npoints - 1);

      for (var i = 0; i < npoints; i++) {
        var step = delta * i;
        var Bx = this.quadraticBezier(start[0], cp[0], end[0], step);
        var By = this.quadraticBezier(start[1], cp[1], end[1], step);
        points.push([Bx, By]);
      }
    }

    return points;
  },

  /**
   * 计算cph, cpv的值
   * @param {object} sameTrailVectorTimes 相同两点相同方向的轨迹（相同矢量）的矢量集合
   * @param {Array<number, number>} startPoint 该轨迹矢量的起点
   * @param {Array<number, number>} endPoint 该轨迹矢量的终点
   * @param {number} startPointIndex 该轨迹矢量在重复轨迹中的索引
   * @param {number} dimensionSize 每个维度的轨迹图形最多显示的个数，超出之后的轨迹的cph值会更大
   * @param {number} initCph 轨迹最高点的位置水平方向比例 default: 0.45
   * @param {number} initCpv 轨迹最高点的位置垂直方向比例 default: 0.16
   * @param {number} cpvStep  default: 0.05
   * */
  getCphvFromIdenticTrailVectorTimes(_ref2) {
    var sameTrailVectorTimes = _ref2.sameTrailVectorTimes,
        startPoint = _ref2.startPoint,
        endPoint = _ref2.endPoint,
        startPointIndex = _ref2.startPointIndex,
        _ref2$dimensionSize = _ref2.dimensionSize,
        dimensionSize = _ref2$dimensionSize === void 0 ? 2 : _ref2$dimensionSize,
        _ref2$initCph = _ref2.initCph,
        initCph = _ref2$initCph === void 0 ? 0.45 : _ref2$initCph,
        _ref2$initCpv = _ref2.initCpv,
        initCpv = _ref2$initCpv === void 0 ? 0.16 : _ref2$initCpv,
        _ref2$cpvStep = _ref2.cpvStep,
        cpvStep = _ref2$cpvStep === void 0 ? 0.1 : _ref2$cpvStep;
    var minCph = 0.1;
    var key = "".concat(startPoint[0], ",").concat(startPoint[1], "--").concat(endPoint[0], ",").concat(endPoint[1]);
    var times = sameTrailVectorTimes[key].length; // 该轨迹矢量在重复轨迹中的索引

    var index = sameTrailVectorTimes[key].indexOf(startPointIndex);
    var cphStep = ((initCph - minCph) / dimensionSize).toFixed(2);
    var cpvIndex = parseInt(index / dimensionSize); // 维度索引

    var cphIndex = index % dimensionSize; // 同个维度下的轨迹索引

    var cph = (initCph - cphIndex * cphStep).toFixed(2);
    var cpv = (initCpv + cpvIndex * cpvStep).toFixed(2);
    return {
      cph,
      cpv
    };
  },

  /**
   * 过滤掉无效坐标点
   * @param {Array<Array<number, number>>} coors 坐标点集合
   * @return {Array<Array<number, number>>}
   * */
  filterCoordinates(coors) {
    var coordinates = []; // 过滤无效坐标点

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = coors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var point = _step.value;
        if (!(point[0] && point[1])) continue;
        coordinates.push(point);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return coordinates;
  },

  // 计算相同两点相同方向的轨迹（相同矢量）出现的矢量起点索引
  getTheSameTrailVectorTimes(coordinates) {
    var times = {};

    for (var i = 0, len = coordinates.length; i < len - 1; i++) {
      var startPoint = coordinates[i];
      var endPoint = coordinates[i + 1];
      var key = "".concat(startPoint[0], ",").concat(startPoint[1], "--").concat(endPoint[0], ",").concat(endPoint[1]);

      if (times[key]) {
        times[key].push(i);
      } else {
        times[key] = [i];
      }
    }

    return times;
  }

};

/***/ })

/******/ });
});