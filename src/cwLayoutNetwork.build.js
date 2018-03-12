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

    cwLayoutNetwork.prototype.applyJavaScript = function () {
        if(this.init) {
            this.init = false;
            var self = this;
            var libToLoad = [];

            if(cwAPI.isDebugMode() === true) {
                if(self.network) self.createNetwork();                    
            } else {
                libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js','modules/vis/vis.min.js','modules/d3/d3.min.js'];
                // AsyncLoad
                cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                    if(error === null) {
                        libToLoad = ['modules/visNetworkMenu/visNetworkMenu.min.js']; 
                        cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                            if(error === null) {
                                if(self.network) self.createNetwork();    
                            } else {
                                cwAPI.Log.Error(error); 
                            }
                        });            
                    } else {
                        cwAPI.Log.Error(error);
                    }
                });
            }
        }
    };


// Building network
    cwLayoutNetwork.prototype.createNetwork = function () {  
        function addStyleString(str) {
            var node = document.createElement('style');
            node.innerHTML = str;
            document.body.appendChild(node);
        }

        var networkContainer = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
        var filterContainer = document.getElementById("cwLayoutNetworkFilter" + this.nodeID);
        var actionContainer = document.getElementById("cwLayoutNetworkAction" + this.nodeID);        
        var objectTypeNodes = this.network.getObjectTypeNodes();
        var ObjectTypeNode,externalfilter;
        var mutex= true;
        var i = 0;


        // legend
        var x = - networkContainer.clientWidth / 2 + 70;
        var y = - networkContainer.clientHeight / 2 + 150;
        var step = 70;

        // provide the data in the vis format
        var nodes = new vis.DataSet(); //this.network.getVisNodes());
        var edges = new vis.DataSet(this.network.getVisEdges()); //this.network.getVisEdges());
        this.nodes = nodes;
        this.edges = edges;

        var data = {
            nodes: nodes,
            edges: edges
        };
        this.networkOptions = {
            groups : this.groupsArt,
            physics: {
                barnesHut: {
                  springLength: 150
                },
                minVelocity: 0.75,
            },
            interaction: {
                keyboard: true
            }
        };

        this.createFilterObjects(filterContainer);


        // Adding filter search
        actionContainer.insertBefore(this.network.getSearchFilterObject(this.nodeID),actionContainer.firstChild);


        // Adding filter options
        //filterContainer.appendChild(this.network.getFilterOptions());
        //give bootstrap select to filter
        $('.selectNetworkPicker_' + this.nodeID).selectpicker(); 
        $('.selectNetworkExternal_' + this.nodeID).selectpicker(); 
        $('.selectNetworkSearch_' + this.nodeID).selectpicker(); 
        
        $('.selectNetworkClusterByGroup_' + this.nodeID + '_child').selectpicker(); 
        $('.selectNetworkClusterByGroup_' + this.nodeID + '_head').selectpicker(); 

        // set height
        var titleReact = document.querySelector(".page-title").getBoundingClientRect();        
        var topBarReact = document.querySelector(".page-top").getBoundingClientRect();
        var actionReact = actionContainer.getBoundingClientRect();
        var filterReact = filterContainer.getBoundingClientRect();                
        var canvaHeight  = window.innerHeight - titleReact.height - actionReact.height - filterReact.height - topBarReact.height;
        networkContainer.setAttribute('style','height:' + canvaHeight + 'px');
        
        var self = this;


        // Event for filter
        // Network Node Selector
        $('select.selectNetworkPicker_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(mutex) { 
                var group = $(this).context['id'];
                var scriptname = $(this).context.getAttribute('scriptname');
                var changeSet,id,nodeId,i;
                var groupArray = {};
                var globValues = $('select.selectNetworkAllGroups').val();

                if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                    id = $(this).context[clickedIndex]['id'];
                    nodeId = id + "#" + scriptname;
                    if(newValue === false) { // hide a node
                        self.removeNodes([nodeId]);
                    } else { // add one node
                        self.network.show(id,group);
                        changeSet = self.network.getVisNode(id,group); // get all the node self should be put on
                        nodes.add(changeSet); // adding nodes into network
                        self.setAllExternalFilter();
                        self.updatePhysics();
                    }
                } else {  // select or deselect all node
                    if($(this).context[0]) {
                        var changeSet = self.network.SetAllAndGetNodesObject($(this).context[0].selected,group);
                        if($(this).context[0].selected === true) {
                            nodes.add(changeSet);
                            self.updatePhysics();
                        } else {
                            self.removeNodes(changeSet);
                        }
                        if(self.networkUI) {
                            self.colorAllNodes();
                            self.colorAllEdges();                        
                        }
                        self.setExternalFilterToNone(); 
                    }
                }
            }
        });


        // Cluster Group Filter Head
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_head").on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var group = $(this).context['id'];
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                self.clusterByGroupOption.head = $(this).selectpicker('val').replaceAll("_"," ");;
                self.clusterByGroup();
            }
        });


        // Cluster Group Filter Child
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_child").on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                self.clusterByGroupOption.child = [];
                if($(this).selectpicker('val') && $(this).selectpicker('val').length > 0) {
                    $(this).selectpicker('val').forEach(function(c) {
                        self.clusterByGroupOption.child.push(c.replaceAll("_"," "));
                    });                    
                } else {
                    self.clusterByGroupOption.child = [];
                }
                self.clusterByGroup();
            }
        });
    

        // External Filter
        $('select.selectNetworkExternal_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var group = $(this).context['id'];
            var filterName = $(this).context.getAttribute('filterName');
            var nodesArray,id,nodeId,i,changeSet;
            
            var allNodes;

            if(self.externalFilterBehaviour.absolute === true) {
                self.deActivateAllGroup();
            }

            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                id = $(this).context[clickedIndex]['id'];
                if(newValue === false) { // hide a node
                    self.removeExternalFilterValue(filterName,id);
                } else {
                    self.addExternalFilterValue(filterName,id);
                }
            } else {  // select or deselect all node
                if($(this).context[0]) {
                    if($(this).context[0].selected === true) {
                        self.addAllExternalFilterValue(filterName,id);
                    } else {
                        self.removeAllExternalFilterValue(filterName,id);
                    }
                }
            }
            self.setAllExternalFilter();

        });

        // Event for filter
        // Move On a Node
        $('select.selectNetworkSearch_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(mutex) { 
                var changeSet,id,nodeId,i;
                var groupArray = {};
                if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                    id = $(this).context[clickedIndex]['id'];
                    var options = {
                      position: self.networkUI.getPositions()[id],
                      scale: 2,
                      offset: {x:0,y:0},
                      animation: true // default duration is 1000ms and default easingFunction is easeInOutQuad.
                    };
                    self.networkUI.moveTo(options);
                    
                    options = {"nodes": [id]};
                    self.networkUI.setSelection(options);
                } 
                $(this).selectpicker('val',""); 
            }
        });

       
        // Action for button
        /* if(this.clusterOption) {
            var clusterButton = document.getElementById("cwLayoutNetworkButtonsCluster" + this.nodeID); 
            clusterButton.addEventListener('click', this.clusterByHubsize.bind(this));              
        }*/

        if(this.physicsOption){
            var physicsButton = document.getElementById("cwLayoutNetworkButtonsPhysics" + this.nodeID);
            physicsButton.addEventListener('click', this.stopPhysics.bind(this)); 
        }

        if(this.edgeOption){
            var zipEdgeButton = document.getElementById("cwLayoutNetworkButtonsZipEdge" + this.nodeID);
            zipEdgeButton.addEventListener('click', this.edgeZipButtonAction.bind(this));
            this.createUnzipEdge();

            var event = {};
            event.target = zipEdgeButton;
            if(this.edgeZipped === false) {
                this.edgeZipped = true;
                this.edgeZipButtonAction(event);
            }
        }

        if(this.removeLonely){
            var removeLonelyButton = document.getElementById("cwLayoutNetworkButtonsLonelyNodes" + this.nodeID);
            removeLonelyButton.addEventListener('click', this.removeLonelyButtonAction.bind(this)); 
        }
        var downloadButton = document.getElementById("cwLayoutNetworkButtonsDownload" + this.nodeID);
        downloadButton.addEventListener('click', this.downloadImage.bind(this)); 

        var deSelectAllButton = document.getElementById("cwLayoutNetworkDeselectAll" + this.nodeID);
        deSelectAllButton.addEventListener('click', this.deActivateAllGroup.bind(this)); 

        var selectAllButton = document.getElementById("cwLayoutNetworkSelectAll" + this.nodeID);
        selectAllButton.addEventListener('click', this.activateAllGroup.bind(this)); 


        // fill the search filter
        data.nodes.on("add", this.addSearchFilterElement.bind(this));
        data.nodes.on("remove", this.removeSearchFilterElement.bind(this));

        if(!this.wiggle) {
        	// Activate Starting groups
        	this.activateStartingGroup();
        }

        // initialize your network 
        this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);


        if(this.wiggle) {
        	// Activate Starting groups
        	this.activateStartingGroup();
        }

        // before drawing event
        this.networkUI.on("beforeDrawing", this.beforeDrawing.bind(this));
        

        // Activate Cluster
        this.activateStartingCluster();

        // Creation du menu et binding
        this.createMenu(networkContainer);
        networkContainer.addEventListener('RemoveNode', this.RemoveNodeEvent.bind(this));  
        networkContainer.addEventListener('AddClosesNodes', this.AddClosesNodes.bind(this));  
        networkContainer.addEventListener('RemoveClosesNodes', this.RemoveClosesNodes.bind(this));  
        networkContainer.addEventListener('AddAllNodesFrom', this.AddAllNodesFrom.bind(this)); 
        networkContainer.addEventListener('AddAllNodesTo', this.AddAllNodesTo.bind(this)); 

        // Interaction Click
        this.networkUI.on("click", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                if (self.networkUI.isCluster(params.nodes[0]) == true) {
                    self.networkUI.openCluster(params.nodes[0]);
                } else {
                    var split = params.nodes[0].split("#");
                    self.openPopOut(split[0],split[1]);
                }
            } else if(params.hasOwnProperty('edges') && params.edges.length === 1) {
                var edge = self.edges.get(params.edges[0]);
                self.openPopOutFromEdge(edge);
            };
        });

        this.networkUI.on("doubleClick", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                self.openObjectPage(split[0],split[1]);
            }
        });
        

        var stop = false;
        this.networkUI.on("stabilizationIterationsDone", function () {
            window.setTimeout(function (params) {
                self.networkUI.fit();
                self.networkUI.removeEventListener("startStabilizing");
                //networkContainer.style["visibility"] = "visible";
                //$('.cwloading').hide(); 
            }, 1000);
        });

 

        this.networkUI.on("startStabilizing", function (params) {
            //$('.cwloading').show(); 
            //networkContainer.style["visibility"] = "hidden";
        });
    };





    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));