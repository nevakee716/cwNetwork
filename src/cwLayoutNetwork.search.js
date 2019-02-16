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

    // Adding element to the search filter
    cwLayoutNetwork.prototype.addSearchFilterElement = function(event, properties, senderId) {
        this.errors.init = false;
        var self = this;
        var htmltxt = "";
        properties.items.forEach(function(elem) {
            var node = self.nodes.get(elem);
            var label, group;
            label = node.name;

            if (self.groupsArt && self.groupsArt[node.group]) {
                //htmltxt += cwApi.customLibs.cwLayoutNetwork.objectTypeNode.prototype.getLegendElement(self.groupsArt[node.group]);

                group = self.groupsArt[node.group];
                if (group && group.shape == "icon") {
                    htmltxt += '<option style="color : ' + group.icon.color + '" class="fa" id=' + node.id.replaceAll(" ", "¤") + ">&#x" + group.unicode + " " + label + "</option>";
                } else if (group && (group.shape === "image" || group.shape === "circularImage")) {
                    htmltxt += "<option id=" + node.id.replaceAll(" ", "¤") + ' data-content="' + "<img class='networkLegendImage' src='" + group.image + "'</> " + label + '">' + label + "</option>";
                } else if(group && group.diagram === true && node.image) {
                    htmltxt += "<option id=" + node.id.replaceAll(" ", "¤") + ' data-content="' + "<img class='networkLegendImage' src='" + node.image + "'</> " + label + '">' + label + "</option>";
                } else if (group && group.shape) {
                    htmltxt +=
                        '<option style="color : ' +
                        group.color.border +
                        '" class="fa" id=' +
                        node.id.replaceAll(" ", "¤") +
                        ">&#x" +
                        cwApi.customLibs.cwLayoutNetwork.objectTypeNode.prototype.shapeToFontAwesome(group.shape) +
                        " " +
                        label +
                        "</option>";
                }
            } else {
                htmltxt += '<option class="fa" id=' + node.id.replaceAll(" ", "¤") + ">" + label + "</option>";
            }
        });
        $("select.selectNetworkSearch_" + this.nodeID)
            .append(htmltxt)
            .selectpicker("refresh");
    };

    // Remove element to the search filter
    cwLayoutNetwork.prototype.removeSearchFilterElement = function(event, properties, senderId) {
        var self = this;
        properties.oldData.forEach(function(elem) {
            $("select.selectNetworkSearch_" + self.nodeID)
                .find('[id="' + elem.id + '"]')
                .remove();
        });
        $("select.selectNetworkSearch_" + self.nodeID).selectpicker("refresh");
    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
