/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var objectTypeNode = function (label,scriptname) {
        this.scriptname = scriptname;
        this.label = label;
        this.nodes = {};
    };

    objectTypeNode.prototype.getScriptName = function () {
        return this.scriptname;
    };

    objectTypeNode.prototype.addNode = function (object_id,label,customDisplayString,icon,filterArray,nodeOptions,networkInfo) {
        if(!this.nodes.hasOwnProperty(object_id)) {
            this.nodes[object_id] = new cwApi.customLibs.cwLayoutNetwork.node(object_id,label,customDisplayString,icon,false,filterArray,nodeOptions,networkInfo);
        }  
    };


    objectTypeNode.prototype.getAllVisData = function () {
        var visData = [];
        var nodeVisData;
        var node;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                nodeVisData = this.nodes[node].getVisData();
                nodeVisData.group = this.label;
                nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
                visData.push(nodeVisData); 
            }
        }
        return visData;
    };

    objectTypeNode.prototype.getVisData = function (id) {
        var nodeVisData;
        nodeVisData = this.nodes[id].getVisData();
        nodeVisData.group = this.label;
        nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
        return nodeVisData;
    };

    objectTypeNode.prototype.getEnabledVisData = function (id) {
        var visData = [];
        var nodeVisData;
        var node;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                nodeVisData = this.nodes[node].getEnabledVisData();
                if(nodeVisData) {
                    nodeVisData.group = this.label;
                    nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
                    visData.push(nodeVisData);
                }

            }
        }
        return visData;

    };

    objectTypeNode.prototype.getAllNodeForSaving = function () {
        var nodeData,nodeDataOut,node,outData = [];
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                nodeData = this.nodes[node].getDataForExport();
                nodeDataOut = {};
                if(nodeData) {
                    nodeDataOut.x = nodeData.x;
                    nodeDataOut.y = nodeData.y;
                    nodeDataOut.name = nodeData.name;
                    nodeDataOut.group = this.label;
                    nodeDataOut.objectTypeScriptName = this.scriptname;
                    nodeDataOut.status = nodeData.status;                    
                    nodeDataOut.id = nodeData.id + "#" + this.scriptname;
                    nodeDataOut.idShort = nodeData.id;
                    outData.push(nodeDataOut);
                }
            }
        }
        return outData;
    };




    objectTypeNode.prototype.getVisDataIfDeactivated = function (id,option) {
        var nodeVisData;
        nodeVisData = this.nodes[id].getVisDataIfDeactivated(option);
        if(nodeVisData) {
            nodeVisData.group = this.label;
            nodeVisData.id = nodeVisData.id + "#" + this.scriptname;        
        }
        return nodeVisData;    
    };


    objectTypeNode.prototype.getFilterObject = function (nodeID,groups) {
        var filterObject;
        var object;
        var node;

        filterObject = document.createElement("select");
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('title',this.label + " " + this.getLegendElement(groups[this.label]));
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','10');
        filterObject.className = "selectNetworkPicker_" + nodeID + " " + this.label.replaceAll(" ","_");
        filterObject.setAttribute('name',this.label);
        filterObject.setAttribute('id',this.label);
        filterObject.setAttribute('scriptname',this.scriptname);

        var array = [];
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                var element = {};
                element.id = this.nodes[node].getId();
                element.label = this.nodes[node].getLabel().replaceAll("\n"," ");
                array.push(element);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        array.sort(function (a, b) {
            var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1;
            if (nameA > nameB)
                return 1;
            return 0; //default return value (no sorting)
        });

        array.forEach(function(element) {
            object = document.createElement("option");
            object.setAttribute('id',element.id);
            object.textContent = element.label; 
            filterObject.appendChild(object);
        });

        return filterObject;
    };

    objectTypeNode.prototype.getLegendElement = function (group) {
        var htmltxt = "";
        if(group && group.shape == "icon") {
            htmltxt += '<i class="fa"';
            if(group.icon.color === undefined) htmltxt += 'style="color : black">';  
            else htmltxt += 'style="color : ' + group.icon.color + '">';        
            htmltxt += group.icon.code;
            htmltxt += '</i>';  
            return htmltxt;         
        } else if(group && (group.shape === "image" || group.shape === "circularImage")) {
            var htmltxt = "";
            htmltxt += '<img class="networkLegendImage" src="' + group.image+ '"></img>';
            return htmltxt; 
        } else if(group && group.shape) {

            htmltxt += '<i class="fa"';
            if(group.shape.color === undefined) htmltxt += 'style="color : black">';  
            else htmltxt += 'style="color : ' + group.icon.color.border + '">';        
            htmltxt += self.shapeToFontAwesome(group.shape);
            htmltxt += '</i>';  
            return htmltxt; 
        }
        return "";
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
                    nodeVisData.group = this.label;
                    nodeVisData.id = nodeVisData.id + "#" + this.scriptname;
                    changeStateNodeObject.push(nodeVisData); 
                }
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        return changeStateNodeObject;
    };


    objectTypeNode.prototype.changeState = function (id,state) {
        return this.nodes[id].setStatus(state);     
    };  


    if (!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if (!cwApi.customLibs.cwLayoutNetwork) {
        cwApi.customLibs.cwLayoutNetwork = {};
    };
    if (!cwApi.customLibs.cwLayoutNetwork.objectTypeNode) {
        cwApi.customLibs.cwLayoutNetwork.objectTypeNode = objectTypeNode;
    }


}(cwAPI, jQuery));