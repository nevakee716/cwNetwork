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


    // Adding element to the search filter
    cwLayoutNetwork.prototype.addSearchFilterElement = function (event, properties, senderId) {
        var self = this;
        var html = "";
        properties.items.forEach(function(elem) {
            var node = self.nodes.get(elem);
            var label;
            if(self.CDSFilterOption) label = node.label;
            else label = node.name;

            if(self.groupsArt && self.groupsArt[node.group]) {
                if(self.groupsArt[node.group].unicode){ // icon
                    html += '<option class="fa" id=' + node.id + '>&#x' + self.groupsArt[node.group].unicode + " " + label + '</option>'; 
                } else if(self.groupsArt[node.group].image){ //image
                    html += '<option id=' + node.id + ' data-content="' + label + '<img class=\'networkLegendImage\' src=\'' +  self.groupsArt[node.group].image + '\'</>">'+ label + '</option>'; 

                }
            } else {
               html += '<option class="fa" id=' + node.id + '>' + label + '</option>'; 
            }
        });
        $('select.selectNetworkSearch_' + this.nodeID)
            .append(html)
            .selectpicker('refresh');
    };

    // Remove element to the search filter
    cwLayoutNetwork.prototype.removeSearchFilterElement = function (event, properties, senderId) {
        var self = this;
        properties.oldData.forEach(function(elem) {
            $('select.selectNetworkSearch_' + self.nodeID)
                .find('[id="' + elem.id +'"]').remove();
        });       
        $('select.selectNetworkSearch_' + self.nodeID).selectpicker('refresh');
    };
    


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));