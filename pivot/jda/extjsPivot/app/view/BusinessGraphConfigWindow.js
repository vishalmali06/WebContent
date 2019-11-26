//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.BusinessGraphConfigWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.businessgraphconfigwindow',
	itemId : 'businessgraphconfigwindow',
	title : '',
	config : {
		pivotObj:null,
		pivotController:null,
		graphData: '',
		isEdit : false
	},
	requires: ['Ext.layout.container.*', 'Ext.data.*','Ext.grid.*','Ext.panel.*',
	           'JdaPivotApp.view.businessgraph.BuildGraphPanel','Ext.tab.Panel'],
	padding : '0 0 0 0',
	cls : 'j-pvt-styling-panel',
	bodyCls : 'j-pvt-styling-panel-body',
	modal: true,
	layout: 'fit',
	initComponent : function() {
		var me = this;
		pivotController = JdaPivotApp.getApplication().getPivotController();
		pivotObj = pivotController.getPivotWrapper().getPivot();
		var	configWinWidth = Ext.getBody().getViewSize().width*0.8;
		var	configWinHeight = Ext.getBody().getViewSize().height*0.8;
		//var configWinHeight = (pivotObj.$_viewobj.parent()[0].offsetHeight + pivotController.getBusinessGraphWrapper().getHeight() )*0.8;
		var buildgraphpanel = Ext.create('Ext.container.Container', {
			width : configWinWidth,
			height : configWinHeight,
			layout: 'fit',
		    items: [
                    {
                    	flex : 1,
                    	xtype : 'buildgraphpanel',
                    	graphData: me.getGraphData(),
                    	isEdit:me.getIsEdit()
                    },
                   ]
		});
		
		me.items = buildgraphpanel;
		
		me.on({
			afterrender : function(me) {
				me.updateLayout();
			}
		});
		me.callParent(arguments);
	},
	validateGraphName : function(graphNameObj){
		var resourceKey = null;
		if(graphNameObj){
			var configuration =pivotObj.getGraphConfig();
			var graphName = graphNameObj.getValue();
			var graphNameMaxLenght = 255;
			if(configuration && configuration.options && configuration.options.graphNameMaxLength){
				graphNameMaxLenght = configuration.options.graphNameMaxLength;
			}
			if(graphName.trim().length === 0){
				resourceKey = 'BusinessGraph.Build.Validation.GraphName.Required';
			}else if(graphName.length > graphNameMaxLenght){
				resourceKey = 'BusinessGraph.Build.Validation.GraphName.LengthExceed';
			}else if(configuration.validators.checkInvalidCharacters === undefined){
				var temp = graphName;
				if((graphName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp))
				{
					resourceKey = 'BusinessGraph.Build.Validation.GraphName.InvalidCharacter';
				}
			} else if(!configuration.validators.checkInvalidCharacters(graphName)){
				resourceKey = 'BusinessGraph.Build.Validation.GraphName.InvalidCharacter';
			}
			
			if(resourceKey == null){
				return true;
			}else{
				pivotController.showFieldError(graphNameObj, pivotObj.getLocaleString(resourceKey));
				graphNameObj.focus();
				return false;
			}
		}
	},
	
});