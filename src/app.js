"use strict";

var React = require('react');
//var EventBus = require('eventbus');
var engine = require('./engine');

var defaultRootPage = engine.createPage("Main Page", "Hello world!");
var wiki = engine.createWiki("Test Wiki", defaultRootPage);
var runtimeArtifact = engine.assembleRuntimeWiki(wiki);
var container = document.getElementById("app");

var Page = React.createClass({
    render: function () {
        var page = this.props.page;
        return <div>
            <h1>{page.title}</h1>
            <div>{page.body}</div>
        </div>
    }
});

React.render(<Page page={runtimeArtifact.root} />, container);