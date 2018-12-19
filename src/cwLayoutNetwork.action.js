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
    // Adding group at start
    cwLayoutNetwork.prototype.activateStartingGroup = function(event) {
        var self = this;
        this.groupToSelectOnStart.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ", "_")).selectpicker('selectAll');
        });
    };

    // Adding group at start
    cwLayoutNetwork.prototype.activateStartingEdgeType = function(edgeTypeToSelect) {
        var self = this;
        var values = [],
            changeSet = [];
        if (edgeTypeToSelect === undefined) edgeTypeToSelect = this.edgeTypeToSelect;
        if (edgeTypeToSelect === undefined) edgeTypeToSelect = [];
        edgeTypeToSelect.forEach(function(edgeTypeScriptname) {
            if (self.edgeConfiguration.hasOwnProperty(edgeTypeScriptname)) {
                self.edgeConfiguration[edgeTypeScriptname].show = true;
                changeSet = changeSet.concat(self.showEdgeByScriptname(edgeTypeScriptname));
                values.push(self.edgeConfiguration[edgeTypeScriptname].label);
            }
        });
        this.edges.update(changeSet);
        $('.selectNetworkEdge_' + this.nodeID).selectpicker('val', values);
    };


    // Activate cluster from option
    cwLayoutNetwork.prototype.activateStartingCluster = function(event) {
        var self = this;
        if (this.wiggle) {
            setTimeout(function() {
                self.fillValueInClusterFilter(self.clusterByGroupOption.head, self.clusterByGroupOption.child);
                self.clusterByGroup();
            }, 5000);
        } else {
            this.fillValueInClusterFilter(this.clusterByGroupOption.head, this.clusterByGroupOption.child);
            this.clusterByGroup();
        }
    };

    // Adding all group
    cwLayoutNetwork.prototype.activateAllGroup = function(event) {
        var self = this;
        this.networkUI.groups.groupsArray.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ", "_")).selectpicker('selectAll');
        });
    };


    cwLayoutNetwork.prototype.disableGroupClusters = function() {
        var node, self = this;

        self.clusters.forEach(function(cluster) {
            self.disableCluster(cluster);
        });
        this.clusters = [];
    };

    // Remove all group
    cwLayoutNetwork.prototype.deActivateAllGroup = function(event) {
        var OT, changeset = [],
            self = this;

        this.disableGroupClusters();
        for (OT in self.network.objectTypeNodes) {
            if (self.network.objectTypeNodes.hasOwnProperty(OT)) {
                changeset = changeset.concat(self.network.SetAllAndGetNodesObject(false, OT));
                $('.selectNetworkPicker_' + self.nodeID + "." + OT.replaceAll(" ", "_")).selectpicker('val', "");
            }
        }
        this.nodes.remove(changeset);
    };


    // manage Expert Mode
    cwLayoutNetwork.prototype.manageExpertMode = function(event) {
        var self = this;
        cwApi.CwAsyncLoader.load('angular', function() {
            if (self.expertMode === true) {
                self.expertMode = false;
                event.target.innerText = "Normal Mode";
                cwAPI.CwPopout.hide();
            } else {
                self.expertMode = true;
                event.target.innerText = "Expert Mode";

                cwApi.CwPopout.showPopout("Expert Mode");

                cwApi.CwPopout.setContent(self.createExpertModeElement());
                cwApi.CwPopout.onClose(function() {
                    self.expertMode = false;
                    event.target.innerText = "Normal Mode";
                });

            }
        });



    };

    // manage Expert Mode
    cwLayoutNetwork.prototype.createExpertModeElement = function() {
        var self = this;


        var expertModeConfig = document.createElement("div");
        expertModeConfig.className = "cwLayoutNetworkExpertModeConfig";
        expertModeConfig.id = "cwLayoutNetworkExpertModeConfig" + this.nodeID;

        var cwLayoutNetworkExpertModeContainerTab = document.createElement("div");
        cwLayoutNetworkExpertModeContainerTab.className = "cwLayoutNetworkExpertModeContainerTab";
        cwLayoutNetworkExpertModeContainerTab.id = "cwLayoutNetworkExpertModeContainerTab" + this.nodeID;

        var tabPhysics = document.createElement("div");
        tabPhysics.className = "cwLayoutNetworkExpertModeTabs";
        tabPhysics.id = "tabPhysics" + this.nodeID;
        tabPhysics.innerText = "Physics";

        var tabGroups = document.createElement("div");
        tabGroups.className = "cwLayoutNetworkExpertModeTabs";
        tabGroups.id = "tabGroups" + this.nodeID;
        tabGroups.innerText = "Groups";

        var groupsConfig = document.createElement("div");
        groupsConfig.className = "cwLayoutNetworkExpertModegroupConfig";
        groupsConfig.id = "cwLayoutNetworkExpertModegroupConfig" + this.nodeID;
        groupsConfig.style.display = "none";


        cwLayoutNetworkExpertModeContainerTab.appendChild(tabPhysics);
        cwLayoutNetworkExpertModeContainerTab.appendChild(tabGroups);
        expertModeConfig.appendChild(cwLayoutNetworkExpertModeContainerTab);

        var physicsConfig = document.createElement("div");
        physicsConfig.className = "cwLayoutNetworkPhysicsConfig";
        physicsConfig.id = "cwLayoutNetworkPhysicsConfig" + this.nodeID;
        
        expertModeConfig.appendChild(physicsConfig);
        expertModeConfig.appendChild(groupsConfig);

        tabPhysics.addEventListener("click", function(event) {
            self.unselectExpertModeTabs(cwLayoutNetworkExpertModeContainerTab);
            physicsConfig.style.display = "";
            groupsConfig.style.display = "none";
            self.setExpertModePhysics(physicsConfig);
            tabPhysics.className += " selected";

        });

        tabGroups.addEventListener("click", function(event) {
            self.unselectExpertModeTabs(cwLayoutNetworkExpertModeContainerTab);
            physicsConfig.style.display = "none";
            groupsConfig.style.display = "";
            groupsConfig.innerHTML = "";
            tabGroups.className += " selected";
            self.createGroupAngular(groupsConfig, $("#cwLayoutNetworkExpertModegroupConfig" + self.nodeID));
        });

        //init
        this.setExpertModePhysics(physicsConfig);
        tabPhysics.className += " selected";
        return expertModeConfig;
    };

    cwLayoutNetwork.prototype.unselectExpertModeTabs = function(tabs) {
        for (var i = 0; i < tabs.children.length; i++) {
            tabs.children[i].className = tabs.children[i].className.replace(" selected", "");
        }
    };

    cwLayoutNetwork.prototype.setExpertModePhysics = function(container) {
        this.networkUI.options.configure = {
            filter: function(option, path) {
                if (path.indexOf('physics') !== -1) {
                    return true;
                }
                if (path.indexOf('layout') !== -1) {
                    return true;
                }
                if (path.indexOf('smooth') !== -1 || option === 'smooth') {
                    return true;
                }
                return false;
            },
            container: container
        };
        this.networkUI.setOptions(this.networkUI.options);
    };


    cwLayoutNetwork.prototype.createGroupAngular = function(container, $container) {
        var loader = cwApi.CwAngularLoader,
            templatePath;
        loader.setup();
        var that = this;
        var self = this;

        templatePath = cwAPI.getCommonContentPath() + '/html/cwNetwork/expertModeGroupTable.ng.html' + '?' + Math.random();

        loader.loadControllerWithTemplate('expertModeGroupTable', $container, templatePath, function($scope) {
           self.angularScope = $scope;
           var g = self.options.CustomOptions['iconGroup'].split("||");
           $scope.configString = g;
           for (var i = 0; i < g.length; i++) {
            g[i] = g[i].split(",");
           }
           $scope.groups = g;
           $scope.updateGroup = self.updatesGroup.bind(self); 
           $scope.bootstrapFilter = self.bootstrapFilter;

        });
    };


    cwLayoutNetwork.prototype.updatesGroup = function(groups) {
        var output = "";
        var self = this;
        groups.forEach(function(g,index){
            g.forEach(function(c,index2){
                output += c;
                if(index2 < g.length -1) output += ",";
            });
            if(index < groups.length -1) output += "||";
        });
        this.getFontAwesomeList(output);
        var opt = {};
        opt.groups = this.groupsArt;
        this.networkUI.setOptions(opt);
        this.angularScope.configString = output;
        this.options.CustomOptions['iconGroup'] = output;
        this.setAllExternalFilter();

        var nu = [];
        var positions = this.networkUI.getPositions();
        this.nodes.forEach(function(node) {
            node.resized = undefined;
            node.widthConstraint = undefined;
            node.heightConstraint = undefined;
            node.color = undefined;
            nu.push(node);
        });

        self.nodes.update(nu);
        

    };

    cwLayoutNetwork.prototype.bootstrapFilter = function(id,value) {

        window.setTimeout(function(params) {
            $('#' + id).selectpicker();
            $('#' + id).selectpicker('val',value); 
        }, 1000);
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));