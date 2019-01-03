/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function(cwApi, $) {
    "use strict";
    if (cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
        var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
        // constructor
        var cwLayoutNetwork = function(options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }


   
    cwLayoutNetwork.prototype.getHSL = function(color) {

        // Variables for red, green, blue values
        var r, g, b, hsp;
        
        // Check the format of the color, HEX or RGB?
        if (color.match(/^rgb/)) {

            // If HEX --> store the red, green, blue values in separate variables
            color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
            
            r = color[1];
            g = color[2];
            b = color[3];
        } 
        else {
            
            // If RGB --> Convert it to HEX: http://gist.github.com/983661
            color = +("0x" + color.slice(1).replace( 
            color.length < 5 && /./g, '$&$&'));

            r = color >> 16;
            g = color >> 8 & 255;
            b = color & 255;
        }
        
        // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
        );

        return hsp;
    };

    cwLayoutNetwork.prototype.LightenDarkenColor = function(col, amt) {

        var usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        var num = parseInt(col, 16);

        var r = (num >> 16) + amt;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amt;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        var g = (num & 0x0000FF) + amt;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

    };


    //manage color of the edge

    cwLayoutNetwork.prototype.getEdgeColorFromGroup = function(group) {
        var color = {};
        if (this.networkUI.groups.groups[group]) {
            if (this.networkUI.groups.groups[group].icon) {
                color.color = this.networkUI.groups.groups[group].icon.color;
            } else {
                if (this.networkUI.groups.groups[group].color.hasOwnProperty("border")) {
                    color.color = this.networkUI.groups.groups[group].color.border;
                } else {
                    color.color = this.networkUI.groups.groups[group].color;
                }
            }
            color.highlight = color.color;
            color.hover = color.color;
        }

        return color;
    };



    cwLayoutNetwork.prototype.colorNodes = function(idsToHighlight) {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            if (idsToHighlight.indexOf(node.id) === -1) {
                if (node.group.indexOf("Hidden") === -1) {
                    node.group = node.group + "Hidden";
                }
            } else {
                node.group = node.group.replace("Hidden", "");
            }
            if (self.networkUI.groups.groups[node.group]) {
                if (self.networkUI.groups.groups[node.group].icon) {
                    node.color = self.networkUI.groups.groups[node.group].icon.color;
                } else {
                    node.color = self.networkUI.groups.groups[node.group].color;
                }
            }
            updateArray.push(node);
        });
        this.nodes.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorUnZipEdges = function(nodesIdToHighlight, edgesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = this.nodes.get({
            returnType: "Object"
        });
        this.edges.forEach(function(edge) {
            if (edge.zipped === false) {
                var nodeID;
                // select the node that the edge will inherit
                if (nodesIdToHighlight.indexOf(edge.to) !== -1 && nodesIdToHighlight.indexOf(edge.from) !== -1 && edgesIdToHighlight.indexOf(edge.object_id + "#" + edge.scriptname) === -1) {
                    edge.color = self.getEdgeColorFromGroup(allNodes[edge.to].group + "Hidden");
                }
                updateArray.push(edge);
            }
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorEdges = function(nodesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var isEdgeToDecolor;
        var allNodes = self.nodes.get({
            returnType: "Object"
        });
        self.edges.forEach(function(edge) {
            var nodeID;
            isEdgeToDecolor = false;
            if (nodesIdToHighlight.indexOf(edge.to) === -1 || nodesIdToHighlight.indexOf(edge.from) === -1) isEdgeToDecolor = true;

            // select the node that the edge will inherit
            if (nodesIdToHighlight.indexOf(edge.to) === -1) {
                nodeID = edge.to;
            } else {
                nodeID = edge.from;
            }
            if (allNodes.hasOwnProperty(nodeID)) {
                edge.color = {};
                if (edge.scriptname && self.edgeConfiguration.hasOwnProperty(edge.scriptname) && isEdgeToDecolor === false) {
                    edge.color = self.getEdgeColorFromEdgeGroup(edge);
                } else {
                    edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
                }
            }
            updateArray.push(edge);
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorAllNodes = function() {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            node.group = node.group.replace("Hidden", "");
            if (self.networkUI.groups.groups[node.group].icon) {
                node.color = self.networkUI.groups.groups[node.group].icon.color;
            } else {
                node.color = self.networkUI.groups.groups[node.group].color;
            }
            updateArray.push(node);
        });
        this.nodes.update(updateArray);
    };


    cwLayoutNetwork.prototype.colorAllEdges = function() {
        var nodeID;
        var self = this;
        var updateArray = [];
        var allNodes = this.nodes.get({
            returnType: "Object"
        });
        this.edges.forEach(function(edge) {
            nodeID = edge.from;
            if (edge.scriptname && self.edgeConfiguration.hasOwnProperty(edge.scriptname)) {
                edge.color = self.getEdgeColorFromEdgeGroup(edge);
            } else if (allNodes.hasOwnProperty(nodeID)) {
                edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
            } else {
                edge.color = {
                    inherit: 'from'
                };
            }
            updateArray.push(edge);
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.getEdgeColorFromEdgeGroup = function(edge) {
        var color = {};
        color.color = this.edgeConfiguration[edge.scriptname].color;
        color.hover = this.edgeConfiguration[edge.scriptname].color;
        color.highlight = this.edgeConfiguration[edge.scriptname].color;
        return color;
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));