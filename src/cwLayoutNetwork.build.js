/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery */
(function (cwApi, $) {
  "use strict";
  if (cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
    var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
  } else {
    // constructor
    var cwLayoutNetwork = function (options, viewSchema) {
      cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
      cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
      this.construct(options);
    };
  }

  cwLayoutNetwork.prototype.applyJavaScript = function () {
    if (this.init) {
      this.init = false;
      var self = this;
      var libToLoad = [];

      var networkContainer = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
      this.createLoadingElement(networkContainer.parentNode);

      // set height
      var titleReact = document.querySelector("#cw-top-bar").getBoundingClientRect();
      let topBar = document.querySelector(".page-top");
      let topBarHeight = 52;
      if (topBar) topBarHeight = topBar.getBoundingClientRect().height;
      var canvaHeight = window.innerHeight - titleReact.height - topBarHeight;
      networkContainer.setAttribute("style", "height:" + canvaHeight + "px");

      if (cwAPI.isDebugMode() === true) {
        self.loadDiagramTemplate("z_diagram_template", self.createNetworkData.bind(self));
      } else {
        libToLoad = [
          "modules/bootstrap/bootstrap.min.js",
          "modules/bootstrap-select/bootstrap-select.min.js",
          "modules/vis/vis.min.js",
          "modules/d3/d3.min.js",
          "modules/jsTree/jstree.min.js",
        ];
        // AsyncLoad
        cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad, function (error) {
          if (error === null) {
            libToLoad = ["modules/visNetworkMenu/visNetworkMenu.min.js"];
            cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad, function (error) {
              if (error === null) {
                self.loadDiagramTemplate("z_diagram_template", self.createNetworkData.bind(self));
              } else {
                cwAPI.Log.Error(error);
              }
            });
          } else {
            cwAPI.Log.Error(error);
          }
        });
      }
    }
  };
  // Building network
  cwLayoutNetwork.prototype.createNetworkData = function () {
    this.simplifyObject = this.manageDataFromEvolve(this.copyObject);
    var isData = false;

    if (this.simplifyObject.length > 0) isData = true;
    if (isData === false) console.log("No data");

    this.network = new cwApi.customLibs.cwLayoutNetwork.network(this.groupsArt, this.diagramTemplate, this.originalObjects);
    this.network.searchForNodesAndEdges(this.simplifyObject, this.nodeOptions);
    this.networkSize = Object.keys(this.originalObjects).length;
    this.createNetwork();
  };

  // Building network
  cwLayoutNetwork.prototype.createNetwork = function () {
    this.hideLoading();
    function addStyleString(str) {
      var node = document.createElement("style");
      node.innerHTML = str;
      document.body.appendChild(node);
    }

    var self = this;
    var networkContainer = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
    var objectTypeNodes = this.network.getObjectTypeNodes();
    var ObjectTypeNode, externalfilter;
    var i = 0;

    // Update Network from configuration
    if (this.networkDisposition) {
      this.network.updateDisposition(this.networkDisposition);
      this.network.updateExternalFilterInformation(this.networkDisposition.external);
    }

    // provide the data in the vis format
    var nodes = this.network.getEnabledVisNodes(); //this.network.getVisNodes());
    var edges = this.network.getVisEdges(); //this.network.getVisEdges());
    this.nodes = new vis.DataSet(nodes);
    this.edges = new vis.DataSet(edges);

    var data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    if (this.layoutConfiguration === undefined) this.layoutConfiguration = {};
    if (this.networkSize > 100) this.layoutConfiguration.improvedLayout = false;

    this.networkOptions = {
      groups: this.groupsArt,
      physics: this.physConfiguration,
      layout: this.layoutConfiguration,
      interaction: {
        keyboard: false,
      },
    };

    // filter search
    var actionContainer = document.getElementById("cwLayoutNetworkSearchBox" + this.nodeID);
    actionContainer.insertBefore(this.network.getSearchFilterObject(this.nodeID), actionContainer.firstChild);
    $(".selectNetworkSearch_" + this.nodeID).selectpicker();

    this.setFilters();

    // Event for filter
    // Move On a Node
    $("select.selectNetworkSearch_" + this.nodeID).on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var changeSet, id, nodeId, i;
      var groupArray = {};
      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        id = $(this).context.children[clickedIndex].id;
        id = id.replaceAll("¤", " ");
        var options = {
          position: self.networkUI.getPositions()[id],
          scale: 2,
          offset: {
            x: 0,
            y: 0,
          },
          animation: true, // default duration is 1000ms and default easingFunction is easeInOutQuad.
        };
        self.networkUI.moveTo(options);

        options = {
          nodes: [id],
        };
        self.networkUI.setSelection(options);
      }
      $(this).selectpicker("val", "");
    });

    // Action for button
    /* if(this.clusterOption) {
            var clusterButton = document.getElementById("cwLayoutNetworkButtonsCluster" + this.nodeID);
            clusterButton.addEventListener('click', this.clusterByHubsize.bind(this));
        }*/

    if (this.physicsOption && this.hidePhysicsButton === false) {
      var physicsButton = document.getElementById("cwLayoutNetworkButtonsPhysics" + this.nodeID);
      physicsButton.addEventListener("click", this.stopPhysics.bind(this));
    }

    this.buildEdges();
    this.enableSaveButtonEvent();
    this.enableExpertModeButtonEvent();

    if (this.removeLonely) {
      var removeLonelyButton = document.getElementById("cwLayoutNetworkButtonsLonelyNodes" + this.nodeID);
      removeLonelyButton.addEventListener("click", this.removeLonelyButtonAction.bind(this));
    }
    var downloadButton = document.getElementById("cwLayoutNetworkButtonsDownload" + this.nodeID);
    downloadButton.addEventListener("click", this.downloadImage.bind(this));

    var filterButton = document.getElementById("cwLayoutNetworkButtonsFilters" + this.nodeID);
    filterButton.addEventListener("click", this.manageFilterButton.bind(this));

    var optionButton = document.getElementById("cwLayoutNetworkButtonsOptions" + this.nodeID);
    optionButton.addEventListener("click", this.manageOptionButton.bind(this));

    var deSelectAllButton = document.getElementById("cwLayoutNetworkDeselectAll" + this.nodeID);
    deSelectAllButton.addEventListener("click", this.deActivateAllGroup.bind(this));

    var selectAllButton = document.getElementById("cwLayoutNetworkSelectAll" + this.nodeID);
    selectAllButton.addEventListener("click", this.activateAllGroup.bind(this));

    var behaviourButton = document.getElementById("cwLayoutNetworkButtonsBehaviour" + this.nodeID);
    behaviourButton.addEventListener("click", this.externalfilterModifyBehaviour.bind(this));
    this.externalfilterUpdateBehaviourTitle(behaviourButton);

    // fill the search filter
    this.nodes.on("add", this.addSearchFilterElement.bind(this));
    this.nodes.on("remove", this.removeSearchFilterElement.bind(this));

    this.activateStartingEdgeType();

    if (this.startingNetwork && this.networkConfiguration && this.networkConfiguration.nodes) {
      let startCwApiNetwork = this.networkConfiguration.nodes[Object.keys(this.networkConfiguration.nodes)[0]];
      if (startCwApiNetwork && startCwApiNetwork.configuration) {
        this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);
        this.loadCwApiNetwork(startCwApiNetwork.configuration);

        self.networkConfiguration.selected = startCwApiNetwork;
        $("select.selectNetworkConfiguration_" + this.nodeID).each(function (index) {
          // put values into filters
          $(this).selectpicker("val", startCwApiNetwork.label); //init cwAPInetworkfilter
        });
      } else if (!this.wiggle) {
        // no network to load
        // Activate Starting element
        this.activateStartingGroup();

        this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);
      }
    } else if (!this.wiggle) {
      // Activate Starting element
      this.activateStartingGroup();
      this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);
    }

    var fitButton = document.getElementById("cwLayoutNetworkButtonsFit" + this.nodeID);
    fitButton.addEventListener("click", function () {
      self.networkUI.fit();
    });

    if (this.wiggle) {
      // Activate Starting element
      this.activateStartingGroup();
    }

    // before drawing event
    this.networkUI.on("afterDrawing", this.afterDrawing.bind(this));
    this.networkUI.on("beforeDrawing", this.beforeDrawing.bind(this));

    if (this.nodes.length === 0) this.hideLoading();

    // Activate Cluster
    if (false && !this.startingNetwork) this.activateStartingCluster();

    // Creation du menu et binding
    this.createMenu(networkContainer);
    networkContainer.addEventListener("RemoveNode", this.RemoveNodeEvent.bind(this));
    networkContainer.addEventListener("AddClosesNodes", this.AddClosesNodes.bind(this));
    networkContainer.addEventListener("RemoveClosesNodes", this.RemoveClosesNodes.bind(this));
    networkContainer.addEventListener("AddAllNodesFrom", this.AddAllNodesFrom.bind(this));
    networkContainer.addEventListener("AddAllNodesTo", this.AddAllNodesTo.bind(this));
    networkContainer.addEventListener("AddAllConnectedNodes", this.AddAllConnectedNodes.bind(this));

    // Interaction Click
    this.networkUI.on("click", function (params) {
      if (self.expertMode !== true) {
        if (params.hasOwnProperty("nodes") && params.nodes.length === 1) {
          let node = self.nodes.get(params.nodes[0]);
          self.openPopOut(node.object_id, node.objectTypeScriptName);
        } else if (params.hasOwnProperty("edges") && params.edges.length === 1) {
          var edge = self.edges.get(params.edges[0]);
          self.openPopOutFromEdge(edge);
        }
      }
    });

    this.networkUI.on("dragStart", function (params) {
      if (params.hasOwnProperty("nodes") && params.nodes.length === 1) {
        self.dragged[params.nodes[0]] = true;
      }
    });

    this.networkUI.on("dragEnd", function (params) {
      if (params.hasOwnProperty("nodes") && params.nodes.length === 1) {
        delete self.dragged[params.nodes[0]];
      }
    });

    this.networkUI.on("doubleClick", function (params) {
      if (params.hasOwnProperty("nodes") && params.nodes.length === 1) {
        let node = self.nodes.get(params.nodes[0]);
        self.openObjectPage(node.object_id, node.objectTypeScriptName);
      } else if (params.hasOwnProperty("edges") && params.edges.length === 1) {
        var edge = self.edges.get(params.edges[0]);
        if (edge.scriptname && edge.object_id) {
          self.openObjectPage(edge.object_id, edge.scriptname);
        }
      }
    });

    this.networkUI.on("startStabilizing", function (params) {});

    this.networkUI.on("stabilizationProgress", function (params) {
      var widthFactor = params.iterations / params.total;
      self.displayLoading();
      self.setLoadingAt(Math.round(widthFactor * 100) + "%");
    });

    var stop = false;
    this.networkUI.on("stabilizationIterationsDone", function () {
      self.colorAllNodes();
      self.colorAllEdges();
      var span = document.getElementById("cwLayoutNetwork_text" + self.nodeID);
      self.activateStartingCluster();
      span.parentNode.removeChild(span);
      self.hideLoading();
      self.networkUI.fit({
        nodes: self.nodes.getIds(),
        animation: true,
      });
    });
    if (this.viewSchema.ViewName.indexOf("popout") !== -1) {
      this.networkUI.on("resize", function (params) {
        self.networkUI.fit({
          nodes: self.nodes.getIds(),
          animation: true,
        });
      });
    }

    if (this.networkSize > 500) {
      this.networkUI.setOptions({ edges: { smooth: { type: "continuous" } } });
      this.networkUI.setOptions({ interaction: { tooltipDelay: 200, hideEdgesOnDrag: true } });
    }

    this.fillFilter(nodes);

    if (this.physicsOptionInitialState === false) {
      this.updatePhysics(false);
      this.networkOptions.physics.enabled = true;
    }
    this.indirectSave(true);

    this.saveEvent = false;
    this.addEventOnSave();
  };

  // Building network
  cwLayoutNetwork.prototype.setFilters = function () {
    var self = this;
    var filterContainer = document.getElementById("cwLayoutNetworkFilter" + this.nodeID);
    var actionContainer = document.getElementById("cwLayoutNetworkAction" + this.nodeID);
    var networkContainer = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
    this.createFilterObjects(filterContainer);

    // Adding filter options
    //filterContainer.appendChild(this.network.getFilterOptions());
    //give bootstrap select to filter
    $(".selectNetworkPicker_" + this.nodeID).selectpicker();
    $(".selectNetworkExternal_" + this.nodeID).selectpicker();
    $(".selectNetworkConfiguration_" + this.nodeID).selectpicker();
    if (this.networkConfiguration.enableEdit && this.canCreateNetwork) {
      $(".selectNetworkConfiguration_" + this.nodeID)[0].children[1].children[0].appendChild(this.createAddButton());
    }
    $(".selectNetworkClusterByGroup_" + this.nodeID + "_child").selectpicker();
    $(".selectNetworkClusterByGroup_" + this.nodeID + "_head").selectpicker();
    $(".selectNetworkEdge_" + this.nodeID).selectpicker();

    // Event for filter
    // Network Node Selector
    $("select.selectNetworkPicker_" + this.nodeID).on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var group = $(this).context["id"];
      var scriptname = $(this).context.getAttribute("scriptname");
      var changeSet, id, i;

      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        id = $(this).context.children[clickedIndex].id;
        if (newValue === false) {
          // hide a node
          self.removeNodes([id]);
        } else {
          // add one node
          self.network.show(id, group);
          changeSet = self.network.getVisNode(id, group); // get all the node self should be put on
          self.nodes.add(changeSet); // adding nodes into network
          self.setAllExternalFilter();
          self.updatePhysics();
        }
      } else {
        // select or deselect all node
        if ($(this).context[0]) {
          var changeSet = self.network.SetAllAndGetNodesObject($(this).context[0].selected, group);
          if ($(this).context[0].selected === true) {
            self.nodes.add(changeSet);
            self.updatePhysics();
          } else {
            self.removeNodes(changeSet);
          }
          if (self.networkUI) {
            self.colorAllNodes();
            self.colorAllEdges();
          }
          self.setExternalFilterToNone();
        }
      }
    });

    // Event for filter
    // Edge Selector
    $("select.selectNetworkEdge_" + this.nodeID).on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var group = $(this).context["id"];
      var scriptname = $(this).context.getAttribute("scriptname");
      var changeSet, id, nodeId, i;

      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        id = $(this).context.children[clickedIndex].id;
        if (newValue === false) {
          // hide a node
          self.edgeConfiguration[id].show = false;
          self.hideEdgeByScriptname(id, true);
        } else {
          // add one node
          self.edgeConfiguration[id].show = true;
          self.showEdgeByScriptname(id, true);
        }
      } else {
        // select or deselect all node
        if ($(this).context[0]) {
          if ($(this).context[0].selected === true) {
            self.showAllEdgesByScriptname();
          } else {
            self.hideAllEdgesByScriptname();
          }
          if (self.networkUI) {
            self.colorAllNodes();
            self.colorAllEdges();
          }
        }
      }
    });

    // Cluster Group Filter Head
    $("select.selectNetworkClusterByGroup_" + this.nodeID + "_head").on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var group = $(this).context["id"];
      if (clickedIndex !== undefined) {
        self.selectedCluster = $(this).selectpicker("val").replaceAll("_", " ");
        self.fillClusterFilter(self.selectedCluster);
      }
    });

    // Cluster Group Filter Child
    $("select.selectNetworkClusterByGroup_" + this.nodeID + "_child").on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        let option = self.clusterByGroupOption[self.selectedCluster];
        let value = $(this).context.children[clickedIndex].value;
        if (newValue === true) {
          self.clusterByGroupOption[self.selectedCluster].push(value);
        } else {
          self.clusterByGroupOption[self.selectedCluster] = option.filter(function (c) {
            return c !== value;
          });
        }

        self.clusterByGroup();
      }
    });

    // External Filter
    $("select.selectNetworkExternal_" + this.nodeID).on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var group = $(this).context["id"];
      var filterName = $(this).context.getAttribute("filterName");
      var nodesArray, id, nodeId, i, changeSet;

      var allNodes;

      if (self.behaviour.absolute === true) {
        self.deActivateAllGroup();
      }

      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        id = $(this).context.children[clickedIndex].id;
        if (newValue === false) {
          // hide a node
          self.removeExternalFilterValue(filterName, id);
        } else {
          self.addExternalFilterValue(filterName, id);
          self.setAllExternalFilter();
        }
      } else {
        // select or deselect all node
        if ($(this).context[0]) {
          if ($(this).context[0].selected === true) {
            self.addAllExternalFilterValue(filterName, id);
          } else {
            self.removeAllExternalFilterValue(filterName, id);
          }
        }
      }
      self.setAllExternalFilter();
    });

    // Event for filter
    // Load a new network
    $("select.selectNetworkConfiguration_" + this.nodeID).on("changed.bs.select", function (e, clickedIndex, newValue, oldValue) {
      var changeSet, id, nodeId, i, config;
      var groupArray = {};
      if (clickedIndex !== undefined && $(this).context.children && $(this).context.children[clickedIndex]) {
        id = $(this).context.children[clickedIndex].id;
        if (id != 0) {
          config = self.networkConfiguration.nodes[id].configuration;
          self.networkConfiguration.selected = self.networkConfiguration.nodes[id];
          self.loadCwApiNetwork(config);
        }
      }
      if (cwAPI.isDebugMode() === true) console.log("network set");
    });
  };

  // Save Button Event
  cwLayoutNetwork.prototype.enableSaveButtonEvent = function () {
    var saveButton = document.getElementById("nodeConfigurationSaveButton_" + this.nodeID);
    if (saveButton) {
      saveButton.addEventListener("click", this.saveIndexPage.bind(this));
    }
  };

  // Expert Mode Button Event
  cwLayoutNetwork.prototype.enableExpertModeButtonEvent = function () {
    if (this.expertModeAvailable) {
      var expertButton = document.getElementById("cwLayoutNetworkExpertModeButton" + this.nodeID);
      if (expertButton) {
        expertButton.addEventListener("click", this.manageExpertMode.bind(this));
      }
    }
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
