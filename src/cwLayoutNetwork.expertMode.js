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


    // manage Expert Mode
    cwLayoutNetwork.prototype.manageExpertMode = function(event) {
        var self = this;
        cwApi.CwAsyncLoader.load('angular', function() {
            if (self.expertMode === true) {
                self.expertMode = false;
                event.target.innerText = $.i18n.prop('activate_expert_mode');
                cwAPI.CwPopout.hide();
            } else {
                self.expertMode = true;
                event.target.innerText = $.i18n.prop('deactivate_expert_mode');

                cwApi.CwPopout.showPopout($.i18n.prop('expert_mode'));

                cwApi.CwPopout.setContent(self.createExpertModeElement());
                cwApi.CwPopout.onClose(function() {
                    self.expertMode = false;
                    event.target.innerText = $.i18n.prop('activate_expert_mode');
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


        var tabNodes = document.createElement("div");
        tabNodes.className = "cwLayoutNetworkExpertModeTabs";
        tabNodes.id = "tabNodes" + this.nodeID;
        tabNodes.innerText = "Nodes Configuration";

        var groupsConfig = document.createElement("div");
        groupsConfig.className = "cwLayoutNetworkExpertModegroupConfig";
        groupsConfig.id = "cwLayoutNetworkExpertModegroupConfig" + this.nodeID;
        groupsConfig.style.display = "none";


        var nodesConfig = document.createElement("div");
        nodesConfig.className = "cwLayoutNetworkExpertModeNodesConfig";
        nodesConfig.id = "cwLayoutNetworkExpertModeNodesConfig" + this.nodeID;
        nodesConfig.style.display = "none";



        cwLayoutNetworkExpertModeContainerTab.appendChild(tabNodes);
        cwLayoutNetworkExpertModeContainerTab.appendChild(tabPhysics);
        cwLayoutNetworkExpertModeContainerTab.appendChild(tabGroups);
        expertModeConfig.appendChild(cwLayoutNetworkExpertModeContainerTab);

        var physicsConfig = document.createElement("div");
        physicsConfig.className = "cwLayoutNetworkPhysicsConfig";
        physicsConfig.id = "cwLayoutNetworkPhysicsConfig" + this.nodeID;


        expertModeConfig.appendChild(physicsConfig);
        expertModeConfig.appendChild(groupsConfig);
        expertModeConfig.appendChild(nodesConfig);


        tabPhysics.addEventListener("click", function(event) {
            self.unselectExpertModeTabs(cwLayoutNetworkExpertModeContainerTab);
            physicsConfig.style.display = "";
            groupsConfig.style.display = "none";
            nodesConfig.style.display = "none";
            self.setExpertModePhysics(physicsConfig);
            tabPhysics.className += " selected";

        });

        tabGroups.addEventListener("click", function(event) {
            self.unselectExpertModeTabs(cwLayoutNetworkExpertModeContainerTab);
            physicsConfig.style.display = "none";
            groupsConfig.style.display = "";
            nodesConfig.style.display = "none";
            groupsConfig.innerHTML = "";
            tabGroups.className += " selected";
            self.createGroupAngular(groupsConfig, $("#cwLayoutNetworkExpertModegroupConfig" + self.nodeID));
        });

        tabNodes.addEventListener("click", function(event) {
            self.unselectExpertModeTabs(cwLayoutNetworkExpertModeContainerTab);
            physicsConfig.style.display = "none";
            groupsConfig.style.display = "none";
            nodesConfig.style.display = "";
            groupsConfig.innerHTML = "";
            tabNodes.className += " selected";
            self.createNodeConfig(nodesConfig);
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
            $scope.checkIfContainObjectType = self.checkIfGroupMatchTemplate.bind(self);
            $scope.diagramTemplate = self.diagramTemplate;

        });
    };


    cwLayoutNetwork.prototype.updatesGroup = function(groups) {
        var output = "";
        var self = this;
        groups.forEach(function(g, index) {
            g.forEach(function(c, index2) {
                output += c;
                if (index2 < g.length - 1) output += ",";
            });
            if (index < groups.length - 1) output += "||";
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

    cwLayoutNetwork.prototype.bootstrapFilter = function(id, value) {
        window.setTimeout(function(params) {
            $('#' + id).selectpicker();
            $('#' + id).selectpicker('val', value);
        }, 1000);
    };


    cwLayoutNetwork.prototype.checkIfGroupMatchTemplate = function(group, template) {
        var OTs = this.groupsArt[group.replaceAll("Hidden", "")].objectTypes;

        for (var paletteEntry in template.diagram.paletteEntries) {
            if (template.diagram.paletteEntries.hasOwnProperty(paletteEntry)) {
                for (var i = 0; i < OTs.length; i++) {
                    let p = paletteEntry.split("|")[0];
                    p = p.toLowerCase();
                    if (OTs[i].indexOf(p) !== -1) return true;
                }
            }

        }
        return false;
    };



    cwLayoutNetwork.prototype.nodeIDToFancyTree = function(node) {
        var self = this;
        if (node === undefined) {
            node = this.viewSchema.NodesByID[this.nodeID];
        }
        node.text = node.NodeName;
        node.children = [];
        node.state = {
            opened: true
        };

        node.SortedChildren.forEach(function(n) {
            node.children.push(self.nodeIDToFancyTree(self.viewSchema.NodesByID[n.NodeId]));
        });
        return node;

    };


    cwLayoutNetwork.prototype.createNodeConfig = function(container) {
        var source = [];
        let q = cwAPI.getQueryStringObject();
        let tab = "tab0";
        var self = this;
        if (q.cwtabid) tab = q.cwtabid;
        if (this.viewSchema.Tab && this.viewSchema.Tab.Tabs) {
            this.viewSchema.Tab.Tabs.forEach(function(t) {
                if (t.Id === tab) {
                    t.Nodes.forEach(function(n) {
                        source.push(self.nodeIDToFancyTree(self.viewSchema.NodesByID[n]));
                    });
                }
            });
        }


        var tree = document.createElement("div");
        tree.className = "cwLayoutNetworkExpertModeNodesConfigTree";
        tree.id = "cwLayoutNetworkExpertModeNodesConfigTree" + this.nodeID;

        var prop = document.createElement("div");
        prop.className = "cwLayoutNetworkExpertModeNodesConfigProp";
        prop.id = "cwLayoutNetworkExpertModeNodesConfigProp" + this.nodeID;

        container.appendChild(tree);
        container.appendChild(prop);



        var loader = cwApi.CwAngularLoader,
            templatePath;
        loader.setup();
        var that = this;
        var self = this;

        templatePath = cwAPI.getCommonContentPath() + '/html/cwNetwork/expertModeNodeConfig.ng.html' + '?' + Math.random();

        loader.loadControllerWithTemplate('expertModeNodeConfig', $("#cwLayoutNetworkExpertModeNodesConfigProp" + self.nodeID), templatePath, function($scope) {


            $scope.data = {};
            $scope.hnode = false;
            $scope.dnode = false;
            $scope.cnode = false;
            $("#cwLayoutNetworkExpertModeNodesConfigTree" + self.nodeID).on('changed.jstree', function(e, data) {
                if (data.node && data.node.original) {
                    $scope.data = data.node.original;

                    $scope.hnode = $scope.isHiddenNode($scope.data.NodeID);
                    $scope.dnode = $scope.isDuplicateNode($scope.data.NodeID);
                    $scope.cnode = $scope.isComplementaryNode($scope.data.NodeID);

                    $scope.$apply();
                }
            }).jstree({
                'core': {
                    'data': source
                }
            });

            var g = self.options.CustomOptions['iconGroup'].split("||");

            for (var i = 0; i < g.length; i++) {
                g[i] = g[i].split(",");
            }

            $scope.groups = g;

            $scope.nodeFiltered = self.nodeFiltered;


            $scope.isComplementaryNode = function(nodeID) {
                if (self.complementaryNode.indexOf(nodeID) === -1) return false;
                else return true;
            };
            $scope.isDuplicateNode = function(nodeID) {
                if (self.duplicateNode.indexOf(nodeID) === -1) return false;
                else return true;
            };
            $scope.isHiddenNode = function(nodeID) {
                if (self.hiddenNodes.indexOf(nodeID) === -1) return false;
                else return true;
            };


            $scope.isSpecificGroup = function(nodeID, group) {
                if (self.specificGroup[nodeID] === group) return true;
                else return false;
            };
            $scope.updateComplementaryNode = function(nodeID) {
                let index = self.complementaryNode.indexOf(nodeID);
                if (this.cnode && index === -1) self.complementaryNode.push(nodeID);
                else if (index > -1 && this.cnode === false) {
                    self.complementaryNode.splice(index, 1);
                }
                $scope.complementaryNodesString = self.complementaryNode.join(',');
                self.updateNetworkData();
            };

            $scope.updateDuplicateNode = function(nodeID) {
                let index = self.duplicateNode.indexOf(nodeID);
                if (this.dnode && index === -1) self.duplicateNode.push(nodeID);
                else if (index > -1 && this.dnode === false) {
                    self.duplicateNode.splice(index, 1);
                }
                $scope.duplicateNodesString = self.duplicateNode.join(',');
                self.updateNetworkData();
            };

            $scope.updateHiddenNode = function(nodeID) {
                let index = self.hiddenNodes.indexOf(nodeID);
                if (this.hnode && index === -1) self.hiddenNodes.push(nodeID);
                else if (index > -1 && this.hnode === false) {
                    self.hiddenNodes.splice(index, 1);
                }
                $scope.hiddenNodesString = self.hiddenNodes.join(',');
                self.updateNetworkData();
            };



            $scope.complementaryNodesString = self.complementaryNode.join(',');
            $scope.duplicateNodesString = self.duplicateNode.join(',');
            $scope.hiddenNodesString = self.hiddenNodes.join(',');

            $scope.updateNetworkData = self.updateNetworkData;

        });

    };


    cwLayoutNetwork.prototype.updateNetworkData = function() {

        this.copyObject = $.extend(true, {}, this.originalObject);
        var sObject = this.manageDataFromEvolve(this.copyObject);
        this.network = new cwApi.customLibs.cwLayoutNetwork.network();
        this.network.searchForNodesAndEdges(sObject, this.nodeOptions);
        var filterContainer = document.getElementById("cwLayoutNetworkFilter" + this.nodeID);
        this.setFilters();
        
        this.edges.clear();
        this.edges.update(this.network.getVisEdges());

        var nodes = this.network.getVisNodes();


        this.nodes.forEach(function(n){

            nodes.forEach(function(nn){
                console.log(n,nn);
            });;



        });


    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));