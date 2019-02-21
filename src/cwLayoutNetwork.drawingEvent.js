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
        //if (this.diagramTemplate) this.diagramDesign(ctx);
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

    cwLayoutNetwork.prototype.shapeToImage = function(node) {

        var self = this;
        let obj = this.originalObjects[node.object_id + "#" + node.objectTypeScriptName];
        let palette;
        let diagramTemplate = this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID];

        if(this.imageTemplate.hasOwnProperty(node.id)) return this.imageTemplate[node.id];
        if (this.groupsArt[node.group] && this.groupsArt[node.group].diagram === true && this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID]) {
            let obj = this.originalObjects[node.object_id + "#" + node.objectTypeScriptName];
            let palette;
            let diagramTemplate = this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID];

            if (obj && obj.properties.type_id && diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id]) {
                palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id];
            } else if (obj && diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"]) {
                palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"];
            } else {
                if (obj && obj.properties.type === undefined) {
                    if (undefined === this.errors.diagrameTemplate[obj.nodeID]) {
                        this.errors.diagrameTemplate[obj.nodeID] = {};
                        this.errors.diagrameTemplate[obj.nodeID].properties = {};
                        this.errors.diagrameTemplate[obj.nodeID].associations = {};
                    }
                    this.errors.diagrameTemplate[obj.nodeID].properties.type = cwAPI.mm.getProperty(obj.objectTypeScriptName, "type").name;
                };
            }
            if (palette) {
                var shape = {};

                palette.Regions.forEach(function(region) {
                    if (region.RegionType >= 3 && region.RegionType < 8 && !obj.properties.hasOwnProperty(region.SourcePropertyTypeScriptName)) {
                        if (undefined === self.errors.diagrameTemplate[obj.nodeID]) {
                            self.errors.diagrameTemplate[obj.nodeID] = {};
                            self.errors.diagrameTemplate[obj.nodeID].properties = {};
                            self.errors.diagrameTemplate[obj.nodeID].associations = {};
                        }
                        self.errors.diagrameTemplate[obj.nodeID].properties[region.SourcePropertyTypeScriptName] = cwAPI.mm.getProperty(obj.objectTypeScriptName, region.SourcePropertyTypeScriptName).name;
                    }
                    if (region.RegionType < 3 && region.RegionData && !obj.associations.hasOwnProperty(region.RegionData.Key)) {
                        if (undefined === self.errors.diagrameTemplate[obj.nodeID]) {
                            self.errors.diagrameTemplate[obj.nodeID] = {};
                            self.errors.diagrameTemplate[obj.nodeID].properties = {};
                            self.errors.diagrameTemplate[obj.nodeID].associations = {};
                        }
                        self.errors.diagrameTemplate[obj.nodeID].associations[region.RegionData.Key] = region.RegionData.AssociationTypeScriptName + " => " + cwAPI.mm.getObjectType(region.RegionData.TargetObjectTypeScriptName).name;
                    }
                });
        

                shape.H = palette.Height * 4;
                shape.W = palette.Width * 4;

                var qualityFactor = 5;

                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.id = "gImage";
                canvas.width = qualityFactor * shape.W * 1.5;
                canvas.height = qualityFactor * shape.H * 1.5;

                shape.X = canvas.width / 2 / qualityFactor - shape.W / 2;
                shape.Y = canvas.height / 2 / qualityFactor - shape.H / 2;

                shape.cwObject = obj;
                ctx.scale(qualityFactor, qualityFactor);

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

                if (this.errorOnRegion === undefined) this.errorOnRegion = false;
                diagC.loadRegionExplosionWithRuleAndRefProp = function() {
                    if (self.errors.explosionRegion !== true) {
                        console.log("Explosion Region are not Supported Yet");
                        self.errors.explosionRegion = true;
                    }
                };
                diagC.getNavigationDiagramsForObject = function() {
                    if (self.errors.navigationRegion !== true) {
                        console.log("Navigation Region are not Supported Yet");
                        self.errors.navigationRegion = true;
                    }
                };
                diagC.getDiagramPopoutForShape = function() {};
                var shapeObj = new cwApi.Diagrams.CwDiagramShape(shape, palette, diagC);

                shapeObj.draw(ctx); 
                let img = cwAPI.customLibs.utils.trimCanvas(canvas).toDataURL();
                this.imageTemplate[node.id]= img;
                return img;
            }
        }


        
    };

   
    cwLayoutNetwork.prototype.loadDiagramTemplate = function(templateListUrl, callback) {
        var self = this;
        this.diagramTemplate = {};
        var idToLoad = [];
        var idLoaded = 0;
        if (this.expertModeAvailable) {
            $.getJSON(cwApi.getLiveServerURL() + "page/" + templateListUrl + "?" + Math.random(), function(json) {
                if (json) {
                    for (var associationNode in json) {
                        if (json.hasOwnProperty(associationNode)) {
                            for (var i = 0; i < json[associationNode].length; i += 1) {
                                idToLoad.push(json[associationNode][i].object_id);
                            }
                        }
                    }
                    if (idToLoad.length === 0) callback();
                    idToLoad.forEach(function(id) {
                        var url = cwApi.getLiveServerURL() + "Diagram/Vector/" + id + "?" + Math.random();
                        $.getJSON(url, function(json) {
                            if (json.status === "Ok") {
                                self.diagramTemplate[id] = json.result;
                            } else {
                                console.log("Failed to Load Diagram Template ID : " + id);
                            }
                            idLoaded = idLoaded + 1;
                            if (idLoaded === idToLoad.length) callback();
                        });
                    });
                } else callback();

                
            });
        } else {
            for (var group in this.groupsArt) {
                if (this.groupsArt[group] && this.groupsArt[group].diagramTemplateID !== undefined) {
                    var id = this.groupsArt[group].diagramTemplateID;
                    idToLoad.push(id);
                }
            }
            if (idToLoad.length === 0) callback();
            idToLoad.forEach(function(id) {
                var url = cwApi.getLiveServerURL() + "Diagram/Vector/" + id + "?" + Math.random();
                $.getJSON(url, function(json) {
                    if (json.status === "Ok") {
                        self.diagramTemplate[id] = json.result;
                        idLoaded = idLoaded + 1;
                        if (idLoaded === idToLoad.length) callback();
                    }
                });
            });
        }
    };

    cwLayoutNetwork.prototype.positionClusters = function(ctx) {
        var self = this;
        self.clusters.forEach(function(cluster) {
            var nodePosition = self.networkUI.getPositions(cluster.nodes[0]);
            nodePosition = nodePosition[cluster.nodes[0]];
            var n = cluster.nodes.length;
            var ystep;
            var labelmargin = 80;
            var xmargin = 100;
            var ymargin = 30;
            var headerOffset;
            var group = self.networkUI.groups.get(self.nodes.get(cluster.head).group);

            if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage") {
                headerOffset = 20;
            } else {
                headerOffset = 0;
            }

            if (group.shape === "image" || group.shape === "circularImage") {
                ystep = 130;
            } else ystep = 100;

            if (cluster.nodes.length > 0) {
                for (i = 1; i < n; i++) {
                    if (self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.nodes[i]]) {
                        self.networkUI.moveNode(cluster.nodes[i], nodePosition.x, nodePosition.y + ystep * i);
                    }
                }
                if (self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.head]) {
                    self.networkUI.moveNode(cluster.head, nodePosition.x, nodePosition.y - ymargin * 2 - labelmargin - headerOffset);
                }
            }
            cluster.init = false;
            ctx.strokeStyle = group.color.border;
            ctx.lineWidth = 2;
            if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage") {
                let color = group.color.background;
                if (color[0] != "#") color = "#" + color;
                while (self.getHSL(color) < 150) {
                    color = self.LightenDarkenColor(color, 100);
                }
                ctx.fillStyle = color;
            } else ctx.fillStyle = group.color.background;
            ctx.rect(nodePosition.x - xmargin, nodePosition.y - ymargin * 2 - labelmargin, 2 * xmargin, ystep * n + labelmargin);
            ctx.fill();
            ctx.stroke();
        });
    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
