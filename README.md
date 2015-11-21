# [React](http://facebook.github.io/react/) Tween State

The equivalent of React's `this.setState`, but for animated tweens: `this.tweenState`.

[Live demo](https://rawgit.com/chenglou/react-tween-state/master/examples/index.html) and [source](https://github.com/chenglou/react-tween-state/tree/master/examples).

Npm:
```sh
npm install react-tween-state
```

Bower:
```sh
bower install react-tween-state
```

## API

Example usage:

```js
var tweenState = require('react-tween-state');
var React = require('react');

var App = React.createClass({
  mixins: [tweenState.Mixin],
  getInitialState: function() {
    return {left: 0};
  },
  handleClick: function() {
    this.tweenState('left', {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 500,
      endValue: this.state.left === 0 ? 400 : 0
    });
  },
  render: function() {
    var style = {
      position: 'absolute',
      width: 50,
      height: 50,
      backgroundColor: 'lightblue',
      left: this.getTweeningValue('left')
    };
    return <div style={style} onClick={this.handleClick} />;
  }
});
```

The library exports `Mixin`, `easingTypes` and `stackBehavior`.

#### `this.tweenState(path: String | Array<String>, configuration: Object)`

This first calls `setState` **and puts your fields straight to their final value**. Under the hood, it creates a layer that interpolates from the old value to the new. You can retrieve that tweening value using `getTweeningValue` below.

`path` is the name of the state field you want to tween. If it's deeply nested, e.g. to animate `c` in {a: {b: {c: 1}}}, provide the path as `['a', 'b', 'c']`

`configuration` is of the following format:

```js
{
  easing: easingFunction,
  duration: timeInMilliseconds,
  delay: timeInMilliseconds,
  beginValue: aNumber,
  endValue: aNumber,
  onEnd: endCallback,
  stackBehavior: behaviorOption
}
```

  - `easing` (default: `easingTypes.easeInOutQuad`): the interpolation function used. react-tween-state provides [frequently used interpolation](https://github.com/chenglou/tween-functions/blob/master/index.js) (exposed under `easingTypes`). To plug in your own, the function signature is: `(currentTime: Number, beginValue: Number, endValue: Number, totalDuration: Number): Number`.
  - `duration` (default: `300`).
  - `delay` (default: `0`). *
  - `beginValue` (default: the current value of the state field).
  - `endValue`.
  - `onEnd`: the callback to trigger when the animation's done. **
  - `stackBehavior` (default: `stackBehavior.ADDITIVE`). Subsequent tween to the same state value will be stacked (added together). This gives a smooth tween effect that is iOS 8's new default. [This blog post](http://ronnqvi.st/multiple-animations/) describes it well. The other option is `stackBehavior.DESTRUCTIVE`, which replaces all current animations of that state value by this new one.

\* For a destructive animation, starting the next one with a delay still immediately kills the previous tween. If that's not your intention, try `setTimeout` or additive animation. `DESTRUCTIVE` + `duration` 0 effectively cancels all in-flight animations, **skipping the easing function**.

\*\* For an additive animation, since the tweens stack and never get destroyed, the end callback is effectively fired at the end of `duration`.

#### `this.getTweeningValue(path: String | Array<String>)`
Get the current tweening value of the state field. Typically used in `render`.

## License
BSD.
