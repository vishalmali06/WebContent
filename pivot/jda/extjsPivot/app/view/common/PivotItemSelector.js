//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.common.PivotItemSelector', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.pivotitemselector',
	itemId : 'pivotitemselector',
	layout:{
		type:'hbox',
		align:'stretch'
	},
    border: false,
    config : {
		filterConfig : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj = JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var filterConfig = me.getFilterConfig(); 
		me.items=  [
	    	{
                flex:1,
                xtype:'container',
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                items:[
                    {
                        xtype:'toolbar',
                        docked:'top',
    	                flex: 0.15,
                        items:[
                            {
                                xtype:'container',
                                html:pivotObj.getLocaleString('MeasureFilter.Config.Available'),
                                padding : '0 10 0 10 ',
                                flex : 0.6,
                            },
                            {
        	    	            xtype: 'trigger',
        	    	            triggerCls: 'x-form-search-trigger',
        	    	            itemId: 'availbleSubMeasuresSearch',
        	    	            enforceMaxLength: true,
        	    	            enableKeyEvents: true,
        	    	            flex : 0.4,
        	    	            border: 0,
        	    	            emptyText: pivotObj.getLocaleString('MeasureFilter.Config.SearchText'),
        	    	        }
                        ]
                    },
                    {
            			xtype: 'gridpanel',
            			flex: 0.85,
            			selModel: {
            				mode: 'MULTI'
            			},
            			hideHeaders:true,
            		  	rowLines: false,
            		  	viewConfig: {
            		  		stripeRows: false,
            		  		copy: true,
            		  	},
                        store: new JdaPivotApp.store.measurefilter.AvailableSubMeasures({storeId:'availableSubMeasuresStore'}),
                        itemId: 'availbaleSplitMeasuresGrid',
                        autoScroll: true,
            			columns : {
            				defaults : {
            					menuDisabled : true,
            					sortable : false
            				},
            				items : [
            	            {
            	                dataIndex: 'name',
            	                flex : 1,
            	            },
            	        ]},
            		}
                ]
	    	},
	    	{
	    		layout:{
                    type:'vbox',
                    pack:'center'
                },
                defaults:{
                	margin: "0 8 8 8"
                },
                border:false,
                items:[
                	{
                		xtype:'button',
                        itemId:'moveAllItemsToRight',
                        iconCls:'j-pvt-measurefilter-moveallright-img',
                        tooltip:pivotObj.getLocaleString('MeasureFilter.Config.MoveAllItemsToRight')
                    },
                    
                    {
                        xtype:'button',
                        itemId:'moveItemsToRight',
                        iconCls:'j-pvt-measurefilter-moveright-img',
                        tooltip:pivotObj.getLocaleString('MeasureFilter.Config.MoveItemsToRight')
                    },
                    {
                        xtype:'button',
                        itemId:'moveItemsToLeft',
                        iconCls:'j-pvt-measurefilter-moveleft-img',
                        tooltip:pivotObj.getLocaleString('MeasureFilter.Config.MoveItemsToLeft')
                    },
                	{
                        xtype:'button',
                        itemId:'moveAllItemsToLeft',
                        iconCls:'j-pvt-measurefilter-moveallleft-img',
                        tooltip:pivotObj.getLocaleString('MeasureFilter.Config.MoveAllItemsToLeft')
                    },
                ]
	    	},
	    	{
                flex:1,
                xtype:'container',
                layout:{
                    type:'vbox',
                    align:'stretch'
                },
                items:[
                    {
                        xtype:'toolbar',
                        docked:'top',
                        flex: 0.15,
                        items:[
                        	 {
                                 xtype:'container',
                                 html:pivotObj.getLocaleString('MeasureFilter.Config.Selected'),
                                 padding : '0 10 0 10 ',
                                 flex : 0.6,
                             },
                             {
         	    	            xtype: 'trigger',
         	    	            triggerCls: 'x-form-search-trigger',
         	    	            itemId: 'selectedSubMeasuresSearch',
         	    	            enforceMaxLength: true,
         	    	            enableKeyEvents: true,
         	    	            flex : 0.4,
         	    	            border: 0,
         	    	            emptyText: pivotObj.getLocaleString('MeasureFilter.Config.SearchText'),
         	    	        }
                        ]
                    },
                    {
            			xtype: 'gridpanel',
            			padding : '0 2 0 0 ',
            			 flex: 0.85,
            			 selModel: {
         		            mode: 'MULTI'
         		        },
            			hideHeaders:true,
            		  	rowLines: false,
            		  	viewConfig: {
              	        	 stripeRows: false,
              	        	 copy: true,
               		  	},
                        store: 'selectedSubMeasuresStore',
                        itemId: 'selectedSplitMeasuresGrid',
                        autoScroll: true,
                        cls : 'j-pvt-measurefilter-grid',
            			bodyCls : 'j-pvt-measurefilter-grid-body',
            			columns : {
            				defaults : {
            					menuDisabled : true,
            				},
            				items : [
            	            {
            	                dataIndex: 'name',
            	                flex : 1,
            	            },
            	        ]},
            		}
                ]
	    	
	    	}
		]
		me.callParent(arguments);
	},
});