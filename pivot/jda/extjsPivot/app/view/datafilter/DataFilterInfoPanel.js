//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFilterInfoPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.datafilterinfopanel',
	itemId : 'datafilterinfopanel',
	config : {
		filterConfig : null,
		canCreate : null,
		canCreateViewFilter : null
	},
	initComponent : function() {
		var me = this;
		var pivotController = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = pivotController.getPivotWrapper().getPivot();
		
		var imgPath;
		if(pivotObj && pivotObj.getDataFilterConfig() && pivotObj.getDataFilterConfig().options && pivotObj.getDataFilterConfig().options.imgPath){
			imgPath = pivotObj.getDataFilterConfig().options.imgPath;
		}
		
		var filterId = null;
		var filterName = '';
		var filterConfig = me.getFilterConfig();
		if(filterConfig){
			filterId = filterConfig.id;
			filterName = filterConfig.name;
		}
		
		// loading data filter type date
		var dataFilterTypesStore = Ext.StoreMgr.lookup('dataFilterTypesStore');
		dataFilterTypesStore.removeAll();
		var filterTypes = [];
		var dataFilterTypes = _pns.Constants.dataFilterTypes;
		for (var key in dataFilterTypes) {
			var displayValue = pivotObj.getLocaleString('DataFilter.Config.Type.' + key);
			filterTypes.push({
				id : dataFilterTypes[key],
				name : displayValue
			});
		}
		dataFilterTypesStore.loadData(filterTypes, false);
		//For ease of understanding placing in if-else blocks rather ? and : usage.
		var typeComboValue = _pns.Constants.dataFilterTypes.Private;
		if(me.getFilterConfig() != null){
			typeComboValue = me.getFilterConfig().type;
		}
		
		var isTypeComboDisabled = !(me.getCanCreate() || me.getCanCreateViewFilter());
		
		//Loading durations. i.e. History, Forecast and Forecast & History
		var dataFilterDurationsStore = Ext.StoreMgr.lookup('dataFilterDurationsStore');
		dataFilterDurationsStore.removeAll();
		var durations = [];
		var dataFilterDurations = _pns.Constants.dataFilterDurations;
		for (var key in dataFilterDurations) {
			var displayValue = pivotObj.getLocaleString('DataFilter.Config.ApplyTo.' + key);
			durations.push({
				id : dataFilterDurations[key],
				name : displayValue
			});
		}
		dataFilterDurationsStore.loadData(durations, false);
		
		var durationComboValue = (me.getFilterConfig() == null) ? _pns.Constants.dataFilterDurations.BOTH : me.getFilterConfig().duration;
		
		var qtipTextSeparator = ": ";
		var qtipText = pivotObj.getLocaleString('DataFilter.Config.Type.Public') + qtipTextSeparator +pivotObj.getLocaleString('DataFilter.Config.Type.Public.Desc')+"</br>";
			qtipText+= pivotObj.getLocaleString('DataFilter.Config.Type.Private')+ qtipTextSeparator +pivotObj.getLocaleString('DataFilter.Config.Type.Private.Desc')+"</br>";
			qtipText+= pivotObj.getLocaleString('DataFilter.Config.Type.ViewFilter')+ qtipTextSeparator +pivotObj.getLocaleString('DataFilter.Config.Type.ViewFilter.Desc');
		
		var typeLabel = pivotObj.getLocaleString('DataFilter.Config.Type')+ "*";
		typeLabel+= '&nbsp;&nbsp;<img style:"margin:-5px 0px 0px 0px;" src='+imgPath+'information_normal_14.png data-qtip="'+qtipText+'">';
				
		me.items=  [
		{
            xtype: 'panel',
            border : false,
            layout: {
            	type: 'hbox',
            	align: 'stretch',
            },
	    	items:[
		    	{
		    		xtype: 'container',
		    		flex : 0.4,
		    		padding: '0 10 0 0',
		    		layout: {
		    			type: 'vbox',
		    		    align: 'stretch',
		    		},
		    		items:[
			    		{
			    			xtype: 'label',
			    			text: pivotObj.getLocaleString('DataFilter.Config.Name') + "*",
			    			padding: '10 0 5 0',
					    },
					    {
					    	xtype: 'textfield',
						    itemId: 'name',
				  	        id: filterId,
				  	        value : filterName
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
			    			text: pivotObj.getLocaleString('DataFilter.Config.ApplyTo') + "*",
			    			padding: '10 0 5 0',
					    },
					    {
					    	xtype: 'combo',
						    store : 'dataFilterDurationsStore',
	 						displayField: 'name',
	 						valueField: 'id',
	 						itemId: 'durationCombo',
	 						value : durationComboValue,
	 						autoSelect: false,
	 						editable : false,
	 					    growToLongestValue: true,
	 		                grow: true,
	 					    queryMode: 'local',
		 					listConfig: {
						        getInnerTpl: function() {
						        	var datafilterinfopanel = Ext.getCmp('datafilterinfopanel');
						    		var durationCombo = Ext.ComponentQuery.query('[itemId=durationCombo]', datafilterinfopanel)[0];
						    		var charLength = ((durationCombo.getWidth()-8)/8);
						        	return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
					            }
		 					},
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
		    		items:[
			    		{
			    			xtype: 'label',
			    			html: typeLabel,
			    			padding: '5 0 5 0',
					    }, 
					    {
					    	xtype: 'combo',
						    store : 'dataFilterTypesStore',
	 						displayField: 'name',
	 						valueField: 'id',
	 						itemId: 'typeCombo',
	 						value : typeComboValue,
	 						autoSelect: false,
	 						editable : false,
	 					    growToLongestValue: true,
	 		                grow: true,
	 					    queryMode: 'local',
	 					    disabled: isTypeComboDisabled,
		 					listConfig: {
						        getInnerTpl: function() {
						        	var datafilterinfopanel = Ext.getCmp('datafilterinfopanel');
						    		var typeCombo = Ext.ComponentQuery.query('[itemId=typeCombo]', datafilterinfopanel)[0];
						    		var charLength = ((typeCombo.getWidth()-8)/8);
						        	return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
					            }
		 					},
		 					listeners: {
		 						 change: function() {
		 							var datafilterinfopanel = Ext.getCmp('datafilterinfopanel');
						    		var typeCombo = Ext.ComponentQuery.query('[itemId=typeCombo]', datafilterinfopanel)[0];
						    		me.enableOrDisableSaveButton(typeCombo.value);
						    		me.enableOrDisableFormatcellpanel(typeCombo.value);
		 						 }
		 					},
					    }
				    ]
		        
		    	},
	    	]
		},
        {
			xtype: 'container',
			padding: '10 0 0 0',
            layout: {
            	type: 'vbox',
            	align: 'stretch',
            },
	    	items:[
		    	{
		    		xtype: 'label',
	    			text: pivotObj.getLocaleString('DataFilter.Config.Description'),
	    			padding: '0 0 5 0',
		    	},
 				{
		    		xtype: 'textarea',
		    		itemId: 'description',
		    		grow      : true,
		    		growMin      : 20,
		    		growMax      : 100,
		    		value : (me.getFilterConfig() == null) ? "" : me.getFilterConfig().description
 				}
			]
        }
		]
		
		me.callParent(arguments);
	},
	enableOrDisableSaveButton : function(filterType){
		 if((filterType == _pns.Constants.dataFilterTypes.ViewFilter && !this.canCreateViewFilter) ||
			(filterType == _pns.Constants.dataFilterTypes.Public && !this.canCreate)){
			 this.up("#datafilterconfigwindow").down("#datafiltersavebtn").disable();
			 this.up("#datafilterconfigwindow").down("#datafiltersaveasbtn").disable();
			 
		 }else{
			 this.up("#datafilterconfigwindow").down("#datafiltersavebtn").enable();
			 this.up("#datafilterconfigwindow").down("#datafiltersaveasbtn").enable();
		 }
   },
   enableOrDisableFormatcellpanel : function(filterType){
	   var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
	   var datafilterformatcellpanel = dataFilterController.getDataFilterFormatCellPanel();
	   if(filterType == _pns.Constants.dataFilterTypes.ViewFilter){
		   datafilterformatcellpanel.hide();
	   }else{
		   datafilterformatcellpanel.show();
	   }
   }
   
   
});