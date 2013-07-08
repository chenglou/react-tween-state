# React animation example

This is an example of touch gestures and animations on React by building a Facebook-like left nav. **Mobile only**.

## Motivations

  * **Mobile first.** It's where the growth is, and where the web performs the worst.
  * **JavaScript only.** To get native-quality interactions, you need ultra-fine-grained control that CSS animations don't give you.
  * **60 frames per second.** No exceptions
  * **Prefer higher quality interactions to higher compatibility.** Tested on iPhone 5 and 4, iPad 3, iOS 6. Seemed to work OK on a Nexus 7.
  * **Application code stays declarative.** React should do all perf work for you (i.e. batching within a single requestAnimationFrame).

## Getting started

  * [Live demo](http://rawgithub.com/petehunt/react-animations/master/index.html)
  * Start hacking by reading `src/example.js`

## Gotchas

  * **It only targets mobile** for panning (or Chrome with "emulate touch events" enabled). Clicking on the list button still works on desktop browsers however.
  * **It uses a custom build of React** to expose `TapEventPlugin` and `ReactUpdates`. I've included the patch against the core.

## Future opportunities

  * **Tween queue.** The easiest way to reason about animations is to do an immediate state update, and then queue the tween for execution after all other tweens complete.
  * **Better easing functions.** Bounce would be nice!

**Please fork, and make this better!**
