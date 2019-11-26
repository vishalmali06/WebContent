//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.PivotWrapper', {
	extend : 'Ext.Component',
	alias : 'widget.pivotwrapper',
	config : {
		pivotConfig:{},
	},
	style : {
		display : 'table-row'
	},
	initComponent : function(config) {
		var me = this;
		this.initConfig(config);
		me.callParent(arguments);
		//pivotlog('Done initComponent'); 
	},
	renderTpl : [ '<div   class="upperPivotLayer pivotLayerElement"></div>' ],
	getPivot  : function() {
		return this.pivotObj;
	},
	createPivotInstance:function(){
		var me  = this;
		var parentContainer=me.el.down('.upperPivotLayer').dom;
		//pivotlog('About to render');
		var actualHandlers=function(){
			var ctor=me.getPivotConfig().configurationFn;
			var retVal=ctor.bind.apply(ctor,arguments);
			retVal=$.extend({parentContainer:parentContainer},retVal);
			return retVal;
		};
		// Adding parent container to configuration
		var pivotConfig = me.getPivotConfig();
		pivotConfig.container=parentContainer;
		me.pivotObj = new _pns.pivot(pivotConfig);
		// perform additional task here.. setting configuration object to graph,comment,cf
		var controller = JdaPivotApp.getApplication().getPivotController();	
		controller.getPivotWrapper().pivotObj= me.pivotObj;
		controller.setImgPath(me.pivotObj.getImgPath());
		if(pivotConfig.enabledCharts){
			controller.getGraphbtn().setText(me.pivotObj.getLocaleString('Graph.Title'));
			controller.getGraphWrapper().setPivotObj(me.pivotObj);
			controller.getGraphWrapper().setGraphConfig(me.pivotObj.getGraphConfig());
		}
		if(pivotConfig.enabledComments){
			controller.getCommentbtn().setText(me.pivotObj.getLocaleString('Comment.Title'));
			controller.getCommentWrapper().setPivotObj(me.pivotObj);
			controller.getCommentWrapper().setCommentConfig(me.pivotObj.getCommentConfig());
		}
		
		if(pivotConfig.enabledDataFilter || pivotConfig.enabledMeasureFilter){
			controller.getFiltersbtn().setText(me.pivotObj.getLocaleString('Filters.Title'));
			controller.getFiltersWrapper().fireEvent('initFilters');
		}else if(pivotConfig.enabledStyling){
			controller.getStylebtn().setText(me.pivotObj.getLocaleString('CF.Title'));
		}
		
		if(pivotConfig.enabledBusinessCharts){
			controller.getBusinessgraphbtn().setText(me.pivotObj.getLocaleString('BusinessGraph.Title'));
			controller.getBusinessGraphWrapper().setPivotObj(me.pivotObj);
			controller.getBusinessGraphWrapper().setGraphConfig(me.pivotObj.getGraphConfig());
		}
	},
	destroyPivot:function(){
		var me =this;
		//Preserving some overridden properties
		me.getPivotConfig().defaultGraphConfiguration = me.getPivot().config.defaultGraphConfiguration;
		me.getPivotConfig().cellCommentRelation = me.getPivot().config.cellCommentRelation;
		me.getPivot().destroy();
	},
	destroyAndReload:function(){
		this.destroyPivot();
		this.createPivotInstance();
	},
	reloadPivot:function(){
		me.config.isDestroyAndReload = true;
		this.createPivotInstance();
	},
	afterRender : function() {
		var me = this;
		this.callParent(arguments); // call the superclass onRender method
		this.createPivotInstance();
	},
	onBoxReady : function( width, height, eOpts ) {
		//pivotlog('onBoxReady %o',arguments);
		this.callParent(arguments);
		this.pivotObj.resizePivot(width, height);
	},
	onResize : function(width, height, oldWidth, oldHeight, eOpts ) {
		//pivotlog('onResize %o', arguments);
		this.callParent(arguments);
		this.pivotObj.resizePivot(width, height);
	},	
	onAdd : function() {
		this.callParent(arguments); // call the superclass onAdd method
		//pivotlog('About to add component');
		// perform additional add tasks here.
	},
	onDestroy : function() {
		//pivotlog('About to destroy component');
		this.callParent();
	}
});