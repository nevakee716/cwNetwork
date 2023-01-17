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

  cwLayoutNetwork.prototype.beforeDrawing = function (ctx) {
    var container = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);

    if (this.networkUI.background) {
      // save current translate/zoom
      ctx.save();
      // reset transform to identity
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // fill background with solid white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // restore old transform
      ctx.restore();
    }

    this.positionClusters(ctx);
    //if (this.diagramTemplate) this.diagramDesign(ctx);
  };

  cwLayoutNetwork.prototype.afterDrawing = function (ctx) {
    //if (this.diagramTemplate) this.diagramDesign(ctx);
  };

  cwLayoutNetwork.prototype.reSizeNode = function (node, palette) {
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

  cwLayoutNetwork.prototype.shapeToImage = function (node) {
    var self = this;
    let obj = this.originalObjects[node.object_id + "#" + node.objectTypeScriptName];
    let palette;
    let diagramTemplate = this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID];

    if (this.imageTemplate.hasOwnProperty(node.id)) return this.imageTemplate[node.id];
    if (
      this.groupsArt[node.group] &&
      this.groupsArt[node.group].diagram === true &&
      this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID]
    ) {
      let obj = this.originalObjects[node.object_id + "#" + node.objectTypeScriptName];
      let palette;
      let diagramTemplate = this.diagramTemplate[this.groupsArt[node.group].diagramTemplateID];

      if (
        obj &&
        obj.properties.type_id &&
        diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id]
      ) {
        palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|" + obj.properties.type_id];
      } else if (obj && diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"]) {
        palette = diagramTemplate.diagram.paletteEntries[node.objectTypeScriptName.toUpperCase() + "|0"];
      } else {
        if (obj && obj.properties.type === undefined) {
          if (undefined === self.errors.diagrameTemplate[node.group]) self.errors.diagrameTemplate[node.group] = {};
          if (undefined === this.errors.diagrameTemplate[node.group][obj.nodeID]) {
            this.errors.diagrameTemplate[node.group][obj.nodeID] = {};
            this.errors.diagrameTemplate[node.group][obj.nodeID].properties = {};
            this.errors.diagrameTemplate[node.group][obj.nodeID].associations = {};
          }
          this.errors.diagrameTemplate[node.group][obj.nodeID].properties.type = cwAPI.mm.getProperty(obj.objectTypeScriptName, "type").name;
        }
      }
      if (palette) {
        var shape = {};

        palette.Regions.forEach(function (region) {
          if (region.RegionType >= 3 && region.RegionType < 8 && !obj.properties.hasOwnProperty(region.SourcePropertyTypeScriptName)) {
            if (undefined === self.errors.diagrameTemplate[node.group]) self.errors.diagrameTemplate[node.group] = {};
            if (undefined === self.errors.diagrameTemplate[node.group][obj.nodeID]) {
              self.errors.diagrameTemplate[node.group][obj.nodeID] = {};
              self.errors.diagrameTemplate[node.group][obj.nodeID].properties = {};
              self.errors.diagrameTemplate[node.group][obj.nodeID].associations = {};
            }
            self.errors.diagrameTemplate[node.group][obj.nodeID].properties[region.SourcePropertyTypeScriptName] = cwAPI.mm.getProperty(
              obj.objectTypeScriptName,
              region.SourcePropertyTypeScriptName
            ).name;
          }
          if (region.RegionType < 3 && region.RegionData && !obj.associations.hasOwnProperty(region.RegionData.Key)) {
            if (undefined === self.errors.diagrameTemplate[node.group]) self.errors.diagrameTemplate[node.group] = {};
            if (undefined === self.errors.diagrameTemplate[node.group][obj.nodeID]) {
              self.errors.diagrameTemplate[node.group][obj.nodeID] = {};
              self.errors.diagrameTemplate[node.group][obj.nodeID].properties = {};
              self.errors.diagrameTemplate[node.group][obj.nodeID].associations = {};
            }
            self.errors.diagrameTemplate[node.group][obj.nodeID].associations[region.RegionData.Key] =
              region.RegionData.AssociationTypeScriptName + " => " + cwAPI.mm.getObjectType(region.RegionData.TargetObjectTypeScriptName).name;
          }
        });

        shape.H = palette.Height * 4; // çorrespondance pixel taille modeler
        shape.W = palette.Width * 4;

        node.size = (2 * 35 * palette.Height) / 32;
        var qualityFactor = 3;

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.id = "gImage";

        // avoid to big canva
        if (qualityFactor * Math.max(shape.W, shape.H) * 3 > 1000) qualityFactor = 1000 / Math.max(shape.W, shape.H) / 3;
        // taking margin for region outside of the shape, 100% each side
        canvas.width = qualityFactor * shape.W * 3;
        canvas.height = qualityFactor * shape.H * 3;

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
        diagC.ctx.font = "10px sans-serif";
        diagC.CorporateModelerDiagramScale = 1;
        diagC.loop = 0;
        diagC.pictureGalleryLoader = new cwApi.CwPictureGalleryLoader.Loader(diagC);

        if (this.errorOnRegion === undefined) this.errorOnRegion = false;
        diagC.loadRegionExplosionWithRuleAndRefProp = function () {
          if (self.errors.explosionRegion !== true) {
            console.log("Explosion Region are not Supported Yet");
            self.errors.explosionRegion = true;
          }
        };
        diagC.getNavigationDiagramsForObject = function () {
          if (self.errors.navigationRegion !== true) {
            console.log("Navigation Region are not Supported Yet");
            self.errors.navigationRegion = true;
          }
        };

        diagC.getExplodedDiagramsForObject = function () {
          if (self.errors.navigationRegion !== true) {
            console.log("Navigation Region are not Supported Yet");
            self.errors.navigationRegion = true;
          }
        };

        diagC.getDiagramPopoutForShape = function () {};
        var shapeObj = new cwApi.Diagrams.CwDiagramShape(shape, palette, diagC);

        shapeObj.draw(ctx);
        let img = cwAPI.customLibs.utils.trimCanvas(canvas).toDataURL();
        this.imageTemplate[node.id] = img;
        return img;
      }
    }
  };

  cwLayoutNetwork.prototype.loadDiagramTemplate = function (templateListUrl, callback) {
    var self = this;
    this.diagramTemplate = {};
    var idToLoad = [];
    var idLoaded = 0;
    if (this.expertModeAvailable) {
      console.log("expert mode loading all templates");
      $.getJSON(cwApi.getLiveServerURL() + "page/" + templateListUrl + "?" + cwApi.getDeployNumber(), function (json) {
        if (json) {
          for (var associationNode in json) {
            if (json.hasOwnProperty(associationNode)) {
              for (var i = 0; i < json[associationNode].length; i += 1) {
                idToLoad.push(json[associationNode][i].object_id);
              }
            }
          }
          if (idToLoad.length === 0) callback();

          async.mapLimit(
            idToLoad,
            3,
            (id, callback) => {
              console.log("try to get " + id);
              var url = cwApi.getLiveServerURL() + "Diagram/Vector/" + id + "?" + cwApi.getDeployNumber();
              $.getJSON(url, function (json) {
                if (json.status === "Ok") {
                  self.diagramTemplate[id] = json.result;
                  console.log("Load Diagram Template ID : " + id);
                } else {
                  console.log("Failed to Load Diagram Template ID : " + id);
                }
                callback(null);
              });
            },
            function (err, results) {
              self.loadDiagramImage(callback);
              console.log("Templates Loaded");
            }
          );
        }
      });
    } else {
      for (var group in this.groupsArt) {
        if (this.groupsArt[group] && this.groupsArt[group].diagramTemplateID !== undefined) {
          var id = this.groupsArt[group].diagramTemplateID;
          idToLoad.push(id);
        }
      }
      if (idToLoad.length === 0) callback();
      else {
        async.mapLimit(
          idToLoad,
          3,
          (id, callback) => {
            console.log("try to get " + id);
            var url = cwApi.getLiveServerURL() + "Diagram/Vector/" + id + "?" + cwApi.getDeployNumber();
            $.getJSON(url, function (json) {
              if (json.status === "Ok") {
                self.diagramTemplate[id] = json.result;
                console.log("Load Diagram Template ID : " + id);
              } else {
                console.log("Failed to Load Diagram Template ID : " + id);
              }
              callback(null);
            });
          },
          function (err, results) {
            self.loadDiagramImage(callback);
            console.log("Templates Loaded");
          }
        );
      }
    }
  };

  cwLayoutNetwork.prototype.loadDiagramImage = function (callback) {
    var self = this;
    let imageToLoad = [];
    let imageLoaded = 0;
    Object.keys(this.diagramTemplate).forEach(function (key) {
      let template = self.diagramTemplate[key];
      Object.keys(template.diagram.paletteEntries).forEach(function (p) {
        let palette = template.diagram.paletteEntries[p];
        if (palette.PictureUuid && imageToLoad.indexOf(palette.PictureUuid) === -1) {
          imageToLoad.push(palette.PictureUuid);
        }
        palette.Regions.forEach(function (region) {
          if (region.PictureUuid && imageToLoad.indexOf(region.PictureUuid) === -1) {
            imageToLoad.push(region.PictureUuid);
          }
          if (region.BandingRows && region.BandingRows.length > 0) {
            region.BandingRows.forEach(function (b) {
              if (b.PictureUuid && imageToLoad.indexOf(b.PictureUuid) === -1) {
                imageToLoad.push(b.PictureUuid);
              }
            });
          }
        });
      });
    });

    if (imageToLoad.length === 0) callback();

    let picturesPath = cwAPI.getSiteMediaPath() + "images/gallerypictures/";
    if (cwAPI.isLive()) {
      picturesPath = cwAPI.getLiveServerURL() + "pictures/gallerypictures/uuid/";
    }

    async.mapLimit(
      imageToLoad,
      3,
      (uuid, callbackAsyncSeries) => {
        console.log("try to get image " + uuid);
        var image = new Image();
        image.src = picturesPath + uuid + ".png?" + cwApi.getDeployNumber();
        cwApi.CwPictureGalleryLoader.images[uuid] = image;
        image.onload = () => {
          console.log("got image " + uuid);
          callbackAsyncSeries(null, uuid);
        };
        image.onerror = () => {
          console.log("error image " + uuid);
          callbackAsyncSeries(null, uuid);
        };
      },
      function (err, results) {
        console.log("Images Loaded");
        callback();
      }
    );
  };

  cwLayoutNetwork.prototype.getStepForNode = function (nodeId) {
    let ystep;
    let node = this.nodes.get(nodeId);
    var group = this.networkUI.groups.get(node.group);
    if (group.shape === "image" || group.shape === "circularImage" || group.diagram === true) {
      ystep = 130;
    } else if (group.shape === "icon") ystep = 100;
    else if (group.shape === "box") ystep = 20 + 15 * node.label.split("\n").length;
    else ystep = 30;

    return ystep;
  };

  cwLayoutNetwork.prototype.positionClusters = function (ctx) {
    var self = this;
    self.clusters.forEach(function (cluster) {
      var headPosition = self.networkUI.getPositions(cluster.head);
      headPosition = headPosition[cluster.head];
      var n = cluster.nodes.length;
      var ystep;
      var labelmargin = 80;
      var xmargin = 100;
      var ymargin = 30;
      var headerOffset;
      var group = self.networkUI.groups.get(self.nodes.get(cluster.head).group);

      if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage" || group.diagram === true) {
        headerOffset = 20;
      } else {
        headerOffset = 0;
      }

      var offsetY = headerOffset + self.getStepForNode(cluster.head) / 2;
      if (cluster.nodes.length > 0) {
        for (i = 0; i < n; i++) {
          if (true || self.dragged[cluster.head] || cluster.init || self.dragged[cluster.nodes[i]]) {
            offsetY += self.getStepForNode(cluster.nodes[i]) / 2;
            self.networkUI.moveNode(cluster.nodes[i], headPosition.x, headPosition.y + offsetY);
            offsetY += self.getStepForNode(cluster.nodes[i]) / 2;
          }
        }
      }

      cluster.init = false;
      ctx.strokeStyle = group.color.border;
      ctx.lineWidth = 2;
      if (group.shape === "icon" || group.shape === "image" || group.shape === "circularImage" || group.diagram === true) {
        let color = group.color.background;
        if (color[0] != "#") color = "#" + color;
        while (self.getHSL(color) < 200) {
          color = self.LightenDarkenColor(color, 100);
        }
        ctx.fillStyle = color;
      } else ctx.fillStyle = group.color.background;
      ctx.rect(headPosition.x - xmargin, headPosition.y, 2 * xmargin, offsetY);
      ctx.fill();
      ctx.stroke();
    });
  };

  // overload Evolve method to avoid error if association not exist
  cwAPI.Diagrams.CwDiagramShape.prototype.getAssociationTypeCustomRegionText = function (region) {
    var sourceObj,
      targetObjs,
      list = [];
    sourceObj = this.shape.cwObject;
    targetObjs = sourceObj.associations[region.RegionData.Key];
    if (targetObjs) {
      targetObjs.forEach(function (targetObj) {
        if (region.RegionData.IntersectionCategory < 0 || region.RegionData.IntersectionCategory === targetObj.iProperties.type_id) {
          var text = "";
          region.RegionData.PropertiesSection.forEach(function (property) {
            if (property.PropertyTypeScriptName !== null) {
              if (property.ObjectTypeScriptName.toLowerCase() === sourceObj.objectTypeScriptName) {
                text = text + sourceObj.properties[property.PropertyTypeScriptName.toLowerCase()];
              } else if (property.ObjectTypeScriptName.toLowerCase() === targetObj.objectTypeScriptName) {
                text = text + targetObj.properties[property.PropertyTypeScriptName.toLowerCase()];
              } else if (property.ObjectTypeScriptName.toLowerCase() === targetObj.iObjectTypeScriptName) {
                text = text + targetObj.iProperties[property.PropertyTypeScriptName.toLowerCase()];
              }
            } else {
              text = text + property.Literal;
            }
          });
          list.push(text);
        }
      });
    }

    return list;
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
