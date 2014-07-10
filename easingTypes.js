// Lifted from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js (BSD license)
// Based on Robert Penner's easing equations

var easingTypes = {
  // t: current time, b: beginning value, c: change in value, d: duration

  // new note: I much prefer specifying the final value rather than the change
  // in value this is what the repo's interpolation plugin api will use. Here,
  // c will stand for final value
  easeInQuad: function (t, b, _c, d) {
    var c = _c - b;
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (t, b, _c, d) {
    var c = _c - b;
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInQuint: function (t, b, _c, d) {
    var c = _c - b;
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (t, b, _c, d) {
    var c = _c - b;
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (t, b, _c, d) {
    var c = _c - b;
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (t, b, _c, d) {
    var c = _c - b;
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (t, b, _c, d) {
    var c = _c - b;
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (t, b, _c, d) {
    var c = _c - b;
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (t, b, _c, d) {
    var c = _c - b;
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (t, b, _c, d) {
    var c = _c - b;
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (t, b, _c, d) {
    var c = _c - b;
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (t, b, _c, d) {
    var c = _c - b;
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (t, b, _c, d) {
    var c = _c - b;
    return c - this.easeOutBounce (d-t, 0, c, d) + b;
  },
  easeOutBounce: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (t, b, _c, d) {
    var c = _c - b;
    if (t < d/2) return this.easeInBounce (t*2, 0, c, d) * .5 + b;
    return this.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
};

window.easingTypes = easingTypes;
