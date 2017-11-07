/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var network = function () {
        this.objectTypeNodes = {};
        this.edges = {};
        this.option = {};
    };

    network.prototype.getObjectTypeNodes = function (object) {
        return this.objectTypeNodes;
    };

    network.prototype.searchForNodesAndEdges = function (object,nodeOptions) {
        var i;
        if(object.hasOwnProperty("children")) {
            for (i = 0; i < object.children.length; i += 1) {
                this.addNode(object.children[i],nodeOptions);
                this.addEdge(object.children[i],object);
                this.searchForNodesAndEdges(object.children[i],nodeOptions);
            }
        } else { // in case of index
            for (i = 0; i < object.length; i += 1) {
                this.addNode(object[i],nodeOptions);
                this.searchForNodesAndEdges(object[i],nodeOptions);
            }    
        }
    };


    network.prototype.addNode = function (object,nodeOptions) {
        if(!this.objectTypeNodes.hasOwnProperty(object.group)) {
            this.objectTypeNodes[object.group] = new cwApi.customLibs.cwLayoutNetwork.objectTypeNode(object.group,object.objectTypeScriptName); 
        }
        this.objectTypeNodes[object.group].addNode(object.object_id,object.name,object.customDisplayString,object.filterArray,nodeOptions);

    };



    network.prototype.applyFilterIn = function (object) {
        var filteredData = [];
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                visData = visData.concat(this.objectTypeNodes[objectType].SetAllAndGetNodesObject(state));
            }
        }  
    };



    network.prototype.ActionAndGetChangeset = function (elements,state) {
        var that = this;
        var changeSet = [];
        var hasChanged; 
        elements.forEach(function(elem) {
            elem.name.replaceAll("\n"," ");
            hasChanged = that.objectTypeNodes[elem.group].changeState(elem.object_id,state);  
            if(hasChanged) { // on check si le node est pas déja présent dans le réseau
                changeSet = changeSet.concat(that.getVisNode(elem.object_id,elem.group));
            }
        });
        return changeSet;
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

    network.prototype.getVisNode = function (id,group,option) {
        var originNode = this.objectTypeNodes[group].getVisData(id);
        var nodesArray = [];
        var result;
        var edges = this.getEdges();
        if(option === undefined || !option.NoOrigin) {
            nodesArray.push(originNode);
        }
        if(option && (option.rangeMin || option.rangeMax)) {
            nodesArray = nodesArray.concat(this.getCloseNodes(originNode.id,edges,option));
        }
        return nodesArray;
    };




    network.prototype.getCloseNodes = function (id,edges,option) {
        var i,tempNode;
        var nodesArray = [];
        for (i = 0; i < edges.length; i += 1) {
            if(option.ImpactTo) { // on cherche les node qui partent de notre node
                if(edges[i].fromUuid === id ) { 
                    tempNode = this.objectTypeNodes[edges[i].toGroup].getVisDataIfDeactivated(edges[i].toId);  
                } else if(edges[i].toUuid === id && edges[i].direction === 'to, from'){// si direction both sur le edge
                    tempNode = this.objectTypeNodes[edges[i].fromGroup].getVisDataIfDeactivated(edges[i].fromId);  
                }
            }
            if(option.ImpactFrom) { // on cherche les node qui viennent de notre node
                if(edges[i].toUuid === id ) { 
                    tempNode = this.objectTypeNodes[edges[i].fromGroup].getVisDataIfDeactivated(edges[i].fromId);  
                } else if(edges[i].fromUuid === id && edges[i].direction === 'to, from'){// si direction both sur le edge
                    tempNode = this.objectTypeNodes[edges[i].toGroup].getVisDataIfDeactivated(edges[i].toId);  
                }
            }

            if(tempNode) {
                if(option.rangeMax) {
                    nodesArray = nodesArray.concat(this.getCloseNodes(tempNode.id,edges,option));
                }
                nodesArray.push(tempNode); 
            }
            tempNode = null;
        }
        return nodesArray;
    };

    network.prototype.changeState = function (id,group,state) {
        this.objectTypeNodes[group].changeState(id,state);     
    };

    network.prototype.hide = function (id,group) {
        this.changeState(id,group,false);
    };

    network.prototype.show = function (id,group) {
        this.changeState(id,group,true);

    };


    network.prototype.addEdge = function (child,object) {
        if(object.name && child.name) {
            var uuid = object.object_id + "#" + object.objectTypeScriptName;
            var uuidChild = child.object_id + "#" + child.objectTypeScriptName;  
            var uuidAsso = uuid + "_" + uuidChild;     
            var uuidAssoReverse = uuidChild + "_" + uuid;       
            if(!this.edges.hasOwnProperty(uuidAsso) && !this.edges.hasOwnProperty(uuidAssoReverse)) { // si aucun edge existe
                if(child.direction === "to") {
                    this.edges[uuidAsso] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid,uuidChild,object.object_id,child.object_id,object.group,child.group,child.direction,child.edge);
                } else {
                    this.edges[uuidAssoReverse] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid,uuidChild,object.object_id,child.object_id,object.group,child.group,child.direction,child.edge);                   
                }
            } else if(this.edges.hasOwnProperty(uuidAsso)) { // si le edge existe déja 
                this.edges[uuidAsso].addEdgeElement(child.direction,child.edge);
            } else if(this.edges.hasOwnProperty(uuidAssoReverse)) { // si le edge reverse existe déja
                this.edges[uuidAssoReverse].addEdgeElement(child.direction,child.edge,true);
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
        if(option === "none") {
            this.option.rangeMax = false;
            this.option.rangeMin = false;          
        }
        if(option === "rangeMin") {
            this.option.rangeMax = false; 
        }
        if(option === "rangeMax") {
            this.option.rangeMin = false; 
        }
        this.option[option] = true;
    };

    network.prototype.DeActivateOption = function (option) {
        this.option[option] = false;        
    };

    network.prototype.getSearchFilterObject = function (nodeID) {

        var filterObject;
        var option,optgroup;

        filterObject = document.createElement("select");
        filterObject.setAttribute('title','<i style="color : black" class="fa fa-search" aria-hidden="true"></i> Focus On');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-size','10');
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-size','10');

        filterObject.className = "selectNetworkSearch_" + nodeID;
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
                object.setAttribute('value',this.objectTypeNodes[objectType].label.replaceAll(" ","_"));
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