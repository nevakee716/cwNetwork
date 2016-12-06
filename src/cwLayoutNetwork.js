/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";

    // constructor
    var cwLayoutNetwork = function (options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
        cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations

    };

    // obligatoire appeler par le system
    cwLayoutNetwork.prototype.drawAssociations = function (output, associationTitleText, object) {
        this.network = new cwApi.customLibs.network();
        this.network.searchForNodesAndEdges(object);
        output.push('<div id="cwLayoutNetwork"></div>');
    };


    cwLayoutNetwork.prototype.applyJavaScript = function () {
        var networkContainer = document.getElementById("cwLayoutNetwork");
        networkContainer.setAttribute('style','height:' + window.innerHeight + 'px');
        // provide the data in the vis format
        var data = this.network.getVisData();

          
        var options = {};   
        // initialize your network!
        var network = new vis.Network(networkContainer, data, options);

    
    };

/*    
        require("/layoutLibs/network.js");
        require("/layoutLibs/edge.js");
        require("/layoutLibs/node.js");
        require("/layoutLibs/vis.min.js");
        function require(script) {
        $.ajax({
            url: script,
            dataType: "script",
            async: false,           // <-- This is the key
            success: function () {
                // all good...
            },
            error: function () {
                throw new Error("Could not load script " + script);
            }
        });
    }*/

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));