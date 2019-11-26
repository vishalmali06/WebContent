//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.ChartTitleDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.charttitledialog',
	itemId : 'charttitledialog',
	title : '',
	modal : true,
	config : {
		previousGraphName : ''
	},
	closable:false,
	border: 0,
    minWidth: 200,
	initComponent : function() {
		var me = this;
		//Getting pivot controller to do all operation.
		var pivotController =JdaPivotApp.getApplication().getPivotController();
		var pivotObj =  pivotController.getPivotWrapper().getPivot();
		//Setting pop window width and height
		me.width = pivotController.getBusinessGraphConfigWindow().getWidth()*0.3;
		//me.height = pivotController.getBusinessGraphConfigWindow().getHeight()*0.3;
		me.items = [{
			xtype : 'form',
			itemId : 'charttitledialogform',
			border: 0,
			padding :'10 10 10 10',
			layout: {
				type: 'vbox',
				align: 'stretch',
            },
			items : [{ 
						 xtype: 'textfield',
					     name: 'graphName',
					     itemId: 'graphName',
					     fieldLabel: pivotObj.getLocaleString('BusinessGraph.Build.GraphName'),
					     value:me.getPreviousGraphName(),
					     labelAlign: 'top',
                         labelSeparator: '',
                         padding :'0 5 0 0',
                         fieldStyle: 'background-image: none;',
                         listeners: {
                             afterrender: function(field) {
                               field.focus();
                               this.selectText();
                             }
                           }
					}
				]				
			}];
		
		me.on({
			afterrender : function(me) {
				me.down('#charttitledialogsavebtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Save'));
				me.down('#charttitledialogcancelbtn').setText(pivotObj.getLocaleString('BusinessGraph.Button.Cancel'));
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
			text : 'Save',
			itemId : 'charttitledialogsavebtn',
			ui : 'j-primary-button',
			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons'
		}, {
			type : 'button',
			text : 'Cancel',
			itemId : 'charttitledialogcancelbtn',
			ui : 'j-standard-button',
   			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
		}, {
			xtype : 'tbspacer',
			flex : 0.25
		} 
	]
	
});