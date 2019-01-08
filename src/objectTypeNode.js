/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var objectTypeNode = function (label,scriptname) {
        this.scriptname = scriptname;
        this.label = label;
        this.nodes = {};
        this.full = false;
    };

    objectTypeNode.prototype.getScriptName = function () {
        return this.scriptname;
    };

    objectTypeNode.prototype.addNode = function (obj,nodeOptions) {
        if(!this.nodes.hasOwnProperty(obj.id)) {
            this.nodes[obj.id] = new cwApi.customLibs.cwLayoutNetwork.node(obj,nodeOptions);
        }  
    };


    objectTypeNode.prototype.getAllVisData = function () {
        var visData = [];
        var nodeVisData;
        var node;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                visData.push(this.getVisData(node)); 
            }
        }
        return visData;
    };

    objectTypeNode.prototype.getVisData = function (id) {
        var nodeVisData;
        nodeVisData = this.nodes[id].getVisData();
        nodeVisData.group = this.label;
        nodeVisData.objectTypeScriptName = this.scriptname;
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
                    nodeVisData.objectTypeScriptName = this.scriptname;
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
                    nodeDataOut.id = nodeData.id;
                    nodeDataOut.idShort = nodeData.object_id;
                    outData.push(nodeDataOut);
                }
            }
        }
        return outData;
    };

    objectTypeNode.prototype.SetAllAndGetNodesObject = function (state) {
        var nodeVisData;
        var changeStateNodeObject = [];
        var node;
        this.full = state;
        for (node in this.nodes) {
            if (this.nodes.hasOwnProperty(node)) {
                if(this.nodes[node].getStatus() !== state) {
                    this.nodes[node].setStatus(state);
                    changeStateNodeObject.push(this.getVisData(node)); 
                }
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        return changeStateNodeObject;
    };


    objectTypeNode.prototype.getVisDataIfDeactivated = function (id,option) {
        var nodeVisData;
        nodeVisData = this.nodes[id].getVisDataIfDeactivated(option);
        if(nodeVisData) {
            nodeVisData.group = this.label;
            nodeVisData.objectTypeScriptname = this.scriptname;
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
            if(group.color.border === undefined) htmltxt += 'style="color : black">';  
            else htmltxt += 'style="color : ' + group.color.border + '">';        
            htmltxt += unescape('%u' + this.shapeToFontAwesome(group.shape));
            htmltxt += '</i>';  
            return htmltxt; 
        }
        return "";
    };
 // convert the vis shape to the fontawesome equivalent shape
    objectTypeNode.prototype.shapeToFontAwesome = function(shape) {
        switch (shape) {
            case 'ellipse':
                return "f1db";
            case 'circle':
                return "f1db"; 
            case 'database':
                return "f0c8";
            case 'box':
                return "f2d0"; 
            case 'diamond':
                return "f0dc";
            case 'dot':
                return "f111";
            case 'triangle':
                return "f0de"; 
            case 'triangleDown':
                return "f0dd"; 
            case 'star':
                return "f005"; 
            case 'hexagon':
                return "f20e";
            case 'square':
                return "f0c8";
            default:
                return "f2d0";
        }

    };




    objectTypeNode.prototype.changeState = function (id,state) {
        this.full = state && this.full;
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