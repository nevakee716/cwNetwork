/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var urlToLoadAsync = function (url,callback) {
        this.url = url;
        this.status = "notLoaded";
        this.callbacks = [callback];
        this.error = null;
    };

    urlToLoadAsync.prototype.addCallback = function (callback) {
        this.callbacks.push(callback);
    };

    urlToLoadAsync.prototype.getStatus = function () {
        return this.status;
    };

    urlToLoadAsync.prototype.getError = function () {
        return this.error;
    };

    urlToLoadAsync.prototype.load = function () {
        this.status = "inLoad";
        var that = this;
        $.ajax({
            url: that.url,
            dataType: 'script',
            cache: true, // otherwise will get fresh copy every page load
            success: function() {
                that.status = "loaded";
                that.callbacks.forEach(function(callback) {
                    callback(null);
                });
            },
            error: function(XMLHttpRequest) { 
                if(XMLHttpRequest.status != "200") {
                    that.status = "failed";
                    that.error = "error " + XMLHttpRequest.status + " : " + XMLHttpRequest.statusText;
                    that.callbacks.forEach(function(callback) {
                        callback(that.error);
                    });
                } else {
                    that.callbacks.forEach(function(callback) {
                        callback(null);
                    });  
                }
            }  
        });
    };




    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if(!cwApi.customLibs.urlToLoadAsync){
        cwApi.customLibs.urlToLoadAsync = urlToLoadAsync;
    };


}(cwAPI, jQuery));