//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.measurefilter.MeasureFilterConfigWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.measurefilterconfigwindow',
	itemId : 'measurefilterconfigwindow',
	requires: ['JdaPivotApp.view.measurefilter.MeasureFilterInfoPanel','JdaPivotApp.view.measurefilter.SplitMeasurePanel','JdaPivotApp.view.measurefilter.SubMeasuresCriteriaPanel'],
	modal: true,
	border:false,
	overflowY: 'auto',
	layout: 'fit',
	config : {
		pivotObj : null,
		filterConfig : null,
		userAccessPermissions : null,
	},
	cls: 'j-pvt-measurefilter-config-window',
	initComponent : function() {
		var me = this;
		me.pivotObj= JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		me.width = Ext.getBody().getViewSize().width*0.6;
		me.height = Ext.getBody().getViewSize().height*0.8;
			
		var buildmeasurefilterpanel = Ext.create('Ext.container.Container', {
			padding:'10 25 20 20',
			itemId : 'buildmeasurefilterpanel',
			items: [
		    	 {
				    	xtype: 'measurefilterinfopanel',
				    	filterConfig : me.getFilterConfig(),
				    	canCreate : me.getUserAccessPermissions() && me.getUserAccessPermissions().canCreate,
				    	border : false,
				    },
				    {
				    	xtype: 'splitmeasurepanel',
				    	filterConfig : me.getFilterConfig(),
				    	border : false,
				    },
		    	],
	    	 listeners: {
	    		 afterlayout: function () {
	    			 var measureFilterController = JdaPivotApp.getApplication().getMeasureFilterController();
	    			 var buildmeasurefilterpanelHeight = measureFilterController.getBuildMeasureFilterPanel().getHeight();
	    			 buildmeasurefilterpanelHeight -= 60 + (measureFilterController.getMeasureFilterInfoPanel().getHeight() + measureFilterController.getSplitMeasurePanel().down("#splitMeasureCombo").getHeight() + measureFilterController.getSplitMeasurePanel().down("#measureSelection").getHeight()); 
	    			 measureFilterController.getPivotItemSelector().setHeight(buildmeasurefilterpanelHeight);
	    			 measureFilterController.getSubMeasuresCriteriaPanel().down("#availbleSubMeasuresGrid").setHeight(buildmeasurefilterpanelHeight-65);
	    		 }
	    	 }
		});
		me.items = buildmeasurefilterpanel;
		
		var disableSaveBtn = false;
		var disableSaveAsBtn = false;
		if(me.getFilterConfig() != null ){
			if(me.getFilterConfig().type  == _pns.Constants.measureFilterTypes.Public) {
				if((!me.getUserAccessPermissions() || !me.getUserAccessPermissions().canUpdate)){
					 disableSaveBtn = true;
				}
				if((!me.getUserAccessPermissions() || !me.getUserAccessPermissions().canCreate)){
					disableSaveAsBtn = true;
				}
			}
		}else if(!me.getUserAccessPermissions().canCreate){
			disableSaveBtn = true;
		}
		
		me.dockedItems= {
			    xtype: 'toolbar',
			    dock: 'bottom',
			    ui: 'footer',
			    items: [
				{
					type   : 'button',
					itemId : 'measurefiltersavebtn',
					ui     : 'j-primary-button',
					text   : me.pivotObj.getLocaleString('Button.Save'),
					disabled : disableSaveBtn,
					margin: '0 0 0 15',
				},
				{
					type   : 'button',
		   			itemId : 'measurefiltersaveasbtn',
		   			ui     : 'j-standard-button',
		   			hidden: (me.getFilterConfig() == null),
		   			margin: '0 0 0 8',
		   			text : me.pivotObj.getLocaleString('Button.SaveAs'),
		   			disabled : disableSaveAsBtn,
				},
				{
					type : 'button',
					itemId : 'measurefiltercancelbtn',
					ui : 'j-standard-button',
					margin: '0 0 0 8',
					text : me.pivotObj.getLocaleString('Button.Cancel'),
				},
				]
			},
		me.callParent(arguments);
	},
});