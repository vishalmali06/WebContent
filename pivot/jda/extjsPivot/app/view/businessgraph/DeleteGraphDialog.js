//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.DeleteGraphDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.deletegraphdialog',
	itemId : 'deletegraphdialog',
	title : '',
	modal : true,
	closable:false,
	border: 0,
	layout: {type:'vbox'},
	paddding : 10,
	minWidth: 200,
	initComponent : function() {
		var me = this;
		var pivotController =JdaPivotApp.getApplication().getPivotController();
		var pivotObj =  pivotController.getPivotWrapper().getPivot();
		me.items = [ {
			xtype : 'label',
			text : pivotObj.getLocaleString('BusinessGraph.GraphConfig.DeleteConfirmMsg'),
			style : 'color : #5E5E5E;font-weight:bold;padding:20px;'
		} ],
		
		me.on({
			afterrender : function(me) {
				me.down('#deletegraphdialogokbtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Ok'));
				me.down('#deletegraphdialogcencelbtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Cancel'));
			}
		});
		me.callParent(arguments);	
	},
	
	buttons : [
	    {
			xtype : 'tbspacer',
			flex : 0.25
		}, {
			type : 'button',
			text : 'Delete',
			itemId : 'deletegraphdialogokbtn',
			ui : 'j-primary-button',
			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons'
		}, {
			type : 'button',
			text : 'Cancel',
			itemId : 'deletegraphdialogcencelbtn',
			ui : 'j-standard-button',
   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
		}, {
			xtype : 'tbspacer',
			flex : 0.25
		} 
	]
	
});