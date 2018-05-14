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

    cwLayoutNetwork.prototype.fillFilter = function (changeSet) {
        var groupArray = {};
        for (i = 0; i < changeSet.length; i += 1) { // put all nodes into groups
            if(!groupArray.hasOwnProperty(changeSet[i].group)) {
                groupArray[changeSet[i].group] = [];
            }
            groupArray[changeSet[i].group].push(changeSet[i].label.replace(/\n/g," "));
        }

        $('select.selectNetworkPicker_' + this.nodeID).each(function( index ) { // put values into filters
            if($(this).val()) {
                $(this).selectpicker('val',$(this).val().concat(groupArray[$(this).context.name]));
            } else {
                $(this).selectpicker('val',groupArray[$(this).context.name] ); 
            }
        });
    };

    // Create Filter selector
    cwLayoutNetwork.prototype.createFilterObjects = function (filterContainer) {

        filterContainer.className += " LayoutNetork_filterSection";

        var externalfilter,objectTypeNode,objectTypeNodes = this.network.getObjectTypeNodes();

        var filterGroupObject = document.createElement("div");
        filterGroupObject.className = "LayoutNetork_filterGroup";

        var filterGroupObjectTitle = document.createElement("div");
        filterGroupObjectTitle.innerHTML  = "Objects Filters";
        var filterGroupObjectFilters = document.createElement("div");
        

        var i = 0;
        // Adding filter for all selector group
        for (objectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(objectTypeNode)) {
                filterGroupObjectFilters.appendChild(objectTypeNodes[objectTypeNode].getFilterObject(this.nodeID,this.groupsArt));
                i += 1;
            }
        }
        if(i > 0) {
            filterGroupObject.appendChild(filterGroupObjectTitle);
            filterGroupObject.appendChild(filterGroupObjectFilters);
            filterContainer.appendChild(filterGroupObject);
        }

        i = 0;
        
        var associationFilterObject = document.createElement("div");
        associationFilterObject.className = "LayoutNetork_filterGroup";

        var associationFilterObjectTitle = document.createElement("div");
        associationFilterObjectTitle.innerHTML = "External Association : ";


        var initID,associationFilterObjectFilters = document.createElement("div");
        for (externalfilter in this.externalFilters) {
            if (this.externalFilters.hasOwnProperty(externalfilter)) {
                if(this.externalFilterToSelectOnStart && externalfilter === this.externalFilterToSelectOnStart[0]) {initID = this.externalFilterToSelectOnStart[1];}
                associationFilterObjectFilters.appendChild(this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal_" + this.nodeID,initID));
                i += 1;
            }
        }
        if(i > 0) {
            associationFilterObject.appendChild(associationFilterObjectTitle);
            
            associationFilterObject.appendChild(associationFilterObjectFilters);
            filterContainer.appendChild(associationFilterObject);
        }

        if(this.clusterOption) {
            var clusterFilterObject = document.createElement("div");
            clusterFilterObject.className = "LayoutNetork_filterGroup";

            var clusterFilterObjectTitle = document.createElement("div");
            clusterFilterObjectTitle.innerHTML = "Cluster by Groups";

            var clusterFilterObjectFilterHead = document.createElement("div");
            clusterFilterObjectFilterHead = this.network.getFilterClusterByGroupHead("selectNetworkClusterByGroup_" + this.nodeID);
            var clusterFilterObjectFilterChilds = document.createElement("div");
            clusterFilterObjectFilterChilds = this.network.getFilterClusterByGroupChilds("selectNetworkClusterByGroup_" + this.nodeID);   

            clusterFilterObject.appendChild(clusterFilterObjectTitle);
            clusterFilterObject.appendChild(clusterFilterObjectFilterHead);
            clusterFilterObject.appendChild(clusterFilterObjectFilterChilds);
            filterContainer.appendChild(clusterFilterObject);
        }
        if(this.networkConfiguration) {
             var configurationFilterObject = document.createElement("div");
            configurationFilterObject.className = "LayoutNetork_filterGroup";

            var configurationFilterObjectTitle = document.createElement("div");
            configurationFilterObjectTitle.innerHTML = "Network : ";

            configurationFilterObject.appendChild(configurationFilterObjectTitle);
            configurationFilterObject.appendChild(this.getNetworkConfigurationFilterObject("selectNetworkConfiguration_" + this.nodeID));
            filterContainer.appendChild(configurationFilterObject);
            var configurationFilterObjectButton = document.createElement("button");
            configurationFilterObjectButton.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
            configurationFilterObjectButton.id = "nodeConfigurationSaveButton_" + this.nodeID ;
            configurationFilterObject.appendChild(configurationFilterObjectButton);
            
            filterContainer.appendChild(configurationFilterObject);
        }



    };
  


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));