var App1 = require('./example1.jsx');
var App2 = require('./example2.jsx');
var React = require('react');
var ReactDOM = require('react-dom');

ReactDOM.render(<App1 />, document.querySelector('#content1'));
ReactDOM.render(<App2 />, document.querySelector('#content2'));
