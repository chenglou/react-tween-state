## React tweenState example

- `npm install`
- `npm run build`
- Open `index.html`

### Example 1

The increasing counter showcases a typical API for 90% of the use-cases. Note that, since we're simply tweening state values rather than CSS properties, we can apply the transition to even an on-screen number, rather than being restrained to, say, `height` and `top`.

### Example 2

This is an advanced example which both showcases how to tween nested collection values in the state, and why the library defaults to additive animation, just like iOS 8. Try interrupting the animation quickly to see where the flaw of the second one is. Further info [here](http://ronnqvi.st/multiple-animations/).
