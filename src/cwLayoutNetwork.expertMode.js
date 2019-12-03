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
    cwApi.CwAsyncLoader.load("angular", function() {
      if (self.expertMode === true) {
        self.expertMode = false;
        event.target.innerText = $.i18n.prop("activate_expert_mode");
        event.target.classList.remove("selected");
        cwAPI.CwPopout.hide();
      } else {
        self.expertMode = true;
        event.target.innerText = $.i18n.prop("deactivate_expert_mode");
        event.target.classList.add("selected");
        cwApi.CwPopout.showPopout($.i18n.prop("expert_mode"));

        cwApi.CwPopout.setContent(self.createExpertModeElement());
        self.setEventForExpertMode();
        cwApi.CwPopout.onClose(function() {
          self.expertMode = false;
          event.target.innerText = $.i18n.prop("activate_expert_mode");
        });
      }
    });
  };

  // manage Expert Mode
  cwLayoutNetwork.prototype.createExpertModeElement = function() {
    var self = this;
    var tab = [];
    var tabs = ["networkNode", "networkPhysics", "networkGroups"];
    var expertModeConfig = document.createElement("div");
    expertModeConfig.className = "cwLayoutNetworkExpertModeConfig";
    expertModeConfig.id = "cwLayoutNetworkExpertModeConfig" + this.nodeID;

    var cwLayoutNetworkExpertModeContainerTab = document.createElement("div");
    cwLayoutNetworkExpertModeContainerTab.className = "cwLayoutNetworkExpertModeContainerTab";
    cwLayoutNetworkExpertModeContainerTab.id = "cwLayoutNetworkExpertModeContainerTab" + this.nodeID;
    expertModeConfig.appendChild(cwLayoutNetworkExpertModeContainerTab);

    var expertModeContainer = document.createElement("div");
    expertModeContainer.className = "cwLayoutNetworkExpertModeContainer";
    expertModeContainer.id = "cwLayoutNetworkExpertModeContainer";
    expertModeConfig.appendChild(expertModeContainer);

    tabs.forEach(function(t) {
      let tab = document.createElement("div");
      tab.className = "cwLayoutNetworkExpertModeTabs";
      tab.id = t;
      tab.innerText = $.i18n.prop(t);
      cwLayoutNetworkExpertModeContainerTab.appendChild(tab);
    });
    let tabElem = document.createElement("div");
    tabElem.className = "cwLayoutNetworkExpertModeTabs";
    tabElem.id = "saveconfiguration";
    tabElem.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
    cwLayoutNetworkExpertModeContainerTab.appendChild(tabElem);

    return expertModeConfig;
  };

  cwLayoutNetwork.prototype.setEventForExpertMode = function() {
    var self = this;
    var $container = $("#cwLayoutNetworkExpertModeContainer");
    let matches = document.querySelectorAll(".cwLayoutNetworkExpertModeTabs");
    for (let i = 0; i < matches.length; i++) {
      let t = matches[i];
      t.addEventListener("click", function(event) {
        var loader = cwApi.CwAngularLoader;
        loader.setup();

        if (t.id === "saveconfiguration") {
          cwAPI.customLibs.utils.copyToClipboard(JSON.stringify(self.config));
        }
        let templatePath = cwAPI.getCommonContentPath() + "/html/cwNetwork/" + t.id + ".ng.html" + "?" + Math.random();
        self.unselectTabs();
        t.className += " selected";
        loader.loadControllerWithTemplate(t.id, $container, templatePath, function($scope) {
          $scope.metamodel = cwAPI.mm.getMetaModel();
          $scope.config = self.config;
          $scope.cwApi = cwApi;

          $scope.toggle = function(c, e) {
            if (c.hasOwnProperty(e)) delete c[e];
            else c[e] = true;
          };

          $scope.toggleArray = function(c, e) {
            var i = c.indexOf(e);
            if (i === -1) c.push(e);
            else c.splice(i, 1);
          };

          if (self["controller_" + t.id] && $scope.config) self["controller_" + t.id]($container, templatePath, $scope);
        });
      });
    }
  };

  cwLayoutNetwork.prototype.controller_networkGroups = function($container, templatePath, $scope) {
    $scope.bootstrapFilter = this.bootstrapFilter;
    $scope.checkIfContainObjectType = this.checkIfGroupMatchTemplate.bind(self);
    $scope.diagramTemplate = this.diagramTemplate;
    $scope.addGroup = this.addGroup.bind(self);
    $scope.getObjectTypeName = cwApi.getObjectTypeName;

    $scope.checkIfErrorOnProperties = function(nodeID, group) {
      if ($scope.errorsTemplate[group] && Object.keys($scope.errorsTemplate[group][nodeID].properties).length > 0) {
        return true;
      } else return false;
    };

    $scope.checkIfErrorOnAssociation = function(nodeID, group) {
      if ($scope.errorsTemplate[group] && Object.keys($scope.errorsTemplate[group][nodeID].associations).length > 0) {
        return true;
      } else return false;
    };

    $scope.updateSplitGroupPropertyNode = this.updateSplitGroupPropertyNode.bind(self);
  };

  cwLayoutNetwork.prototype.unselectTabs = function(tabs) {
    let matches = document.querySelectorAll(".cwLayoutNetworkExpertModeTabs");
    for (let i = 0; i < matches.length; i++) {
      let t = matches[i];
      t.className = t.className.replaceAll(" selected", "");
    }
  };

  cwLayoutNetwork.prototype.setExpertModePhysics = function(container) {
    var self = this;

    this.networkUI.options.configure = {
      filter: function(option, path) {
        if (path.indexOf("physics") !== -1) {
          return true;
        }
        if (path.indexOf("layout") !== -1) {
          return true;
        }
        return false;
      },
      container: container,
    };
    this.networkUI.setOptions(this.networkUI.options);

    var buttonPhysicsConfig = document.getElementById("cwLayoutNetworkButtonPhysicsConfig" + this.nodeID);
    if (buttonPhysicsConfig === null) {
      buttonPhysicsConfig = document.createElement("button");
      buttonPhysicsConfig.className = "cwLayoutNetworkButtonPhysicsConfig k-grid k-button";
      buttonPhysicsConfig.id = "cwLayoutNetworkButtonPhysicsConfig" + this.nodeID;
      buttonPhysicsConfig.innerText = "Physics Configuration";
    }

    buttonPhysicsConfig.addEventListener("click", function(event) {
      let json = {};
      json.layout = self.networkUI.layoutEngine.options;
      json.phys = self.networkUI.physics.options;
      cwAPI.customLibs.utils.copyToClipboard(JSON.stringify(json));
    });

    container.appendChild(buttonPhysicsConfig);
  };

  cwLayoutNetwork.prototype.addGroup = function(groups) {
    var g = [];
    g[0] = "New Group";
    g[1] = "ellipse";
    g[2] = Math.floor(Math.random() * 16777215).toString(16);
    g[3] = Math.floor(Math.random() * 16777215).toString(16);
    g[4] = false;
    g[5] = false;
    groups.push(g);
    this.updateGroups(groups, g);
  };

  cwLayoutNetwork.prototype.updateSplitGroupPropertyNode = function(group, value) {
    if (value === "none") this.splitGroupByProperty[group] = undefined;
    else this.splitGroupByProperty[group] = value;

    this.angularScope.splitGroupByPropertyString = "";
    for (let i in this.angularScope.splitGroupByProperty) {
      if (this.angularScope.splitGroupByProperty.hasOwnProperty(i)) {
        this.angularScope.splitGroupByPropertyString += i + "," + this.angularScope.splitGroupByProperty[i] + "#";
      }
    }
    this.options.CustomOptions["separateObjectTypeGroupByProperty"] = this.angularScope.splitGroupByPropertyString;

    this.updateNetworkData();
    this.angularScope.configString = this.options.CustomOptions["iconGroup"];

    this.angularScope.groups = this.options.CustomOptions["iconGroup"].split("||");
    for (var i = 0; i < this.angularScope.groups.length; i++) {
      this.angularScope.groups[i] = this.angularScope.groups[i].split(",");
      if (this.groupToSelectOnStart.indexOf(this.angularScope.groups[i][0]) !== -1) this.angularScope.groups[i][4] = true;
      else this.angularScope.groups[i][4] = false;
    }
  };

  cwLayoutNetwork.prototype.updateGroups = function(groups, changeGroup) {
    var output = "";
    var self = this;
    var gts = "";
    groups.forEach(function(g, index) {
      g.forEach(function(c, index2) {
        if (index2 < 5) {
          output += c;
          if (index2 < 4) output += ",";
        }
      });
      if (g[4] === true) gts += g[0] + ",";
      if (index < groups.length - 1) output += "||";
    });

    if (gts !== "") gts = gts.substring(0, gts.length - 1);

    // starting group
    let index = self.groupToSelectOnStart.indexOf(changeGroup[0]);
    if (changeGroup[4] === true && index === -1) self.groupToSelectOnStart.push(changeGroup[0]);
    else if (index > -1 && changeGroup[4] === false) {
      self.groupToSelectOnStart.splice(index, 1);
    }

    this.errors.diagrameTemplate[changeGroup[1]] = {};

    this.getFontAwesomeList(output);
    var opt = {};
    opt.groups = this.groupsArt;
    this.networkUI.setOptions(opt);
    this.angularScope.configString = output;
    this.angularScope.groupToSelectOnStartString = gts;
    this.options.CustomOptions["groupToSelectOnStart"] = gts;
    this.groupString = output;
    this.options.CustomOptions["iconGroup"] = output;
    this.setAllExternalFilter();

    var nu = [];
    var positions = this.networkUI.getPositions();
    this.imageTemplate = {};
    this.nodes.forEach(function(node) {
      if (changeGroup && node.group === changeGroup[0]) {
        let img = self.shapeToImage(node);
        if (img) {
          self.network.objectTypeNodes[node.group].nodes[node.id].dataImage = img;
          node.image = img;
          node.shape = "image";
        }
        nu.push(node);
      }
    });

    self.nodes.update(nu);
    if (this.angularScope) {
      this.angularScope.errorsTemplate = this.errors.diagrameTemplate;
      //this.angularScope.$apply();
    }
  };

  cwLayoutNetwork.prototype.bootstrapFilter = function(id, value) {
    window.setTimeout(function(params) {
      $("#" + id).selectpicker();
      $("#" + id).selectpicker("val", value);
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

  cwLayoutNetwork.prototype.nodeIDToFancyTree = function(node, noLoop) {
    var self = this;
    if (node === undefined) {
      node = this.viewSchema.NodesByID[this.nodeID];
    }
    node.text = node.NodeName;
    node.children = [];
    node.state = {
      opened: true,
    };

    if (noLoop !== true) {
      node.SortedChildren.forEach(function(n) {
        node.children.push(self.nodeIDToFancyTree(self.viewSchema.NodesByID[n.NodeId]));
      });
    }

    return node;
  };

  cwLayoutNetwork.prototype.createNodeConfig = function(container) {
    var tmpsource = [],
      source = [];
    let q = cwApi.getQueryStringObject();
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
    } else {
      self.viewSchema.RootNodesId.forEach(function(n) {
        source.push(self.nodeIDToFancyTree(self.viewSchema.NodesByID[n]));
      });
    }

    if (cwApi.isIndexPage() === false) {
      tmpsource.push(self.nodeIDToFancyTree(self.viewSchema.NodesByID[self.viewSchema.RootNodesId[0]]));
      tmpsource[0].children = source;
      source = tmpsource;
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

    templatePath = cwAPI.getCommonContentPath() + "/html/cwNetwork/expertModeNodeConfig.ng.html" + "?" + Math.random();

    loader.loadControllerWithTemplate("expertModeNodeConfig", $("#cwLayoutNetworkExpertModeNodesConfigProp" + self.nodeID), templatePath, function($scope) {
      $scope.data = {};
      $scope.config = {};
      $scope.config.hnode = false;
      $scope.config.dnode = false;
      $scope.config.cnode = false;
      $scope.config.egroup = "";

      $scope.optionString = {};
      $("#cwLayoutNetworkExpertModeNodesConfigTree" + self.nodeID)
        .on("changed.jstree", function(e, data) {
          if (data.node && data.node.original) {
            $scope.data = data.node.original;

            $scope.config.hnode = $scope.isHiddenNode($scope.data.NodeID);
            $scope.config.dnode = $scope.isDuplicateNode($scope.data.NodeID);
            $scope.config.cnode = $scope.isComplementaryNode($scope.data.NodeID);

            if (self.specificGroup[$scope.data.NodeID]) $scope.config.sgroup = self.specificGroup[$scope.data.NodeID];
            else $scope.config.sgroup = "None";

            if (self.directionList[$scope.data.NodeID]) $scope.config.aDirection = self.directionList[$scope.data.NodeID];
            else $scope.config.aDirection = "None";

            if (self.nodeFiltered[data.node.original.NodeID]) $scope.config.egroup = self.nodeFiltered[data.node.original.NodeID][0];
            else $scope.config.egroup = "";

            $scope.$apply();
          }
        })
        .jstree({
          core: {
            data: source,
          },
        });

      var g = self.options.CustomOptions["iconGroup"].split("||");

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
        if ($scope.config.cnode && index === -1) self.complementaryNode.push(nodeID);
        else if (index > -1 && $scope.config.cnode === false) {
          self.complementaryNode.splice(index, 1);
        }
        $scope.optionString.complementaryNodesString = self.complementaryNode.join(",");
        self.complementaryNodesString = $scope.optionString.complementaryNodesString;
        self.updateNetworkData();
      };

      $scope.updateDuplicateNode = function(nodeID) {
        let index = self.duplicateNode.indexOf(nodeID);
        if ($scope.config.dnode && index === -1) self.duplicateNode.push(nodeID);
        else if (index > -1 && $scope.config.dnode === false) {
          self.duplicateNode.splice(index, 1);
        }
        $scope.optionString.duplicateNodesString = self.duplicateNode.join(",");
        self.duplicateNodesString = $scope.optionString.duplicateNodesString;
        self.updateNetworkData();
        $(".selectNetworkPicker_" + self.nodeID + "." + $scope.config.sgroup.replaceAll(" ", "_")).selectpicker("selectAll");
      };

      $scope.updateHiddenNode = function(nodeID) {
        let index = self.hiddenNodes.indexOf(nodeID);
        if ($scope.config.hnode && index === -1) self.hiddenNodes.push(nodeID);
        else if (index > -1 && $scope.config.hnode === false) {
          self.hiddenNodes.splice(index, 1);
        }
        $scope.optionString.hiddenNodesString = self.hiddenNodes.join(",");
        self.hiddenNodesString = self.hiddenNodes.join(",");
        self.updateNetworkData();
      };

      $scope.updateExtFilters = function(string, nodeID) {
        if (string === "" || string.length < 2) {
          delete self.nodeFiltered[nodeID];
        } else {
          self.nodeFiltered[nodeID] = [string];
        }

        var newNodeFilteredString = "";
        for (var n in self.nodeFiltered) {
          if (self.nodeFiltered.hasOwnProperty(n)) {
            newNodeFilteredString += n + ":" + self.nodeFiltered[n] + "#";
          }
        }
        if (newNodeFilteredString != "") newNodeFilteredString = newNodeFilteredString.slice(0, -1);
        self.externalFilters = {};
        self.nodeFiltered = {};
        self.getExternalFilterNodes(newNodeFilteredString);
        self.updateNetworkData();
        self.newNodeFilteredString = newNodeFilteredString;
        $scope.optionString.nodeFilteredString = newNodeFilteredString;
      };

      $scope.copyToClipboard = cwAPI.customLibs.utils.copyToClipboard;

      $scope.updateSpecificGroups = function(sgroup, nodeID) {
        if (sgroup === "None") {
          delete self.specificGroup[nodeID];
        } else {
          self.specificGroup[nodeID] = sgroup;
        }

        this.specificGroupString = "";
        for (var n in self.specificGroup) {
          if (self.specificGroup.hasOwnProperty(n)) {
            this.specificGroupString += n + "," + self.specificGroup[n] + "#";
          }
        }
        if (this.specificGroupString != "") this.specificGroupString = this.specificGroupString.slice(0, -1);
        self.specificGroup = {};
        self.options.CustomOptions["specificGroup"] = this.specificGroupString;
        self.specificGroupString = this.specificGroupString;
        $scope.optionString.specificGroupString = this.specificGroupString;
        self.getOption("specificGroup", "specificGroup", "#", ",");
        self.updateNetworkData();
      };

      $scope.updateArrowDirection = function(dir, nodeID) {
        if (dir === "None") {
          delete self.directionList[nodeID];
        } else {
          self.directionList[nodeID] = dir;
        }

        $scope.optionString.directionListString = "";
        for (var n in self.directionList) {
          if (self.directionList.hasOwnProperty(n)) {
            $scope.optionString.directionListString += n + "," + self.directionList[n] + "#";
          }
        }
        if ($scope.optionString.directionListString != "") $scope.optionString.directionListString = $scope.optionString.directionListString.slice(0, -1);
        self.directionList = {};
        self.options.CustomOptions["arrowDirection"] = $scope.optionString.directionListString;
        self.directionListString = $scope.optionString.directionListString;

        self.getdirectionList($scope.optionString.directionListString);
        self.updateNetworkData();
      };

      $scope.optionString.complementaryNodesString = self.complementaryNode.join(",");
      $scope.optionString.duplicateNodesString = self.duplicateNode.join(",");
      $scope.optionString.hiddenNodesString = self.hiddenNodes.join(",");
      $scope.optionString.nodeFilteredString = self.options.CustomOptions["filterNode"];
      $scope.optionString.directionListString = self.options.CustomOptions["arrowDirection"];
      $scope.optionString.updateNetworkData = self.updateNetworkData;
      $scope.optionString.specificGroupString = self.options.CustomOptions["specificGroup"];
    });
  };

  cwLayoutNetwork.prototype.updateNetworkData = function() {
    this.setExternalFilterToNone();
    this.disableGroupClusters();

    this.copyObject = $.extend(true, {}, this.originalObject);
    var sObject = this.manageDataFromEvolve(this.copyObject);
    this.network = new cwApi.customLibs.cwLayoutNetwork.network();
    this.network.searchForNodesAndEdges(sObject, this.nodeOptions);

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

    this.nodes.forEach(function(n) {
      var s = nodes.every(function(nn) {
        if (n.id === nn.id) {
          nn.x = nodePosition[n.id].x;
          nn.y = nodePosition[n.id].y;
          changeset.push(nn);
          return false;
        }
        return true;
      });
      if (s) nodeToRemove.push(n.id);
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
    this.activateStartingGroup();
    this.enableSaveButtonEvent();
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
