//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.common.SaveAsNameDialog', {
	extend : 'Ext.window.Window',
	alias : 'widget.saveasnamedialog',
	itemId : 'saveasnamedialog',
	title : '',
	modal : true,
	closable:false,
	border: 0,
	config : {
		previousName : '',
		scope : null,
		saveAs : null,
		nameFieldLabel : null,
		saveCallbackFn : null,
		cancelCallbackFn : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		me.width = Ext.getBody().getViewSize().width*0.3;
		me.items = [{
			xtype : 'form',
			itemId : 'saveasnamedialogform',
			border: 0,
			padding :'10 10 10 20',
			layout: {
				type: 'vbox',
				align: 'stretch',
            },
			items : [{ 
						 xtype: 'textfield',
					     itemId: 'name',
					     fieldLabel: me.getNameFieldLabel() + "*",
					     value:me.getPreviousName(),
					     labelAlign: 'top',
                         labelSeparator: '',
                         padding :'0 5 0 0',
                         listeners: {
                        	 afterrender: function(field) {
                        		 field.focus();
                        		 this.selectText();
                        	 }
                         }
					}
				]				
			}];
		me.dockedItems= {
			    xtype: 'toolbar',
			    dock: 'bottom',
			    ui: 'footer',
			    items: [
				    	{
							type   : 'button',
							itemId : 'dialogokbtn',
							ui     : 'j-primary-button',
							text   : pivotObj.getLocaleString('Button.Save'),
							margin	: '0 0 0 15',
							handler: function() {
				                if (me.saveCallbackFn) {
				                	me.saveCallbackFn.call(me.scope,me.saveAs);
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