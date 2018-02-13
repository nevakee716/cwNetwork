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

    
    cwLayoutNetwork.prototype.edgeZipButtonAction  = function (event) {
        var self = this;
        var changeSetEdges = [];
        if(this.edgeZipped == true) {
            event.target.innerHTML = "Zip Edges";
            this.edgeZipped = false;
            this.edges.forEach(function(edge) {
                if(edge.zipped === true && edge.labels.length > 0) {
                    edge.hidden = true;
                    edge.physics = false;  
                    edge.hideByZipping = true;  
                } else if (edge.zipped === false) {
                    edge.hidden = false;
                    edge.physics = true;
                    edge.hideByZipping = false;
                }  
                changeSetEdges.push(edge);     
            }); 
        } else {
            event.target.innerHTML = "unZip Edges";
            this.edgeZipped = true;
            this.edges.forEach(function(edge) {
                if(edge.zipped === true && edge.labels.length > 0) {
                    edge.hidden = false;
                    edge.physics = true;    
                    edge.hideByZipping = false;
                } else if (edge.zipped === false) {
                    edge.hidden = true;
                    edge.physics = false;
                    edge.hideByZipping = true;
                }  
                changeSetEdges.push(edge);          
            });            
        }
        this.edges.update(changeSetEdges); 
        // this.networkUI.redraw();

    };

    cwLayoutNetwork.prototype.createUnzipEdge  = function (event) {
        var self = this;
        this.edges.forEach(function(edge) {
            if(edge.zipped) {
                edge.labels.forEach(function(zipEdge) {
                    var newEdge = $.extend(true, {}, edge);
                    newEdge.zipped = false;
                    newEdge.hidden = true;
                    newEdge.hideByZipping = true;
                    newEdge.physics = false;
                    newEdge.arrows = zipEdge.direction;
                    newEdge.label = zipEdge.label;   
                    newEdge.scriptname = zipEdge.scriptname;  
                    newEdge.id = edge.id + "#" + zipEdge.uuid;  
                    newEdge.object_id = zipEdge.id;
                    newEdge.width = 1;           
                    self.edges.add(newEdge);
                });                 
            }    
        }); 
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));