/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    if(cwApi && cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
      var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
    // constructor
        var cwLayoutNetwork = function (options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }

    cwLayoutNetwork.prototype.stopPhysics = function (event) {
        if(this.physics == true) {
            this.physics = false;
            event.target.innerHTML = "Enable Physics";
        }
        else {
            this.physics = true;
            event.target.innerHTML = "Disable Physics";
        }
        this.updatePhysics();
    };

    cwLayoutNetwork.prototype.updatePhysics = function () {
        var self = this,changeset = [];
        
        if(this.physics == true) {
            this.nodes.forEach(function(node) {
                node.physics = !(node.cluster); 
                changeset.push(node);
                self.nodes.update(node);
            });
        }
        else {
            this.nodes.forEach(function(node) {
                node.physics = false;
                changeset.push(node);
                
            });
        }
        self.nodes.update(changeset);
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));