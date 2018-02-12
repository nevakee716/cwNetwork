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


    cwLayoutNetwork.prototype.downloadImage = function (event) {

        function downloadURI(canvas, name) {
            var link = document.createElement("a");
            //link.download = name;
            //link.href = uri;
            //link.click();
            //var blob = new Blob([uri], { type: "image/png" });
            //window.navigator.msSaveOrOpenBlob(uri, name);

            if (canvas.msToBlob) { //for IE
                var blob = canvas.msToBlob();
                window.navigator.msSaveBlob(blob, name);
            } else {
                //other browsers
                link.href = canvas.toDataURL('image/png');
                link.download = name;
                // create a mouse event
                var event = new MouseEvent('click');

                // dispatching it will open a save as dialog in FF
                link.dispatchEvent(event);
            }


        }

        try {
            this.networkUI.fit();
            var container = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
            var oldheight = container.offsetHeight; 
            var scale = this.networkUI.getScale(); // change size of the canva to have element in good resolution
            container.style.width = (container.offsetWidth * 2/scale ).toString() + "px";
            container.style.height = (container.offsetHeight * 2/scale ).toString() + "px";
            this.networkUI.redraw();
            downloadURI(container.firstElementChild.firstElementChild,cwAPI.getPageTitle() + ".png");
            this.networkUI.on("afterDrawing",function (ctx) {});
            container.style.height = oldheight + "px";
            container.style.width = "";
            
            this.networkUI.redraw();
            this.networkUI.fit();
        }
        catch (e) {
            console.log(e);
        }




    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));