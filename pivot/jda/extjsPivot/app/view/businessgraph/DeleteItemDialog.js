//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.DeleteItemDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.deleteitemdialog',
	itemId : 'deleteitemdialog',
	title : '',
	modal : true,
	closable:false,
	border: 0,
	layout: {type:'vbox'},
	paddding : 10,
	minWidth: 360,
	minHeight: 145,
	initComponent : function() {
		var me = this;
		var pivotController =JdaPivotApp.getApplication().getPivotController();
		var pivotObj =  pivotController.getPivotWrapper().getPivot();
		me.items = [ {
			xtype : 'label',
			text : pivotObj.getLocaleString('BusinessGraph.GraphConfig.DeleteItemConfirmMsg'),
			width: 400,
			style : 'color:#505050;padding:20px;font-size:12px;'
		} ],
		
		me.on({
			afterrender : function(me) {
				me.down('#deleteitemdialogokbtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Delete'));
				me.down('#deleteitemdialogcencelbtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Cancel'));
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
			itemId : 'deleteitemdialogokbtn',
			ui : 'j-primary-button',
			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons'
		}, {
			type : 'button',
			text : 'Cancel',
			itemId : 'deleteitemdialogcencelbtn',
			ui : 'j-standard-button',
   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
		}, {
			xtype : 'tbspacer',
			flex : 0.25
		} 
	]
	
});