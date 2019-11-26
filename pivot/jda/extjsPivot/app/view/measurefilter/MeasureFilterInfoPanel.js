//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.measurefilter.MeasureFilterInfoPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.measurefilterinfopanel',
	itemId : 'measurefilterinfopanel',
	layout: 'anchor',
	config : {
		filterConfig : null,
		canCreate : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj = JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();;
		var filterConfig = me.getFilterConfig();
		
		var imgPath;
		if(pivotObj && pivotObj.getMeasureFilterConfig() && pivotObj.getMeasureFilterConfig().options && pivotObj.getMeasureFilterConfig().options.imgPath){
			imgPath = pivotObj.getMeasureFilterConfig().options.imgPath;
		}
		
		var qtipTextSeparator = ": ";
		var qtipText = pivotObj.getLocaleString('MeasureFilter.Config.Type.Public') + qtipTextSeparator +pivotObj.getLocaleString('MeasureFilter.Config.Type.Public.Desc')+"</br>";
			qtipText+= pivotObj.getLocaleString('MeasureFilter.Config.Type.Private')+ qtipTextSeparator +pivotObj.getLocaleString('MeasureFilter.Config.Type.Private.Desc')+"</br>";
		
		var typeLabel = pivotObj.getLocaleString('MeasureFilter.Config.Type')+ "*";
		typeLabel+= '&nbsp;&nbsp;<img style:"margin:-5px 0px 0px 0px;" src='+imgPath+'information_normal_14.png data-qtip="'+qtipText+'">';
		
		me.items=  [{
  	        xtype			: 'textfield',
  	        itemId			: 'name',
  	        fieldLabel		: pivotObj.getLocaleString('MeasureFilter.Config.Name')+ "*",
  	        labelSeparator 	: '',
  	        width  			: "100%",
	        value 			: (filterConfig) ? filterConfig.name: '',
            configId        : (filterConfig) ? filterConfig.id: null,
  	    },
		{
  	    	xtype			: 'textarea',
  	    	itemId			: 'description',
  	        fieldLabel		: pivotObj.getLocaleString('MeasureFilter.Config.Description'),
  	        labelSeparator 	: '',
  	        grow      		: true,
    		growMax     	: 100,
    		width  			: "100%",
    		padding			: '10 0 0 0',
    		value 			: (filterConfig) ? filterConfig.description: "",
  	    },
	  	{
	    	xtype			: 'combo',
		    store 			: 'measureFilterTypesStore',
		    fieldLabel		: typeLabel,
		    labelSeparator 	: '',
			displayField	: 'name',
			valueField		: 'id',
			itemId			: 'filterTypeCombo',
			autoSelect		: false,
			editable 		: false,
		    growToLongestValue: true,
	        grow			: true,
	        queryMode		: 'local',
	        anchor 			: "50%",
	        padding			: '10 0 0 0',
	        disabled		: !(me.getCanCreate()),
	        value 			: (filterConfig) ? filterConfig.type : _pns.Constants.measureFilterTypes.Private,
			listConfig		: {
		        getInnerTpl	: function() {
		    		var filterTypeCombo =me.down('#filterTypeCombo');
		    		var charLength = ((filterTypeCombo.getWidth()-8)/8);
		        	return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
	            }
			},
	    },
	    ]
		
		me.callParent(arguments);
	},
   
});