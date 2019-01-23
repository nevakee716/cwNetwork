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
        this.definition = {};
        this.definition.capinetworkScriptname = "capinetwork";
        this.definition.capinetworkDisplayname = "Network";
        this.definition.capinetworkLabelScriptname = "label";
        this.definition.capinetworkLabelDisplayname = "Libéllé";
        this.definition.capinetworkToAnyAssociationScriptname = "CAPINETWORKTOASSOCWAPINETWORKTOANYOBJECTTOANYOBJECT";
        this.definition.capinetworkToAnyAssociationDisplayName = "Present On Network";
        this.definition.capinetworkCreateOnViewScriptname = "createoncwview";
        this.definition.capinetworkConfigurationScriptname = "configuration";
        this.canCreateNetwork = false;
        this.canUpdateNetwork = false;
        this.networkConfiguration = {};
        this.networkConfiguration.enableEdit = this.options.CustomOptions['enableEdit'];
        this.networkConfiguration.nodes = {}; 
        this.expertMode = false;
        this.expertModeAvailable = this.options.CustomOptions['expertMode'];


        this.errors = {};
        this.errors.diagrameTemplate = {};
        this.errors.init = false;
        try {
            this.definition.capinetworkCreateOnViewDisplayName = cwAPI.mm.getProperty(this.definition.capinetworkScriptname,this.definition.capinetworkCreateOnViewScriptname).name;
            this.definition.capinetworkConfigurationDisplayname = cwAPI.mm.getProperty(this.definition.capinetworkScriptname,this.definition.capinetworkConfigurationScriptname).name;

            if(cwAPI.cwUser.isCurrentUserSocial() === false && cwAPI.mm.getLookupsOnAccessRights(this.definition.capinetworkScriptname,"CanCreate").length > 0) {
                this.canCreateNetwork = true;
            }
            if(cwAPI.cwUser.isCurrentUserSocial() === false && cwAPI.mm.getLookupsOnAccessRights(this.definition.capinetworkScriptname,"CanUpdate").length > 0) {
                this.canUpdateNetwork = true;
            }
        } catch (e) {
            console.log(e);
        }
        

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

        this.layoutsByNodeId = {};
        this.clusters = [];
        this.init = true;
        this.clustered = false;
        this.clusterByGroupOption = {};
        this.clusterByGroupOption.head = "";
        this.clusterByGroupOption.child = [];
        this.dragged = {};


        this.originalOptions = {};
        this.originalOptions.groupString = this.options.CustomOptions['iconGroup'];
        this.originalOptions.directionListString = this.options.CustomOptions['arrowDirection'];
        this.originalOptions.newNodeFilteredString = this.options.CustomOptions['filterNode'];
        this.originalOptions.specificGroupString = this.options.CustomOptions['specificGroup'];
        this.originalOptions.hiddenNodesString = this.options.CustomOptions['hidden-nodes'];
        this.originalOptions.duplicateNodesString = this.options.CustomOptions['duplicateNodes'];
        this.originalOptions.complementaryNodesString = this.options.CustomOptions['complementaryNode'];



        this.multiLineCount = this.options.CustomOptions['multiLineCount'];
        this.getOption('complementaryNode','complementaryNode',',');
        this.getOption('contextualFilter','contextualNode',',');
        this.getOption('hidden-nodes','hiddenNodes',',');
        this.getOption('groupToSelectOnStart','groupToSelectOnStart',',');        
        this.getOption('specificGroup','specificGroup','#',',');
        this.getOption('popOutList','popOut','#',',');       

        this.startingNetwork = this.options.CustomOptions['startingNetwork'];
        this.getOption('duplicateNodes','duplicateNode',',');


        this.getFontAwesomeList(this.options.CustomOptions['iconGroup']);
        this.getdirectionList(this.options.CustomOptions['arrowDirection']);

        this.getExternalFilterNodes(this.options.CustomOptions['filterNode'], this.options.CustomOptions['filterNodeBehaviour']);

        this.edgeOption = this.options.CustomOptions['zipEdgeOption'];
        this.edgeZipped = this.options.CustomOptions['zipEdgeInitState'];
        this.hideEdgeButton = this.options.CustomOptions['hideEdgeButton'];

        this.clusterOption = this.options.CustomOptions['clusterOn'];
        this.hideClusterMenu = this.options.CustomOptions['hideClusterMenu'];
        this.getStartingCluster(this.options.CustomOptions['clusterToSelectOnStart']);

        this.physicsOption = this.options.CustomOptions['physicsOn'];
        this.hidePhysicsButton = this.options.CustomOptions['hidePhysicsButton'];
        this.physicsOptionInitialState = this.options.CustomOptions['physicsInitialState'];
        this.physConfiguration = this.options.CustomOptions['physicsConfiguration'];


        this.removeLonely = this.options.CustomOptions['removeLonelyOn'];

        this.assignEdge = {};
        try {
            this.edgeConfiguration = JSON.parse(this.options.CustomOptions['edgeColor']);
            this.getOption('edgeTypeToSelect','edgeTypeToSelect',',');     
            this.getOption('assignEdge','assignEdge','#',','); 
        } catch (e) {
            this.edgeConfiguration = {};
        }

        this.originalObjects = {};
        this.wiggle = true;
        this.CDSNodesOption = true;
        this.CDSFilterOption = true;
        this.physics = true;
        this.nodeOptions = {
            "CDSFilterOption": this.CDSFilterOption,
            "CDSNodesOption": this.CDSNodesOption
        };



        this.loadDiagramTemplate("z_diagram_template");
  


    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));