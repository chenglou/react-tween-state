# [React](http://facebook.github.io/react/) Tween State

The equivalent of React's `this.setState`, but for animated tweening: `this.tweenState`.

[Live demo](https://rawgit.com/chenglou/react-tween-state/master/examples/index.html) and [source](https://github.com/chenglou/react-tween-state/tree/master/examples).

Npm:
```sh
npm install react-tween-state
```

Bower:
```sh
bower install react-tween-state
```

*For Bower*: the single source file is `index-bower.js`, not `index.js`.

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

### General

#### `this.tweenState(stateNameString, configurationObject)`

This immediately calls `setState` on your state name under the hood, and also creates a virtual "layer", in which your state didn't jump straight to the final value: rather, it is being tweened. `this.getTweeningValue(stateNameString)` lets you access the tweening value on that layer. Formal API below.

`stateNameString` is the name of the state you want to tween.

`configurationObject` is an object of the following format:

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

  - `easing` (default: `tweenState.easingTypes.easeInOutQuad`): the interpolation function used. react-tween-state provides [frequently used interpolation](https://github.com/chenglou/react-tween-state/blob/master/easingTypes.js) (all exposed inside `tweenState.easingTypes`). In case you ever create your own, the function signature is: `(currentTime: Number, beginValue: Number, endValue: Number, totalDuration: Number): Number`.
  - `duration` (default: `300`).
  - `delay` (default: `0`). *
  - `beginValue` (default: the current value the state being tweened, `this.state[stateNameString]`).
  - `endValue`.
  - `onEnd`: the callback to trigger when the animation's done. **
  - `stackBehavior` (default: `tweenState.stackBehavior.ADDITIVE`). Subsequent tweening to the same state value will be stacked (added together). This gives a smooth tweening effect that is iOS 8's new default. [This blog post](http://ronnqvi.st/multiple-animations/) describes it well. The other option is `tweenState.stackBehavior.DESTRUCTIVE`, which replaces all current animations of that state value by this new one.

\* For a destructive animation, starting the next one with a delay still immediately kills the previous tween. If that's not your intention, try `setTimeout` or additive animation.

\*\* For an additive animation, since the tweens stack and never get destroyed, the end callback is effectively fired at the end of `duration`.

#### `this.getTweeningValue(stateNameString)`

After you call `this.tweenState(...)`, the state value is set just like after a normal `setState()`. To actually get the current, tweening value of that state, you'd use `this.getTweeningValue(stateNameString)` (typically used in `render`).

### Advanced

#### `this.tweenState(stateRefFunction, stateNameString, configurationObject)`

Sometimes, you want to tween not `this.state.myValue`, but the value in `this.state.myObject.myArray[4]`, in which case passing only a string of the state name isn't enough. The second form of `tweenState()` accepts a function and expects you to return the state path of the value you tween, like this:

```js
getInitialState: function() {
  return {
    rectangles: [
      {x: 10, y: 20},
      {x: 10, y: 40}
    ]
  };
}
// ... tween this.state.rectangles[0].x
this.tweenState(function(state) {return state.rectangles[0]}, 'x', configurationObject);
```

`configurationObject` is the same.

#### `this.getTweeningValue(stateRefFunction, stateNameString)`

See above. Usage: `this.getTweeningValue(function(state) {return state.rectangles[0]}, 'x')`.

## Goal of this library

React's powerful model allows us to build apps the functional way. Having a sensible API for animation is a less explored area. This library leverages React's concept of state and render to let you specify transitions declaratively. If everything goes alright, we can make React expose powerful hooks to make this even better.

Part of a few animation API experimentations.

## License
BSD.
