//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.BuildGraphPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.buildgraphpanel',
	itemId : 'buildgraphpanel',
	id     : 'buildgraphpanel',
	requires: ['Ext.data.*','Ext.grid.*','Ext.dd.*','Ext.panel.*','JdaPivotApp.view.businessgraph.BuildGraphWestPanel', 'JdaPivotApp.view.businessgraph.PivotHighChartWidget'],
	layout: 'border',
	border : false,
	defaults: {
		border : false
	},
	config : {
		graphData: '',
		isEdit : false
	},
	initComponent : function() {
		var me = this;
		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
  	
		var graphId = null;
		var graphName = '';
		var graphData = me.getGraphData();
		if(graphData){
			graphId = graphData.id;
			graphName = graphData.name;
		}
		
		var graphNameLabel = pivotObj.getLocaleString('BusinessGraph.Build.GraphName');
	    var tm = new Ext.util.TextMetrics();
	    var graphNameLabelWidth  = tm.getWidth(graphNameLabel + ":");
		var northPanel = Ext.create('Ext.form.Panel', {
	  	    bodyPadding: 10,
	  	    items: [{
	  	        xtype: 'textfield',
	  	      	anchor: '30%',
	  	        name: 'graphName',
	  	        itemId: 'graphName',
	  	        id: graphId,
	  	        value : graphName,
	  	        labelWidth: graphNameLabelWidth,
	  	        labelSeparator : '',
	  	        fieldLabel: graphNameLabel,
	  	        msgTarget  : 'qtip',
	  	        fieldStyle: 'background-image: none;',
  	        	listeners: {
                    afterrender: function(field) {
                      field.focus();
                    }
                }
	  	    }
	  	    ]
	  	});
	
		var dragDropPanel = Ext.create('Ext.panel.Panel', {
		  		border : false,
		  		layout: {
		    	    type: 'vbox',
		    	    align: 'stretch'
		    	},
		  		items: 
		  			[
						{
						    xtype: 'label',
						    text: pivotObj.getLocaleString('BusinessGraph.Build.DragDropBuildChart'),
						    flex: 0.05,
		  					style : {
		                          textAlign: 'center'
		                    },
		                    cls: 'split-panel-separation',
						},
						{
			            	xtype : 'buildgraphwestpanel',
			            	border : false,
			            	graphData: me.getGraphData(),
			            	flex: 0.95
			            }
					] 
		}); 
		var graphOptions = pivotObj.getGraphConfig().options;
		if(!graphOptions.informationMessageCallBack){
			graphOptions.informationMessageCallBack = Ext.ComponentQuery.query('[itemId=businessgraphwrapper]')[0]._informationMessageCallBack;
		}
		//graphOptions.informationMessageCallBack = me.informationMessageCallBack;
		var chartPreviewPanel = Ext.create('Ext.panel.Panel', {
	  		border : false,
	  		layout: {
	    	    type: 'vbox',
	    	    align: 'stretch'
	    	},
	  		items: 
	  			[
					{
					    xtype: 'label',
					    text: pivotObj.getLocaleString('BusinessGraph.Build.chartPreview'),
					    flex: 0.05,
					    style : {
	                        textAlign: 'center'
	                    }
					},
					{
		    			xtype: 'panel',
		    			width: '100%',
		    			layout: {
		    	  			type: 'hbox',
		    	  			align: 'middle'
		    			},
		    			itemId: 'governorMsgPanel-pivotBusinessGraphPreviewArea',
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
		                   //padding: 0,
		                   padding: '3px 3px 3px 3px',
		                   flex:1,
		                   fieldCls: 'ellipsis',
		                   fieldStyle: 'text-align: center;',
		                   listeners : {
		                	   afterrender: function(component) {
		                		   try{
		                			   component.bodyEl.el.dom.style.verticalAlign="middle";
		                		   }catch(e){
		                			   console.log('failied to set vertical align for governor message');
		                		   }
		                	   }
		                   }
		    			},
		    			{
		                   xtype: 'box',
		                   margin: '0px 5px',
		                   autoEl: {
		                	   tag: 'a',
		                	   html: '<span class="j-standard-inner-margin-right j-graphic-cancel-close j-vpimage j-font-graphic j-font-graphic--size-small j-font-graphic--supports-mouseover j-font-graphic--base"'
		                    	   +'style="color: #FFFFFF;;font-size:10px;"></span>',
		                       href: "JavaScript:Ext.ComponentQuery.query('[itemId=businessgraphwrapper]')[0]._hideGovernorExceededInfoMessage('governorMsgPanel-pivotBusinessGraphPreviewArea')",
		                   },
		    			}]
		            },
		            {
		    			xtype: 'panel',
		    			width: '100%',
		    			layout: {
		    	  			type: 'hbox',
		                    align: 'middle'
		    			},
		    			itemId: 'warningMessagePanel-pivotBusinessGraphPreviewArea',
		    			border: false,
		    			style: 'border-style: solid; border-width: 1px; border-color: #D68001;',
		    			bodyStyle: 'background-color: #D68001; color: #FFFFFF;',
		    			margin: 2,
		    			padding: '0 0 0 0',
		    			bodyPadding: '0 0 0 0',
		    			hidden: true,

		    			items:[{
		                   xtype: 'displayfield',
		                   itemId: 'warningMessage',
		                   //padding: 0,
		                   padding: '3px 3px 3px 3px',
		                   flex:1,
		                   fieldCls: 'ellipsis',
		                   fieldStyle: 'text-align: center;',
	                	   listeners : {
		                	   afterrender: function(component) {
		                		   try{
		                			   component.bodyEl.el.dom.style.verticalAlign="middle";
		                		   }catch(e){
		                			   console.log('failied to set vertical align for warning message');
		                		   }
		                	   }
		                   }
		    			},
		    			{
		                   xtype: 'box',
		                   margin: '0px 5px',
		                   autoEl: {
		                	   tag: 'a',
		                	   html: '<span class="j-standard-inner-margin-right j-graphic-cancel-close j-vpimage j-font-graphic j-font-graphic--size-small j-font-graphic--supports-mouseover j-font-graphic--base"'
		                    	   +'style="color: #FFFFFF;;font-size:10px;"></span>',
		                       href: "JavaScript:Ext.ComponentQuery.query('[itemId=businessgraphwrapper]')[0]._hideGovernorExceededInfoMessage('warningMessagePanel-pivotBusinessGraphPreviewArea')",
		                   },
		    			}]
		            },
					{
		            	xtype : 'pivothighchartwidget',
		            	graphOptions: graphOptions,
		            	chartId :'pivotBusinessGraphPreviewArea',
		        		containerId :'pivotBusinessGraphPreviewArea',
		        		isClickContextRequired:false,
		            	flex: 0.95,
		            	border : false,
		            }
				] 
		}); 
		 me.items=  [
		             {
	            region:'north',
	            xtype: 'panel',
	            id: 'north-region-container',
	            items : northPanel
	        },
	        {
	            region: 'south',
	        	buttons : [
	        	   	    {
	        	   			xtype : 'tbspacer',
	        	   			flex : 0.25
	        	   		},
	        	   		{
	  					  xtype: 'label',
	  				      forId: 'graphConfigStatus',
	  				      text: '',
	  				      margin: '0 20 0 0',
	  				      labelStyle : 'font-weight:bold;',
	  				      style : {
	  	                        color : 'red',
	  	                    }
	        	   		},
	        	   		{
	        	   			type : 'button',
	        	   			text : pivotObj.getLocaleString('BusinessGraph.Button.Save'),
	        	   			itemId : 'businessgraphsavebtn',
	        	   			ui : 'j-primary-button',
	        	   			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons',
	        	   		},
	        	   		{
	        	   			type : 'button',
	        	   			text :  pivotObj.getLocaleString('BusinessGraph.Button.SaveAs'),
	        	   			itemId : 'businessgraphsaveasbtn',
	        	   			ui : 'j-standard-button',
	        	   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
	        	   			hidden: !me.getIsEdit()
	        	   		},
	        	   		{
	        	   			type : 'button',
	        	   			text :  pivotObj.getLocaleString('BusinessGraph.Button.Cancel'),
	        	   			itemId : 'businessgraphcancelbtn',
	        	   			ui : 'j-standard-button',
	        	   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
	        	   		},
	        	   		{
	        	   			type : 'button',
	        	   			text :  pivotObj.getLocaleString('BusinessGraph.Button.Delete'),
	        	   			itemId : 'businessgraphdeletebtn',
	        	   			ui : 'j-standard-button',
	        	   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
	        	   			hidden: !me.getIsEdit()
	        	   		},
	        	   		{
	        	   			xtype : 'tbspacer',
	        	   			flex : 0.25
	        	   		} 
	        	   	],
	        	   	padding : '0 0 10 0'
	        },{
	            region:'west',
	            xtype: 'panel',
	            id: 'buildgraph-west-region-container',
	            layout: 'fit',
	            flex : 0.40,
	            items : dragDropPanel,
	            split: true,
	            cls: 'split-panel-separation',
	            floatable: false,
		  		padding : '20 0 10 10'
	        },{
	            region: 'center',
	            id: 'center-region-container',
	            xtype: 'panel',
	            layout: 'fit',
	            flex : 0.60,
	            items : chartPreviewPanel,
		  		padding : '20 10 10 5',
	        }];
		me.callParent(arguments);
	},
	setSplitRange: function(){
		var me = this;
		/*This will be for split between drag drop panel and chart preview panel. 
		  split can be dragged towards left till it reaches minimum width;
		  split can be dragged towards right till it reaches max width;*/
		var width = me.getWidth();
		var container = Ext.getCmp('buildgraph-west-region-container');
		if(width && container){
			container.minWidth = width * 0.3;
			container.maxWidth = width * 0.7;
		}
	},
	afterRender : function() {
		this.setSplitRange();
		this.callParent(arguments);
	}
});