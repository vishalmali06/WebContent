//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.common.DeleteConfirmDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.deleteconfirmdialog',
	itemId : 'deleteconfirmdialog',
	title : '',
	modal : true,
	closable:false,
	border: 0,
	layout: {type:'vbox'},
	paddding : 10,
	autoScroll: true, 
	config:{
		scope : null,
		displayMessage : null,
		filterIds : null,
		okCallbackFn : null,
		cancelCallbackFn : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		me.width = Ext.getBody().getViewSize().width*0.3;
		me.maxHeight = Ext.getBody().getViewSize().width*0.8;
		me.items = [ {
			border: 0,
			html : '<span style="font-weight: bold;">'+me.displayMessage+'</span>',
			padding : '20 20 20 20'
		} ],
		
		me.dockedItems= {
			    xtype: 'toolbar',
			    dock: 'bottom',
			    ui: 'footer',
			    items: [
					{
						type   : 'button',
						itemId : 'dialogokbtn',
						ui     : 'j-primary-button',
						text   : pivotObj.getLocaleString('Button.Ok'),
						margin	: '0 0 0 15',
						handler: function() {
			                if (me.okCallbackFn) {
			                	me.okCallbackFn.call(me.scope, me.filterIds);
			                }
			            }
					},
					{
						type   : 'button',
			   			itemId : 'dialogcencelbtn',
			   			ui     : 'j-standard-button',
			   			margin: '0 0 0 8',
			   			text : pivotObj.getLocaleString('Button.Cancel'),
			   			handler: function() {
			                if (me.cancelCallbackFn) {
			                	me.cancelCallbackFn.call(me.scope);
			                }
			            }
					},
				]
			},
		me.callParent(arguments);	
	},
});