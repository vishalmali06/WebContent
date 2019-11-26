//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.ColorCombo', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.colorcombo',
	itemId : 'colorcombo',
	triggerTip: 'Please select a color.',
	selectOnFocus: true,
    hideEmptyLabel: true,
    menu : null,
    autoSelect: false,
	editable:false,
	config : {
		colorValue : 'FFFFFF',
	
		colors : ['000000','434343','656565','999999','B6B6B6','CBCBCB','DBDBDB','EDEDED','F4F4F4','FFFFFF',
		          'C73920','F54B2E','FBAD43','F8D162','2FA764','54D691','A6C2F4','4E86E8','A27AE3','F291B2',
		          'E4B8AF','F4C5BE','FEE6C7','FDF1D1','BCE4D0','C9F3DE','DDE5F3','CADAF8','E3D7F5','FADEE8',
		          'D97E6B','EBA093','FDD6A1','FBE8B2','8ED3B1','A5EAC8','C5D6F5','A6C2F4','CFBCF2','F9C8D9',
		          'C74024','E16450','FCBC69','FADA81','50B983','73DFA8','9BBFFF','709EEC','B494E9','F3A7C0',
		          'A21A00','C73920','E7A03E','F0C95D','2C9E5F','4EC788','608EE7','4178D9','8C63CF','DC7798',
		          '821F0B','A82A15','CC8930','D3AE46','21804A','389C67','5077C0','2D5BAD','633E9C','B25775',
		          '590E00','7F2010','A16A1F','A8882E','176238','26764C','375795','204588','40236E','80324C']		
	},
	initComponent: function () {
        var me = this;
        me.callParent(arguments);
    },
    createPicker: function () {
        var trigger = this;
        var me = this;
        if (me.picker) { //destroy if already created so it doesn't remember previous state.
            me.picker.destroy();
            me.picker = null;
        }
        me.picker = Ext.create('Ext.picker.Color', {     
			pickerField: this,     
			ownerCt: this,    
			renderTo: document.body,     
			floating: true,    
			hidden: false,    
			focusOnShow: true,
			colors : me.getColors(),
			shadow:false,
			cls:'j-pvt-rule-dialog-colorpicker',
			listeners: {
				scope:this,
				select: function(field, value, opts){
					var bgcolor = 'background-color:#'+ value + ';background-image:none;';
					me.setFieldStyle(bgcolor);
					me.setColorValue('#'+value);
					me.unsetActiveError();
					me.picker.hide();
				},
				show: function(field,opts){
					field.getEl().monitorMouseLeave(500, field.hide, field);
				}
				
			}
		});
        me.picker.alignTo(me.inputEl, 'tl-bl?');
		me.picker.show(me.inputEl);
        return me.picker;
    },
    listeners: {
        focus: function (colorfld) {
            colorfld.setFieldStyle({color: colorfld.getValue()});
            colorfld.setFieldStyle({background: colorfld.getValue()});
            colorfld.inputEl.dom.setAttribute('spellcheck', false);
        },
        blur: function (colorfld) {
            colorfld.setValue(colorfld.getColorValue());
            colorfld.setFieldStyle({color: '#FFF'});
            colorfld.setFieldStyle({background: '#FFF'});
        }
    },
 	onTriggerClick: function() {
 		if (this.picker) {
            this.picker.destroy();
            this.picker = null; //will force recreation of picker.
            this.isExpanded = false; //make sure it's not in expanded mode.
        }
        this.callParent(arguments);
 		
 		},
	//Fix for MDAP-2449
	listeners : {          
		labelEl: {
            click: function(e) {
                e.preventDefault();
            }
        }, 
		focusleave : function(){
			var me = this;
			if(me.picker){
				me.picker.hide();
			}			
		}
	}, 
	setValue : function(value) {
		if(value !='')
		{
			this.setFieldStyle('background-color:'+ value + ';');
			var color = new Ext.draw.Color();
			this.setColorValue(color.toHex(value));
		}
		else
			this.setColorValue('');
		
	},
	getValue : function() {
		return this.getColorValue();
	},
	getRGB: function(){
		var midColor =Ext.draw.Color.fromString(this.getFieldStyle().replace(';background-image:none;','').replace('background-color:','')); 
		var rgbColor="";
		if(midColor){
			rgbColor ='rgb(' +midColor.r+','+midColor.g+','+midColor.b+ ')';
		}
	    return rgbColor;

	}
	

});