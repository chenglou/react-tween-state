Legend:
  - [I]: improvement
  - [F]: fix

### 0.1.5 (April 28th 2016)
- [I] Move React and React-DOM dependencies to devDependencies. React-tween-state doesn't require React.

### 0.1.4 (November 21th 2015)
- [I] Support for IE9 through `requestAnimationFrame` polyfill. a0b4fb5.
- [I] Used to use `this.isMounted()` internally. Removed that since React might deprecate this. #49.
- [F] If duration's 0, we jump to `config.endValue` immediately, rather than calling the easing function. #52.

### 0.1.3 (July 4th 2015)
- [I] Export everything as default.

## 0.1.1 (June 21th 2015)
**Note**: this version is not compatible with React < 0.13.
- [I] Better API! See the [updated examples](https://github.com/chenglou/react-tween-state/tree/master/examples).
- [I] Library converted to ES7 with Babel.
- [I] Compatible with UMD.
- [F] See the note [here](https://github.com/chenglou/react-tween-state/wiki/Change-from-React-0.12-to-0.13).

### 0.0.5 (March 17th 2015)
**Note**: this is the last release compatible with React < 0.13!
- [I] Small optimizations.
- [F] [#24](https://github.com/chenglou/react-tween-state/issues/24): Prevent error when `onEnd` unmounts the component (through parent).

### 0.0.4 (November 14th 2014)
- [I] Bower support!
- [F] The passed-in config object is no longer mutated.

### 0.0.3 (August 2nd 2014)
- [F] Stop animation after the component's unmounted.

### 0.0.2 (July 25th 2014)
- [I] Delay option. See the updated README.
- [F] Default param not initialized correctly.
- [F] Animation not starting.

## 0.0.0 (July 15th 2014)
- Initial public release.
