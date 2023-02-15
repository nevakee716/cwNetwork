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

  cwLayoutNetwork.prototype.fillFilter = function (changeSet) {
    var groupArray = {};
    for (i = 0; i < changeSet.length; i += 1) {
      // put all nodes into groups
      if (!groupArray.hasOwnProperty(changeSet[i].group)) {
        groupArray[changeSet[i].group] = [];
      }
      groupArray[changeSet[i].group].push(changeSet[i].label.replace(/\n/g, " "));
    }

    $("select.selectNetworkPicker_" + this.nodeID).each(function (index) {
      // put values into filters
      if ($(this).val()) {
        $(this).selectpicker("val", $(this).val().concat(groupArray[$(this).attr("name")]));
      } else {
        $(this).selectpicker("val", groupArray[$(this).attr("name")]);
      }
    });
  };

  cwLayoutNetwork.prototype.checkSelectAllForFilter = function (jThis, clickedIndex) {
    if (cwAPI.cwConfigs.EnabledVersion.indexOf("v2022") !== -1 && $(this)[0] && $(this).val().length > 0) {
      return true;
    }
    if (
      cwAPI.cwConfigs.EnabledVersion.indexOf("v2022") === -1 &&
      clickedIndex !== undefined &&
      jThis.context.children &&
      jThis.context.children[clickedIndex]
    ) {
      return jThis.context.children[clickedIndex].id;
    }
    return null;
  };

  cwLayoutNetwork.prototype.getCheckForSelectAll = function (jThis) {
    let a = cwAPI.cwConfigs.EnabledVersion.indexOf("v2022") !== -1 ? jThis[0] : jThis.context[0];
    let b = cwAPI.cwConfigs.EnabledVersion.indexOf("v2022") === -1 ? jThis.val().length > 0 : jThis.context[0].selected === true;
    return [a, b];
  };

  cwLayoutNetwork.prototype.fillClusterFilter = function (clusterGroupName) {
    let self = this;
    $("select.selectNetworkClusterByGroup_" + this.nodeID + "_child").each(function (index) {
      if (self.clusterByGroupOption[clusterGroupName] === undefined) self.clusterByGroupOption[clusterGroupName] = [];
      $(this).selectpicker("val", self.clusterByGroupOption[clusterGroupName]);
    });
  };

  // Create Filter selector
  cwLayoutNetwork.prototype.createFilterObjects = function (filterContainer) {
    filterContainer.className += " cwLayoutNetork_filterSection";
    filterContainer.innerHTML = "";
    var externalfilter,
      objectTypeNode,
      objectTypeNodes = this.network.getObjectTypeNodes();

    var filterGroupObject = document.createElement("div");
    filterGroupObject.className = "LayoutNetork_filterGroup";

    var filterGroupObjectTitle = document.createElement("div");
    filterGroupObjectTitle.innerHTML = $.i18n.prop("objects_filters") + " : ";
    filterGroupObjectTitle.className = "LayoutNetork_filterTitle";
    var filterGroupObjectFilters = document.createElement("div");
    filterGroupObjectFilters.className = "bootstrap-iso";

    var i = 0;
    // Adding filter for all selector group
    for (objectTypeNode in objectTypeNodes) {
      if (objectTypeNodes.hasOwnProperty(objectTypeNode)) {
        let f = objectTypeNodes[objectTypeNode].getFilterObject(this.nodeID, this.groupsArt);
        f.className += " cwLayout_networkSelect";
        filterGroupObjectFilters.appendChild(f);
        i += 1;
      }
    }
    if (i > 0) {
      filterGroupObject.appendChild(filterGroupObjectTitle);
      filterGroupObject.appendChild(filterGroupObjectFilters);
      filterContainer.appendChild(filterGroupObject);
    }

    if (this.edgeConfiguration && !(Object.keys(this.edgeConfiguration).length === 0 && this.edgeConfiguration.constructor === Object)) {
      var edgeFilterObject = document.createElement("div");
      edgeFilterObject.className = "LayoutNetork_filterGroup";
      var edgeFilterObjectTitle = document.createElement("div");
      edgeFilterObjectTitle.className = "LayoutNetork_filterTitle";
      edgeFilterObjectTitle.innerHTML = $.i18n.prop("link_type") + " : ";

      var edgeFilterObjectFilters = document.createElement("div");
      edgeFilterObjectFilters.className = "bootstrap-iso";
      let edgeFilter = this.getEdgeFilterObject("selectNetworkEdge_" + this.nodeID);
      edgeFilter.className += " cwLayout_networkSelect";
      edgeFilterObjectFilters.appendChild(edgeFilter);

      edgeFilterObject.appendChild(edgeFilterObjectTitle);
      edgeFilterObject.appendChild(edgeFilterObjectFilters);

      filterContainer.appendChild(edgeFilterObject);
    }

    i = 0;

    var associationFilterObject = document.createElement("div");
    associationFilterObject.className = "LayoutNetork_filterGroup";
    var associationFilterObjectTitle = document.createElement("div");
    associationFilterObjectTitle.innerHTML = $.i18n.prop("external_association") + " :";
    associationFilterObjectTitle.className = "LayoutNetork_filterTitle";
    var associationFilterObjectFilters = document.createElement("div");
    associationFilterObjectFilters.className = "bootstrap-iso";
    for (externalfilter in this.externalFilters) {
      if (this.externalFilters.hasOwnProperty(externalfilter)) {
        let extFilter = this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal_" + this.nodeID);
        extFilter.className += " cwLayout_networkSelect";
        associationFilterObjectFilters.appendChild(extFilter);
        i += 1;
      }
    }
    if (i > 0) {
      associationFilterObject.appendChild(associationFilterObjectTitle);

      associationFilterObject.appendChild(associationFilterObjectFilters);
      filterContainer.appendChild(associationFilterObject);
    }

    if (this.clusterOption) {
      var clusterFilterObject = document.createElement("div");
      clusterFilterObject.className = "LayoutNetork_filterGroup bootstrap-iso";

      var clusterFilterObjectTitle = document.createElement("div");
      clusterFilterObjectTitle.className = "LayoutNetork_filterTitle";
      clusterFilterObjectTitle.innerHTML = $.i18n.prop("cluster_by_groups");

      var clusterFilterObjectFilterHead = document.createElement("div");
      clusterFilterObjectFilterHead = this.network.getFilterClusterByGroupHead("selectNetworkClusterByGroup_" + this.nodeID);
      clusterFilterObjectFilterHead.className += " cwLayout_networkSelect";
      var clusterFilterObjectFilterChilds = document.createElement("div");
      clusterFilterObjectFilterChilds = this.network.getFilterClusterByGroupChilds("selectNetworkClusterByGroup_" + this.nodeID);
      clusterFilterObjectFilterChilds.className += " cwLayout_networkSelect";

      clusterFilterObject.appendChild(clusterFilterObjectTitle);
      clusterFilterObject.appendChild(clusterFilterObjectFilterHead);
      clusterFilterObject.appendChild(clusterFilterObjectFilterChilds);
      filterContainer.appendChild(clusterFilterObject);
    }
    if (this.networkConfiguration && this.networkConfiguration.enableEdit) {
      var configurationFilterObject = document.createElement("div");
      configurationFilterObject.className = "LayoutNetork_filterGroup";

      var configurationFilterObjectTitle = document.createElement("div");
      configurationFilterObjectTitle.className = "LayoutNetork_filterTitle";
      configurationFilterObjectTitle.innerHTML = "   " + $.i18n.prop("network");

      configurationFilterObject.appendChild(configurationFilterObjectTitle);

      var wrapper = document.createElement("span");
      wrapper.className = "bootstrap-iso";

      let networkConfigurationFilter = this.getNetworkConfigurationFilterObject("selectNetworkConfiguration_" + this.nodeID);
      networkConfigurationFilter.className += " cwLayout_networkSelect";
      wrapper.appendChild(networkConfigurationFilter);

      configurationFilterObject.appendChild(wrapper);

      if (this.canUpdateNetwork) {
        var configurationFilterObjectButton = document.createElement("a");

        configurationFilterObjectButton.className = "btn page-action no-text fa fa-floppy-o nodeConfigurationSaveButton";
        configurationFilterObjectButton.id = "nodeConfigurationSaveButton_" + this.nodeID;
        configurationFilterObject.appendChild(configurationFilterObjectButton);
      }

      filterContainer.appendChild(configurationFilterObject);
    }
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
