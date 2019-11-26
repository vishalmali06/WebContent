//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.RuleWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.rulewindow',
	itemId : 'rulewindow',
	title : '',
	requires : ['JdaPivotApp.view.ColorCombo','Ext.form.Panel','Ext.form.Label','Ext.form.field.ComboBox',
	            'Ext.form.FieldContainer','Ext.layout.container.Table','Ext.picker.Color'],
	modal : true,
	config : {
		ruleId :'',
		ruleTitle : '',
		measure : '',
		measures : null,
		expression : '',
		color : '',
		colors : null,
		fontColor:'',
		fontColors: null,
		ruleDisabled:false
	},
	padding : '0 30 0 30',
	cls:'j-pvt-rule-dialog',
	bodyCls:'j-pvt-rule-dialog-body',
	layout: 'fit',
	bodyBorder: false,
	border: false,
	initComponent : function() {
		var me = this;
		var store = Ext.StoreMgr.lookup('measuresstore');
		store.removeAll();
		var measures = me.getMeasures();
		var pivotController =JdaPivotApp.getApplication().getPivotController();
		var pivotObj =  pivotController.getPivotWrapper().getPivot();
	    me.width = pivotController.getPivotViewPort().getWidth()*0.5;
		if(measures){
			var excludeMeasureTypes = ['boolean', 'image'];
			for(var i=0;i<measures.length;i++){
				var measure = measures[i];
				if(measure && excludeMeasureTypes.indexOf(measure.typeName) < 0 && !(measure.uIAttributes && measure.uIAttributes.isDataDomain)){
					store.add(Ext.create('JdaPivotApp.model.Pair',{
						id : measure.id,
						name : measure.label
					}));
				}
			}
		}
		
		var colorComboItem ={
			xtype : 'colorcombo',
			itemId : 'bgcolor',
			fieldLabel : pivotObj.getLocaleString('CF.backGroundColor'),
			anchor : '40%',
			name : 'color',
			value : me.getColor(),
			fieldStyle: 'background-image: none;',
			disabled:me.getRuleDisabled(),
			padding: '5 0 0 0',
		};
		if(me.getColors() && me.getColors().length>0)
			colorComboItem.colors = me.getColors();
		
		var fontColorComboItem ={
				xtype : 'colorcombo',
				itemId : 'fontcolor',
				fieldLabel : pivotObj.getLocaleString('CF.fontColor'),
				anchor : '40%',
				name : 'fontcolor',
				value : me.getFontColor(),
				fieldStyle: 'background-image: none;',
				disabled:me.getRuleDisabled()
			};
			if(me.getColors() && me.getColors().length>0)
				fontColorComboItem.colors = me.getColors();
					
		me.items = [{
			xtype : 'form',
			itemId : 'ruleform',
			layout : {type:'vbox',align:'stretch'},
			flex : 1,
			border: false,
			bodyCssClass: 'x-border-layout-ct',  // solution for border removal
			validationSuccess:false,
			items : [{
				xtype : 'label',
				itemId : 'errorlabel',
				style : 'color : #580000; font-weight:bold;padding-bottom:10px;',
				hidden : true
			},{
				xtype : 'textfield',
				fieldLabel : pivotObj.getLocaleString('CF.RuleTitle'),
				padding : '10 0 0 0',
				name : 'title',
				msgTarget  : 'qtip',	
				value : me.getRuleTitle(),
				fieldStyle: 'background-image: none;',
				disabled:me.getRuleDisabled()
			},{
				xtype : 'combo',
				disabled:me.getRuleDisabled(),
				autoSelect: false,
				editable:false,
				triggerAction: 'all',
				//store : "Measures",
				store : Ext.StoreMgr.lookup('measuresstore'),
				fieldLabel : pivotObj.getLocaleString('CF.TargetMeasures'),
				displayField: 'name',
			    valueField: 'id',
			    growToLongestValue: true,
                grow: true,
                autoFitErrors: false,
			    queryMode: 'local',
			    name : 'measure',
			    fieldStyle: 'background-image: none;',
			    msgTarget  : 'qtip'
			},
			
			{
				xtype : 'container',
				flex: 1,
				layout : {
					type : 'hbox',
					align: 'stretch'
				},
				items : [{
					xtype : 'textarea',
					name : 'expression',
					fieldLabel : pivotObj.getLocaleString('CF.DefineRuleExpression'),
					flex : 1,
					grow: false,
					itemId : 'expressionarea', 
					value : me.getExpression(),
					msgTarget  : 'qtip',
					fieldStyle: 'background-image: none;',
				    disabled:me.getRuleDisabled()
				},{
					xtype:'container',
					items:{
						xtype : 'button',
						disabled:me.getRuleDisabled(),
						iconCls:'j-cf-validate-rule',
						tooltip : pivotObj
						.getLocaleString('CF.Validation.ValidateRule'),
						overCls : '',
						focusCls : '',
						margin: '0 0 0 10',
						style: {color:'gray'},
						alt : 'Not',
						itemId  :'validateBtn',
						listeners: {
							el: {
						    	click: function() {
						    		JdaPivotApp.getApplication().getPivotController().fireEvent('validaterule');
						    	}
							}
						}
					}
				}]
			},colorComboItem,fontColorComboItem]
		}];
		me.on({
			afterrender : function(me) {
				me.down('combo').setValue(me.getMeasure());
				me.down('#bgcolor').setValue(me.getColor());
				me.down('#fontcolor').setValue(me.getFontColor());
				var topPadding = me.down('textarea').getHeight()*0.5;
				//me.doComponentLayout();
				me.updateLayout();
				me
					.down('#dialogsavebtn')
					.setText(pivotObj.getLocaleString('CF.Apply')).setDisabled(me.getRuleDisabled());
				me
					.down('#dialogcancelbtn')
					.setText(pivotObj.getLocaleString('CF.Cancel')).setDisabled(me.getRuleDisabled());
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
			text : 'Apply',
			itemId : 'dialogsavebtn',
			ui : 'j-primary-button',
			cls : 'j-pvt-styling j-pvt-primary-button j-pvt-toolbar-buttons',
		}, {
			type : 'button',
			text : 'Cancel',
			itemId : 'dialogcancelbtn',
			ui : 'j-standard-button',
			cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons',
		}, {
			xtype : 'tbspacer',
			flex : 0.25
		} 
	]
	
});