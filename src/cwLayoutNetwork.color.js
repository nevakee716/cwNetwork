/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    if(cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
      var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
    // constructor
        var cwLayoutNetwork = function (options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }


    cwLayoutNetwork.prototype.LightenDarkenColor = function(col, amt) {
          
        var usePound = false;
      
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
     
        var num = parseInt(col,16);
     
        var r = (num >> 16) + amt;
     
        if (r > 255) r = 255;
        else if  (r < 0) r = 0;
     
        var b = ((num >> 8) & 0x00FF) + amt;
     
        if (b > 255) b = 255;
        else if  (b < 0) b = 0;
     
        var g = (num & 0x0000FF) + amt;
     
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
     
        return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
      
    };


//manage color of the edge

    cwLayoutNetwork.prototype.getEdgeColorFromGroup = function (group) {
        var color = {};
        if(this.networkUI.groups.groups[group].icon) {
           color.color = this.networkUI.groups.groups[group].icon.color;
        } else {
            if(this.networkUI.groups.groups[group].color.hasOwnProperty("border")) {
                color.color = this.networkUI.groups.groups[group].color.border;    
            } else {
                color.color = this.networkUI.groups.groups[group].color;    
            }  
        } 
        color.highlight = color.color;
        color.hover = color.color;
        return color;
    };



    cwLayoutNetwork.prototype.colorNodes = function (idsToHighlight) {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            if(idsToHighlight.indexOf(node.id) === -1) {
                if(node.group.indexOf("Hidden") === -1) {
                    node.group = node.group + "Hidden";
                }
            } else {
                node.group = node.group.replace("Hidden","");     
            }
            if(self.networkUI.groups.groups[node.group]) {
                if(self.networkUI.groups.groups[node.group].icon) {
                    node.color = self.networkUI.groups.groups[node.group].icon.color;
                } else {
                    node.color = self.networkUI.groups.groups[node.group].color;  
                }  
            } 
            updateArray.push(node); 
        });
        this.nodes.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorUnZipEdges = function (nodesIdToHighlight,edgesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = this.nodes.get({returnType:"Object"});
        this.edges.forEach(function(edge) {
            if(edge.zipped === false){
                var nodeID;
                // select the node that the edge will inherit
                if(nodesIdToHighlight.indexOf(edge.to) !== -1 && nodesIdToHighlight.indexOf(edge.from) !== -1 && edgesIdToHighlight.indexOf(edge.object_id + "#" + edge.scriptname) === -1) {
                    edge.color = self.getEdgeColorFromGroup(allNodes[edge.to].group + "Hidden");
                }
                updateArray.push(edge);               
            }
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorEdges = function (nodesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = self.nodes.get({returnType:"Object"});
        self.edges.forEach(function(edge) {
            var nodeID;
            // select the node that the edge will inherit
            if(nodesIdToHighlight.indexOf(edge.to) === -1) {
                nodeID =  edge.to;
            } else {
                nodeID =  edge.from; 
            }
            if(allNodes.hasOwnProperty(nodeID)) {
                edge.color = {};
                edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
            }
            updateArray.push(edge);               
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorAllNodes = function () {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            node.group = node.group.replace("Hidden",""); 
            if(self.networkUI.groups.groups[node.group].icon) {
                node.color = self.networkUI.groups.groups[node.group].icon.color;
            } else {
                node.color = self.networkUI.groups.groups[node.group].color;    
            } 
            updateArray.push(node); 
        });
        this.nodes.update(updateArray);
    };


    cwLayoutNetwork.prototype.colorAllEdges = function () {
        var nodeID;
        var self = this;
        var updateArray = [];
        var allNodes = this.nodes.get({returnType:"Object"});
        this.edges.forEach(function(edge) {
            nodeID =  edge.from;
            if(allNodes.hasOwnProperty(nodeID)) {
                edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
            } else {
                edge.color = {inherit:'from'};  
            }
            updateArray.push(edge);
        });
        this.edges.update(updateArray);
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));