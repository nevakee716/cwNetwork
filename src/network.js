/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

    "use strict";
    // constructor
    var network = function() {
        this.objectTypeNodes = {};
        this.edges = {};
        this.option = {};
    };

    network.prototype.getObjectTypeNodes = function(object) {
        return this.objectTypeNodes;
    };

    network.prototype.searchForNodesAndEdges = function(object, nodeOptions) {
        var i;
        if (object.hasOwnProperty("children")) {
            for (i = 0; i < object.children.length; i += 1) {
                this.addNode(object.children[i], nodeOptions);
                this.addEdge(object.children[i], object);
                this.searchForNodesAndEdges(object.children[i], nodeOptions);
            }
        } else { // in case of index
            for (i = 0; i < object.length; i += 1) {
                this.addNode(object[i], nodeOptions);
                this.searchForNodesAndEdges(object[i], nodeOptions);
            }
        }
    };


    network.prototype.addNode = function(object, nodeOptions) {
        if (!this.objectTypeNodes.hasOwnProperty(object.group)) {
            this.objectTypeNodes[object.group] = new cwApi.customLibs.cwLayoutNetwork.objectTypeNode(object.group, object.objectTypeScriptName);
        }
        this.objectTypeNodes[object.group].addNode(object, nodeOptions);

    };



    network.prototype.applyFilterIn = function(object) {
        var filteredData = [];
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                visData = visData.concat(this.objectTypeNodes[objectType].SetAllAndGetNodesObject(state));
            }
        }
    };



    network.prototype.ActionAndGetChangeset = function(elements, state) {
        var that = this;
        var changeSet = [];
        var hasChanged;
        if (elements) {
            elements.forEach(function(elem) {
                if (elem) {
                    elem.name.replaceAll("\n", " ");
                    hasChanged = that.objectTypeNodes[elem.group].changeState(elem.id, state);
                    if (hasChanged) { // on check si le node est pas déja présent dans le réseau
                        changeSet = changeSet.concat(that.getVisNode(elem.id, elem.group));
                    }
                }
            });
        }
        return changeSet;
    };


    network.prototype.getVisNodes = function() {
        var objectType;
        var visData = [];
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                visData = visData.concat(this.objectTypeNodes[objectType].getAllVisData());
            }
        }
        return visData;
    };

    network.prototype.getEnabledVisNodes = function() {
        var objectType;
        var visDatas = [];
        var visData;

        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                visData = this.objectTypeNodes[objectType].getEnabledVisData();
                visDatas = visDatas.concat(visData);
            }
        }
        return visDatas;
    };

    network.prototype.getAllNodeForSaving = function() {
        var objectType;
        var Datas = [];
        var Data;

        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                Data = this.objectTypeNodes[objectType].getAllNodeForSaving();
                Datas = Datas.concat(Data);
            }
        }
        return Datas;
    };

    network.prototype.updateDisposition = function(config) {
        var self = this,objectType, nodeUpdate, nodeId;


        this.setFullGroups(config.fullGroups);

        try {
            for (nodeId in config.nodes) {
                if (config.nodes.hasOwnProperty(nodeId)) {
                    nodeUpdate = config.nodes[nodeId];
                    if (this.objectTypeNodes[nodeUpdate.group] && this.objectTypeNodes[nodeUpdate.group].nodes[nodeUpdate.id]) {
                        this.objectTypeNodes[nodeUpdate.group].nodes[nodeUpdate.id].updatePostionAndState(nodeUpdate);
                    }
                }
            }
            config.fullGroups.forEach(function(g) {
                self.SetAllAndGetNodesObject(true,g);
            });

        } catch (e) {
            console.log(e);
        }
    };


    network.prototype.setNodesFromChangeset = function(changeSet,value) {
        var self = this;
        if(value === undefined) value = true;

        changeSet.forEach(function(n){
            if (self.objectTypeNodes[n.group] && self.objectTypeNodes[n.group].nodes[n.id]) {
                self.objectTypeNodes[n.group].nodes[n.id].setStatus(value);
            }
        });
    };

    network.prototype.getFullGroups = function() {
        var objectType,r = [];
        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType) && this.objectTypeNodes[objectType].full) {
                r.push(objectType);
            }
        }
        return r;
    };
    
    network.prototype.setFullGroups = function(groups) {
        var self = this;
        if(groups) {
            groups.forEach(function(g) {
                if (self.objectTypeNodes.hasOwnProperty(g)) {
                    self.objectTypeNodes[g].full = true;
                }
            });            
        }
    };


    network.prototype.SetAllAndGetNodesObject = function(state, scriptname) {
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

    network.prototype.getVisNode = function(id, group, option, activeEdges) {
        var originNode = this.objectTypeNodes[group].getVisData(id);
        var nodesArray = [];
        var result;
        var edges = this.getEdges();
        if (option === undefined || !option.NoOrigin) {
            nodesArray.push(originNode);
        }
        if (option && (option.rangeMin || option.rangeMax)) {
            this.tempNodeIds = {};
            nodesArray = nodesArray.concat(this.getCloseNodes(originNode.id, activeEdges, option));
        }
        return nodesArray;
    };



    network.prototype.getCloseNodes = function(id, edges, option) {
        var i, tempNode = null,self=this;
        var nodesArray = [];
        if (this.tempNodeIds[id] === true) {
            return nodesArray;
        } else {
            this.tempNodeIds[id] = true;
        }

        edges.forEach(function(edge) {
            if (edge.hidden === false) {
                if (option.ImpactTo && option.ImpactFrom) { // on cherche les node qui partent de notre node
                    if (edge.from === id) {
                        tempNode = self.objectTypeNodes[edge.toGroup].getVisDataIfDeactivated(edge.toId, option.highlight);
                    } else if (edge.to === id) {
                        tempNode = self.objectTypeNodes[edge.fromGroup].getVisDataIfDeactivated(edge.fromId, option.highlight);
                    }
                }

                if (edge.direction) {
                    if (option.ImpactTo && tempNode === null) { // on cherche les node qui partent de notre node
                        if (edge.from === id && edge.direction.indexOf('to') !== -1) {
                            tempNode = self.objectTypeNodes[edge.toGroup].getVisDataIfDeactivated(edge.toId, option.highlight);
                        } else if (edge.to === id && edge.direction.indexOf('from') !== -1) { // si direction both sur le edge
                            tempNode = self.objectTypeNodes[edge.fromGroup].getVisDataIfDeactivated(edge.fromId, option.highlight);
                        }
                    }
                    if (option.ImpactFrom && tempNode === null) { // on cherche les node qui viennent de notre node
                        if (edge.to === id && edge.direction.indexOf('to') !== -1) {
                            tempNode = self.objectTypeNodes[edge.fromGroup].getVisDataIfDeactivated(edge.fromId, option.highlight);
                        } else if (edge.from === id && edge.direction.indexOf('from') !== -1) { // si direction both sur le edge
                            tempNode = self.objectTypeNodes[edge.toGroup].getVisDataIfDeactivated(edge.toId, option.highlight);
                        }
                    }
                }

                if (tempNode) {
                    if (option.rangeMax) {
                        nodesArray = nodesArray.concat(self.getCloseNodes(tempNode.id, edges, option));
                    }
                    if (tempNode.alreadyInNetwork !== true || option.highlight) {
                        nodesArray.push(tempNode);
                    }
                }
                tempNode = null;
            }
        });
        return nodesArray;
    };

    network.prototype.changeState = function(id, group, state) {
        this.objectTypeNodes[group].changeState(id, state);
    };

    network.prototype.hide = function(id, group) {
        this.changeState(id, group, false);
    };

    network.prototype.show = function(id, group) {
        this.changeState(id, group, true);

    };


    network.prototype.addEdge = function(child, object) {
        if (object.name && child.name) {
            var uuid = object.id;
            var uuidChild = child.id;
            var uuidAsso = uuid + "_" + uuidChild;
            var uuidAssoReverse = uuidChild + "_" + uuid;
            if (!this.edges.hasOwnProperty(uuidAsso) && !this.edges.hasOwnProperty(uuidAssoReverse)) { // si aucun edge existe
                if (child.direction === "from") {
                    this.edges[uuidAssoReverse] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid, uuidChild, object.id, child.id, object.group, child.group, child.direction, child.edge);
                } else {
                    this.edges[uuidAsso] = new cwApi.customLibs.cwLayoutNetwork.edge(uuid, uuidChild, object.id, child.id, object.group, child.group, child.direction, child.edge);
                }
            } else if (this.edges.hasOwnProperty(uuidAsso)) { // si le edge existe déja 
                this.edges[uuidAsso].addEdgeElement(child.direction, child.edge);
            } else if (this.edges.hasOwnProperty(uuidAssoReverse)) { // si le edge reverse existe déja
                this.edges[uuidAssoReverse].addEdgeElement(child.direction, child.edge, true);
            }
        }
    };

    network.prototype.getVisEdges = function() {
        var edges = [];
        var edge;
        for (edge in this.edges) {
            if (this.edges.hasOwnProperty(edge)) {
                edges.push(this.edges[edge].getVisData());
            }
        }
        return edges;
    };

    network.prototype.getEdges = function() {
        var edges = [];
        var edge;
        for (edge in this.edges) {
            if (this.edges.hasOwnProperty(edge)) {
                edges.push(this.edges[edge].getEdge());
            }
        }
        return edges;
    };

    network.prototype.getVisData = function() {

        var nodes = this.getVisNodes();
        var edges = this.getVisEdges();
        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        return data;
    };

    network.prototype.ActivateOption = function(option) {
        if (option === "none") {
            this.option.rangeMax = false;
            this.option.rangeMin = false;
        }
        if (option === "rangeMin") {
            this.option.rangeMax = false;
        }
        if (option === "rangeMax") {
            this.option.rangeMin = false;
        }
        this.option[option] = true;
    };

    network.prototype.DeActivateOption = function(option) {
        this.option[option] = false;
    };

    network.prototype.getSearchFilterObject = function(nodeID) {

        var filterObject;
        var option, optgroup;

        filterObject = document.createElement("select");
        filterObject.setAttribute('title', '<i style="color : black" class="fa fa-search" aria-hidden="true"></i> ' + $.i18n.prop('focus_on'));
        filterObject.setAttribute('data-selected-text-format', 'static');
        filterObject.setAttribute('data-size', '10');
        filterObject.setAttribute('data-live-search', 'true');
        filterObject.setAttribute('data-selected-text-format', 'static');
        filterObject.setAttribute('data-size', '10');

        filterObject.className = "selectNetworkSearch_" + nodeID;
        return filterObject;

    };

    network.prototype.getFilterClusterByGroupHead = function(className) {
        var filterObject;
        var object, objectType, node;

        filterObject = document.createElement("select");
        filterObject.className = className + "_head";
        filterObject.setAttribute('title', $.i18n.prop('head_group'));

        //Creation du None
        object = document.createElement("option");
        object.setAttribute('id', 0);
        object.textContent = 'None';
        filterObject.appendChild(object);

        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                object = document.createElement("option");
                object.setAttribute('value', this.objectTypeNodes[objectType].label.replaceAll(" ", "_"));
                object.textContent = this.objectTypeNodes[objectType].label;
                filterObject.appendChild(object);
            }
        }
        return filterObject;
    };

    network.prototype.getFilterClusterByGroupChilds = function(className) {
        var filterObject;
        var object, objectType, node;

        filterObject = document.createElement("select");
        filterObject.className = className + "_child";
        filterObject.setAttribute('title', $.i18n.prop('child_group'));
        filterObject.setAttribute('multiple', '');


        for (objectType in this.objectTypeNodes) {
            if (this.objectTypeNodes.hasOwnProperty(objectType)) {
                object = document.createElement("option");
                object.setAttribute('value', this.objectTypeNodes[objectType].label.replaceAll(" ", "_"));
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