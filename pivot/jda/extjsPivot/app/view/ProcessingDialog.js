//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.ProcessingDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.processingdialog',
	itemId : 'processingdialog',
	id : 'processingdialog',
	modal : true,
	closable : false,
	resizable : false,
	draggable : false,
	layout : 'fit',
	border : false,
	padding : '20 10 10 20 ',
	cls : 'waitIndicator',
	config : {
		imageLoc : null,
		displayMsg : null,
		cancelBtnText : null,
	},
	initComponent : function() {
		var me = this;
		me.width = 400, me.height = 120, 
		me.items = [ {
			xtype : 'form',
			itemId : 'processingdialogform',
			border : false,
			items : [ {
				xtype : 'image',
				src : me.getImageLoc(),
				mode : 'image',
			}, {
				xtype : 'label',
				text : me.getDisplayMsg(),
				cls : 'ui-dialog-content',
				padding : '0 0 0 20 ',
			} ]
		} ]

		me.on({
			afterrender : function(me) {
				me.down('#processingdialogcencelbtn').setText(
						me.getCancelBtnText());
			}
		});
		me.callParent(arguments);
	},

	buttons : [ {
		xtype : 'tbspacer',
		flex : 0.25
	}, {
		type : 'button',
		text : 'Cancel',
		itemId : 'processingdialogcencelbtn',
		ui : 'j-standard-button',
		cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
	}, {
		xtype : 'tbspacer',
		flex : 0.25
	}, ]

});