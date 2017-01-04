/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var aSyncLayoutLoader = function () {
        this.urls = {};
    };;

    aSyncLayoutLoader.prototype.CheckUrl = function (url,callback) {
        if(cwApi.isLive()) {
            url = "../../Common/" + url;
        }
        if(!this.urls.hasOwnProperty(url)) {
            console.log("create " + url);
            this.urls[url] = new cwApi.customLibs.urlToLoadAsync(url,callback);
            this.urls[url].load();
        } else {
            var status = this.urls[url].getStatus();
            if(status === "inLoad") {
                console.log("url " + url + " inload adding callback");
                this.urls[url].addCallback(callback);
            } else if(status === "loaded") {
                callback();
                console.log("url " + url + " already loading");
            } else if(status === "failed") {
                callback(this.urls[url].getError());
            }
        }
    };

    aSyncLayoutLoader.prototype.loadUrls = function (urls,callback) {
        var i;
        var loaded = urls.length;
        for (var i = 0; i < urls.length; i += 1) {
            this.CheckUrl(urls[i], function(error) {
                if(error !== null) {
                    callback(error);
                } else {
                    loaded = loaded - 1;
                    if(loaded === 0) {
                        callback(null);
                    }                   
                }
            });
        }

        if(this.urls.length === 0 ) {
            callback(null);
        }
    };


    aSyncLayoutLoader.prototype.load = function (url,callback) {
        $.ajax({
            url: url,
            dataType: 'script',
            cache: true, // otherwise will get fresh copy every page load
            success: function() {callback(null);}
        });
    };




    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if(!cwApi.customLibs.aSyncLayoutLoader){
        cwApi.customLibs.aSyncLayoutLoader = new aSyncLayoutLoader();
    };


}(cwAPI, jQuery));