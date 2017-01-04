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
        this.network = new cwApi.customLibs.cwLayoutNetwork.network();
        this.network.searchForNodesAndEdges(object);
        output.push('<div id="cwLayoutNetwork"><div id="cwLayoutNetworkFilter"></div><div id="cwLayoutNetworkCanva"></div></div>');
        this.object = object.associations;
    };


    cwLayoutNetwork.prototype.applyJavaScript = function () {
        var that = this;
        var libToLoad = [];

        if(cwAPI.isDebugMode() === true) {
            that.createNetwork();
        } else {
            libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js','modules/vis/vis.min.js'];
            // AsyncLoad
            cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                if(error === null) {
                    that.createNetwork();                
                } else {
                    cwAPI.Log.Error(error);
                }
            });
        }
    };


    cwLayoutNetwork.prototype.createNetwork = function () {    
        var networkContainer = document.getElementById("cwLayoutNetworkCanva");
        var filterContainer = document.getElementById("cwLayoutNetworkFilter");
        var objectTypeNodes = this.network.getObjectTypeNodes();
        var ObjectTypeNode;
        for (ObjectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(ObjectTypeNode)) {
                filterContainer.appendChild(objectTypeNodes[ObjectTypeNode].getFilterObject());
            }
        }

        $('.selectNetworkPicker').selectpicker();

        var canvaHeight = window.innerHeight - networkContainer.getBoundingClientRect().top;
        networkContainer.setAttribute('style','height:' + canvaHeight + 'px');
        
        // provide the data in the vis format
        var nodes = new vis.DataSet(); //this.network.getVisNodes());
        var edges = new vis.DataSet(this.network.getVisEdges()); //this.network.getVisEdges());
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {};   
        // initialize your network!/*# sourceMappingURL=bootstrap.min.css.map */
        this.networkUI = new vis.Network(networkContainer, data, options);
        var that = this;
        $('select.selectNetworkPicker').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var scriptname = $(this).context['id'];
            if(clickedIndex !== undefined) {
                var id = $(this).context[clickedIndex]['id'];
                var nodeId = id + "#" + scriptname;
                if(newValue === false) {
                    nodes.remove(nodeId);
                    that.network.hide(id,scriptname);
                } else {
                    that.network.show(id,scriptname);
                    nodes.add(that.network.getVisNode(id,scriptname));
                }
            } else {
                if($(this).context[0]) {
                    var changeNodesArray = that.network.SetAllAndGetNodesObject(scriptname,$(this).context[0].selected);
                    if($(this).context[0].selected === true) {
                        nodes.add(changeNodesArray);
                    } else {
                        nodes.remove(changeNodesArray);
                    }
                }

            }

        });
    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));