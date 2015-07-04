(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["tweenState"] = factory();
	else
		root["tweenState"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/*!*****************!*\
  !*** multi lib ***!
  \*****************/
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./index.js */160);


/***/ },

/***/ 160:
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _tweenFunctions = __webpack_require__(/*! tween-functions */ 161);
	
	var _tweenFunctions2 = _interopRequireDefault(_tweenFunctions);
	
	// additive is the new iOS 8 default. In most cases it simulates a physics-
	// looking overshoot behavior (especially with easeInOut. You can test that in
	// the example
	var DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
	var DEFAULT_EASING = _tweenFunctions.easeInOutQuad;
	var DEFAULT_DURATION = 300;
	var DEFAULT_DELAY = 0;
	
	var stackBehavior = {
	  ADDITIVE: 'ADDITIVE',
	  DESTRUCTIVE: 'DESTRUCTIVE'
	};
	var Mixin = {
	  getInitialState: function getInitialState() {
	    return {
	      tweenQueue: []
	    };
	  },
	
	  tweenState: function tweenState(path, _ref) {
	    var _this = this;
	
	    var easing = _ref.easing;
	    var duration = _ref.duration;
	    var delay = _ref.delay;
	    var beginValue = _ref.beginValue;
	    var endValue = _ref.endValue;
	    var onEnd = _ref.onEnd;
	    var configSB = _ref.stackBehavior;
	
	    this.setState(function (state) {
	      var cursor = state;
	      var stateName = undefined;
	      // see comment below on pash hash
	      var pathHash = undefined;
	      if (typeof path === 'string') {
	        stateName = path;
	        pathHash = path;
	      } else {
	        for (var i = 0; i < path.length - 1; i++) {
	          cursor = cursor[path[i]];
	        }
	        stateName = path[path.length - 1];
	        pathHash = path.join('|');
	      }
	      // see the reasoning for these defaults at the top of file
	      var newConfig = {
	        easing: easing || DEFAULT_EASING,
	        duration: duration == null ? DEFAULT_DURATION : duration,
	        delay: delay == null ? DEFAULT_DELAY : delay,
	        beginValue: beginValue == null ? cursor[stateName] : beginValue,
	        endValue: endValue,
	        onEnd: onEnd,
	        stackBehavior: configSB || DEFAULT_STACK_BEHAVIOR
	      };
	
	      var newTweenQueue = state.tweenQueue;
	      if (newConfig.stackBehavior === stackBehavior.DESTRUCTIVE) {
	        newTweenQueue = state.tweenQueue.filter(function (item) {
	          return item.pathHash !== pathHash;
	        });
	      }
	
	      // we store path hash, so that during value retrieval we can use hash
	      // comparison to find the path. See the kind of shitty thing you have to
	      // do when you don't have value comparison for collections?
	      newTweenQueue.push({
	        pathHash: pathHash,
	        config: newConfig,
	        initTime: Date.now() + newConfig.delay
	      });
	
	      // sorry for mutating. For perf reasons we don't want to deep clone.
	      // guys, can we please all start using persistent collections so that
	      // we can stop worrying about nonesense like this
	      cursor[stateName] = newConfig.endValue;
	      if (newTweenQueue.length === 1) {
	        _this.startRaf();
	      }
	
	      // this will also include the above mutated update
	      return { tweenQueue: newTweenQueue };
	    });
	  },
	
	  getTweeningValue: function getTweeningValue(path) {
	    var state = this.state;
	
	    var tweeningValue = undefined;
	    var pathHash = undefined;
	    if (typeof path === 'string') {
	      tweeningValue = state[path];
	      pathHash = path;
	    } else {
	      tweeningValue = state;
	      for (var i = 0; i < path.length; i++) {
	        tweeningValue = tweeningValue[path[i]];
	      }
	      pathHash = path.join('|');
	    }
	    var now = Date.now();
	
	    for (var i = 0; i < state.tweenQueue.length; i++) {
	      var item = state.tweenQueue[i];
	      if (item.pathHash !== pathHash) {
	        continue;
	      }
	
	      var progressTime = now - item.initTime > item.config.duration ? item.config.duration : Math.max(0, now - item.initTime);
	      // `now - item.initTime` can be negative if initTime is scheduled in the
	      // future by a delay. In this case we take 0
	
	      var contrib = -item.config.endValue + item.config.easing(progressTime, item.config.beginValue, item.config.endValue, item.config.duration);
	      tweeningValue += contrib;
	    }
	
	    return tweeningValue;
	  },
	
	  _rafCb: function _rafCb() {
	    var state = this.state;
	    if (state.tweenQueue.length === 0) {
	      return;
	    }
	
	    var now = Date.now();
	    var newTweenQueue = [];
	
	    for (var i = 0; i < state.tweenQueue.length; i++) {
	      var item = state.tweenQueue[i];
	      if (now - item.initTime < item.config.duration) {
	        newTweenQueue.push(item);
	      } else {
	        item.config.onEnd && item.config.onEnd();
	      }
	    }
	
	    // onEnd might trigger a parent callback that removes this component
	    if (!this.isMounted()) {
	      return;
	    }
	
	    this.setState({
	      tweenQueue: newTweenQueue
	    });
	
	    requestAnimationFrame(this._rafCb);
	  },
	
	  startRaf: function startRaf() {
	    requestAnimationFrame(this._rafCb);
	  }
	};
	
	exports['default'] = {
	  Mixin: Mixin,
	  easingTypes: _tweenFunctions2['default'],
	  stackBehavior: stackBehavior
	};
	module.exports = exports['default'];

	// TODO: some funcs accept a 5th param

/***/ },

/***/ 161:
/*!************************************!*\
  !*** ./~/tween-functions/index.js ***!
  \************************************/
/***/ function(module, exports) {

	'use strict';
	
	// t: current time, b: beginning value, _c: final value, d: total duration
	var tweenFunctions = {
	  linear: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * t / d + b;
	  },
	  easeInQuad: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * (t /= d) * t + b;
	  },
	  easeOutQuad: function(t, b, _c, d) {
	    var c = _c - b;
	    return -c * (t /= d) * (t - 2) + b;
	  },
	  easeInOutQuad: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d / 2) < 1) {
	      return c / 2 * t * t + b;
	    } else {
	      return -c / 2 * ((--t) * (t - 2) - 1) + b;
	    }
	  },
	  easeInCubic: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * (t /= d) * t * t + b;
	  },
	  easeOutCubic: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * ((t = t / d - 1) * t * t + 1) + b;
	  },
	  easeInOutCubic: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d / 2) < 1) {
	      return c / 2 * t * t * t + b;
	    } else {
	      return c / 2 * ((t -= 2) * t * t + 2) + b;
	    }
	  },
	  easeInQuart: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * (t /= d) * t * t * t + b;
	  },
	  easeOutQuart: function(t, b, _c, d) {
	    var c = _c - b;
	    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	  },
	  easeInOutQuart: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d / 2) < 1) {
	      return c / 2 * t * t * t * t + b;
	    } else {
	      return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	    }
	  },
	  easeInQuint: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * (t /= d) * t * t * t * t + b;
	  },
	  easeOutQuint: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	  },
	  easeInOutQuint: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d / 2) < 1) {
	      return c / 2 * t * t * t * t * t + b;
	    } else {
	      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	    }
	  },
	  easeInSine: function(t, b, _c, d) {
	    var c = _c - b;
	    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	  },
	  easeOutSine: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * Math.sin(t / d * (Math.PI / 2)) + b;
	  },
	  easeInOutSine: function(t, b, _c, d) {
	    var c = _c - b;
	    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	  },
	  easeInExpo: function(t, b, _c, d) {
	    var c = _c - b;
	    var _ref;
	    return (_ref = t === 0) !== null ? _ref : {
	      b: c * Math.pow(2, 10 * (t / d - 1)) + b
	    };
	  },
	  easeOutExpo: function(t, b, _c, d) {
	    var c = _c - b;
	    var _ref;
	    return (_ref = t === d) !== null ? _ref : b + {
	      c: c * (-Math.pow(2, -10 * t / d) + 1) + b
	    };
	  },
	  easeInOutExpo: function(t, b, _c, d) {
	    var c = _c - b;
	    if (t === 0) {
	      b;
	    }
	    if (t === d) {
	      b + c;
	    }
	    if ((t /= d / 2) < 1) {
	      return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
	    } else {
	      return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	    }
	  },
	  easeInCirc: function(t, b, _c, d) {
	    var c = _c - b;
	    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	  },
	  easeOutCirc: function(t, b, _c, d) {
	    var c = _c - b;
	    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	  },
	  easeInOutCirc: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d / 2) < 1) {
	      return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
	    } else {
	      return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	    }
	  },
	  easeInElastic: function(t, b, _c, d) {
	    var c = _c - b;
	    var a, p, s;
	    s = 1.70158;
	    p = 0;
	    a = c;
	    if (t === 0) {
	      b;
	    } else if ((t /= d) === 1) {
	      b + c;
	    }
	    if (!p) {
	      p = d * 0.3;
	    }
	    if (a < Math.abs(c)) {
	      a = c;
	      s = p / 4;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	  },
	  easeOutElastic: function(t, b, _c, d) {
	    var c = _c - b;
	    var a, p, s;
	    s = 1.70158;
	    p = 0;
	    a = c;
	    if (t === 0) {
	      b;
	    } else if ((t /= d) === 1) {
	      b + c;
	    }
	    if (!p) {
	      p = d * 0.3;
	    }
	    if (a < Math.abs(c)) {
	      a = c;
	      s = p / 4;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	  },
	  easeInOutElastic: function(t, b, _c, d) {
	    var c = _c - b;
	    var a, p, s;
	    s = 1.70158;
	    p = 0;
	    a = c;
	    if (t === 0) {
	      b;
	    } else if ((t /= d / 2) === 2) {
	      b + c;
	    }
	    if (!p) {
	      p = d * (0.3 * 1.5);
	    }
	    if (a < Math.abs(c)) {
	      a = c;
	      s = p / 4;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    if (t < 1) {
	      return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	    } else {
	      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	    }
	  },
	  easeInBack: function(t, b, _c, d, s) {
	    var c = _c - b;
	    if (s === void 0) {
	      s = 1.70158;
	    }
	    return c * (t /= d) * t * ((s + 1) * t - s) + b;
	  },
	  easeOutBack: function(t, b, _c, d, s) {
	    var c = _c - b;
	    if (s === void 0) {
	      s = 1.70158;
	    }
	    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	  },
	  easeInOutBack: function(t, b, _c, d, s) {
	    var c = _c - b;
	    if (s === void 0) {
	      s = 1.70158;
	    }
	    if ((t /= d / 2) < 1) {
	      return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
	    } else {
	      return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
	    }
	  },
	  easeInBounce: function(t, b, _c, d) {
	    var c = _c - b;
	    var v;
	    v = tweenFunctions.easeOutBounce(d - t, 0, c, d);
	    return c - v + b;
	  },
	  easeOutBounce: function(t, b, _c, d) {
	    var c = _c - b;
	    if ((t /= d) < 1 / 2.75) {
	      return c * (7.5625 * t * t) + b;
	    } else if (t < 2 / 2.75) {
	      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
	    } else if (t < 2.5 / 2.75) {
	      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
	    } else {
	      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
	    }
	  },
	  easeInOutBounce: function(t, b, _c, d) {
	    var c = _c - b;
	    var v;
	    if (t < d / 2) {
	      v = tweenFunctions.easeInBounce(t * 2, 0, c, d);
	      return v * 0.5 + b;
	    } else {
	      v = tweenFunctions.easeOutBounce(t * 2 - d, 0, c, d);
	      return v * 0.5 + c * 0.5 + b;
	    }
	  }
	};
	
	module.exports = tweenFunctions;


/***/ }

/******/ })
});
;
//# sourceMappingURL=index.js.map