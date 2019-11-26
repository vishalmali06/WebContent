//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFilterExpressionPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.datafilterexpressionpanel',
	itemId : 'datafilterexpressionpanel',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    
    /**
     * Number of operator columns in the submenu.
     */
    OPERATOR_SUBMENU_COLUMN_COUNT: 3,

    /**
     * Width of operator button in the visible lineup.
     */
    OPERATOR_BUTTON_WIDTH: 36,

    /**
     * Width of operator button in the submenu.
     */
    OPERATOR_BUTTON_SUBMENU_WIDTH: 60,
    
    /**
     * List of operators. This is the default list.
     */
    config: {
        expressionOperators: null,
        i18n : null,
        expression : null,
        measureEnclosingChars : null
    },

    /**
     * Initialization.
     */
    initComponent: function () {
    	var me = this;
    	me.items=  [
    		{
			 	xtype: 'label',
			 	text: me.i18n.ExpressionBuilder.Name,
			 	padding: '10 0 0 0',
		 	},
		 	{
	    		xtype: 'container',
	    		layout: {
	    			type: 'hbox',
	    		    align: 'stretch',
	    		},
	    		items:[

	    		 	{
	    			 	xtype: 'label',
	    			 	text: me.i18n.ExpressionBuilder.Measures,
	    			 	margin: '5 0 0 0',
	    			 	flex: 0.3,
	    		 	},
	    		 	 {
	    	            xtype: 'panel',
	    	            border: false,
	    	            flex: 0.2,
	    	        },
	    	        {
	    	            xtype: 'checkbox',
	    	            border: false,
	    	            boxLabel  : me.i18n.ExpressionBuilder.ShowFilterdMeasure,
	    	            labelSeparator:'',
	    	            itemId: 'showFilterdMeasureCheck',
	    	            value : true,
	    	            flex: 0.2
	    	        },
	    		 	{
	    	            xtype: 'trigger',
	    	            triggerCls: 'x-form-search-trigger',
	    	            itemId: 'expBuilderMeasureSearch',
	    	            enforceMaxLength: true,
	    	            enableKeyEvents: true,
	    	            flex: 0.3,
	    	            border: 0,
	    	            emptyText: me.i18n.ExpressionBuilder.Search,
	    	            listeners: {
    	                	keyup: function() {
    	                		var expBuilderMeasureSearch = Ext.ComponentQuery.query('[itemId=expBuilderMeasureSearch]', me)[0];
	                    		var searchValue = expBuilderMeasureSearch.getValue().toLowerCase();
	                    		var expressionMeasuresGrid = Ext.ComponentQuery.query('[itemId=expressionMeasuresGrid]', me)[0];
	                    		expressionMeasuresGrid.getStore().clearFilter();
	                    		expressionMeasuresGrid.getStore().filter([{
                    	            filterFn: function(item) {
                    	                if(searchValue == null || item.get("id").toLowerCase().indexOf(searchValue) > -1 
                    	                    || item.get("displayName").toLowerCase().indexOf(searchValue) > -1) {
                    	                    return true;
                    	                }
                    	                return false;
                    	            }
	                    		}]);
						    }
	                    },
	    	        },
			    ]
	    	},
	    	
    		{
    	        xtype: 'panel',
    	        layout: {
    	            type: 'hbox'
    	        },
    	        padding: '5 0 0 0 ',
    	        border: false,
    	        items: [{
    	            xtype: 'gridpanel',
    	            store : 'dataFilterMeasuresStore',
    	            plugins: {
    	            	jdarowexpand:{
    	            		 columnInd:0,
    	            		 dataIndex:'hasChildren',
    	            		 expandValue:true
    	            	}
    	            },
    	            itemId: 'expressionMeasuresGrid',
    	            autoScroll: true,
    	            width: '100%',
    	            minHeight:100,
    	            columns : {
    					defaults : {
    						menuDisabled : true,
    						sortable : false
    					},
    					items : [{
		    	                header: me.i18n.ExpressionBuilder.Title.Name,
		    	                dataIndex: 'id',
		    	                flex: 0.5
	    	            	}, {
		    	                header: me.i18n.ExpressionBuilder.Title.DisplayName,
		    	                dataIndex: 'displayName',
		    	                flex: 0.5,
		    	                renderer: function(value) {
		    	                    return Ext.String.htmlEncode(value);
		    	                }
	    	            	}],
    	            },
    	            viewConfig: {
    	                listeners: {
    	                    itemdblclick: me.updateExpressionEditor,
    	                    boxready:function(view){
    	                    	view.grid.showFilterdMeasure = me.down('#showFilterdMeasureCheck').getValue();
    	                    }
    	                }
    	            }
    	        }],
    	    }, 
    	    {
    	        xtype: 'panel',
    	        layout: {
    	            type: 'hbox',
    	            pack: 'start'
    	        },
    	        itemId: 'operatorsPanel',
    	        padding: '5 20 0 0',
    	        scrollable: true,
    	        border: false,
    	        defaults: {
    	            xtype: 'button',
    	            style: 'margin-right:4px;margin-top:4px;',
    	            minWidth: 36,
    	            ui: 'j-standard-button',
    	            cls: 'expressionOperator'
    	        },
    	        items: []
    	    },
    	    {
    	        xtype: 'panel',
    	        layout: {
    	            type: 'vbox'
    	        },
    	        border: false,
    	        items: [{
    	            xtype: 'label',
    	            text: me.i18n.ExpressionBuilder.Expression+ "*",
    	            padding: '10 0 0 0',
    	        }, {
    	            xtype: 'panel',
    	            layout: {
    	                type: 'hbox'
    	            },
    	            width: '100%',
    	            border: false,
    	            padding: '5 0 0 0',
    	            items: [{
    	                xtype: 'textareafield',
    	                itemId: 'expressionEditor',
    	                border: false,
    	                enableKeyEvents: true,
    	                flex: 1,
    	    		    growMin      : 20,
    	    		    growMax      : 100,
    	                value : me.getExpression(),
    	                grow      : true,
    	                listeners: {
    	                	keyup: function() {
    	                		var expressionEditor = Ext.ComponentQuery.query('[itemId=expressionEditor]', me)[0];
	                    		var expr = expressionEditor.getValue();
						    }
	                    },
    	                
    	            }]
    	        }]
    	    }
    		
    	];
    	
        this.callParent(arguments);
        this.on("afterrender", this.onAfterRender);
    },
    onAfterRender: function () {
        var me = this;
        var operatorPanel = this.down('#operatorsPanel');
        operatorPanel.on("resize", function () {
        	var startTime = new Date().getTime();
            //adding and removing operators can fire resize event, we need to suspend it first during modification.
            operatorPanel.suspendEvent("resize");
            try {
                //preparing operator buttons menu list 
                me.prepareOperatorButtonsMenu(me);
            } finally {
                operatorPanel.resumeEvent("resize"); //resume
            }
            console.log("Time taken : 11111 = " + (new Date().getTime() - startTime));
        });

        //dynamically add list of operators
        Ext.Array.each(me.expressionOperators, function (operator) {
            operatorPanel.add(me.createButton(operator,me.OPERATOR_BUTTON_WIDTH, me));
        });
    },
    prepareOperatorButtonsMenu : function(datafilterexpressionpanel){
    	var startTime = new Date().getTime();
    	var me = datafilterexpressionpanel;
    	 var operatorPanel = datafilterexpressionpanel.down('#operatorsPanel');
    	 var operatorPanelWidth = datafilterexpressionpanel.down('#expressionMeasuresGrid').getWidth();
    	 var startTime = new Date().getTime();
    	 
    	 if(operatorPanel.down("#submenuButton")){
    		 me.showAllOperators();
    	 }
         var menuButtons = [];
         var panelButtons = [];
         var buttons = operatorPanel.query('button');
         var operatorsPanelWidth = datafilterexpressionpanel.down('#expressionMeasuresGrid').getWidth();
         var operatorButtonsWidth = 0;
         for (var i = 0; i < buttons.length; i++) {
        	  var button = buttons[i];
        	  var buttonWidth = button.getWidth();
        	  operatorButtonsWidth += buttonWidth + 5;
        	  if(operatorButtonsWidth < operatorsPanelWidth-50){
        		  panelButtons.push(button);
        	  }else{
        		  menuButtons.push(button);
        		  if(me.OPERATOR_BUTTON_SUBMENU_WIDTH < buttonWidth) { //if the button width is greater than the default width override the default value
                      me.OPERATOR_BUTTON_SUBMENU_WIDTH = buttonWidth;
                  }
        	  }
         }
         //removing all items from operator panel
         operatorPanel.removeAll(false);
         
         //adding panel buttons
         operatorPanel.add(panelButtons);
         
         //creating sub menu button and adding items to menu button
         var submenuButton = operatorPanel.down("#submenuButton");
         if (menuButtons.length > 0 && !submenuButton) { //check if it's already shown
        	 operatorPanel.add(me.createSubmenuButton(me));
        	 //add the removed buttons to the submenu.
        	 submenuButton = operatorPanel.down("#submenuButton");
             var menu = submenuButton.down('#menuPanel');
             var i = menuButtons.length; //or 10
             while(i--)
             {
            	 menu.insert(0, me.createButton(menuButtons[i].text, me.OPERATOR_BUTTON_SUBMENU_WIDTH, me));
             }
         }
    },
    createButton : function(operator, operatorButtonWidth,  me){
    	return {
            xtype: 'button',
            text: operator,
            ui: 'j-standard-button',
            name: 'expressionOperator',
            minWidth: operatorButtonWidth,
            isWordOperator: me.isAllAlphabet(operator), //if all alphabets, it's a function.
            listeners: {
			    click: function(object) {
			    	me.updateExpressionValue(me, object.text);
			    }
            },
        }
    },
    createSubmenuButton : function(me){
    	return {
                xtype: 'button',
                itemId: 'submenuButton',
                style: 'margin-right:4px;margin-top:4px;',
                minWidth: me.OPERATOR_BUTTON_WIDTH,
                ui: 'j-standard-button',
                cls: 'expressionOperator',
                text: '...', //do we externalize this?
                menuAlign: 'bl',
                arrowCls: 'dummy', //what is this?
                menu: [{
                    xtype: 'panel',
                    itemId: 'menuPanel',
                    layout: {
                        type: 'table',
                        columns: me.OPERATOR_SUBMENU_COLUMN_COUNT,
                        cellCls: 'operatorCell'
                    },
                    border: false,
                    items: []
                }]
            }
    },
    /**
     * Check if str is all alphabets. This is used by simple parser.
     */
    isAllAlphabet: function (str) {
        return /^[A-z]+$/.test(str);
    },

    /**
     * Move all operators in the submenu to the main line up.
     */
    showAllOperators: function () {
        var me = this;
        var operatorPanel = me.down('#operatorsPanel');
        var submenuButton = operatorPanel.down("#submenuButton");
        if (submenuButton) { //do nothing if there is no submenu
            var buttons = submenuButton.query('button');
            Ext.suspendLayouts();
            operatorPanel.remove(submenuButton); //remove "..."
            //move all operator buttons in submenu back to the main lineup
            Ext.Array.each(buttons, function (button) {
                operatorPanel.add(me.createButton(button.text, me.OPERATOR_BUTTON_WIDTH,  me));
            });
            Ext.resumeLayouts(true);
        }
    },

	updateExpressionEditor: function(dataview, record, item, index, e) {
       var measureName = record.get('id');
       var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
       var filterexpressionpanel = dataFilterController.getDataFilterExpressionPanel();
       filterexpressionpanel.updateExpressionValue(filterexpressionpanel, measureName);
    },
    updateExpressionValue : function(filterexpressionpanel, value) {
    	var measureEnclosingChars = this.config.measureEnclosingChars;
    	if(measureEnclosingChars){
    		if(measureEnclosingChars.length == 1){
    			value = measureEnclosingChars[0] + " " + value + " " + measureEnclosingChars[0];	
    		}else if(measureEnclosingChars.length == 2){
    			value = measureEnclosingChars[0] + " " + value + " " + measureEnclosingChars[1];
    		}
    	}
        var expressionEditor = Ext.ComponentQuery.query('[itemId=expressionEditor]', filterexpressionpanel)[0];
        var currValue = expressionEditor.getValue();
        currValue = currValue == null? currValue : currValue.trim();
		var editorEle = expressionEditor.inputEl.dom;
		var updatedVal = null;
        if(currValue != null && currValue != '') {
			var cursorPos = filterexpressionpanel.getTextAreaCursorPosition(editorEle);
			if(cursorPos == currValue.length) {
				updatedVal = currValue + " " + value;
			} else if(currValue.charAt(cursorPos) == " ") {
				updatedVal = currValue.substring(0,cursorPos) + " "+ value + currValue.substring(cursorPos ,currValue.length);
			} else if(currValue.charAt(cursorPos-1) == " ") {
				updatedVal = currValue.substring(0,cursorPos) + value + " " + currValue.substring(cursorPos ,currValue.length);
			} else {
				updatedVal = currValue.substring(0,cursorPos) + " " + value + " " + currValue.substring(cursorPos ,currValue.length);
			}
			expressionEditor.setValue(updatedVal);						
        } else {
			updatedVal = value;
			expressionEditor.setValue(updatedVal);
        }
		if(editorEle.selectionStart != null) {
			editorEle.selectionStart = updatedVal.length;
		}
    },
    getTextAreaCursorPosition : function(el) {
        var pos = 0;
        // IE Support
        if (document.selection) 
        {
        	el.focus ();
        	var Sel = document.selection.createRange();
        	var SelLength = document.selection.createRange().text.length;
        	Sel.moveStart ('character', -el.value.length);
        	pos = Sel.text.length - SelLength;
        }
        // Firefox support
        else if (el.selectionStart || el.selectionStart == '0')
        	pos = el.selectionStart;

        return pos;
    },
});