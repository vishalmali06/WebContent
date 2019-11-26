//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFilterFormatCellPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.datafilterformatcellpanel',
	itemId : 'datafilterformatcellpanel',
	config : {
		filterConfig : null,
	},
	initComponent : function() {
		var me = this;
		var pivotController = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = pivotController.getPivotWrapper().getPivot();
		
		var filterConfig = me.getFilterConfig();
		var formatCell = filterConfig && filterConfig.formatCell;
		
		var cellBgColor = (formatCell)? (formatCell.cellBgColor + ';background-image:none;') : '';
		var cellFontColor = (formatCell)? (formatCell.cellFontColor + ';background-image:none;') : '';
		
		var hasExpandableMeasure = pivotObj.hasExpandableMeasure();
		
		var dataFilterTargetMeasuresStore = Ext.create('JdaPivotApp.store.datafilter.DataFilterTargetMeasures');
		//Initialize the store with measures in cube definition   
		var cube = pivotObj._getCubeDefinition();
		var measures = [];
		if(cube && cube.measures){
			var availableMeasures = cube.measures;
			for (var i = 0; i < availableMeasures.length; i++) {
				var measure = availableMeasures[i];
				if(measure && measure.uIAttributes){
					var measureId = measure.id;
					measures.push({
						id : measure.id,
						name : measure.label,
						displayName : measure.uIAttributes.displayName,
						hasChildren : measure.hasChildren
					});
				}
			}
		}
		dataFilterTargetMeasuresStore.loadData(measures, false);
		
		me.items=  [
		{
    		xtype: 'container',
    		defaultType: 'checkboxfield',
    		padding: '10 0 0 0',
    		items:[
			    {
                    boxLabel  : pivotObj.getLocaleString('DataFilter.Config.FormatCell'),
                    itemId    : 'formatCell',
                    checked	  : (formatCell && formatCell.targetMeasureId),
                    listeners : {
                    	change: function (checkbox, newVal, oldVal) {
                    		var datafilterformatCellPropsPanel = me.down("#datafilterformatCellPropsPanel");
                    		if(newVal){
                    			datafilterformatCellPropsPanel.show();
                    			var datafilterconfigwindow = datafilterformatCellPropsPanel.up("#datafilterconfigwindow").body.dom;
                    			datafilterconfigwindow && (datafilterconfigwindow.scrollTop = datafilterconfigwindow.scrollHeight - datafilterconfigwindow.offsetHeight);
                    		}else{
                    			datafilterformatCellPropsPanel.hide();
                    		}
                        }
                    }
			    }
		    ]
    	},
		{
            xtype: 'panel',
            border : false,
            hidden : !(formatCell && formatCell.targetMeasureId),
            itemId: "datafilterformatCellPropsPanel",
            layout: {
            	type: 'hbox',
            	align: 'stretch',
            },
	    	items:[
	    		{
		    		xtype: 'container',
		    		flex : 0.3,
		    		padding: '0 10 0 0',
		    		layout: {
		    			type: 'vbox',
		    		    align: 'stretch',
		    		},
		    		items:[
			    		{
			    			xtype: 'label',
			    			text: pivotObj.getLocaleString('DataFilter.Config.FormatCell.TargetMeasure')+ "*",
			    			padding: '0 0 5 0',
					    },
					    {
					    	xtype: 'combo',
					    	emptyText : pivotObj.getLocaleString('DataFilter.Config.FormatCell.SelectTargetMeasure'),
						    store : dataFilterTargetMeasuresStore,
	 						displayField: 'displayName',
	 						valueField: 'id',
	 						itemId: 'targetMeasureCombo',
	 						value : (formatCell && formatCell.targetMeasureId),
	 						editable : true,
	 					    growToLongestValue: true,
	 		                grow: true,
	 					    queryMode: 'local',
	 		                typeAhead: true,
	 		                pinList:true,
		 					listConfig: {
						        getInnerTpl: function() {
						        	var datafilterformatcellpanel = Ext.getCmp('datafilterformatcellpanel');
						    		var targetMeasureCombo = Ext.ComponentQuery.query('[itemId=targetMeasureCombo]', datafilterformatcellpanel)[0];
						    		var charLength = ((targetMeasureCombo.getWidth()-8)/8);
						    	
						    		var expandHtml = "";
						    		var extraValCss = "";
						    		if(hasExpandableMeasure){
						    			expandHtml = '<tpl if="values.hasChildren == true"> '+
						    							'<div class="x-tool-img x-tool-tool-el"'+
						    								' style="background-position: 0 '+
						    								'<tpl if="values.expanded == true"> -255px '+
						    								'<tpl else> -240px</tpl>;display:inline-block;position:relative;top:3px;">'+
						    							'</tpl></div>';
						    			
						    			extraValCss = ' style="display:inline-block;  padding: 0 0 0 '+
										    			'<tpl if="values.subMeasure == true">28px'+
						    							'<tpl elseif="values.hasChildren == false">18px'+
					    								'<tpl else>3px</tpl>; "';
						    		}
						        	return expandHtml +'<div '+extraValCss+' title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
					            },
					            listeners:{
				 					
		 						}
		 					}
					    }
				    ]
		        
		    	},
		    	{
		    		xtype: 'container',
		    		flex : 0.3,
		    		padding: '0 10 0 0',
		    		layout: {
		    			type: 'vbox',
		    		    align: 'stretch',
		    		},
		    		items:[
			    		{
			    			xtype: 'label',
			    			text: pivotObj.getLocaleString('DataFilter.Config.FormatCell.BackgroundColor')+ "*",
			    			padding: '0 0 5 0',
					    },
					    {
					    	xtype : 'colorcombo',
							itemId : 'bgcolor',
							value : cellBgColor,
					    }
				    ]
		        
		    	},
		    	{
		    		xtype: 'container',
		    		flex : 0.3,
		    		padding: '0 20 0 0',
		    		layout: {
		    			type: 'vbox',
		    		    align: 'stretch',
		    		},
		    		items:[
			    		{
			    			xtype: 'label',
			    			text: pivotObj.getLocaleString('DataFilter.Config.FormatCell.FontColor')+ "*",
			    			padding: '0 0 5 0',
					    },
					    {

							xtype : 'colorcombo',
							itemId : 'fontcolor',
							value : cellFontColor,
					    }
				    ]
		        
		    	},
		    	{
		    		xtype: 'container',
		    		flex : 0.3,
		    		layout: {
		    			type: 'vbox',
		    		    align: 'stretch',
		    		},
		    		defaultType: 'checkboxfield',
		    		items:[
			    		{
		                    boxLabel  : pivotObj.getLocaleString('DataFilter.Config.FormatCell.FormatAncestors'),
		                    itemId    : 'formatAncestors',
		                    checked   : (formatCell && formatCell.formatAncestors),
					    },
					    {
		                    boxLabel  : pivotObj.getLocaleString('DataFilter.Config.FormatCell.FormatDescendants'),
		                    itemId    : 'formatDescendants',
		                    checked   : (formatCell && formatCell.formatDescendants),
					    }
				    ]
		    	},
	    	]
		}
		],
		me.callParent(arguments);
	}
});