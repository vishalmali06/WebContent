//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.JdaViewport', {
	/*	extend : 'Ext.container.Container',*/
	extend : 'Ext.container.Container',
	alias:'widget.jdaviewportcontainer',
	requires : [ 'Ext.container.Container'],
	layout : 'fit',
	initComponent : function() {
		var me=this;

		this.callParent();
    	Ext.EventManager.onWindowResize(function(){
    		pivotlog('JdaViewport onWindowResize %o ',arguments);
    		this.fitSize(arguments);
        },me);

	},
	onAdded : function() {
		this.callParent();
		//pivotlog('JdaViewport onAdded');
	},
	/*
	 * 	MDAP-3436: CLONE: CWB:Close button is not displaying on restoring the browser window
	 * 	Issue is due to change in size variable when minimize to maximize. 
	 * 	The basic expectation is args[0] should be equals to size.width - pos[0] and args[1] should be equals to size.height - pos[1].
	 *  But size is changing for flow casting window, so width is increasing to 16px and close button dragged and hidden into shell.
	 *  To get original size of the window, get size value than args[0] and args[1].
	 * */
    fitSize: function(args) {
    	if(this.container){
    		size = this.container.getViewSize(),
            offsets = this.getOffsetsTo(this.container);
        pivotlog('JdaViewport fitSize viewsize=%o offsets=%o',size,offsets);
        this.setSize(
        	   size.width - offsets[0]  ,
        	   size.height - offsets[1]  );
    	}   
    },
    onBoxReady : function(  width, height, eOpts ) {
		this.callParent();
		pivotlog('JdaViewport boxready');
	},
	onRender : function (eOpts ){
		this.callParent();
		var parentSize = eOpts.getSize();
		this.setSize(parentSize.width,parentSize.height);
		pivotlog('JdaViewport onRender');
	},
	onResize : function(width, height, oldWidth, oldHeight){
		this.callParent();
		pivotlog('JdaViewport onResize %o',arguments);
	}
});