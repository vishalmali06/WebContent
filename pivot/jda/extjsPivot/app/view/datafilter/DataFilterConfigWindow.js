//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFilterConfigWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.datafilterconfigwindow',
	itemId : 'datafilterconfigwindow',
	requires: ['JdaPivotApp.view.datafilter.DataFilterInfoPanel', 'JdaPivotApp.view.datafilter.DataFilterExpressionPanel', 'JdaPivotApp.view.datafilter.DataFilterDomainsPanel',
		'JdaPivotApp.view.datafilter.DataFilterFormatCellPanel'],
	modal: true,
	layout: 'fit',
	border:false,
	overflowY: 'auto',
	config : {
		pivotController:null,
		pivotObj:null,
		filterConfig : null,
		cellContextInfo : null,
		userAccessPermissions : null,
		viewFilterPermissions : null
	},
	cls: 'j-pvt-datafilter-config-window',
	initComponent : function() {
		var me = this;
		me.pivotController = JdaPivotApp.getApplication().getPivotController();
		me.pivotObj = me.pivotController.getPivotWrapper().getPivot();
		var cube = me.pivotObj._getCubeDefinition();
    	var expressionOperators = cube.expressionOperators;
    	
    	var i18n = {
    			ExpressionBuilder : {
    				Measures : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.Measures'),
    				Search : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.Search'),
    				Expression : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.Expression'),
    				ShowFilterdMeasure : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.ShowFilterdMeasure'),
    				Title : {
        				Name : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.Title.Name'),
        				DisplayName : me.pivotObj.getLocaleString('DataFilter.Config.ExpressionBuilder.Title.DisplayName'),
        			}
    			},
    			Button : {
    				Validate : me.pivotObj.getLocaleString('DataFilter.Button.Validate'),
    				Reset : me.pivotObj.getLocaleString('DataFilter.Button.Reset'),
    			}
    	}
		me.width = Ext.getBody().getViewSize().width*0.6;
		me.height = Ext.getBody().getViewSize().height*0.95;
		var builddatafilterpanel = Ext.create('Ext.container.Container', {
			padding:'10 25 20 20',
			itemId : 'builddatafilterpanel',
		    items: [
		    		{
			            xtype: 'datafilterinfopanel',
			            border : false,
			            filterConfig : me.getFilterConfig(),
			            canCreate : me.getUserAccessPermissions() && me.getUserAccessPermissions().canCreate,
			            canCreateViewFilter : me.getViewFilterPermissions() && me.getViewFilterPermissions().canCreate
			        },{
			            xtype: 'datafilterexpressionpanel',
			            border : false,
			            expressionOperators : expressionOperators,
			            i18n : i18n,
			            expression : (me.getFilterConfig() == null) ? "" : me.getFilterConfig().expression,
			            measureEnclosingChars : cube.measureEnclosingChars,
			        },{
			            xtype: 'datafilterdomainspanel',
			            border : false,
			            levelInfos : (me.getFilterConfig() == null) ? me.getCellContextInfo() : me.getFilterConfig().levelInfos,
			        },
			        {
			            xtype: 'datafilterformatcellpanel',
			            border : false,
			            filterConfig : me.getFilterConfig(),
			        },
                   ],
       		    listeners: {
       		    	afterrender : me.populateStoreObjects,
       		    	afterlayout: function () {
       		    		var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
       		    		dataFilterController.getBuildDataFilterPanel();
    	  				var builddatafilterpanelHeight = (dataFilterController.getBuildDataFilterPanel().getHeight());
    	  				builddatafilterpanelHeight -= (dataFilterController.getDataFilterInfoPanel().getHeight() + dataFilterController.getDataFilterDomainsPanel().getHeight() + 250); 
    	  				this.down('#expressionMeasuresGrid').setHeight(builddatafilterpanelHeight);
    	  		    }
       		    }
		});
		
		me.items = builddatafilterpanel;
		
		me.on({
			afterrender : function(me) {
				var datafiltersavebtn = me.down('#datafiltersavebtn');
				datafiltersavebtn.setText(me.pivotObj.getLocaleString('DataFilter.Button.Save'));
				
				me.down('#datafiltercancelbtn').setText(me.pivotObj.getLocaleString('DataFilter.Button.Cancel'));
				
				var datafiltersaveasbtn = me.down('#datafiltersaveasbtn');
				datafiltersaveasbtn.setText(me.pivotObj.getLocaleString('DataFilter.Button.SaveAs'));
				datafiltersaveasbtn.setVisible((me.getFilterConfig() != null));
				
				var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
				var datafilterformatcellpanel = dataFilterController.getDataFilterFormatCellPanel();
				
				if(me.getFilterConfig() != null){
					if(me.getFilterConfig().type  == _pns.Constants.dataFilterTypes.Public){
						if(!me.getUserAccessPermissions() || !me.getUserAccessPermissions().canCreate){
							datafiltersaveasbtn.disable();
						}
						
						if(!me.getUserAccessPermissions() || !me.getUserAccessPermissions().canUpdate){
							datafiltersavebtn.disable();
						}
					}else if(me.getFilterConfig().type  == _pns.Constants.dataFilterTypes.ViewFilter){
						datafilterformatcellpanel.down('#formatCell').checked = false;
						datafilterformatcellpanel.hide();
						
			    		var typeCombo = dataFilterController.getDataFilterInfoPanel().down('[itemId=typeCombo]');
						
						if(!me.getViewFilterPermissions() || !me.getViewFilterPermissions().canCreate){
							datafiltersaveasbtn.disable();
							typeCombo.disable();
						}						
						if(!me.getViewFilterPermissions() || !me.getViewFilterPermissions().canUpdate){
							datafiltersavebtn.disable();
							typeCombo.disable();
						}
					}
				}else{
					var typeCombo = dataFilterController.getDataFilterInfoPanel().down('[itemId=typeCombo]');
					if(typeCombo && typeCombo.value === _pns.Constants.dataFilterTypes.ViewFilter){
						datafilterformatcellpanel.hide();
					}
				}
			}
		});
		me.callParent(arguments);
	},
	
	dockedItems: [{
	    xtype: 'toolbar',
	    dock: 'bottom',
	    ui: 'footer',
	    items: [
		{
			type   : 'button',
			itemId : 'datafiltersavebtn',
			ui     : 'j-primary-button',
			margin: '0 0 0 15',
		},
		{
			type   : 'button',
   			itemId : 'datafiltersaveasbtn',
   			ui     : 'j-standard-button',
   			hidden: true,
   			margin: '0 0 0 8',
		},
		{
			type : 'button',
			itemId : 'datafiltercancelbtn',
			ui : 'j-standard-button',
			margin: '0 0 0 8',
		},
		]
	}],	
	populateStoreObjects:function(){
		var pivotController = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = pivotController.getPivotWrapper().getPivot();
		var cube = pivotObj._getCubeDefinition();
		
		// loading data filter measures data
		var dataFilterMeasuresStore = Ext.StoreMgr.lookup('dataFilterMeasuresStore');
		var dataFilterTargetMeasuresStore =  Ext.create('JdaPivotApp.store.datafilter.DataFilterTargetMeasures');
		
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
		dataFilterMeasuresStore.removeAll();
		dataFilterMeasuresStore.clearFilter();
		dataFilterMeasuresStore.loadData(measures, false);
		
		dataFilterTargetMeasuresStore.removeAll();
		dataFilterTargetMeasuresStore.clearFilter();
		dataFilterTargetMeasuresStore.loadData(measures, false);
		
		var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
		var datafilterformatcellpanel = dataFilterController.getDataFilterFormatCellPanel()
		
		var filterConfig = datafilterformatcellpanel.getFilterConfig();
		if(filterConfig && filterConfig.formatCell){
			var targetMeasureComboObj = datafilterformatcellpanel.down('#targetMeasureCombo');
			targetMeasureComboObj.setValue(filterConfig.formatCell.targetMeasureId);
		}
	}
});