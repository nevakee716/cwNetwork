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

    network.prototype.SetAllAndGetNodesObject = function (state,scriptname) {
        var objectType;
        var visData = [];
        if (scriptname && this.objectTypeNodes.hasOwnProperty(scriptname)) {
            visData = this.objectTypeNodes[scriptname].SetAllAndGetNodesObject(state);
        } else {
            for (objectType in this.objectTypeNodes) {
                if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                    visData = visData.concat(this.objectTypeNodes[objectType].SetAllAndGetNodesObject(state));
                }
            }    
        }
        return visData;    
    };

    network.prototype.getVisNode = function (id,scriptname) {
        if(this.range) {
            var originNode = this.objectTypeNodes[scriptname].getVisData(id);
            var nodesArray = [];
            nodesArray.push(originNode);
            var edges = this.getEdges();
            var i,tempNode;
            for (i = 0; i < edges.length; i += 1) {
                if(edges[i].fromUuid === originNode.id) {
                    tempNode = this.objectTypeNodes[edges[i].toGroup].getVisDataIfDeactivated(edges[i].toId);  
                }
                if(edges[i].toUuid === originNode.id) {
                    tempNode = this.objectTypeNodes[edges[i].fromGroup].getVisDataIfDeactivated(edges[i].fromId);                    
                }
                if(tempNode) {
                    nodesArray.push(tempNode); 
                }
                tempNode = null;
            }
            return nodesArray;
        } else {
            return this.objectTypeNodes[scriptname].getVisData(id);                
        }
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
                this.edges[uuidAsso] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid,uuidChild,object.object_id,child.object_id,object.group,child.group,child.direction);
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

    network.prototype.getEdges = function () {
        var edges = [];
        var edge ;
        for (edge in this.edges) {
            if(this.edges.hasOwnProperty(edge)) {
                edges.push(this.edges[edge].getEdge());
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

    network.prototype.ActivateOption = function (option) {
        this[option] = true;
    };

    network.prototype.DeActivateOption = function (option) {
        this[option] = false;        
    };

    network.prototype.getFilterOptions = function () {

      var filterObject;
        var object;
        var node;

        filterObject = document.createElement("select");
        filterObject.setAttribute('title','Options');
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-size','10');
        filterObject.className = "selectNetworkOptions";


        object = document.createElement("option");
        object.setAttribute('id',"range");
        object.textContent = "Impact Range";
        filterObject.appendChild(object);                                                                                                                                                                                                                                                                                                                                                                                                     

        return filterObject;
    };

    network.prototype.getFilterAllGroups = function () {

      var filterObject;
        var object,objectType,node;

        filterObject = document.createElement("select");
        filterObject.setAttribute('title','All Objects Groups');
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-size','10');
        filterObject.className = "selectNetworkAllGroups";   
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                object = document.createElement("option");
                object.setAttribute('id',this.objectTypeNodes[objectType].label.replace(" ","_"));
                object.textContent = this.objectTypeNodes[objectType].label;
                filterObject.appendChild(object);       
            }
        }   
        return filterObject;
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