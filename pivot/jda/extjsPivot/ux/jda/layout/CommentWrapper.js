//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.CommentWrapper', {
	extend : 'Ext.Component',
	alias : 'widget.commentwrapper',
	id : 'commentwrapper',
	itemId : 'commentwrapper',
	config : {
		cellId : null,
		intersection : null,
		setting : {},
		configuration:{},
		pivotObj:null,
		flyoutIsOpen:false,
	},
	style : {
		display : 'table-row',
		width:'100%'
	},
	initComponent : function(config) {
		var me = this;
		this.initConfig(config);
		me.callParent(arguments);
		/** Add events to CommentWrapper type **/
		//me.addEvents('initcomment','pivotcellchanged','addaccordion', 'refreshcommentarea','destroy');
		
		/**Add listeners to events **/
		me.on({
			/** event name : listener or handler **/
			initcomment:me.initComment,
			pivotcellchanged : me.onCellChange,
			addaccordion:me.addAccordion,
			refreshcommentarea:me.refreshCommentArea,
			destroy:me.destroyComment,
			pivotFlyoutOpen:this._pivotFlyoutOpen,
			pivotFlyoutClose:this._pivotFlyoutClose,
			setReasonCodes:me._setReasonCodes
			
		});
		//pivotlog('Done initComponent'); 
	},
	renderTpl : [ '<div   class="pivotComment" style="height:100%;width:100%;"></div>' ],
	getCommentObj  : function() {
		return this.commentObj;
	},
	initComment :function(){
		this.configuration =this.getPivotObj().getCommentConfig();
		
		this.getCommentObj().pivotComment(this.getConfiguration().options,this.getConfiguration().validators,this.getConfiguration().hooks);
		this.getCommentObj().pivotComment("initializeCommentArea",true,true);
		
	},
	setCommentConfig:function(config){
		this.configuration =config;
		if(this.getCommentObj())
		this.getCommentObj().pivotComment("option",this.getConfiguration().options,this.getConfiguration().validators,this.getConfiguration().hooks);
	},
	refreshCommentArea:function(){
		//alert("call success");
		this.getCommentObj().pivotComment("initializeCommentArea",true,true);
	},
	addAccordion:function(comments,operation){
		this.getCommentObj().pivotComment("addAccordion",comments,operation);
	},
	onCellChange:function(cellId, intersection){
		this.getCommentObj() && this.getCommentObj().pivotComment("onCellChange",cellId,intersection);
	},
	destroyComment:function(){
		this.getCommentObj().pivotComment("destroy");
	},
	_pivotFlyoutOpen : function (){
		this.config.flyoutIsOpen = true,
		this.getCommentObj().pivotComment("pivotflyoutopen");
	},
	_pivotFlyoutClose:function (){
		this.config.flyoutIsOpen = false,
		this.getCommentObj().pivotComment("pivotflyoutclose");
	},
	_setReasonCodes:function(reasonCodes){
		this.getCommentObj().pivotComment("addReasonCodes",reasonCodes);
	},
	afterRender : function() {
		var me = this;
		this.callParent(arguments); 
		/*me.pivotObj=Ext.ComponentQuery.query('pivotwrapper')[0].getPivot();*/
		//me.pivotObj =me.pivotObj.getPivot();
		me.commentObj=$(me.el.down('.pivotComment').dom);
		if(me.pivotObj){
			this.initComment();
		}
		// perform additional rendering tasks here.
	},
	onBoxReady : function( width, height, eOpts ) {
		//pivotlog('onBoxReady %o',arguments);
		this.callParent(arguments);
		//this.pivotObj.resizePivot(width, height);
	},
	onResize : function(width, height, oldWidth, oldHeight, eOpts ) {
		//pivotlog('onResize %o', arguments);
		this.callParent(arguments);
		this.getCommentObj().pivotComment("resize",width,height);
		//this.pivotObj.resizePivot(width, height);
	},
	
	onAdded : function() {
		this.callParent(arguments); // call the superclass onAdd method
		
		var pivotObj = this.getPivotObj();
		//pivotlog('About to add component');
		// perform additional add tasks here.
	},
	beforeDestroy: function() {
		this.getCommentObj().pivotComment("destroy");
		//pivotlog("beforeDestroy");
		this.callParent();
	} ,
	onDestroy : function() {
		//pivotlog('About to destroy component');
		this.callParent();
	}
});