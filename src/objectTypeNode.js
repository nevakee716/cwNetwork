/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var objectTypeNode = function (scriptname,label) {
        this.scriptname = scriptname;
        this.label = label;
        this.nodes = {};
    };

    objectTypeNode.prototype.getScriptName = function () {
        return this.scriptname;
    };

    objectTypeNode.prototype.addNode = function (object_id,label) {
        if(!this.nodes.hasOwnProperty(object_id)) {
            this.nodes[object_id] = new cwApi.customLibs.node(object_id,label,false);
        }  
    };


    objectTypeNode.prototype.getAllVisData = function () {
        var visData = [];
        var nodeVisData;
        var node;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                nodeVisData = this.nodes[node].getVisData();
                nodeVisData.group = this.scriptname;
                nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
                visData.push(nodeVisData); 
            }
        }
        return visData;
    };

    objectTypeNode.prototype.getVisData = function (id) {
        var nodeVisData;
        nodeVisData = this.nodes[id].getVisData();
        nodeVisData.group = this.scriptname;
        nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
        return nodeVisData;
    };


    objectTypeNode.prototype.getFilterObject = function () {
        var filterObject;
        var object;
        var node;

        filterObject = document.createElement("select");
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('title',this.label);
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','10');
        filterObject.className = "selectNetworkPicker";
        filterObject.setAttribute('id',this.scriptname);

        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                object = document.createElement("option");
                object.setAttribute('id',this.nodes[node].getId());
                object.textContent = this.nodes[node].getLabel();
                filterObject.appendChild(object);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        return filterObject;
    };

    objectTypeNode.prototype.SetAllAndGetNodesObject = function (state) {
        var nodeVisData;
        var changeStateNodeObject = [];
        var node;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                if(this.nodes[node].getStatus() !== state) {
                    this.nodes[node].setStatus(state);
                    nodeVisData = this.nodes[node].getVisData();
                    nodeVisData.group = this.scriptname;
                    nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
                    changeStateNodeObject.push(nodeVisData); 
                }
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        return changeStateNodeObject;
    };


    objectTypeNode.prototype.changeState = function (id,state) {
        this.nodes[id].setStatus(state);     
    };  


    cwApi.customLibs.objectTypeNode = objectTypeNode;
}(cwAPI, jQuery));