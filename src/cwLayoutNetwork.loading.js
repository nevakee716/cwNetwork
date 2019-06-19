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





    cwLayoutNetwork.prototype.createLoadingElement = function(container) {
        var a = document.createElement('a');
        a.className = 'networkLoadingElementWrapper';
        a.innerHTML = "<i class='networkLoadingElement fa fa-circle-o-notch fa-spin'> </i>";
        let m;
        m = (document.body.offsetHeight-10) /2;
        a.style.top = m + "px";
        m = (document.body.offsetWidth-50) /2;
        a.style.left = m + "px";
        var span = document.createElement("span");
        span.className = "cwLayoutNetworkLoadingBartext";
        span.id = "cwLayoutNetwork_text" + this.nodeID;
        a.appendChild(span);

        this.loadingElement = a;
        container.appendChild(a);
    };

    cwLayoutNetwork.prototype.displayLoading = function() { 
        this.loadingElement.classList.remove("cw-hidden");
    };


    cwLayoutNetwork.prototype.hideLoading = function() { 
        this.loadingElement.classList.add("cw-hidden");
    };

    cwLayoutNetwork.prototype.setLoadingAt = function(number) { 
        document.getElementById("cwLayoutNetwork_text" + this.nodeID).innerHTML = number;
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));