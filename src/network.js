/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var network = function () {
        this.objectTypeNodes = {};
        this.edges = {};
    };

    network.prototype.getObjectTypeNodes = function (object) {
        return this.objectTypeNodes;
    };

    network.prototype.searchForNodesAndEdges = function (object) {
        var i;
        if(object.hasOwnProperty("children")) {
            for (i = 0; i < object.children.length; i += 1) {
                this.addNode(object.children[i]);
                this.addEdge(object.children[i],object);
                this.searchForNodesAndEdges(object.children[i]);
            }
        } else { // in case of index
            for (i = 0; i < object.length; i += 1) {
                this.addNode(object[i]);
                this.searchForNodesAndEdges(object[i]);
            }    
        }
    };


    network.prototype.addNode = function (object) {
        if(!this.objectTypeNodes.hasOwnProperty(object.group)) {
            this.objectTypeNodes[object.group] = new cwApi.customLibs.cwLayoutNetwork.objectTypeNode(object.group,object.objectTypeScriptName); 
        }
        this.objectTypeNodes[object.group].addNode(object.object_id,object.name);
    };

    network.prototype.getVisNodes = function () {
        var objectType ;
        var visData = [];
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                visData = visData.concat(this.objectTypeNodes[objectType].getVisData());
            }
        }    
        return visData;    
    };

    network.prototype.SetAllAndGetNodesObject = function (scriptname,state) {
        if (this.objectTypeNodes.hasOwnProperty(scriptname)) {
            return this.objectTypeNodes[scriptname].SetAllAndGetNodesObject(state);
        }    
        return null;    
    };

    network.prototype.getVisNode = function (id,scriptname) {
        return this.objectTypeNodes[scriptname].getVisData(id);    
    };

    network.prototype.changeState = function (id,scriptname,state) {
        this.objectTypeNodes[scriptname].changeState(id,state);     
    };

    network.prototype.hide = function (id,scriptname) {
        this.changeState(id,scriptname,false);
    };

    network.prototype.show = function (id,scriptname) {
        this.changeState(id,scriptname,true);

    };


    network.prototype.addEdge = function (child,object) {
        if(object.name && child.name) {
            var uuid = object.object_id + "#" + object.objectTypeScriptName;
            var uuidChild = child.object_id + "#" + child.objectTypeScriptName;  
            var uuidAsso = uuid + "_" + uuidChild;     
            var uuidAssoReverse = uuidChild + "_" + uuid;        
            
            if(!this.edges.hasOwnProperty(uuidAsso) && !this.edges.hasOwnProperty(uuidAssoReverse)) {
                this.edges[uuidAsso] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid,uuidChild,child.direction);
            }   
        }
        
    };

    network.prototype.getVisEdges = function () {
        var edges = [];
        var edge ;
        for (edge in this.edges) {
            if(this.edges.hasOwnProperty(edge)) {
                edges.push(this.edges[edge].getVisData());
            }
        }    
        return edges;    
    };

    network.prototype.getVisData = function () {

        var nodes = this.getVisNodes();
        var edges = this.getVisEdges();
        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        return data;
    };



    network.prototype.getExempleVisData = function () {

        var nodes = new vis.DataSet([
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ]);

        
        // create an array with edges
        var edges = new vis.DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5}
        ]);

        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        return data;
    };

    if (!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if (!cwApi.customLibs.cwLayoutNetwork) {
        cwApi.customLibs.cwLayoutNetwork = {};
    };
    if (!cwApi.customLibs.cwLayoutNetwork.network) {
        cwApi.customLibs.cwLayoutNetwork.network = network;
    }

}(cwAPI, jQuery));