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

    cwLayoutNetwork.prototype.updatePhysicsButtonTitle = function (button) {
        if(button === undefined) button = document.getElementById("cwLayoutNetworkButtonsPhysics" + this.nodeID);
        if(this.physics == false) {
            button.innerHTML = "Enable Physics";
        }
        else {
            button.innerHTML = "Disable Physics";
        }
    };

    cwLayoutNetwork.prototype.updatePhysics = function (state) {
        var changeset = [];
        if(state !== undefined) {
            this.physics = state;
            this.updatePhysicsButtonTitle();
        }
        if(this.physics == true) {
            this.nodes.forEach(function(node) {
                node.physics = !(node.cluster); 
                changeset.push(node);
            });
        }
        else {
            this.nodes.forEach(function(node) {
                node.physics = false;
                changeset.push(node);
                
            });
        }
        this.nodes.update(changeset);
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));