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

    cwLayoutNetwork.prototype.beforeDrawing = function (ctx) {
        this.positionClusters(ctx);
    };

    
    cwLayoutNetwork.prototype.positionClusters = function (ctx) {
        var self = this;
        self.clusters.forEach(function(cluster){
            
                var nodePosition = self.networkUI.getPositions(cluster.nodes[0]);
                nodePosition = nodePosition[cluster.nodes[0]];
                var n = cluster.nodes.length;
                var ystep;
                var labelmargin= 40;
                var xmargin= 60;
                var ymargin= 10;
                var headerOffset;
                var group = self.networkUI.groups.get(self.nodes.get(cluster.head).group);
                
                if(group.shape === "icon" || group.shape === "image" ||group.shape === "circularImage") {
                    headerOffset = 20;
                } else {
                    headerOffset = 0;
                }

                if(group.shape === "image" || group.shape === "circularImage") {
                    ystep = 80;
                } else ystep = 60;

                
                if(cluster.nodes.length > 0) {
                    for(i=1;i < n;i++) {
                        if(self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.nodes[i]]) {
                            self.networkUI.moveNode(cluster.nodes[i],nodePosition.x,nodePosition.y+ystep*(i));
                        }
                    }
                    if(self.dragged[cluster.nodes[0]] || cluster.init || self.dragged[cluster.head]) {
                        self.networkUI.moveNode(cluster.head,nodePosition.x,nodePosition.y-ymargin*2-labelmargin - headerOffset);
                    }
                }   
                cluster.init = false;
                ctx.strokeStyle = group.color.border;
                ctx.lineWidth = 2;
                if(group.shape === "icon" || group.shape === "image" ||group.shape === "circularImage") ctx.fillStyle = self.LightenDarkenColor(group.color.background,100);
                else  ctx.fillStyle = group.color.background;
                ctx.rect(nodePosition.x-xmargin, nodePosition.y-ymargin*2-labelmargin,2*xmargin,ystep*n+labelmargin);
                ctx.fill();
                ctx.stroke();
            
          
        }); 

    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));