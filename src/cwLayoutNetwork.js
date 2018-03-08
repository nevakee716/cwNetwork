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
   
    cwLayoutNetwork.prototype.construct = function(options) {
        this.hiddenNodes = [];
        this.complementaryNode = [];
        this.externalFilters = [];
        this.externalFilterBehaviour = {};
        this.externalFilterBehaviour.add = false;
        this.externalFilterBehaviour.absolute = false;     
        this.externalFilterBehaviour.or = false;              
        this.nodeFiltered = [];
        this.popOut = [];
        this.specificGroup = [];
        this.directionList = [];
        this.groupToSelectOnStart = [];
        this.objects = {};
        this.layoutsByNodeId = {};
        this.clusters = [];
        this.init = true;
        this.clustered = false;
        this.clusterByGroupOption = {};
        this.clusterByGroupOption.head = "";
        this.clusterByGroupOption.child = [];
        this.multiLineCount = this.options.CustomOptions['multiLineCount'];
        this.getspecificGroupList(this.options.CustomOptions['specificGroup']);        
        this.getPopOutList(this.options.CustomOptions['popOutList']);
        this.getHiddenNodeList(this.options.CustomOptions['hidden-nodes']);
        this.getComplementaryNodeList(this.options.CustomOptions['complementaryNode']);
        this.getFontAwesomeList(this.options.CustomOptions['iconGroup']);
        this.getdirectionList(this.options.CustomOptions['arrowDirection']);
        this.getGroupToSelectOnStart(this.options.CustomOptions['groupToSelectOnStart']);
        this.getExternalFilterNodes(this.options.CustomOptions['filterNode'],this.options.CustomOptions['filterNodeBehaviour']);
        this.getExternalFilterToSelectOnStart(this.options.CustomOptions['externalFilterToSelectOnStart']);  
        this.getStartingCluster(this.options.CustomOptions['clusterToSelectOnStart']);

        this.wiggle = true;
        this.edgeOption = this.options.CustomOptions['zipEdgeOption'];
        this.edgeZipped = this.options.CustomOptions['zipEdgeInitState'];
        this.clusterOption = this.options.CustomOptions['clusterOn'];
        this.physicsOption = this.options.CustomOptions['physicsOn'];       
        this.removeLonely = this.options.CustomOptions['removeLonelyOn'];
        this.CDSNodesOption = true;
        this.CDSFilterOption = false;
        this.physics = true;
        this.nodeOptions = {"CDSFilterOption" : this.CDSFilterOption,"CDSNodesOption" : this.CDSNodesOption};
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));