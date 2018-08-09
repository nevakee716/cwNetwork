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


// dealing with adding node with the menu
    cwLayoutNetwork.prototype.AddClosesNodes = function (event) {
        var option = {};
        option.ImpactTo = true;
        option.ImpactFrom = true;
        option.rangeMin = true;
        option.rangeMax = false;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };


    cwLayoutNetwork.prototype.AddAllNodesFrom = function (event) {
        var option = {};
        option.ImpactTo = false;
        option.ImpactFrom = true;
        option.rangeMin = false;
        option.rangeMax = true;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };

    cwLayoutNetwork.prototype.AddAllNodesTo = function (event) {
        var option = {};
        option.ImpactTo = true;
        option.ImpactFrom = false;
        option.rangeMin = false;
        option.rangeMax = true;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };


    cwLayoutNetwork.prototype.AddAllConnectedNodes = function (event) {
        var option = {};
        option.ImpactTo = true;
        option.ImpactFrom = true;
        option.rangeMin = false;
        option.rangeMax = true;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };

    cwLayoutNetwork.prototype.AddNodesToNetwork = function (event,option) {
        var nodeID,group,changeSet,nodeIDFull = event.data.d.nodes[0];
        this.nodes.forEach(function(node) { 
            if(node.id === nodeIDFull) {
                group = node.group.replace("Hidden","");
            }
        });
        nodeID = nodeIDFull.split("#")[0];
        

        if(this.behaviour.absolute === true) {
            this.deActivateAllGroup();
        }
        if(this.behaviour.highlight === true) {
            option.highlight  = true;
        } 


        changeSet = this.network.getVisNode(nodeID,group,option,this.edges); // get all the node self should be put on

        if(this.behaviour.absolute === true) {
            var originObj = this.network.objectTypeNodes[group].getVisDataIfDeactivated(nodeID);
            if(originObj.alreadyInNetwork !== true) {
                changeSet.push(originObj);
            }
        }

        if(this.networkUI) {
            this.colorAllNodes();
            this.colorAllEdges();                        
        }
        this.setExternalFilterToNone(); 

        if(this.behaviour.highlight === false) {
            this.fillFilter(changeSet); // add the filter value
            this.nodes.add(changeSet); // adding nodes into network
        } else {
            var nodesIdToHighlight = [];
            changeSet.forEach(function(c) { 
                nodesIdToHighlight.push(c.id);
            });
            nodesIdToHighlight.push(nodeIDFull);
            if(this.networkUI) {
                this.colorNodes(nodesIdToHighlight);
                this.colorEdges(nodesIdToHighlight);
            }
        }

    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));