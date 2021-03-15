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

  cwLayoutNetwork.prototype.clipBoardImage = function (event) {
    var self = this;

    try {
      this.networkUI.fit();
      var container = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
      var oldheight = container.offsetHeight;
      var scale = this.networkUI.getScale(); // change size of the canva to have element in good resolution
      if ((container.offsetWidth * 2) / scale > 10000) scale = container.offsetWidth / 5000;
      container.style.width = ((container.offsetWidth * 2) / scale).toString() + "px";
      container.style.height = ((container.offsetHeight * 2) / scale).toString() + "px";
      this.networkUI.background = true;
      this.networkUI.redraw();
      cwAPI.customLibs.utils.copyCanvasToClipboard(container.firstElementChild.firstElementChild);
      container.style.height = oldheight + "px";
      container.style.width = "";
      this.networkUI.background = false;
      this.networkUI.redraw();
      this.networkUI.fit();
    } catch (e) {
      console.log(e);
    }
  };

  cwLayoutNetwork.prototype.downloadImage = function (event) {
    var self = this;

    function downloadURI(canvas, name) {
      var link = document.createElement("a");

      var actionContainer = document.getElementById("cwLayoutNetworkAction" + self.nodeID);
      actionContainer.appendChild(link);
      link.style = "display: none";

      if (canvas.msToBlob) {
        //for IE
        var blob = canvas.msToBlob();
        window.navigator.msSaveBlob(blob, name);
      } else {
        canvas.toBlob(function (blob) {
          link.href = URL.createObjectURL(blob);

          link.download = name;
          link.style = "display: block";
          link.click();
          link.remove();
        }, "image/png");
      }
    }

    try {
      this.networkUI.fit();
      var container = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
      var oldheight = container.offsetHeight;
      var scale = this.networkUI.getScale(); // change size of the canva to have element in good resolution
      if ((container.offsetWidth * 2) / scale > 10000) scale = container.offsetWidth / 5000;
      container.style.width = ((container.offsetWidth * 2) / scale).toString() + "px";
      container.style.height = ((container.offsetHeight * 2) / scale).toString() + "px";
      this.networkUI.background = true;
      this.networkUI.redraw();
      downloadURI(container.firstElementChild.firstElementChild, cwAPI.getPageTitle() + ".png");
      //            this.networkUI.on("afterDrawing", function(ctx) {});
      container.style.height = oldheight + "px";
      container.style.width = "";
      this.networkUI.background = false;
      this.networkUI.redraw();
      this.networkUI.fit();
    } catch (e) {
      console.log(e);
    }
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
