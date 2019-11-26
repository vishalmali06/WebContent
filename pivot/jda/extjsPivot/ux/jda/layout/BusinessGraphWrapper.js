//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.BusinessGraphWrapper',{
	extend : 'Ext.panel.Panel',
	alias : 'widget.businessgraphwrapper',
	requires : ['JdaPivotApp.view.businessgraph.PivotHighChartWidget'],
	config : {
		graphConfig:{},
		pivotObj:null,
		graphAreaId:'pivothighchartwidget-pivotBusinessGraphArea',
		flyoutIsOpen:false,
		selectedCell: null,
		businessGraphs: null,
		intersection:null,
	},
	cls : 'j-pvt-styling-panel',
	layout       : {
		type: 'vbox',
		align: 'fit',
	  },
	initComponent : function() {
		var me = this;
		me.on({
			handleResponse : me._handleResponse,
			refreshGraphData : me._refreshGraphData,
			pivotFlyoutOpen:me._pivotFlyoutOpen,
			pivotFlyoutClose:me._pivotFlyoutClose,
			isFlyoutOpen:me._isFlyoutOpen,
			cellchange : this._onCellChange
		});
		 
		me.items = [
            {
    			xtype: 'panel',
    			width: '100%',
    			layout: {
    				type: 'hbox',
                    align: 'stretch',
                    pack: 'start'
    			},
    			itemId: 'governorMsgPanel-pivotBusinessGraphArea',
    			border: false,
    			style: 'border-style: solid; border-width: 1px; border-color: #D68001;',
    			bodyStyle: 'background-color: #D68001; color: #FFFFFF;',
    			margin: 2,
    			padding: '0 0 0 0',
    			bodyPadding: '0 0 0 0',
    			hidden: true,
    			items:[{
                   xtype: 'displayfield',
                   itemId: 'governorExceededInfoMessage',
                   padding: 0,
                   flex:1,
                   fieldCls: 'ellipsis',
                   fieldStyle: 'text-align: center; vertical-align: top;'
    			},
    			{
                   xtype: 'box',
                   margin: '0px 5px',
                   autoEl: {
                	   tag: 'a',
                       html: '<span class="j-standard-inner-margin-right j-graphic-cancel-close j-vpimage j-font-graphic j-font-graphic--size-small j-font-graphic--supports-mouseover j-font-graphic--base"'
                    	   +'style="color: #FFFFFF;;font-size:10px;padding-top:6px"></span>',
                       href: "JavaScript:Ext.ComponentQuery.query('[itemId=businessgraphwrapper]')[0]._hideGovernorExceededInfoMessage('governorMsgPanel-pivotBusinessGraphArea')",
                }
    			}]
            },
			{
	        	xtype : 'pivothighchartwidget',
	        	chartId :'pivotBusinessGraphArea',
	    		containerId :'pivotBusinessGraphArea',
	        	flex: 1,
	        	isClickContextRequired:false,
	        	border : false,
	        }],
		me.dockedItems= {
            xtype: 'toolbar',
            cls : 'j-pvt-styling-header',
            id : 'businesssGraphToolBar',
            items : [
                     {
					  xtype: 'label',
				      forId: 'graphStatus',
				      text: '',
				      margin: '0 0 0 10',
				      labelStyle : 'font-weight:bold;',
				      style : {
	                        color : 'green',
				      }
					},
					{
					  xtype: 'label',
				      id: 'intersectionName',
				      text: '',
				      margin: '0 0 0 10',
				      style : {
				    	  'font-weight':'bold',
				      }
 					},
 					{
 						xtype : 'tbspacer',
 						flex : 1
 					},
 					{
 						xtype : 'combo',
 						store : Ext.StoreMgr.lookup('businessGraphsStore'),
 						displayField: 'name',
 						valueField: 'id',
 						id: 'graphscombo',
 						width: '15%',
 						autoSelect: false,
 						editable : false,
 					    growToLongestValue: true,
 		                grow: true,
 					    queryMode: 'local',
	 					listConfig: {
					        getInnerTpl: function() {
					        			var charLength = ((Ext.getCmp('graphscombo').getWidth()-8)/8);
					        	 return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
				            }
	 					},
	 					listeners: {
				            change: function (field, newValue, oldValue) {
				            	if(newValue != null){
				            		me.pivotObj.getPivotController()._getGraphDataById(newValue);
					            	me.enableEditGraphButton();
					                me.pivotObj.config.defaultGraphConfiguration = newValue;
					                me.setIntersectionName();
				            	}else{
				            		me.disableEditGraphButton();
				            		Ext.getCmp(me.graphAreaId).drawChart(null);
				            	}
				            },
	 					}
 					},
 					{
 						type : 'button',
 						iconCls:'j-bg-editconfig',
 						itemId : 'editgraphconfigbtn',
 						id     : 'editgraphconfigbtn',
 						overCls : '',
 						focusCls : '',
 						style: {color:'gray'},
 						margin: '0 5 0 0',
 						disabled: true
 					},
 					{
 						type : 'button',
 						iconCls:'j-bg-addconfig',
 						itemId : 'addgraphconfigbtn',
 						id     : 'addgraphconfigbtn',
 						overCls : '',
 						focusCls : '',
 						margin: '0 5 0 0',
 					}
 					]
        },
		me.callParent(arguments);
	},
	onResize : function(width, height, oldWidth, oldHeight, eOpts ) {
		var wrapperHeight = (height- Ext.getCmp('businesssGraphToolBar').getHeight());
		var graphCmp = Ext.getCmp(this.graphAreaId);
		graphCmp.setWidth(width);
		graphCmp.setHeight(wrapperHeight);
	},
	afterRender : function() {
		var me = this;
		this.callParent(arguments);
		Ext.getCmp('graphscombo').setEmptyText(me.pivotObj.getLocaleString('BusinessGraph.DefaultValue.SelectGraph'));
		//Ext.getCmp('editgraphconfigbtn').setTooltip(me.pivotObj.getLocaleString('BusinessGraph.Tooltip.EditConfig'));
		Ext.getCmp('addgraphconfigbtn').setTooltip(me.pivotObj.getLocaleString('BusinessGraph.Tooltip.AddConfig'));
		me.graphConfig.options.informationMessageCallBack = me._informationMessageCallBack;
		me.graphConfig.options.warningMessageCallBack = me._warningMessageCallBack;
		Ext.getCmp(me.graphAreaId).graphOptions = me.graphConfig.options;
	},
	enableEditGraphButton: function(){
		 var editgraphconfigbtnObj = Ext.getCmp('editgraphconfigbtn');
         if(editgraphconfigbtnObj && editgraphconfigbtnObj.disabled){
         	editgraphconfigbtnObj.setDisabled(false);
         	editgraphconfigbtnObj.setTooltip("<table><tr><td nowrap>"+this.pivotObj.getLocaleString('BusinessGraph.Tooltip.EditConfig')+"</td></tr></table>");
         }
	},
	disableEditGraphButton: function(){
		 var editgraphconfigbtnObj = Ext.getCmp('editgraphconfigbtn');
        if(editgraphconfigbtnObj && editgraphconfigbtnObj.enable){
        	editgraphconfigbtnObj.setDisabled(true);
        	editgraphconfigbtnObj.setTooltip("");
        }
	},
	_handleResponse : function(response, request) {
		var pivotController = JdaPivotApp.getApplication().getPivotController(); 
		if(response == null) // null passed for GetGraphData error response handling
		{
			// This block is required for below case :
			// When a default graph is configured and that one is corrupted (hierarchy changed or something else happened after graph is saved),
			// we see error loop for GraphData and UpdateFacts requests until browser goes out of memory.
			//so we need to handle error response and show empty graph for both preview and normal view of graphs.
			if(request && request.params && request.params.operation === pivotController.self.PREVIEW_GRAPH){ 
				//hiding the preview governor exceeds message if any.
            	this._hideGovernorExceededInfoMessage('governorMsgPanel-pivotBusinessGraphPreviewArea');
				Ext.getCmp('pivothighchartwidget-pivotBusinessGraphPreviewArea').drawChart(null);
			}
			else
			{
				Ext.getCmp('pivothighchartwidget-pivotBusinessGraphArea').drawChart(null);
			}
		}
		else{
			if( request && request.params && (request.params.operation === pivotController.self.GET_GRAPH_DATA_BY_ID)){
				var graphCmp = Ext.getCmp(this.graphAreaId);
				graphCmp.drawChart(response.result.graphData);
			}else if( request && request.params && (request.params.operation === pivotController.self.SAVE_GRAPH_CONFIG || request.params.operation === pivotController.self.SAVEAS_GRAPH_CONFIG)){
				
				//call application hook
				if(this.graphConfig && this.graphConfig.hooks && this.graphConfig.hooks.afterSave){
					this.graphConfig.hooks.afterSave();
				}
				
				if(response && response.result && response.result.saveOrUpdateStatus) {
					
					if(request.params.operation === pivotController.self.SAVEAS_GRAPH_CONFIG){
						pivotController.closeChartTitleDialog();
		            }
					if(response.result.businessGraphs[0].id){
						/*var graphStatusObj = Ext.ComponentQuery.query('[forId=graphStatus]', this)[0];
						graphStatusObj.setText(this.pivotObj.getLocaleString('BusinessGraph.GraphConfig.Save.Successful'));
						setTimeout(function(){
							graphStatusObj.setText("");
						}, 2000);*/
						pivotController.closeBusinessGraphConfigWindow();
						//Add New Graph to List.
						var store = Ext.StoreMgr.lookup('businessGraphsStore');
						if(store){
							store.add(Ext.create('JdaPivotApp.model.Pair',{
								id : response.result.businessGraphs[0].id,
								name : response.result.businessGraphs[0].name
							}));
						}
						//Set the new graph as selected in graphscombo box.
						var graphscombo = Ext.getCmp('graphscombo');
						if(graphscombo){
							graphscombo.setValue(response.result.businessGraphs[0].id);
						}
						
		            	var data = {};
		                data.graphId = response.result.businessGraphs[0].id;
		                data.operation = pivotController.self.GET_GRAPH_DATA_BY_ID;
		                if(this.pivotObj.isCellContextGraphEnabled()){
		                	data.selectedCell = this.pivotObj.getSelectedCell();
		                	var graphs = this.config.businessGraphs;
		                	!graphs && (graphs = []);
		                	var isAdd = true;
		                	for(var i=0;i<graphs.length;i++){
		                		if(graphs[i] && graphs[i].id === response.result.businessGraphs[0].id){
		                			graphs[i] = response.result.businessGraphs[0];
		                			isAdd = false;
		                			break;
		                		}
		                	}
		                	isAdd && graphs.push(response.result.businessGraphs[0]);
		                	this.setIntersectionName();
		                }
		                pivotController.sendBusinessGraphRequest(data);
						//If edit graph button disabled, then enable it after graph loaded.
						this.enableEditGraphButton();
					}else{
						var graphStatusObj = Ext.ComponentQuery.query('[forId=graphConfigStatus]', pivotController.getBusinessGraphConfigWindow())[0];
						graphStatusObj && graphStatusObj.setText(this.pivotObj.getLocaleString('BusinessGraph.GraphConfig.Save.Failed'));
					}
				}else{
					var graphNameObj;
					if(request.params.operation == pivotController.self.SAVEAS_GRAPH_CONFIG){
						var chartTitleDialog = pivotController.getChartTitleDialog();
						graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', chartTitleDialog)[0];
	                }else{
	                	graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', pivotController.getBusinessGraphConfigWindow())[0];
	                }
					//Placed setTimeout due to _parse:onHideOverlaySpinner executing after 100ms. 
					setTimeout(function() {
						pivotController && graphNameObj && pivotController.showFieldError(graphNameObj, pivotObj.getLocaleString("BusinessGraph.Build.Validation.GraphName.NotUnique"));
						graphNameObj && graphNameObj.focus();
	                }, 100);
				}
			}else if( request && request.params && request.params.operation === pivotController.self.EDIT_GRAPH_CONFIG ){
				var resObj = response;
				var graphConfigData = resObj.result.graphData;
				var configWindow = Ext.widget('businessgraphconfigwindow', {
					graphData: graphConfigData,
					isEdit : true
				});
				configWindow.setTitle(this.pivotObj.getLocaleString('BusinessGraph.EditChart'));
				configWindow.show();
				pivotController.previewGraph(pivotController.self.PREVIEW_GRAPH);//Load preview.
				
			}else if( request && request.params && request.params.operation === pivotController.self.LOAD_BUSINESS_GRAPHS ){
				var resObj = response;
				var graphs = resObj.result.businessGraphs;
				this.config.businessGraphs = graphs;
				var store = Ext.StoreMgr.lookup('businessGraphsStore');
				store.removeAll();
				var graphscombo = Ext.getCmp('graphscombo');
				if(graphs && graphs.length > 0){
					for(var i=0;i<graphs.length;i++)
						store.add(Ext.create('JdaPivotApp.model.Pair',{
							id : graphs[i].id,
							name : graphs[i].name
						}));
					//Set the default graph configuration in graphscombo box.
					if(graphscombo && this.pivotObj && this.pivotObj.defaultGraphConfiguration() && store.contains(store.getById(this.pivotObj.defaultGraphConfiguration()))){
						if(graphscombo.getValue() == this.pivotObj.defaultGraphConfiguration()){
							this._refreshGraphData();
						}else{
							graphscombo.setValue(this.pivotObj.defaultGraphConfiguration());
						}
					}else{
						graphscombo.setValue(null);
					}
				}else if(graphscombo){
					graphscombo.setValue(null);
				}
				setTimeout(function(){
					pivotController && pivotController.getBusinessgraphbtn() && pivotController.getBusinessgraphbtn().focus();
			    }, 200);
				
			}else if( request && request.params && request.params.operation === pivotController.self.PREVIEW_GRAPH){
				Ext.getCmp('pivothighchartwidget-pivotBusinessGraphPreviewArea').drawChart(response.result.graphData);
			}else if(request && request.params && request.params.operation === pivotController.self.DELETE_GRAPH_CONFIG){
				//call application hook
				if(this.graphConfig && this.graphConfig.hooks && this.graphConfig.hooks.afterDelete){
					this.graphConfig.hooks.afterDelete();
				}
				
				pivotController.closeDeleteGraphDialog();
				
				if(response && response.result && response.result.deleteGraphConfigStatus){
					var store = Ext.StoreMgr.lookup('businessGraphsStore');
					if(store.contains(store.getById(request.params.graphId))){
						store.remove(store.getById(request.params.graphId)); 
						var graphscombo = Ext.getCmp('graphscombo');
						if(store.data.length > 0){
							graphscombo.setValue(store.first().get('id'));
						}else{
							graphscombo.setValue(null);
						}
						pivotController.closeBusinessGraphConfigWindow();
					}
					var graphs = this.config.businessGraphs;
                	!graphs && (graphs = []);
                	for(var i=0;i<graphs.length;i++){
                		if(graphs[i] && graphs[i].id === request.params.graphId){
                			delete graphs[i];
                			break;
                		}
                	}
				}else{
					var graphStatusObj = Ext.ComponentQuery.query('[forId=graphConfigStatus]', pivotController.getBusinessGraphConfigWindow())[0];
					graphStatusObj && graphStatusObj.setText(this.pivotObj.getLocaleString('BusinessGraph.GraphConfig.Delete.Failed'));
				}
			}
		}
	},
	_refreshGraphData:function(){
		//Update the graph data when user editing cells.
		var graphId = Ext.getCmp('graphscombo').getValue(); 
		if(graphId){
			this.pivotObj.getPivotController()._getGraphDataById(graphId);
		}
	},
	_pivotFlyoutOpen : function (){
		this.config.flyoutIsOpen = true;
	},
	_pivotFlyoutClose:function (){
		this.config.flyoutIsOpen = false;
	},
	_isFlyoutOpen:function (){
		return this.config.flyoutIsOpen;
	},
	_setDefaultDecimals:function(graphData){
		if(graphData){
			graphData.chart.decimals = this.pivotObj._settings.defaultDecimal;	
		}
		return graphData;
	},
	_informationMessageCallBack: function(msg, containerId, hideMessage) {
		var governorMsgPanel = Ext.ComponentQuery.query("[itemId=governorMsgPanel-"+containerId+"]")[0];
        if(governorMsgPanel){
        	if(hideMessage){
        		 governorMsgPanel.isVisible() && governorMsgPanel.hide();
    		}else{
    			var governorMsgPanel = Ext.ComponentQuery.query("[itemId=governorMsgPanel-"+containerId+"]")[0];
	        	var governorMsg = governorMsgPanel.down("#governorExceededInfoMessage");
	        	if(governorMsg){
	        		governorMsg.setValue(msg);
	        		governorMsg.getEl() && $(governorMsg.getEl().dom).attr("data-qtip",msg);
	                !governorMsgPanel.isVisible() && governorMsgPanel.show();
    	        }
    		}	
        }
    },
    _warningMessageCallBack: function(msg, containerId, hideMessage) {
		var warningMessagePanel = Ext.ComponentQuery.query("[itemId=warningMessagePanel-"+containerId+"]")[0];
        if(warningMessagePanel){
        	if(hideMessage){
        		warningMessagePanel.isVisible() && warningMessagePanel.hide();
    		}else{
    			var warningMessagePanel = Ext.ComponentQuery.query("[itemId=warningMessagePanel-"+containerId+"]")[0];
	        	var warningMsg = warningMessagePanel.down("#warningMessage");
	        	if(warningMsg){
	        		warningMsg.setValue(msg);
	        		$(warningMsg.getEl().dom).attr("data-qtip",msg);
	                !warningMessagePanel.isVisible() && warningMessagePanel.show();
    	        }
    		}	
        }
    },
    _hideGovernorExceededInfoMessage: function(containerId) {
    	var governorMsgPanel = Ext.ComponentQuery.query('[itemId='+containerId+']')[0];
    	governorMsgPanel && governorMsgPanel.isVisible() && governorMsgPanel.hide();
    },
    
    _onCellChange : function(selectedCell, intersection){
    	this.config.selectedCell = selectedCell;
    	this.config.intersection = intersection;
    	if(this.pivotObj.config.defaultGraphConfiguration){
    		this.pivotObj.getPivotController()._getGraphDataById(this.pivotObj.config.defaultGraphConfiguration);
    	};
    	this.setIntersectionName();
	},
	setIntersectionName : function(){
		var intersection  = this.config.intersection;
    	//preparing intersection name
		intersectionNameObj = this.down('#intersectionName');
    	if(this.pivotObj.isCellContextGraphEnabled() && intersection){
    		var selectedGraphConfig = undefined;
    		var selectedGraphId = Ext.getCmp('graphscombo').getValue();
    		var selectedFacets = [];
    		var graphs = this.config.businessGraphs;
    		if(graphs && graphs.length > 0){
				for(var i=0;i<graphs.length;i++){
					if(graphs[i] && graphs[i].id === selectedGraphId){
						selectedGraphConfig = graphs[i];
						break;
					}
				}
			}
    		
    		if(selectedGraphConfig && ((selectedGraphConfig.xaxis && selectedGraphConfig.xaxis.length > 0) || (selectedGraphConfig.legendFields && selectedGraphConfig.legendFields.length > 0) ) ){
    			for(var i = 0; i < selectedGraphConfig.xaxis.length; i++ ){
    				if(!selectedFacets.includes(selectedGraphConfig.xaxis[i].dimensionName)){
    					selectedFacets.push(selectedGraphConfig.xaxis[i].dimensionName);
    				}
    			}
    			
    			for(var i = 0; i < selectedGraphConfig.legendFields.length; i++ ){
    				if(!selectedFacets.includes(selectedGraphConfig.legendFields[i].dimensionName)){
    					selectedFacets.push(selectedGraphConfig.legendFields[i].dimensionName);
    				}
    			}
    		}
    		
    		intersection = $.grep(intersection,function(intersectionFacets){
				return !(selectedFacets.includes(intersectionFacets.facetName));
			});
    		
    		//intersection = intersection.filter(intersectionFacets => !selectedFacets.includes(intersectionFacets.facetName));
    		
    		var intr = this.pivotObj.getLocaleString("Graph.Intersection")+":  " ;
 			var intrLength =intersection.length;
 			for(var i=0; i<intrLength-1;i++){
 				var spt = intersection[i].facetLevelLabelObj.toString().split(",");
 				var hierarchy = [intersection[i].facetLabel].concat(intersection[i].facetLevelLabelObj).toString().replace(/,/g,'  ');
 				if(spt.length==1 && spt[0].length==0){
 					spt[0]=this.pivotObj.getLocaleString("TotalMemberName");
 				}
 					
 				if(i==intrLength-2)
 					intr+= '<span title="'+hierarchy+'">'+spt[spt.length-1]+'</span>';
 				else
 					intr += '<span title="' + hierarchy+'">'+spt[spt.length-1]+'</span>'+"<span style='font-size: 14px;'> &#9679; </span> ";
 			}
 			intr+=" ";
 			intersectionNameObj.setText(intr, false);
        }else{
        	intersectionNameObj.setText("");
        }
	}

});