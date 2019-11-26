//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.CopyDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.copydialog',
	itemId : 'copydialog',
	title : '',
	requires : ['Ext.form.Label'],
	modal : true,
	config : {
		clipBoardText : null,
		dialogText : null,
		dialogImgLoc : null,
		processingRequest : false
	},
	//padding : '0 30 0 30',
	cls:'j-pvt-rule-dialog',
	bodyCls:'j-pvt-rule-dialog-body',
	border: 0,
	layout: 'fit',
	bodyBorder: false,
	closable:false,
	initComponent : function() {
		var me = this;
		//Getting pivot controller to do all operation.
		var pivotController =JdaPivotApp.getApplication().getPivotController();
		//Setting pop window width and height
		me.width = pivotController.getPivotViewPort().getWidth()*0.3;
		//me.height = pivotController.getPivotViewPort().getHeight()*0.3;
		var pivotObj =  pivotController.getPivotWrapper().getPivot();
		me.items = [{
			xtype : 'form',
			itemId : 'copydialogform',
			layout : {type:'hbox',align:'stretch'},
			flex : 1,
			validationSuccess:false,
			items : [{ 
						 xtype: 'label',
					     forId: 'clipBoardText',
					     text: me.getClipBoardText(),
					     hidden : true
					},
					{ 
						 xtype: 'label',
					     forId: 'processingRequest',
					     text: me.getProcessingRequest(),
					     hidden : true
					},
					{
						xtype : 'image',
						forId: 'imageId',
						src : me.getDialogImgLoc(),
						padding : '20 0 0 20'
					},
					{
						xtype: 'label',
						forId: 'dialogText',
						text: me.getDialogText(),
						padding : '20 20 20 40',
						style: 'font-weight:bold'
					}
				]				
			}];
		
		me.on({
			afterrender : function(me) {
				me.down('#copydialogcopybtn').setText(pivotObj.getLocaleString('Button.Ok'));
				me.down('#copydialogcancelbtn').setText(pivotObj.getLocaleString('Cancel'));
				if(me.getProcessingRequest()){
					me.down('#copydialogcopybtn').setVisible(false);
					me.down('#copydialogcancelbtn').setVisible(true);
				}else{
					me.down('#copydialogcopybtn').setVisible(true);
					me.down('#copydialogcancelbtn').setVisible(false);
				}
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
			text : 'Ok',
			itemId : 'copydialogcopybtn',
			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons'
		}, {
			type : 'button',
			text : 'Cancel',
			itemId : 'copydialogcancelbtn',
			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
		}, {
			xtype : 'tbspacer',
			flex : 0.25
		} 
	]
	
});