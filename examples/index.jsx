var App1 = require('./example1');
var App2 = require('./example2');
var React = require('react');

React.render(<App1 />, document.querySelector('#content1'));
React.render(<App2 />, document.querySelector('#content2'));
