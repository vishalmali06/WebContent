//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.GraphWrapper', {
	extend : 'Ext.Component',
	alias : 'widget.graphwrapper',
	config : {
		cellId : null,
		intersection : null,
		setting : {},
		configuration:{},
		pivotObj:null,
		flyoutIsOpen:false,
	},
	layout : 'fit',
	style : {
		display : 'table-row',
		width:'100%',
		height:'100%'
	},
	initComponent : function(config) {
		var me = this;
		this.initConfig(config);
		me.callParent(arguments);
		//me.addEvents('initgraph','cellchange','plotChart','saveNotification','refreshSettings','destroy','pivotFlyoutOpen','pivotFlyoutClose');
		me.on({
			initgraph : this._initGraph,
			cellchange : this._onCellChange,
			plotChart: this._plotChart,
			saveNotification : this._saveNotification,
			refreshSettings : this._refreshSettings,
			destroy:this._destroyGraph,
			pivotFlyoutOpen:this._pivotFlyoutOpen,
			pivotFlyoutClose:this._pivotFlyoutClose
		});
		//pivotlog('Done initComponent'); 
	},
	
	renderTpl : [ '<div class="pivotGraphWrapper"><div id="pivotGraphFlyout"></div></div>'],
	getGraphObj  : function() {
		return this.graphObj;
	},
	_initGraph :function(){
		if(this.getPivotObj()._getCubeDefinition())
			this.getGraphObj().pivotGraph('buildGraphSettings',this.getPivotObj()._getCubeDefinition());
		this.getGraphObj().pivotGraph('pivotflyoutopen');
	},
	_refreshSettings : function(cubeDefinition, isCubeDef){
		this.getGraphObj().pivotGraph('refreshSettings', cubeDefinition, isCubeDef);
	},
	_onCellChange : function(cellId,intersection){
		this.getGraphObj().pivotGraph("onCellChange",cellId,intersection);
	},
	_plotChart:function(response){
		this.getGraphObj().pivotGraph("drawChart",response);
	},
	_saveNotification : function(responseResult, requestParams){
		this.getGraphObj().pivotGraph("showNotification",responseResult, requestParams);
	},
	_destroyGraph:function(){
		this.getGraphObj().pivotGraph("destroy");
	},
	_pivotFlyoutOpen : function (){
		this.config.flyoutIsOpen = true;
		var graphObj = this.getGraphObj();
		graphObj.pivotGraph("pivotflyoutopen");
		
	},
	_pivotFlyoutClose:function (){
		this.config.flyoutIsOpen = false;
		this.getGraphObj().pivotGraph("pivotflyoutclose");
	},
	setGraphConfig:function(config){
	    this.configuration = config;
	    if(this.getGraphObj()){
	    	this.getGraphObj().pivotGraph("option",this.getConfiguration());
	    }
	},
	afterRender : function() {
		var me = this;
		this.callParent(arguments); 
		/*me.pivotObj=Ext.ComponentQuery.query('pivotwrapper')[0].getPivot();*/
		//me.pivotObj =me.pivotObj.getPivot();
		me.graphObj=$(me.el.down('#pivotGraphFlyout').dom);
		
		me.configuration =this.getPivotObj().getGraphConfig();		
		me.getGraphObj().pivotGraph(me.getConfiguration().options);
		// perform additional rendering tasks here.
	},
	onBoxReady : function( width, height, eOpts ) {
		//pivotlog('onBoxReady %o',arguments);
		this.callParent(arguments);
		//this.pivotObj.resizePivot(width, height);
	},
	onResize : function(width, height, oldWidth, oldHeight, eOpts ) {
		this.getGraphObj().pivotGraph("resize",width,height);
	},
	
	onAdded : function() {
		this.callParent(arguments); // call the superclass onAdd method
		
		//var pivotObj = this.getPivotObj();
		//pivotlog('About to add component');
		// perform additional add tasks here.
	},
	beforeDestroy: function() {
		this.getGraphObj().pivotGraph("destroy");
		//pivotlog("beforeDestroy");
		this.callParent();
	} ,
	onDestroy : function() {
		//pivotlog('About to destroy component');
		this.callParent();
	}
});