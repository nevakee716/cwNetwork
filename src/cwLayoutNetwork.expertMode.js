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
            $scope.configString = self.options.CustomOptions['iconGroup'];
            for (var i = 0; i < g.length; i++) {
                g[i] = g[i].split(",");
            }
            if(g[g.length - 1].length < 5) g.push(["Add a new group","","","",true]);
            
            $scope.groups = g;
            $scope.updateGroups = self.updateGroups.bind(self);
            $scope.bootstrapFilter = self.bootstrapFilter;
            $scope.checkIfContainObjectType = self.checkIfGroupMatchTemplate.bind(self);
            $scope.diagramTemplate = self.diagramTemplate;
            $scope.addGroup = self.addGroup.bind(self);
        });
    };


    cwLayoutNetwork.prototype.addGroup = function(groups,changeGroup) {
        changeGroup.pop();
        groups.push(["Add a new group","","","",true]);
        this.updateGroups(groups,changeGroup);
    };

    cwLayoutNetwork.prototype.updateGroups = function(groups,changeGroup) {
        if(changeGroup.length < 5) {
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
        }


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
            $scope.e = {};
            $scope.hnode = false;
            $scope.dnode = false;
            $scope.cnode = false;
            $scope.e.group = "";
            $("#cwLayoutNetworkExpertModeNodesConfigTree" + self.nodeID).on('changed.jstree', function(e, data) {
                if (data.node && data.node.original) {
                    $scope.data = data.node.original;

                    $scope.hnode = $scope.isHiddenNode($scope.data.NodeID);
                    $scope.dnode = $scope.isDuplicateNode($scope.data.NodeID);
                    $scope.cnode = $scope.isComplementaryNode($scope.data.NodeID);


                    if(self.directionList[$scope.data.NodeID]) $scope.aDirection = self.directionList[$scope.data.NodeID];
                    else $scope.aDirection = "None";

                    if(self.nodeFiltered[data.node.original.NodeID]) $scope.e.group = self.nodeFiltered[data.node.original.NodeID][0];
                    else $scope.e.group = "";

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
                $('.selectNetworkPicker_' + self.nodeID + "." + sgroup.replaceAll(" ", "_")).selectpicker('selectAll');
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


            $scope.updateExtFilters = function(string,nodeID) {

                if(string === "" || string.length < 2) {
                    delete self.nodeFiltered[nodeID];
                } else {
                    self.nodeFiltered[nodeID] = [string];
                }

                var newNodeFilteredString = "";
                for(var n in self.nodeFiltered) {
                    if(self.nodeFiltered.hasOwnProperty(n)) {
                        newNodeFilteredString += n + ":" + self.nodeFiltered[n] + "#";
                    }
                }
                if(newNodeFilteredString != "") newNodeFilteredString = newNodeFilteredString.slice(0, -1);
                self.externalFilters = {};
                self.nodeFiltered = {};
                self.getExternalFilterNodes(newNodeFilteredString);
                self.updateNetworkData();
                $scope.nodeFilteredString = newNodeFilteredString;
            };


            $scope.updateSpecificGroups = function(sgroup,nodeID) {

                if(sgroup === "None") {
                    delete self.specificGroup[nodeID];
                } else {
                    self.specificGroup[nodeID] = sgroup;
                }


                this.specificGroupString = "";
                for(var n in self.specificGroup) {
                    if(self.specificGroup.hasOwnProperty(n)) {
                        this.specificGroupString += n + "," + self.specificGroup[n] + "#";
                    }
                }
                if(this.specificGroupString != "") this.specificGroupString = this.specificGroupString.slice(0, -1);
                self.specificGroup = {};
                self.options.CustomOptions['specificGroup'] = this.specificGroupString;
                self.getOption('specificGroup','specificGroup','#',',');
                self.updateNetworkData();
                $('.selectNetworkPicker_' + self.nodeID + "." + sgroup.replaceAll(" ", "_")).selectpicker('selectAll');

            };


            $scope.updateArrowDirection = function(dir,nodeID) {


                if(dir === "None") {
                    delete self.directionList[nodeID];
                } else {
                    self.directionList[nodeID] = dir;
                }


                $scope.directionListString = "";
                for(var n in self.directionList) {
                    if(self.directionList.hasOwnProperty(n)) {
                        $scope.directionListString += n + "," + self.directionList[n] + "#";
                    }
                }
                if($scope.directionListString != "") $scope.directionListString = $scope.directionListString.slice(0, -1);
                self.directionList = {};
                self.options.CustomOptions['arrowDirection'] = $scope.directionListString;
                self.getdirectionList($scope.directionListString);
                self.updateNetworkData();

            };




            $scope.complementaryNodesString = self.complementaryNode.join(',');
            $scope.duplicateNodesString = self.duplicateNode.join(',');
            $scope.hiddenNodesString = self.hiddenNodes.join(',');
            $scope.nodeFilteredString = self.options.CustomOptions['filterNode'];
            $scope.directionListString = self.options.CustomOptions['arrowDirection'];
            $scope.updateNetworkData = self.updateNetworkData;

        });

    };


    cwLayoutNetwork.prototype.updateNetworkData = function() {
        this.setExternalFilterToNone(); 
        this.disableGroupClusters();
        this.copyObject = $.extend(true, {}, this.originalObject);
        var sObject = this.manageDataFromEvolve(this.copyObject);
        this.network = new cwApi.customLibs.cwLayoutNetwork.network();
        this.network.searchForNodesAndEdges(sObject, this.nodeOptions);
        var filterContainer = document.getElementById("cwLayoutNetworkFilter" + this.nodeID);
        this.setFilters();

        var opt = {};
        opt.groups = this.groupsArt;
        this.networkUI.setOptions(opt);
            
        this.edges.clear();
        this.edges.update(this.network.getVisEdges());

        var nodes = this.network.getVisNodes();
        var changeset = [];
        var nodeToRemove = [];
        let nodePosition = this.networkUI.getPositions();

        this.nodes.forEach(function(n){
            var s = nodes.every(function(nn){
                if(n.id === nn.id){
                    nn.x = nodePosition[n.id].x;
                    nn.y = nodePosition[n.id].y;
                    changeset.push(nn);
                    return false;
                }
                return true;
            });;
            if(s) nodeToRemove.push(n.id);
        });


        this.nodes.remove(nodeToRemove);
        this.fillFilter(changeset);
        this.network.setNodesFromChangeset(changeset);
        this.nodes.update(changeset);  
        changeset = [];
        this.nodes.forEach(function(node) {
            node.resized = undefined;
            node.widthConstraint = undefined;
            node.heightConstraint = undefined;
            node.color = undefined;
            node.x = undefined;
            node.y = undefined;
            changeset.push(node);
        });

        this.nodes.update(changeset);
        this.buildEdges();



    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));