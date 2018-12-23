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
        filterContainer.innerHTML = "";
        var externalfilter,objectTypeNode,objectTypeNodes = this.network.getObjectTypeNodes();

        var filterGroupObject = document.createElement("div");
        filterGroupObject.className = "LayoutNetork_filterGroup";

        var filterGroupObjectTitle = document.createElement("div");
        filterGroupObjectTitle.innerHTML  = $.i18n.prop('objects_filters') + " : ";
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

        if(this.edgeConfiguration && !(Object.keys(this.edgeConfiguration).length === 0 && this.edgeConfiguration.constructor === Object)) {
            var edgeFilterObject = document.createElement("div");
            edgeFilterObject.className = "LayoutNetork_filterGroup";
            var edgeFilterObjectTitle = document.createElement("div");
            edgeFilterObjectTitle.innerHTML= $.i18n.prop('link_type')  + " : ";

            edgeFilterObject.appendChild(edgeFilterObjectTitle);
            edgeFilterObject.appendChild(this.getEdgeFilterObject("selectNetworkEdge_" + this.nodeID));
        
            filterContainer.appendChild(edgeFilterObject);
        }


        i = 0;
        
        var associationFilterObject = document.createElement("div");
        associationFilterObject.className = "LayoutNetork_filterGroup";
        var associationFilterObjectTitle = document.createElement("div");
        associationFilterObjectTitle.innerHTML = $.i18n.prop('external_association')  + " :";


        var associationFilterObjectFilters = document.createElement("div");
        for (externalfilter in this.externalFilters) {
            if (this.externalFilters.hasOwnProperty(externalfilter)) {
                associationFilterObjectFilters.appendChild(this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal_" + this.nodeID));
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
            clusterFilterObjectTitle.innerHTML = $.i18n.prop('cluster_by_groups');

            var clusterFilterObjectFilterHead = document.createElement("div");
            clusterFilterObjectFilterHead = this.network.getFilterClusterByGroupHead("selectNetworkClusterByGroup_" + this.nodeID);
            var clusterFilterObjectFilterChilds = document.createElement("div");
            clusterFilterObjectFilterChilds = this.network.getFilterClusterByGroupChilds("selectNetworkClusterByGroup_" + this.nodeID);   

            clusterFilterObject.appendChild(clusterFilterObjectTitle);
            clusterFilterObject.appendChild(clusterFilterObjectFilterHead);
            clusterFilterObject.appendChild(clusterFilterObjectFilterChilds);
            filterContainer.appendChild(clusterFilterObject);
        }
        if(this.networkConfiguration && this.networkConfiguration.enableEdit) {
            var configurationFilterObject = document.createElement("div");
            configurationFilterObject.className = "LayoutNetork_filterGroup";

            var configurationFilterObjectTitle = document.createElement("div");
            configurationFilterObjectTitle.innerHTML = "   " + $.i18n.prop('network');

            configurationFilterObject.appendChild(configurationFilterObjectTitle);
            configurationFilterObject.appendChild(this.getNetworkConfigurationFilterObject("selectNetworkConfiguration_" + this.nodeID));
            if(this.canUpdateNetwork) {
                var configurationFilterObjectButton = document.createElement("button");
                configurationFilterObjectButton.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i>';
                configurationFilterObjectButton.id = "nodeConfigurationSaveButton_" + this.nodeID ;
                configurationFilterObject.appendChild(configurationFilterObjectButton);                
            }

            
            filterContainer.appendChild(configurationFilterObject);
        }



    };
  


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));