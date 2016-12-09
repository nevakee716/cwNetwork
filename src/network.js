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
        var associationNode,i;
        for (associationNode in object.associations) {
            if (object.associations.hasOwnProperty(associationNode)) {
                for (i = 0; i < object.associations[associationNode].length; i += 1) {
                    this.addNode(object.associations[associationNode][i]);
                    this.addEdge(object.associations[associationNode][i],object);
                    this.searchForNodesAndEdges(object.associations[associationNode][i]);
                }
            }
        }
    };


    network.prototype.addNode = function (object) {
        if(!this.objectTypeNodes.hasOwnProperty(object.objectTypeScriptName)) {
            this.objectTypeNodes[object.objectTypeScriptName] = new cwApi.customLibs.objectTypeNode(object.objectTypeScriptName,cwAPI.mm.getObjectType(object.objectTypeScriptName).name); 
        }
        this.objectTypeNodes[object.objectTypeScriptName].addNode(object.object_id,object.properties.name);
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
        //console.log(object.name + " ==> " + child.name);
        if(object.name && child.name) {
            var uuid = object.object_id + "#" + object.objectTypeScriptName;
            var uuidChild = child.object_id + "#" + child.objectTypeScriptName;  
            var uuidAsso = uuid + "_" + uuidChild;     
            var uuidAssoReverse = uuidChild + "_" + uuid;        
            
            if(!this.edges.hasOwnProperty(uuidAsso) && !this.edges.hasOwnProperty(uuidAssoReverse)) {
                this.edges[uuidAsso] = new cwApi.customLibs.edge(uuid,uuidChild);
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

    cwApi.customLibs.network = network;
}(cwAPI, jQuery));