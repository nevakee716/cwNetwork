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

    cwLayoutNetwork.prototype.construct = function(options) {
        this.hiddenNodes = [];
        this.complementaryNode = [];
        this.externalFilters = [];
        
        this.behaviour = {};        
        this.behaviour.add = false;
        this.behaviour.absolute = false;
        this.behaviour.or = false;
        this.behaviour.highlight = true;

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

        this.getExternalFilterNodes(this.options.CustomOptions['filterNode'], this.options.CustomOptions['filterNodeBehaviour']);
        this.getExternalFilterToSelectOnStart(this.options.CustomOptions['externalFilterToSelectOnStart']);

        this.edgeOption = this.options.CustomOptions['zipEdgeOption'];
        this.edgeZipped = this.options.CustomOptions['zipEdgeInitState'];
        this.hideEdgeButton = this.options.CustomOptions['hideEdgeButton'];

        this.clusterOption = this.options.CustomOptions['clusterOn'];
        this.hideClusterMenu = this.options.CustomOptions['hideClusterMenu'];
        this.getStartingCluster(this.options.CustomOptions['clusterToSelectOnStart']);

        this.physicsOption = this.options.CustomOptions['physicsOn'];
        this.hidePhysicsButton = this.options.CustomOptions['hidePhysicsButton'];
        this.physicsOptionInitialState = this.options.CustomOptions['physicsInitialState'];

        this.removeLonely = this.options.CustomOptions['removeLonelyOn'];

        try {
            this.edgeColor = JSON.parse(this.options.CustomOptions['edgeColor']);
        } catch (e) {
            this.edgeColor = {};
        }


        this.wiggle = true;
        this.CDSNodesOption = true;
        this.CDSFilterOption = true;
        this.physics = true;
        this.nodeOptions = {
            "CDSFilterOption": this.CDSFilterOption,
            "CDSNodesOption": this.CDSNodesOption
        };

        this.networkConfiguration = {};
        if (cwAPI.mm.getMetaModel().objectTypes.hasOwnProperty("capinetwork")) {

            this.networkConfiguration.enableEdit = this.options.CustomOptions['enableEdit'];
            this.networkConfiguration.personnalEdit = this.options.CustomOptions['personnalEdit'];
            this.networkConfiguration.rolesEdit = this.options.CustomOptions['rolesEdit'];
            this.networkConfiguration.rolesEditForAll = this.options.CustomOptions['rolesEditForAll'];
            this.networkConfiguration.nodes = [];
        }



    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));