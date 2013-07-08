/**
 * @jsx React.DOM
 */

// pooled obj to save GCs
var EMPTY_STYLE = {};

// Stolen from: http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
function has3d() {
  var el = document.createElement('p'),
  has3d,
  transforms = {
    'webkitTransform':'-webkit-transform',
    'OTransform':'-o-transform',
    'msTransform':'-ms-transform',
    'MozTransform':'-moz-transform',
    'transform':'transform'
  };

    // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (var t in transforms) {
    if (el.style[t] !== undefined) {
      el.style[t] = "translate3d(1px,1px,1px)";
      has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
    }
  }

  document.body.removeChild(el);

  return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
}

var HAS_3D = has3d();

var Sprite = React.createClass({
  getDefaultProps: function() {
    // pooled object to save gcs
    return {x: 0, y: 0};
  },
  componentWillMount: function() {
    // Putting things into and out of vram leads to rendering
    // bugs on chrome, and artifacts on ios6. But we don't
    // want to put everything in 3d always. So we use this to
    // continue to use translate3d on an object if it ever was
    // before.
    this.everWas3d = false;
  },
  getStyle: function() {
    if (!this.props.x && !this.props.y && !this.everWas3d) {
      return EMPTY_STYLE;
    }
    if (HAS_3D) {
      this.everWas3d = true;
      var translate3d = 'translate3d(' + this.props.x + 'px, ' + this.props.y + 'px, 0)';
      return {
        '-webkit-transform': translate3d,
        '-moz-transform': translate3d
      };
    } else {
      return {
        position: 'absolute',
        left: this.props.x,
        top: this.props.y
      };
    }
  },
  render: function() {
    return this.transferPropsTo(
      <div style={this.getStyle()}>{this.props.children}</div>
    );
  }
});

var StaticSprite = React.createClass({
  shouldComponentUpdate: function(nextProps) {
    return !this.props.animating || !nextProps.animating;
  },
  render: function() {
    return this.props.children;
  }
});

window.Sprite = Sprite;