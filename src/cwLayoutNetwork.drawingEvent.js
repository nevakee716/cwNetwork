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

    cwLayoutNetwork.prototype.beforeDrawing = function(ctx) {
        this.positionClusters(ctx);
        //if (this.diagramTemplate) this.diagramDesign(ctx);
    };



    cwLayoutNetwork.prototype.afterDrawing = function(ctx) {
        if (this.diagramTemplate) this.diagramDesign(ctx);
    };


    cwLayoutNetwork.prototype.reSizeNode = function(node, palette) {
        if (node.resized !== true) {
            node.resized = true;
            node.widthConstraint = {};
            node.widthConstraint.minimum = palette.Width * 3.5; //80
            node.widthConstraint.maximum = palette.Width * 3.5;

            node.heightConstraint = {};
            node.heightConstraint.minimum = palette.Height * 3.4;
        }
        return node;
    };


    cwLayoutNetwork.prototype.diagramDesign = function(ctx) {

        ctx.save();
        var changeNode = [];
        var self = this;

        self.nodes.forEach(function(node) {

            if (self.groupsArt[node.group] && self.groupsArt[node.group].diagram === true && self.diagramTemplate[self.groupsArt[node.group].diagramTemplateID]) {
                let obj = self.originalObjects[node.object_id + "#" + node.objectTypeScriptName];
                let palette;
                let diagramTemplate = self.diagramTemplate[self.groupsArt[node.group].diagramTemplateID];

                if (obj && obj.properties.type_id && diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id]) {
                    palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id];
                } else if (obj && diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"]) {
                    palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"];
                }
                if (palette) {

                    let nodePosition = self.networkUI.getPositions(node.id)[node.id];

                    var shape = {};

                    changeNode.push(self.reSizeNode(node, palette));

                    shape.H = palette.Height * 4;
                    shape.W = palette.Width * 4;
                    shape.X = nodePosition.x - shape.W / 2;
                    shape.Y = nodePosition.y - shape.H / 2;

                    shape.cwObject = obj;

                    var diagC = {};
                    diagC.objectTypesStyles = diagramTemplate.diagram.paletteEntries;
                    diagC.json = {};
                    diagC.json.diagram = {};
                    diagC.json.diagram.Style = palette.Style;
                    diagC.json.diagram.symbols = diagramTemplate.diagram.symbols;
                    diagC.camera = {};
                    diagC.camera.scale = 1;
                    diagC.ctx = ctx;
                    diagC.CorporateModelerDiagramScale = 1;
                    diagC.loop = 0;
                    diagC.pictureGalleryLoader = new cwApi.CwPictureGalleryLoader.Loader(diagC);

                    if (self.errorOnRegion === undefined) self.errorOnRegion = false;
                    diagC.loadRegionExplosionWithRuleAndRefProp = function() {
                        if (self.errorOnRegion === false) {
                            console.log("Explosion Region are not Supported Yet");
                            self.errorOnRegion = true;
                        }
                    };

                    diagC.getDiagramPopoutForShape = function() {};
                    var shapeObj = new cwApi.Diagrams.CwDiagramShape(shape, palette, diagC);
                    shapeObj.draw(ctx);
                }
            }


        });

        this.nodes.update(changeNode);
    };


    cwLayoutNetwork.prototype.loadDiagramTemplate = function(templateListUrl) {
        var self = this;
        this.diagramTemplate = {};
        var idToLoad = [];


        $.getJSON(cwApi.getLiveServerURL() + "page/" + templateListUrl + '?' + Math.random(), function(json) {
            if (json) {
                for (var associationNode in json) {
                    if (json.hasOwnProperty(associationNode)) {
                        for (var i = 0; i < json[associationNode].length; i += 1) {
                            idToLoad.push(json[associationNode][i].object_id);
                        }
                    }
                }
                idToLoad.forEach(function(id) {
                    var url = cwApi.getLiveServerURL() + "Diagram/Vector/" + id + '?' + Math.random();
                    $.getJSON(url, function(json) {
                        if (json.status === "Ok") {
                            self.diagramTemplate[id] = json.result;
                        }
                    });
                });
            }
        });



    };



    cwLayoutNetwork.prototype.positionClusters = function(ctx) {
        var self = this;
        self.clusters.forEach(function(cluster) {

            var nodePosition = self.networkUI.getPositions(cluster.nodes[0]);
            nodePosition = nodePosition[cluster.nodes[0]];
            var n = cluster.nodes.length;
            var ystep;
            var labelmargin = 40;
            var xmargin = 60;
            var ymargin = 10;
            var headerOffset;
            var group = self.networkUI.groups.get(self.nodes.get(cluster.head).group);

            if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage") {
                headerOffset = 20;
            } else {
                headerOffset = 0;
            }

            if (group.shape === "image" || group.shape === "circularImage") {
                ystep = 80;
            } else ystep = 60;


            if (cluster.nodes.length > 0) {
                for (i = 1; i < n; i++) {
                    if (self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.nodes[i]]) {
                        self.networkUI.moveNode(cluster.nodes[i], nodePosition.x, nodePosition.y + ystep * (i));
                    }
                }
                if (self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.head]) {
                    self.networkUI.moveNode(cluster.head, nodePosition.x, nodePosition.y - ymargin * 2 - labelmargin - headerOffset);
                }
            }
            cluster.init = false;
            ctx.strokeStyle = group.color.border;
            ctx.lineWidth = 2;
            if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage") ctx.fillStyle = self.LightenDarkenColor(group.color.background, 100);
            else ctx.fillStyle = group.color.background;
            ctx.rect(nodePosition.x - xmargin, nodePosition.y - ymargin * 2 - labelmargin, 2 * xmargin, ystep * n + labelmargin);
            ctx.fill();
            ctx.stroke();


        });

    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));