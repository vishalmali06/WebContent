//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/**
 * Pivot UI common code. Here we have moved most of the structured code like constants,Axis, AxisPath, Facet, Header class.
 * jda_pivot.js becomes cumbersome. So we moved most of the code from jda_pivot.js
 * 
 * @author Mohamed Faizel
 * @date 	07 Nov 2014
 */

////////////////////////////////////////////////////////////////
///////////////// Pivot Constants //////////////////////////////
//////////////////////////////////////////////////////////////// 

_pns.Constants = {
        rootId : "-1",
        NA_Value : "N/A",
        measurePathSeperator : '\u26BD',
        subMeasurePathSeperator : ':#SMS#:',
        facetPathSeperator : '\u2993',
        axisPathSeperator : '\u265A',
        classNameSeperator:".",
        hdrPrefix : "hdr_",
        attrIdPrefix:"attr",
        facetIdPrefix : "fc",
        facetNamePrefix : "fname",
        measureIdPrefix : "mr",
        spacer : "&#160;",
        attributeHeaderSection:'attributeHeaderSection',
        attributeMemberSection:'attributeMemberSection',
        filterDropSection : 'filterDropSection',
        topAxisFacetsSection : 'topAxisFacetsSection',
        topAxisMembersSection : 'topAxisMembersSection',
        sideAxisFacetsSection : 'sideAxisFacetsSection',
        sideAxisMembersSection : 'sideAxisMembersSection',
        attrCellsSection:'attrCellSection',
        dataCellsSection : 'dataCellsSection',
        measuresDataSection : 'measuresDataSection',
        lockDescPrefix : 'lockType.',
        cellUpdateErrorPrefix : 'error.Update.',
        cellImportErrorPrefix : 'error.import.',
        PhysLock : 'PHY',
        TempLock : 'TMP',
        UiIconPrefix : "ui-icon-",
        PhysLockCSS : "ui-icon-" + 'phy',
        TempLockCSS : "ui-icon-" + 'tmp',
        NoneLockCSS : "ui-icon-" + "non",
        failLock : 'LCK',
        // failSecurity : 'SEC',
        wasCellEdited : 'ed',
        selectedAxis : 'selAxs',
        transactionMode:'multiEdit',
        renderType:'render',
        cubeView:'getCubeViewDefinition',
        children:'getChildren',
        segmentData:'getSegmentData',
        updateMeasure:'updateFacts',
        pivotAxis:'setPivotAxes',
        expandPivot:'expandPivotRequest',
        cancelRequest:'cancelMethod',
        multiEdit:'multiEdit',
        isShowNegativeInRed:'isShowNegativeInRed',
        isShowNegativeInParentheses:'isShowNegativeInParentheses',
        dataFilterTypes :{
        	"Private" : "private",
        	"Public" : "public",
        	"ViewFilter" : "viewFilter",
        },
        measureFilterTypes :{
        	"Private" : "private",
        	"Public" : "public",
        },
        dataFilterDurations :{
        	"BOTH" : "BOTH",
        	"FORECAST" : "FORECAST",
        	"HISTORY" : "HISTORY",        	
        },
        filterOperators:{
        	"BeginsWith" : "beginsWith",
        	"Contains" : "contains",
        	"DoesNotContain" : "doesNotContain",
        	"EndsWith" : "endsWith",
        	"NotEqual" : "notEqual",
        }
    };
///////////////////////////////////////////////////////////////
////////////// Pivot Common Util  /////////////////////////////
///////////////////////////////////////////////////////////////
 _pns.utility =

 {   
	/**
	 * Provide configuration for each command (i.e, request). This can be overridden by application 
	 * by adding enableLongPolling, showDialog. Application can turn on long polling for each
	 * request. By default long polling is turned off.
	 * 
	 */
	 getDefaultCommandConfig:function(){

 	    	return {	// cube view request
 	    		PivotViewRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		// get children request
 	    		GetChildrenRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		// get segment data request
 	    		GetSegmentDataRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:true
 	    		},
 	    		// set pivot axes request (swapping facet,moving measure,sorting,filtering)
 	    		SetPivotAxesRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		// expand pivot request (re-expand hierarchy)
 	    		ExpandPivotRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		// update facts request (update measure after editing the cell)
 	    		UpdateFactsRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:true
 	    		},
 	    		// generic request (application specific request) 
 	    		CheckRequestRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		
 	    		CancelRequestRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
 	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},// paste copied content in selected row.
 	    		pasteCopiedContentRequest:{
 	    			enableLongPolling:false,
 	    			showDialog:false
 	    		},
 	    		ImportFromExcelRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		BusinessGraphRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:false
 	    		},
 	    		DataFilterRequest:{
 	    			enableLongPolling:false,
 	    			//pollingTimeout:30000,
	    			//pollingTimeoutServerDelta:1000,
 	    			showDialog:true
 	    		},
 	    	};
     	   },
     /**
      * @param {Array} _parentAxisPath
      *            the axis path of the parent
      * @param {string}
      *            the id of the child
      */
     getMemberAxisPath : function(_parentAxisPath, memberId, facetIndex, currFacet) {
         // Let's clone the parent axis path
         var parentAxisPath = _parentAxisPath.slice(0);
         for ( var i = 0, j = parentAxisPath.length; i < j; i++){
             currFacet = parentAxisPath[i];
             var newFacet = {
                 facetId : currFacet.facetId,
                 showEmpty : currFacet.showEmpty
             };
             if (currFacet){
                 newFacet = currFacet.slice(0);
             }
             parentAxisPath[i] = newFacet;
         }
         if (!parentAxisPath[facetIndex]){
             parentAxisPath[facetIndex] = {
                 facetPath : []
             };
         }

         var facetPath = parentAxisPath[facetIndex];
         facetPath = facetPath.slice(0, facetPath.length);
         var currentFacetPath = undefined;
         if(_.contains(facetPath,"-1") && memberId == "-1")
      	    currentFacetPath = facetPath.concat( ["-999"]); 
         else
      	   currentFacetPath = facetPath.concat([ memberId ]);
         // Duplicate the parent axis
         var childAxisPath = parentAxisPath.slice(0);
         childAxisPath[facetIndex] = currentFacetPath;

         return childAxisPath;
     },
     getMemberAxisPathCollection: function(memberAxisPath, axisPath, currMember){
         var index = -1, memberCollection = [];
         var memberCollectionMap={};
         memberAxisPath.every(function(element, i){
             if(element.toString()!=axisPath[i].toString()){
                 index = i;
                 return false;
             }
             return true;
         });
         if(index != -1){
             (function(memberAxisPath, currMember, index){
                 if(currMember.axisChildren && currMember.axisChildren.length){
                     for(var i =0;i < currMember.axisChildren.length; i++){
                         var newAxis = JSON.parse(JSON.stringify(memberAxisPath));
                         if(currMember.axisChildren[i].id != -1){
                             if(newAxis[index+1].length === 1)
                                 newAxis[index+1].push(currMember.axisChildren[i].id);
                             else{
                                 newAxis[index+1].pop();
                                 newAxis[index+1].push(currMember.axisChildren[i].id);
                             }
                         }
                         arguments.callee(newAxis, currMember.axisChildren[i], index + 1);
                     }
                 }
                 else{
                	//remove duplicate values
                	/*  var found=false;
                     //remove duplicate values
                     memberCollection.every(function(element,i){
                         if(element.toString()===memberAxisPath.toString()){
                             found=true;
                             return false;
                         }
                         return true;
                     });
                     if(!found)*/
                	 var key = JSON.stringify(memberAxisPath);
                	 if(!memberCollectionMap[key]){
                		 memberCollection.push(memberAxisPath);
                		 memberCollectionMap[key] = true;
                	 }  
                 }
                 if(currMember.facetChildren && currMember.facetChildren.length){
                     for(var i =0;i < currMember.facetChildren.length; i++){
                         var newAxis = JSON.parse(JSON.stringify(memberAxisPath));
                         newAxis[index].push(currMember.facetChildren[i].id);
                         arguments.callee(newAxis, currMember.facetChildren[i], index);
                     }
                 }
             }).call(undefined, memberAxisPath, currMember, index);
         }
         return memberCollection;
     },
     createSpacer : function(depth) {
         var retVal = "";
         if (depth){
             for ( var i = 0; i < depth; i++){
                 retVal += _pns.Constants.spacer;
             }
         }
         return retVal;
     },
     /**
      * Get's the parent's axis path of the provided node's axis path. The parent may be in the same facet or the
      * previous facet.
      *
      * @param {_pns.axis}
      *            axis The axis to resolve the axis path for.
      * @param {Array.<String>}
      *            axisPath The axis to resolve the axis path for.
      * @return {string[]} the axis path of the parent
      */
     getParentAxisPath : function(axis, axisPath) {
         var retVal = null;
         if (axis && axisPath){
         }
         return retVal;
     },
     getAxisPathIdNoMeasureStr : function(axisPath) {
         axisPath = axisPath.facetPaths ? axisPath.facetPaths : axisPath;
         var retValArray = [];
         for ( var i = 0, j = axisPath.length; i < j; i++){
             retValArray.push(axisPath[i].join(_pns.Constants.facetPathSeperator));
         }
         var retVal = retValArray.join(_pns.Constants.axisPathSeperator);
         return retVal;
     },

     getAxisNodeIdFromFacetPaths : function(facetPaths) {
         if (!jdapivot.isArray(facetPaths)){
             facetPaths = [ facetPaths ];
         }
         var facetsIds = ahx.toArray();
         for ( var i = 0; i < facetPaths.length; i++){
             facetsIds.push(this._getFacetNodeIdFromFacetPath(_getFacetNodeIdFromFacetPath[i]));
         }
         var id = facetsIds.join(jda.pivot.Constants.axisPathSeperator);
         return id;
     },
     findColumnPath : function(data,keyName){
     	
     	var result = [];
     	for(var index  in data){
     		if(typeof data[index] == 'object'){
     			for(var index2  in data[index]){
     				if(index2 == keyName){
     					result.push(data[index][index2]);
     				}
     			}
     		}
     	};
     	return result;
     },
     createSubmeasreStructure : function(newMeasures, pivot,clickedMeasureId,axisFacet) {
    	var createdMemberCollection ={};
    	
		var currentMeasureData = pivot.data.pull[clickedMeasureId];
		//Mark current measured is expanded
		currentMeasureData.isExpanded = true;
		var facets = axisFacet.axis.facets;
		currentMeasureData.subMeasures = []; // attach all submeasures for future use (i.e. last measure on column rendering)
		for(var index = 0; index < newMeasures.length ; index++){
			
			var newMeasureData = {};// _.clone(currentMeasureData);
			
			for(var faceInd  in facets){
					
				newMeasureData[_pns.Constants.facetIdPrefix + facets[faceInd].id] = currentMeasureData[_pns.Constants.facetIdPrefix + facets[faceInd].id];
			}
			newMeasureData.axisPath = [];
			
			for(var axisInd  = 0; axisInd < axisFacet.axisPath.length - 1;axisInd++){
				newMeasureData.axisPath.push(axisFacet.axisPath[axisInd]);
			}
			newMeasureData.axisPath.push([newMeasures[index].label]);
			
			newMeasureData.dataNodes = currentMeasureData.dataNodes;

			axisFacet.axis.getAxisPathIdStr(newMeasureData.axisPath);
			
			newMeasureData.id = currentMeasureData.id.split(_pns.Constants.measurePathSeperator)[0]+_pns.Constants.measurePathSeperator+newMeasures[index].id;
			newMeasureData.mr =  newMeasures[index].displayName ||  newMeasures[index].label;
			newMeasureData.isSubmeasure=true;
			
			currentMeasureData.subMeasures.push(newMeasureData.id);
			
			createdMemberCollection[newMeasureData.id] = newMeasureData;
		}
    	
    	
    	return createdMemberCollection;
    }
 };

 ///////////////////////////////////////////////////////////////////////
 /////////////// Pivot CONTEXT MENU  structure //////////////////////////
 ///////////////////////////////////////////////////////////////////////
 
 _pns.MenuContext = function(_config) {
     var view = new dhtmlXMenuObject();
     /*view._showPolygon = new_showPolygon;*/
     view.setOpenMode("web");
     view.setAutoHideMode(true);
     view.renderAsContextMenu();
     view.setOverflowHeight(20);
     
     this.config = _config;
     this._contextName = _config.name;
     this._contextView = null;
     this._items = [];
     this._customLogic = {};
     this.eventMenuHandlerConf = null;
     this.setView(view);
 };

 _pns.MenuContext.prototype =
 {
     eventNames : [ 'onHide', 'onClick', 'onCheckboxClick' ],
     getContextName : function() {
         return this._contextName;
     },
     setView : function(contextView) {
         this._contextView = contextView;
     },
     getView : function() {
         return this._contextView;
     },
     getViewTopId : function() {
         this.getView().topId;
     },
     getUserData : function(id) {
         var view = this.getView();
         return view ? view.getUserData(id, "data") : null;
     },
     detachEvent : function(id){
     	var view = this.getView();
       if(view.checkEvent(id)){
     	 view.detachEvent(id);
       }
     },
	setItemDisabled : function(id){
		this.getView().setItemDisabled(id);
	},
	setItemEnabled : function(id){
		this.getView().setItemEnabled(id);
	},
    setUserData : function(id, value) {
		var view = this.getView();
		if (view){
          view.setUserData(id, "data", value);
		}
         
     },
     clearItems : function() {
         this._items = [];
     },
     addItem : function(srcItems, destinationItems) {
         // We need to make sure we add the item in the right location
         var that = this;
         items = !_.isArray(srcItems) ? [ srcItems ] : srcItems;
         destinationItems = !destinationItems ? this._items : destinationItems;
         _.each(items, function(srcItem, srcIndex) {
             if (!srcItem){
                 return;
             }
             

             var srcItemName = srcItem.name;
             // A path of an item is the names of itself+ancestors seperated by slash ("/")
             // Example: "grandparetName/parentName/me" . If no path is present or you're part of children
             // collection
             // you'll be added to the current level
             var srcItemPath = srcItem.item ? srcItem.item : "";
             if (!srcItemPath){
                 var foundIndex = that._findItem(srcItem, destinationItems);
                 if (foundIndex !== -1){
                     // Replace the existing item
                     destinationItems[foundIndex] = srcItem;
                 }
                 else{
                     // Append this new item
                     destinationItems.push(srcItem);
                 }
             }
             else{
                 // Need to implement merge
             }

         });

         this._items = destinationItems;
     },
     /**
      * Make sure the menu item has the right properties
      */
     _augmentItem : function(item) {
         // Make sure we have action in the data object of the item.
         // If none exists copy the name of the item to be the action name
         var itemData = item.data = item.data || {};
         itemData.action = itemData.action || item.name;

     },
     _findItem : function(srcItem, destList) {
         var foundIdx = undefined;
         var notFound = _.every(destList, function(searchedItem, searchedIndex) {
             var res = searchedItem.name != srcItem.name;
             if (!res){
                 searchedIndex = searchedIndex;
             }
             return res;
         });
         return notFound ? -1 : foundIdx;
     },
     /**
      * Returns the menu items for the menu context
      *
      * @param {boolean}
      *            if true will return all the menu items recursively. otherwise will return the top most
      *            items.
      * @param {Array}
      *            The items to iterate over. If empty we will iterate over the topmost items.
      */
     getItems : function(deep, _items, pivotObject, cellNode, pos, id) {
         var retVal = [];
         var that = this;
         var _items = _items ? _items : this._items.concat(this.getCustomItems(pivotObject, cellNode, pos, id));

         retVal = !deep ? _items : retVal.concat((function(collection) {
             var retValDeep = [];
             _.each(collection, function(element) {
                 retValDeep.push(element);
                 if (element.children){
                     retValDeep = retValDeep.concat(that.getItems(deep, element.children));
                 }
             });
             return retValDeep;
         })(_items));
         return retVal;
     },
     getApplicableItems : function(itemName) {
         var items = this.getItems();
         return items;
     },
     getCoreItems : function() {
         return this._items;
     },
     getCoreItem : function(item) {
         var itemName = typeof item === 'string' ? item : item ? item.name : null;
         return this._items[itemName];
     },
     setCustomLogic : function(customLogic) {
         this._customLogic = customLogic;
     },
     getCustomLogic : function() {
         return this._customLogic;
     },
     getCustomItems : function(pivotObject, cellNode, pos, id) {
         var customLogic = this.getCustomLogic();
         var retVal = [];
         if (customLogic.items && _.isFunction(customLogic.items)) {
             retVal = customLogic.items.call(pivotObject, cellNode, pos, id);
         } else {
             retVal = customLogic ? customLogic.items : [];
         }
         return retVal;
     },
     getHooks: function(){
       	 var customLogic = this.getCustomLogic();
       	 return (customLogic ? (customLogic.hooks ? customLogic.hooks : null) : null);
       	 
     },
     getBlacklistItems : function() {
         var customLogic = this.getCustomLogic();
         return (customLogic ? (customLogic.blackListItems ? customLogic.blackListItems : []) : []);
     },
     getCustomAppliacbleLogic : function(pivotObject, cellNode, pos, id) {
         var customLogic = this.getCustomLogic();
         var that = this;
         var retVal =
                 customLogic && customLogic.getApplicableItems ? customLogic.getApplicableItems : function() {
             return that.getItems(null,null,pivotObject, cellNode, pos, id);
         };
         _.bind(retVal, this);
         return retVal;
     },
     hide : function() {
         if (this._contextView){
             this._contextView.hide();
         }
     },
     setEventHandlerConf : function(eventMenuHandlerConf) {
         this.eventMenuHandlerConf = eventMenuHandlerConf;
     },
     render : function(pivotObject, cellNode, pos, id) {
         var contextMenuView = this.getView();
         pivotlog('render cellNode=%o',cellNode);
         var appliacbleItemsFunc = this.getCustomAppliacbleLogic(pivotObject, cellNode, pos, id), appliacbleItems =
             appliacbleItemsFunc.call(this, pivotObject, cellNode, this.getCoreItems()), config =
             this.config;
         this._renderLevel(this.getViewTopId(), appliacbleItems, pivotObject, id);
         _.each(_.unique(this.eventNames), function(eventName) {
             var eventHandler = config[eventName];
             if (eventHandler){
                 contextMenuView.attachEvent(eventName, eventHandler);
             }
         });
         pivotObject._isShowingContextMenu = true;
         contextMenuView._showContextMenu(pos.x - 5, pos.y - 5);
     },
     _renderLevel : function(currMenuTopId, items, pivotObject, id) {
         var that = pivotObject;
         var item = this;
         var contextMenuView = this.getView();
         _.each(_.unique(items), function(currItem, menuItemIndex) {
             if (item.getBlacklistItems().indexOf(currItem.name) > -1){
                 return;
             }
             item._augmentItem(currItem);
             if (currItem.radio){
                 contextMenuView.addRadioButton('child', currMenuTopId, currItem.location, currItem.name,
                     currItem.label, currItem.radio.groupName, currItem.radio.checked,
                         currItem.enabled === false);

             }
             else if (currItem.checkbox){
                 contextMenuView.addCheckbox('child', currMenuTopId, currItem.location, currItem.name,
                     currItem.label, currItem.checkbox.checked, currItem.enabled === false);

             }
             else{
                 contextMenuView.addNewChild(currMenuTopId, currItem.location, currItem.name,
                         currItem.label || currItem.label, currItem.enabled === false);

             }
             if (currItem.data){
                 item.setUserData(currItem.name, id ? _.extend({
                     id : id
                 }, currItem.data) : currItem.data);
             }
             ;
             if (currItem.children && currItem.children){
                 item._renderLevel(currItem.name, currItem.children, that, id);
             }
         });

     },
     _generateHandlingFunction : function(origFunction, _ud) {
         var ud = _ud;
         var that = this;
         return function() {
             origFunction.apply(that, arguments);
             //that.cleanup();
             return true;
         };
     },
     cleanup : function(pivotObject) {
         this.clearItems();
         this.eventMenuHandlerConf = null;
         if (this._contextView){
             this.hide();
             this._contextView.detachAllEvents();
             this._contextView.clearAll();
         }
     }
 };
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Pivot CONTEXT MENU EVENT HANLDER  //////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
 _pns.eventHandlers =
     function(_pivotObject,action,itemName,deep,e) {
         this.pivotObject = _pivotObject;
         var pivotObject = this.pivotObject;
         this.cycleHandlers = function(ud, evtType) {
             var dispatchedActionName = ud.action;
             pivotObject._isShowingContextMenu = false;
             var list = Array.prototype.slice.call(arguments);
             _pivotObject.data.cube.backup_definition.expansionParam = _pivotObject._getExpandPivotParams(ud.id);
             if(ud.action == "expandToFacetLevel" || ud.action == "showHideTotal"){
                 _pivotObject.previousViewPort = undefined;     
             }

             var executedItem = _.find(this.getItems(true, null, _pivotObject, null, null, ud.id), function(item, itemIndex) {
             	if (!item.data) {
             		item.data = {action:item.name};
             	}
                 var itemAction = item.data.action;
                 if (item[evtType] && dispatchedActionName == itemAction){
                     // Remove the event type
                     list.splice(1, 1);
                     item[evtType].apply(this, list);
                     return true;
                 }
                 return false;
             });
            
             if (executedItem.clearSort){
                 // Make sure the sorts are cleared
                 pivotObject._setCubeDefinitionSortParams([]);
             }
             if (executedItem.repaint){
            	 this.cleanup();
                 pivotObject._blockUI();
                 pivotObject.setCubeViewDefinition();
             }
             return true;
         };
         this.contextMenuRequest = function(){
         	this.cleanup();
             pivotObject._setCubeDefinitionSortParams([]);
             pivotObject._blockUI();
             pivotObject.setCubeViewDefinition();
             return true;
         };
         this.cellMenuOnClick =
             function(id) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'click' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of cellMenuOnClick
         this.cellMenuOnCheckboxClick =
             function(action, state, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickCheck' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of cellMenuOnClick
         this.cellMenuOnRadioClick =
             function(group, idChecked, idClicked, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickRadio' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of cellMenuOnRadioClick
         this.dynNavHandler =
             function(ud) {
                 ud.id.column = ud.id.column.split(_pns.Constants.axisPathSeperator);
                 ud.id.row =
                     ud.id.row.split(_pns.Constants.axisPathSeperator).slice(1).join(
                         _pns.Constants.axisPathSeperator);

                 pivotObject.triggerEvent('dynamicNav',{
                     cellId:ud.id,
                     plusChildren:ud.plusChildren

                 });


             },
             // End of dynNavHandler
             this.facetMenuOnClick =
                 function(id) {
                     var ud = this.getUserData(id);
                     this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'click' ]
                         .concat(Array.prototype.slice.call(arguments)));
                     return true;
                 };
         // End of facetMenuOnClick
         this._debounceFacetCheckBoxClick = _.debounce(function(that, ud, args){	
         	that.eventMenuHandlerConf.contextMenuRequest.apply(that);
         		},800);// pivotObject.config.facetMenuClickDelay);
         this.facetMenuOnCheckboxClick =
             function(id, state, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickCheck' ].concat(Array.prototype.slice.call(arguments)));
                 this.detachEvent(this._contextView.eventId.onClick);
                 if(this.eventMenuHandlerConf){
                 	this.eventMenuHandlerConf._debounceFacetCheckBoxClick(this, ud, arguments);
                 }
                 
                 /*MDAP-2732 - When single scenario present on top/side and other facet is moved to the axis using context menu, 
                  * 		   should be hide scenario as it's single. To hide the scenario, we have to call load scenarios()*/
                 var viewDef = pivotObject._getCubeDefinition();
                 if(ud.action == 'viewFacet' && viewDef && viewDef.availableScenarios && viewDef.availableScenarios.length < 2 && pivotObject.isScenarioFacetVisible()){
                	 pivotObject.handleScenarios("loadScenarios", viewDef.availableScenarioIds,viewDef.availableScenarios);
	             }
                 
                 return true;
             };
         // End of facetMenuOnCheckboxClick
         this.facetMenuOnRadioClick =
             function(id, state, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickRadio' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of facetMenuOnRadioClick
         this.facetViewHandler = function(ud, id, state, zoneId, casState) {
             pivotObject.flipVisibleFacet(ud.facetId, !state, pivotObject._getFacetAxis(ud.facetId).index);
         };
         // End of facetViewHandler
         this.flipVisibleFacetLevel =
             function(ud, id, state, zoneId, casState) {
                 pivotObject.flipVisibleFacetLevel(ud.facetId, ud.facetLevelId, !state, pivotObject
                     ._getFacetAxis(ud.facetId).index,this);
             };
         // End of flipVisibleFacetLevel
         this.swapWithFacet = function(ud, id) {
             pivotObject._swapFacets(ud.axisIndex, ud.facetIndex, ud.swapToAxis, ud.swapToFacet);
         };
         // End of swapWithFacet
         this.expandToFacetLevel =
             function(ud, id) {
                 //var measuresAxisIdx = pivotObject.areMeasuresOnTop() ? 1 : 0;
                 //var mainNodeAxisPath = (ud.axis.index == measuresAxisIdx) ? ud.axisPath.slice(0, ud.axisPath.length - 1) : ud.axisPath;
                 var tweakedAxisPath = pivotObject.getTweakedAxisPath(ud);
                 var mainNodeAxisPath =(ud.axis.facets.length < tweakedAxisPath.length) ? tweakedAxisPath.slice(0, tweakedAxisPath.length - 1) : tweakedAxisPath;
                 pivotObject._getChildrenHierarchy(ud.axis.index, mainNodeAxisPath, ud.facet.id, ud.extraDepth);
                 pivotObject.updateFocusedCell(); //Make sure the focused cell as selected cell.
                 return true;
             };
         // End of expandToFacetLevel
         this.anchorFacetMember = function(ud, id) {
             pivotlog('anchorFacetMember selected with object %o', ud);
             pivotObject.anchorFacetMembers(ud);
         };
         // End of anchorFacetMember
         
         
         this.showHideTotal = function(ud, id) {
             pivotlog('showHideTotal selected with object %o', ud);
             
             var visibleFacet = pivotObject._getCubeDefinition().visibleFacets;
             for(var facet  in visibleFacet){
             	if(visibleFacet[facet].id == ud.id){
             		visibleFacet[facet].showRoot = !visibleFacet[facet].showRoot;
             		break;
             	}
             }
             

             for( var axisIndex = 0; axisIndex <2;axisIndex++){
            
             	var currAxis = axisIndex == 0 ? 'topAxis' : 'sideAxis'; 
             	
             	currAxis = pivotObject._getCubeDefinition()[currAxis];
             	currAxis = currAxis.facets;
             	for(var facet  in currAxis){
                 	if(currAxis[facet].id == ud.id){
                 		currAxis[facet].showRoot = !currAxis[facet].showRoot;
                 		break;
                 	}
                 }	
             }
             pivotObject._deleteAllSortParams();
             pivotObject._setPivotAxesRequest();
             
         };                
         
         this.swapFacetAxisHandler =
             function(ud, id) {
                 var axis = pivotObject.data.getAxisFromIndex(ud.axisIndex);
                 var axisId = ud.axisIndex;
                 pivotObject.data.getAxisNameFromIndex();
                 var actualFacetIndex = ud.facetIndex;
                 var facetIndex = axis.getFacetIndexFromId(ud.facetId);
                 var axisFacet = axis.facets[actualFacetIndex];
                 var section = ud.section;
                 if (typeof section == "object"){
                     section = section.toArray();
                 }
                 if (axisFacet){
                     var viewDef = pivotObject._getCubeDefinition();
                     var axes = [ "sideAxis", "topAxis" ];

                     var facet = axisFacet.facet;
                     if (!facet){
                         facet = viewDef[axes[axisId]].facets[facetIndex];
                     }

                     var facetId = (facet && facet.id) || ud.facetIndex;

                     pivotlog("ERROR - " + id + " action for cell row=" + ud.row + " column=" + ud.column +
                         "  section=" + ud.section + " axisId=" + axisId + " facetId=" + facetId);

                     var movingFacet = viewDef[axes[axisId]].facets.splice(facetIndex, 1);
                     viewDef[axes[1 - axisId]].facets.push(movingFacet[0]);
                     // Clear sort
                     pivotObject.clearSortHandler();
                     /*MDAP-2732 - When single scenario present on top/side and other facet is moved to the axis using context menu, 
                      * 		   should be hide scenario as it's single. To hide the scenario, we have to call load scenarios()*/
                     if(viewDef && viewDef.availableScenarios && viewDef.availableScenarios.length < 2 && pivotObject.isScenarioFacetVisible()){
                    	 pivotObject.handleScenarios("loadScenarios", viewDef.availableScenarioIds,viewDef.availableScenarios);
    	             }
                 }
                 
             };
         // End of swapFacetAxisHandler
         this.measureMenuOnClick =
             function(id) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'click' ]
                     .concat(Array.prototype.slice.call(arguments)));
             };
         // End of measureMenuOnClick
         this.measureMenuOnCheckboxClick =
             function(ud, id, state, zoneId, casState) {
                 var ud = this.getUserData(ud);
                 pivotObject.prepareSubmeasureExpandCache();
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickCheck' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of measureMenuOnCheckboxClick
         this.measureMenuOnRadioClick =
             function(id, state, zoneId, casState) {
                 var ud = this.getUserData(ud);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'radioClick' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of measureViewMenuOnRadioClick
         this.measureViewClick = function(ud, id, state, zoneId, casState) {
             pivotObject.flipVisibleMeasure(ud.measure, !state);
         };
         // End of measureViewMenuOnRadioClick
         this.measureMenuMoveOnClick = function(ud, id) {
             pivotObject.switchMeasuresAxis();
         };
         // End of measureMenuMoveOnClick
         this.selectionMenuOnClick =
             function(id) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'click' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of selectionMenuOnClick
         this.selectionMenuOnCheckboxClick =
             function(id, state, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickCheck' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of selectionMenuOnCheckboxClick
         this.selectionMenuOnRadioClick =
             function(id, state, zoneId, casState) {
                 var ud = this.getUserData(id);
                 this.eventMenuHandlerConf.cycleHandlers.apply(this, [ ud, 'clickRadio' ]
                     .concat(Array.prototype.slice.call(arguments)));
                 return true;
             };
         // End of selectionMenuOnRadioClick

     };
 
////////////////////////////////////////////////////////////////
//////////// Pivot Common Request structures     ///////////////
///////////////////////////////////////////////////////////////


    jda.pivot.request = {
        _init : function(params,config) {
            this.jsonrpc = '2.0';
            this.method = 'abstractMethod';
            this.config = config;

            this.params = this._initParamPayload.call(this, params);
            this.pollingTimeout = 30000;
            this.pollingTimeoutServerDelta = 1000;
            this.id = this._generateCommandId();
        },

        getCallBack : function() {
            return this.config&&this.config.callback;
        },
        _initParamPayload : function(params) {
            params=params||{};
            return params;
        },
        _generateCommandId : function() {
        	// using secure Random numbers which are supported on latest browsers
        	var arrayTemp= new Uint32Array(1); 
        	var crypto= window.crypto || window.msCrypto; 
        	if(crypto)
        		return crypto.getRandomValues(arrayTemp)[0];
        	// older browser versions we are not supporting from 2017.1 
        	//else // if using older version continuing insecure random for now. this has to be cleaned up later
        		//return new Date().getTime() +""+ (Math.floor(Math.random() * 100));
        },

        _getPayload : function() {
            var payload = {
                "jsonrpc" : this.jsonrpc,
                "id" : this.id,
                "params" : this.params,
                "pollingTimeout" : this.pollingTimeout,
                "pollingTimeoutServerDelta" : this.pollingTimeoutServerDelta
            };

            if (this['@class']){
                payload['@class'] = this['@class'];
            }

            return payload;
        }
    };

///////////////////////////////////////////////////////////////////////////////////////////////////////
////////////// Here is the place to add new  pivot request  ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
    
    jda.pivot.updateCfRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.UpdateCfRuleRequest";
        }
    }, jda.pivot.request);

    jda.pivot.updateCommentRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.UpdateCommentRequest";
        }
    }, jda.pivot.request);

    jda.pivot.getGraphDataRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.GetGraphDataRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);


    jda.pivot.saveGraphSettingRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.SaveGraphSettingRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);

    jda.pivot.exportToExcelRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.request.ExportToExcelRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);
    
    jda.pivot.importFromExcelRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.request.ImportFromExcelRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);
    
    jda.pivot.cubeRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.PivotViewRequest";
        }
    }, jda.pivot.request);

    jda.pivot.updateFactsRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.UpdateFactsRequest";

        },
        _initParamPayload : function(config) {
            return config;
        }

    }, jda.pivot.request);
    jda.pivot.getCellDetailsRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.GetCellDetailsRequest";
        }
    }, jda.pivot.request);
    jda.pivot.expandPivotRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.ExpandPivotRequest";
        }
    }, jda.pivot.request);

    jda.pivot.setPivotAxes = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+'protocol.SetPivotAxesRequest';
        }
    }, jda.pivot.request);

    jda.pivot.getChildrenHierarchyRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+'protocol.GetChildrenRequest';
        }
    }, jda.pivot.request);

    jda.pivot.getGenericRequest = jdapivot.proto({
        _init : function(params) {
            if (this.params.actionParameters){
                this['@class'] = this.params.actionParameters['@class'];
                delete this.params.actionParameters['@class'];
            }

        }
    }, jda.pivot.request);

    jda.pivot.getSegmentDataRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+'protocol.GetSegmentDataRequest';
        }
    }, jda.pivot.request);
    
    jda.pivot.pasteCopiedContentRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.PasteCopiedContentRequest";
        }
    }, jda.pivot.request);

    jda.pivot.getScenariosRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.GetScenariosRequest";
        }
    }, jda.pivot.request);

    jda.pivot.getScenarioStatusRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.GetScenarioStatusRequest";
        }
    }, jda.pivot.request);

    jda.pivot.addScenarioRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.AddScenarioRequest";
        }
    }, jda.pivot.request);

    jda.pivot.setScenarioRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.SetScenarioRequest";
        }
    }, jda.pivot.request);

    jda.pivot.setScenariosRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.SetScenariosRequest";
        }
    }, jda.pivot.request);

    jda.pivot.deleteScenarioRequest = jdapivot.proto({
        _init : function(params) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.DeleteScenarioRequest";
        }
    }, jda.pivot.request);
    
    jda.pivot.businessGraphRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.request.BusinessGraphRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);

    
    jda.pivot.dataFilterRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.request.DataFilterRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);
    
    jda.pivot.measureFilterRequest = jdapivot.proto({
        _init : function(config) {
            this['@class'] = _pns.getPivotPackagePrefix()+"protocol.request.MeasureFilterRequest";
        },
        _initParamPayload : function(config) {
            return config;
        }
    }, jda.pivot.request);
    

////////////////////////////////////////////////////////
/// Header class ////////////////////////////////////////
/////////////////////////////////////////////////////////
    /**
     * @constructor
     * @param {string}
     *            id the unique Id of this column header. Usually it will be it's axis path
     * @param {boolean}
     *            groupValues whether to group same header columns together.
     * @param {stirng[]}
     *            axisPath the array representing the axis path
     */
    _pns.header = function(id, labels, groupValues, axisPath, isMeasure, dataNodes) {
        isMeasure = isMeasure ? true : false;
        this.type = "header";
        this.width = 50;
        this.id = id;
        this.isMeasure = isMeasure;
        this.header = labels;
        this.levels = [];
        this.adjust = false;
        this.groupValues = groupValues;
        this.axisPath = axisPath;
        this.dataNodes = dataNodes;

    };
    /**
     * @param {number}
     *            headerIndex the index of the header with top axis. It's also the index of the facet within the axis.
     * @returns {number} The level of the header within it's hierarchy. 0 means root level.
     */
    _pns.header.prototype.getHeaderLevel = function(headerIndex) {
        var level = this.levels[headerIndex];
        return level ? level : 0;
    };
// //////////////////////////////////////////////////////////////////////////
// // Attribute Header Class  ////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////
    /**
     * @constructor
     * @param {string}
     *          id the unique Id of this column header
     * @param {string}
     *          labels- header label name
     * @param {boolean}
     *          groupValues whether to group same header columns together
     * @param {string}
     *          name -attribute name
     * @param {string}
     *          datatype - attribute datatype
     */
    _pns.attributeHeader = function(id,labels,groupValues,name,datatype){

        this.id=id;
        this.width=50;
        this.header=labels;
        this.name =name;
        this.datatype=datatype;
        this.adjust=false;
        this.groupValues=groupValues;

    };
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////// Facet data structures
// //////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /***********************************************************************************************************************
     * Represents the facet node for a member in a facet
     *
     * @param {string}
     *            id the id of the node. Same as the member id
     * @param {string}
     *            name the label of the facet node
     * @param {boolean}
     *            hasFacetChildren true if that node has children
     * @constructor
     * @this {_pns.facetNode}
     */
    _pns.facetNode = function(id, name, hasFacetChildren, level, axisPath, parentNode) {
        /**
         * the unique id of this node within it's parent
         *
         * @type {string}
         */
        this.id = id;
        /**
         * the display name of this node
         *
         * @type {string}
         */
        this.name = name;
        /*if (!axisPath){
            // Should not happen
        }*/
        this.axisPath = axisPath;
        /**
         * the children of this facet node within it's facet
         *
         * @type {Object.<Array.<string>,_pns.facetNode>}
         */
        this.childrenMap = {};

        this.level = level ? level : 0;
        this.hasFacetChildren = hasFacetChildren;
        this.isExpanded = false;
        this.parentNode = parentNode;
    };

    /**
     * Represents a facet within the axis
     *
     * @param {number}
     *            id the unique id of the facet
     * @param {string}
     *            the display name of the facet
     * @param {Array.
 *            <Object>}
     */
    _pns.facet =
        function(pivot, id, facetNameID, facetLabel, visibleLevels, facetLevels, rootLabel, showRoot, visibleIndex, dummy,
                 UIAttributes) {
            /**
             * @type {integer} the id of this facet
             */
            this.id = id;
            this.rootId = _pns.Constants.rootId;
            
            this.visibleIndex = visibleIndex;
            this.dummy = dummy;
            
            if(showRoot!=undefined)
              	this.showRoot = showRoot;
              else
              { // root node is not configured, so bring back old behariour , only inner facets  show total but border facet do not
              	if(visibleIndex!= -1  )
              		this.showRoot=true;
              	else
              		this.showRoot=false;
              }
            
            /**
             * @type {integer} display name for this facet
             */
            this.name = facetNameID;
            /**
             * @type {Array.<Object>} the facets levels for this facet
             */
            this.visibleLevels = visibleLevels;
            this.facetLevels = facetLevels;
            this.visible = false;
            this.visibleAttrs = null;
            this.availableAttrs = null;
            
            //update showRoot UI attribute to showRoot set above.
            if(UIAttributes && 'showRoot' in UIAttributes )
            {	
            	UIAttributes['showRoot'] = { 'showRoot': this.showRoot };
            }
            this.UIAttributes = UIAttributes;

            /**
             * @type {Object.<FacetPath,>} display name for this axis
             */
            this._parentFacetNodesMap = {};
            
            this.rootLabel = rootLabel;
            
            // Resolve the root label if it is one of the predefined values.
        	// Server side:
            // PivotConstants.FACET_ROOT_LABEL_TOTAL = "_Total_"
            // PivotConstants.FACET_ROOT_LABEL_ALL = "_All_"
            // PivotConstants.FACET_ROOT_LABEL_ALL_FACET = "_All_Facet_"
        	if(this.rootLabel == null || this.rootLabel == '_Total_'){
        		this.rootLabel = (pivot.getLocaleString('TotalMemberName') || 'Total');
        	}
        	else if(this.rootLabel == '_All_'){
        		this.rootLabel = (pivot.getLocaleString('All') || 'All');
        	}
        	else if(this.rootLabel == '_All_Facet_'){
        		var displayName =  (this.UIAttributes && this.UIAttributes.displayName) || this.name;
        		this.rootLabel = (pivot.getLocaleString('All') || 'All') + ' ' + displayName;
        	}
        	

        };
    _pns.facet.prototype.getIDName = function() {
        return this.name;
    };
    _pns.facet.prototype.getDisplayName = function() {
        return (this.UIAttributes && this.UIAttributes.displayName) || this.getIDName();
    };
    // Returns available attribute on available levels
    _pns.facet.prototype.getAvailableAttrs =function(){
        // if avaialble attrs available then no need to do for loop to get all available attrs
        if(this.availableAttrs){
            return this.availableAttrs;
        }

        var attrList =[];
        if(this.visibleLevels){
            // Iterate through all visible levels to identify the visible attribute available or not
            // if it available then return those attribute information
            for(var i=0; i< this.visibleLevels.length; i++){
                var currentLevel = this.visibleLevels[i];
                if(currentLevel.availbleAttrs && currentLevel.availbleAttrs.length > 0){
                    // Iterate through all visible attribute
                    for(var j=0; j<currentLevel.availbleAttrs.length; j++){
                        // get the attribute for current level
                        var currentAttr = currentLevel.availbleAttrs[j];
                        // push attribute information attribute list
                        attrList.push(currentAttr);
                    }
                }
            }

            this.availableAttrs =attrList;
        }
        return attrList;
    };

    // Returns visible attribute list on available levels
    _pns.facet.prototype.getVisibleAttrs =function(){
        // if visible attrs available then no need to do for loop to get all visible attrs
        if(this.visibleAttrs){
            return this.visibleAttrs;
        }

        var attrList =[];
        if(this.visibleLevels){
            // Iterate through all visible levels to collect the visible attributes. Note that
            // an attribute (as identified by its ID) may appear in multiple levels, such as
            // Name or Description. In this case, we consider them as the single attribute
            // to make sure there is only one column for it appearing in the pivot.
            for(var i=0; i< this.visibleLevels.length; i++){
                var currentLevel = this.visibleLevels[i];

                if(currentLevel.visibleAttrs && currentLevel.visibleAttrs.length > 0){
                    // Iterate through all visible attribute
                    for(var j=0; j<currentLevel.visibleAttrs.length; j++){
                        // get the attribute for current level
                        var currentAttr = currentLevel.visibleAttrs[j];
                        // check if an attribute with the same ID has already
                        // been collected. If not, add it to the list.
                        var found = false;
                        for(var x = 0; x < attrList.length; x ++) {
                            if(attrList[x].id == currentAttr.id){
                                found = true;
                                break;
                            }
                        }
                        if(!found) {
                            attrList.push(currentAttr);
                        }
                    }

                }


            }

            this.visibleAttrs =attrList;
        }

        return attrList;
    };
  /**
   * Get the available filter
   */
    _pns.facet.prototype.getAvailableFilters = function(){
    	var attr = this.getVisibleAttrs();
    	var filter = [];
    	if(attr && attr.length >0){
    		
    		   for(var i=0; i< this.attr.length; i++){
    		     
    			   if(attr[i].hasFilter){
    				   filter.push(attr[i]);
    			   }
    			   
    		   }
    		
    	}
    	
    	return filter;
    }; 
// Create a data node containing information about the hierarchy of the facet member
    _pns.facet.prototype.createFacetParentNode = function(axisPath) {
        // Let's creat
        var axisPathStr = _pns.utility.getAxisPathIdNoMeasureStr(this.truncateAxisPathToFacet(axisPath));

        var thisFacetPath = axisPath[this.index];
        var facetNewRootId = thisFacetPath[thisFacetPath.length - 1];
        var parentLevel = 0;

        var parentNodeId = this.rootId;
        var parentNodeName = this.rootLabel;
        var hasChildren = true;
        if (facetNewRootId != this.rootId && this.UIAttributes.Filters){
            parentNodeId = facetNewRootId;
            parentNodeName = this.UIAttributes.Filters.filterName;
            hasChildren = false;
            parentLevel = thisFacetPath.length - 1;
        }
        newNode = new _pns.facetNode(parentNodeId, parentNodeName, hasChildren, parentLevel, axisPath);

        this._parentFacetNodesMap[axisPathStr] = newNode;
        return newNode;
    };

    _pns.facet.prototype.isDummy = function() {
        return this.dummy;
    };

    _pns.facet.prototype.getFilters = function() {
        return this.UIAttributes&&this.UIAttributes.Filters;
    };

    _pns.facet.prototype.getEntryFullLabel = function(axis, axisPath) {
        // Let's create
        var axisPathStr = "";
        var currNode = null;
        var hierarchyElements = [];
        while ((currNode = this._parentFacetNodesMap[axisPath]) === undefined){

        }
        return currNode;
    };

    _pns.facet.prototype.getFacetParentNode = function(axis, axisPath) {
        var truncatedPath = this.truncateAxisPathToFacet(axisPath);
        var facetRootNode = this._parentFacetNodesMap[_pns.utility.getAxisPathIdNoMeasureStr(truncatedPath)];
        return facetRootNode;
    };
    _pns.facet.prototype.getFacetLevelIndexFromId = function(facetLevelId) {
        var retVal = -1;
        for ( var i = 0, j = this.facetLevels.length; i < j; i++){
            var facetLevel = this.facetLevels[i];
            if (facetLevel.attributeId == facetLevelId){
                retVal = i;
                break;
            }
        }
        return retVal;
    };
    _pns.facet.prototype.removeFacetParentNode = function(truncatedAxisPathStr) {
        var facetRootNode = this._parentFacetNodesMap[truncatedAxisPathStr];
        delete this._parentFacetNodesMap[truncatedAxisPathStr];
        return facetRootNode;
    };

    _pns.facet.prototype.truncateAxisPathToFacet = function(axisPath) {
        if (!axisPath)
            return [ [ -1 ] ];
        axisPath = axisPath.facetPaths ? axisPath.facetPaths : axisPath;
        var retVal = [];
        for ( var i = 0; i < this.index; i++){
            retVal.push(axisPath[i]);
        }
        return retVal;
    };
    _pns.facet.prototype.getLevelFacetStateInFacet = function(levelId) {
        for ( var index = 0; index < this.visibleLevels.length; index++){
            if (this.visibleLevels[index].attributeId == levelId){
                if (this.visibleLevels.length == 1){
                    return {
                        last : true
                    };
                }
                else{
                    return {
                        last : false
                    };
                }
            }
        }
        return null;
    };
    _pns.facet.prototype.isVisible = function() {
        return this.visible;
    };
    _pns.facet.prototype.getRootLabel = function() {
    	return this.rootLabel;
    };

    ///////////////////////////////////////////////////////////////////////////////////////
    //////////////////////  HORIZONTAL SCROLL SEPERATOR AREA  structure ///////////////////
    //////////////////////////////////////////////////////////////////////////////////////
    /**
     * Area of a pivot
     * @class
     *
     * @param {Object} config
     * @param {String} {config.id=autogenerated} The unique ID of the area. Should be sideFacets|attributes|data
     * @param {String} {config.startIdx=-1}     The index of the first(leftmost) column of the area
     * @param {String} {config.endIdx=-1}         The index of the last(rihgtmost) column of the area
     * @param {String} {config.scrollable=false} The scroll bar creation policy. Possible values: auto|true|false
     * @param {String} {config.initialWidth=}     The initial width of the area in pixels.
     * @returns {Object}
     */
    _pns.area = function (config) {
        _.extend(this, {
            heightOffset:3, // Make sure we don't cause the left border of this scroll to go out of bounds
            scope : this,
            startIdx: -1,
            scrollable: false,
            width: 0,
            viewportWidth: 0,
            scrollHeight:14,
            x_scroll:null,
            scrollIdx:0,
            id: _.uniqueId('areaId-')
        },config || {});
    };

    /***
     * Get the starting column index (0-based)
     */
    _pns.area.prototype.getStartIdx = function()
    {
        return  this.startIdx;
    };

    _pns.area.prototype.setStartIdx = function(idx)
    {
        this.startIdx=idx;
        return this;
    };

    _pns.area.prototype.setEndIdx = function(idx)
    {
        this.endIdx=idx;
    };

    _pns.area.prototype.getEndIdx = function()
    {
        return  this.endIdx;
    };

    _pns.area.prototype.setScrollIdx = function(idx)
    {
        this.scrollIdx=idx;
    };

    _pns.area.prototype.getScrollIdx = function()
    {
        return  this.scrollIdx;
    };


    /**
     * Sets the width of the area in pixels
     * @param width
     * @returns {int}
     */
    _pns.area.prototype.setScrollWidth = function(width)
    {
        this.width=width;
        if (this.x_scroll != null)
        	this.x_scroll.sizeTo(this.width);
        return this;
    };

    _pns.area.prototype.getScrollwidth = function()
    {
        return this.width;
    };

    _pns.area.prototype.setViewportWidth = function(viewportWidth)
    {
        this.viewportWidth=viewportWidth;
        if (this.x_scroll != null)
        	this.x_scroll.define("scrollWidth", viewportWidth);
        return this;
    };

    _pns.area.prototype.getViewportWidth = function()
    {
        return this.viewportWidth;
    };

    _pns.area.prototype.getId = function()
    {
        return this.id;
    };

    _pns.area.prototype.getScroll = function()
    {
        return this.x_scroll;
    };

    _pns.area.prototype.getScrollLeft = function()
    {
        return this.x_scroll._viewobj.scrollLeft;
    };

    _pns.area.prototype.isDataArea = function(){
        return this.getId()==='dataArea';
    };

    _pns.area.prototype.addToContainer = function(pivotHScrollContainer){
    	this.areaContainer = $("<div>", {
    		"class": 'cls-'+this.getId()+' subScrollX'
    		});
    	if(this.getId() === "attributesArea"){
            $(pivotHScrollContainer).find(".cls-sideFacets").after(this.areaContainer);
        }else{
            $(pivotHScrollContainer).append(this.areaContainer);
        }
        return this;
    };

    _pns.area.prototype.scrollTo = function(x){
        return this.getScroll().scrollTo(x);
    };

    /**
     * Sets the horizontal scroll bar for this area
     * @param {number} dataviewWidth the total scroll area
     * @param {number} size the actual size of the scroll on the screen
     * @returns {_pns.area} This object
     */
    _pns.area.prototype.setScroll = function(dataviewWidth,size)
    {
        this.dataviewWidth = dataviewWidth;
        this.size = size;
        var pivotObj=this.scope;
        var that=this;
        this.addToContainer(pivotObj._footer.nextSibling);
        this.x_scroll = new jdapivot.ui.vscroll({
            container : this.areaContainer[0],
            scrollWidth : this.dataviewWidth
        });

        jdapivot.eventRemoveType('scroll', this.x_scroll._viewobj);
        $(this.x_scroll._viewobj).unbind('scroll');
        dhtmlx.event(this.x_scroll._viewobj, "mousedown", function(e) {
            if (pivotObj.isEditing() && !pivotObj.submitEdit()){
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                if (this.isDataArea()) {
                    pivotObj._lastScrollX = this.x_scroll._viewobj.scrollLeft;
                    setTimeout(function() {
                        this.x_scroll._viewobj.scrollLeft = pivotObj._lastScrollX;
                        delete pivotObj._lastScrollX;
                    }, 100);
                }
                return false;
            }
        }, this);
        // if (this.isDataArea()) {
        // this.x_scroll.attachEvent("onscroll", dhx.bind(this.scope._onscroll_x, this.scope));
        dhtmlx.event(this.x_scroll._viewobj, "scroll", function(e) {
            if (pivotObj.isEditing() && !pivotObj.submitEdit()){
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                e.stopPropagation ? e.stopPropagation() : e.returnValue = false;
                return;
            }

            pivotObj._onscroll_x.call(pivotObj, that.getScrollLeft(),that.getScrollIdx());
        }, pivotObj);
        //};
        this.x_scroll.sizeTo =
            function(value) {
                /*if (!this._settings.scrollSize){
                 this._viewobj.style.display = 'none';
                 }
                 else*/{
                    this._viewobj.style.width = value + "px";
                    this._viewobj.style.height = that.scope._scrollSizeX + 1 + "px";
                }
            };
        return this;
    };


    _pns.area.prototype.onScroll = function(){
        if (this.isDataArea()) {
            this.scope._settings.scrollPos = this.x_scroll._viewobj.scrollLeft;
            this.scope.callEvent("onScroll", [ this.scope._settings.scrollPos ]);
        }
    };
    /**********
     * End of area class
     */

    /////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////// AXIS PATH structure /////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * Object representation of the axis path.
     *
     * @class
     * @param {string|array}
     *            fromAxisPathStr The axis path string/array representation. With or without the measure
     * @param {string}
     *            [measureId] if supplied the previous param should not include the measure as part of the string
     */
    _pns.axisPath = function(fromAxisPath, measureId) {
        if (!fromAxisPath)
            return;
        /* @public */
        this.facetPaths = Array.isArray(fromAxisPath) ? fromAxisPath.slice(0) : new jdapivot.toArray();
        /* @public */
        this.measure = measureId;

        var fromAxisPathStrNoMeasure = fromAxisPath;
        // Check if the string axis path has the measure ID
        if (typeof fromAxisPath === 'string'){
            var axisPathParts = fromAxisPathStrNoMeasure.split(_pns.Constants.measurePathSeperator);
            if (axisPathParts.length > 1){
                this.measure = axisPathParts[1];
                fromAxisPathStrNoMeasure = axisPathParts[0];
            }

            var facetsStrs = fromAxisPathStrNoMeasure.split(_pns.Constants.axisPathSeperator);
            for ( var i = 0, j = facetsStrs.length; i < j; i++){
                var facetStr = facetsStrs[i];
                var currFacetPath = jdapivot.toArray(facetStr.split(_pns.Constants.facetPathSeperator));
                this.facetPaths.push(currFacetPath);
            }

        }

    };

    _pns.axisPath.prototype.getMeasureId = function() {
        return this.measure;
    };

    _pns.axisPath.prototype.getPathArray = function() {
        return this.facetPaths;
    };

    _pns.axisPath.prototype.getComparisonBitmap = function(otherAxisPath) {
        var retVal = new jdapivot.toArray();
        if (_otherAxisPath === undefined)
            return retVal;
        var smallestArrayLength = Math.min(otherAxisPath.facetPaths.length, this.facetPaths.length);
        for ( var i = 0; i < smallestArrayLength; i++){
            retVal.push(this.facetPaths[i].equals(otherAxisPath.facetPaths[i]));
        }
        return retVal;
    };
    /**
     * Compares if two axis paths have the same parent facets members
     *
     * @param {string|_pns.axisPath}
     *            _otherAxisPath the axis path to compare to
     * @param {number}
     *            level the level down to which we shall compare the axespaths //TODO
     */
    _pns.axisPath.prototype.sameParentFacetMembers =
        function(_otherAxisPath, level) {
            if (_otherAxisPath === undefined)
                return false;
            var otherAxisPathObj = _otherAxisPath;
            if (typeof otherAxisPathObj === 'string'){
                otherAxisPathObj = new _pns.axisPath(_otherAxisPath);
            }
            // xor
            if ((this.facetPaths === undefined) ? (this.otherAxisPathObj !== undefined) : (this.otherAxisPathObj === undefined))
                return false;
            if (!level){
                level = _otherAxisPath.length - 1;
            }

        };

    _pns.axisPath.getMeasureIdFromAxisPathStr = function(axisPathStr) {
        var axisPathParts = axisPathStr.split(_pns.Constants.measurePathSeperator);
        return axisPathParts.length > 1 ? axisPathParts[axisPathParts.length - 1] : null;
    };

    _pns.axisPath.getCondensedAxisPath = function(axisPath, hasMeasures) {
        if (!axisPath)
            return [];
        axisPath = axisPath.facetPaths ? axisPath.facetPaths : axisPath;
        var retVal = [];
        var length = hasMeasures ? axisPath.length - 1 : axisPath.length;

        for ( var i = 1; i < length; i++){
            var facetPath = axisPath[i];
            facetPath = facetPath.length ? facetPath.slice(1) : [];
            retVal.push(facetPath);
        }
        return retVal;
    };

    /**
     * Creates an instance of of an pivot axis.
     *
     * @constructor
     * @public
     * @this {_pns.axis}
     * @param {object}
     *            config to the object.
     */
    _pns.axis =
        function(pivot, config) {
            /**
             *
             * @public
             * @type {integer} The index for this axis
             */
            this.index = config.index;
            /**
             * @public
             * @type {string} display name for this axis
             */
            this.label = config.label;
            /**
             * type {Array.<_pns.facet>}
             */
            this.facets = [];
            
            this.filters=[];
            
            this.visibleFacetsIdx = [];

            this.anchoredFacetsIdx = [];

            this.anchoredFacetsMemeberId = [];

            this._hasMeasures = config.hasMeasures;

            this.rootPathStr = null;

            this.measuresMap = {};

            var visibleFacets = config.visibleFacets;
            var i = 0;
            var confFacet;
            var currFacet;
            var showRootVisibleIdx=false;

            for (i = 0; i < config.facets.length; i++){
                confFacet = config.facets[i];
                
                var showRoot = confFacet.showRoot;
                //default config for show root
                if((pivot.config.enabledRootNodeConfig == false) && (confFacet.UIAttributes.visible == true)  && (showRootVisibleIdx == false) ){
                	
                	showRootVisibleIdx =true;
                	showRoot=false;
                }
                
                this.facets.push(new _pns.facet(pivot, confFacet.id, confFacet.getIDName(), confFacet.getDisplayName(),
                    confFacet.visibleLevels, confFacet.facetLevels, confFacet.rootLabel, showRoot, 
                    confFacet.visibleIndex, confFacet.dummy, confFacet.UIAttributes, confFacet));

                // Make sure we have a bogus root node
                currFacet = this.facets[i];
                currFacet.index = i;

                var found = false;
                for ( var iVisibleFacet = 0; iVisibleFacet < visibleFacets.length; iVisibleFacet++){
                    if (currFacet.id == visibleFacets[iVisibleFacet].id){
                        currFacet.visible = true;
                        found = true;
                        this.visibleFacetsIdx.push(i);
                        break;
                    }
                }
                if (!found){
                    currFacet.visible = false;
                }

                if (currFacet.anchor !== undefined){
                    anchoredFacetsIdx.push(i);
                    anchoredFacetsMemeberId.push(currFacet.anchor);
                }

            }
            for (i = 0; i < config.facets.length; i++){
                currFacet = this.facets[i];
                this.rootPath = this.getRootPath(config.facets.length);
                currFacet.createFacetParentNode(this.rootPath);
            }
        };

    _pns.axis.prototype.hasMeasures = function() {
        return this._hasMeasures;
    };

    _pns.axis.prototype.getVisibleFacets = function() {
        var retVal = [];
        for ( var i = 0; i < this.visibleFacetsIdx.length; i++){
            retVal.push(this.facets[this.visibleFacetsIdx[i]]);
        }
        return retVal;
    };
    
    _pns.axis.prototype.getAllFilters= function() {
    	var allVisibleAttr = this.getAvailableAttributes();
    	    	
    	if(allVisibleAttr && allVisibleAttr.length > 0){
    		for(var i=0; i<allVisibleAttr.length; i++){
    			 if(allVisibleAttr[i].hasFilter){
    				 this.filters.push(allVisibleAttr[i]);
    			 }
    		}
    	}
    	
    	return this.filters;
    	
    };
    _pns.axis.prototype.getVisibleAttributes= function() {

        var visibleFacet = this.getVisibleFacets();
        var allVisibleAttributes = [];
        for(var i=0; i<visibleFacet.length; i++){

            allVisibleAttributes = allVisibleAttributes.concat(visibleFacet[i].getVisibleAttrs());
        }

        return allVisibleAttributes;

    };

    _pns.axis.prototype.getAvailableAttributes= function() {

        var visibleFacet = this.getVisibleFacets();
        var availableAttributes = [];
        for(var i=0; i<visibleFacet.length; i++){

        	availableAttributes = availableAttributes.concat(visibleFacet[i].getAvailableAttrs());
        }

        return availableAttributes;

    };
    _pns.axis.prototype.getVisibleAttributeCount = function() {
        return this.getVisibleAttributes().length;
    };

    _pns.axis.prototype.getVisibleFacetId = function(facetIndex) {
        return this.visibleFacetsIdx.indexOf(facetIndex);
    };

    _pns.axis.prototype.getFacets = function() {
        return this.facets;
    };
    _pns.axis.prototype.hasFilteredLevel =function(facet){

        if (facet.UIAttributes && facet.UIAttributes.Filters){
            return true;
        }

        return false;
    };
    _pns.axis.prototype.addFilterLevelName =function(facetId,facetObj){
        var facet = this.facets[facetId];
        var facetLabelObj=[];
        if(this.hasFilteredLevel(facet)){
            facetLabelObj.push(facet.UIAttributes.Filters.memberName);
            facetObj.facetLevelLabelObj=facetLabelObj;
        }

        return facetObj;

    };
    _pns.axis.prototype.createMeasuresParentNode = function(axisPath, parentNode) {

        var axisPathStr = this.getAxisPathIdStr(axisPath);

        this.measuresMap[axisPathStr] = parentNode;
        return newNode;
    };

    _pns.axis.prototype.getMeasuresParentNode = function(axisPath) {

        var facetRootNode = this.measuresMap[_pns.utility.getAxisPathIdNoMeasureStr(axisPath)];
        return facetRootNode;
    };
    _pns.axis.prototype.removeMeasuresParentNode = function(axisPath) {

        // var facetRootNode = this.measuresMap.remove(axisPath);
        var facetRootNode = this.measuresMap[axisPath];
        delete this.measuresMap[axisPath];
        return facetRootNode;
    };

    _pns.axis.prototype.isAxisRoot = function(axisPath, facetId) {
        if (axisPath.length != this.facets.length)
            return false;
        for ( var i = 0, j = this.facets.length; i < j; i++){
            var facet = this.facets[i];
            var facetPath = axisPath[i];
            if (facetPath.length != 1)
                return false;
            if (facetPath[0] != facet.rootId)
                return false;
            if(facet.showRoot == true && facet.id == facetId)
                return false;
        }
        return true;
    };
    _pns.axis.prototype.getRootPath = function(numOfFacets) {
        var retValObj = [];
        for ( var i = 0; i < numOfFacets; i++){
            var facetPath = [ _pns.Constants.rootId ];
            if (this.facets[i].UIAttributes && this.facets[i].UIAttributes.Filters){
                facetPath = this.facets[i].UIAttributes.Filters.facetPath;
            }
            retValObj.push(facetPath);
        }
        return retValObj;
    };

    _pns.axis.prototype.isSideAxis = function() {
        return this.index === 0;
    };

    _pns.axis.prototype.getFacetIndexFromId = function(facetId) {
        var retVal = -1;
        if (facetId == _pns.Constants.measureIdPrefix)
            return this.facets.length - 1;
        for ( var i = 0, j = this.facets.length; i < j; i++){
            var facet = this.facets[i];
            if (facet.id == facetId){
                retVal = i;
                break;
            }
        }
        return retVal;
    };
    _pns.axis.prototype.getAxisPathIndexFromVisibleIndex = function(visibleIndex) {
        var retVal = this.visibleFacetsIdx[visibleIndex];
        return retVal;
    };

    _pns.axis.prototype.getFacetNodeIndexFromVisibleIndex = function(pivotVisibleIndex) {
        var visibleFacet = this.getFacets()[(this.visibleFacetsIdx[pivotVisibleIndex])];
        if (visibleFacet)
            return visibleFacet.visibleIndex;
        else
            return -1;
    };
    _pns.axis.prototype.getFacetFromId = function(facetId) {

        for ( var i = 0, j = this.facets.length; i < j; i++){
            var facet = this.facets[i];
            if (facet.id == facetId){
                return facet;
            }
        }
        return null;
    };
    _pns.axis.prototype.addNodeToPivot = function(indexToAdd, memberNode) {
        order[indexToAdd] = memberNode.id;
    };

    _pns.axis.prototype.getRootLevelAxisPathParam = function() {
        var retVal = [];
        for ( var i = 0; i < this.facets.length; i++){
            var facet = this.facets[i];
            var facetPath = [ facet.rootId ];
            if (facet.UIAttributes && facet.UIAttributes.Filters){
                facetPath = facet.UIAttributes.Filters.facetPath;
            }
            retVal.push(facetPath);
        }
        return retVal;

    };
    _pns.axis.prototype.getSortingParamAxisPathParam =
        function(sortingFacetPathsParams) {
            var retVal = [], facet, facetPath, i, facetIndex, foundFacetPathParam, rootAxisPath =
                this.rootPath || this.getRootPath(currAxis.facets.length);
            for (i = 0; i < this.facets.length; i++){
                facet = this.facets[i];
                facetIndex = this.getFacetIndexFromId(facet.id);

                facetPath = rootAxisPath[i];
                // facetPath = [ facet.rootId ];
                foundFacetPathParam = sortingFacetPathsParams[facet.id];
                if (foundFacetPathParam){
                    facetPath = facetPath.concat(foundFacetPathParam.facetPath);
                }
                else if (facet.UIAttributes && facet.UIAttributes.Filters){
                    facetPath = facet.UIAttributes.Filters.facetPath;
                }

                retVal.push(facetPath);
            }
            return retVal;

        };
// _pns.utility.getAxisPathIdStr=function(axisPath)
    _pns.axis.prototype.getAxisPathIdStr = function(_axisPath) {

        var axisPath = _axisPath.facetPaths ? _axisPath.facetPaths : _axisPath;
        var retValArray = [];
        var pathLength = Math.min(this.facets.length, axisPath.length);
        var facetPathSeperator = _pns.Constants.facetPathSeperator;
        for ( var i = 0; i < pathLength; i++){
            var currElement = axisPath[i].facetPath ? axisPath[i].facetPath : axisPath[i];
            if (currElement && currElement.length > 0)
                retValArray.push(currElement.join(facetPathSeperator));
        }
        var retVal = retValArray.join(_pns.Constants.axisPathSeperator);
        if (this.hasMeasures()){
            if (_axisPath.measure){
                retVal += _pns.Constants.measurePathSeperator + _axisPath.measure;
            }
            else if (axisPath.length > this.facets.length){
                // If we have a measure facet path in this axis path
                retVal += _pns.Constants.measurePathSeperator + axisPath[axisPath.length - 1].join(facetPathSeperator);;
            }
        }
        return retVal;
    };

    _pns.axis.prototype.getAxisPathNodes = function(_axisPath) {

        var axisPath = _axisPath;
        if (axisPath.facetPaths){
            axisPath = axisPath.facetPaths;
        }

        var retVal = [];
        var lastFacetParentId = _pns.Constants.rootId;
        var currentChildMap = null;
        var currNode = null;
        var parentNodeMap = null;
        for ( var i = 0, j = this.facets.length; i < j; i++){
            var currFacet = this.facets[i];
            var facetRootNode = currFacet.parentFacetNodesMap[lastFacetParentId];
            if (!facetRootNode){
                facetRootNode = currFacet.createFacetParentNode(_axisPath);
            }
            currNode = facetRootNode;
            currentChildMap = currNode.childrenMap;
            for ( var k = 1; k < axisPath[i].length; k++){
                var currFacetMemberId = axisPath[i][k];
                currNode = currentChildMap[currFacetMemberId];
                currentChildMap = currNode.childrenMap;
                lastFacetParentId = currFacetMemberId;
            }
            retVal.push(currNode);

        }
        return retVal;
    };

    _pns.axis.prototype.getAxisPathSortLabel = function(axisPath, useLastLevel, _pivotObject) {
    	var iFacet = 0;
        var axisPathLabelObj = this.getAxisPathLabelObj(axisPath, useLastLevel, undefined, _pivotObject);
        var retStr = "<DIV>";
        var facet = null;

        if (this.index === 0){
        	retStr +="<SPAN>";
        }
        else{
        	retStr +="<SPAN class ='topAxisToolTipCoor'>";
        }
        retStr += " [";
        for (iFacet = 0; iFacet < axisPathLabelObj.length; iFacet++){
            facet = axisPathLabelObj[iFacet];
            if (facet.facetLevelLabelObj.length){
            	retStr += facet.facetLabel ;
                for ( var iFacetLevel = 0; iFacetLevel < facet.facetLevelLabelObj.length; iFacetLevel++){
                    var facetLevelLabel = facet.facetLevelLabelObj[iFacetLevel];
                    retStr += ": " + facetLevelLabel;
                    if((iFacet != (axisPathLabelObj.length-1)) )
                    	retStr += "; ";
                }
            }else if(facet.facetLabel != null) {
            	retStr +=  facet.facetLabel +"; ";
            }
        }
        if(retStr.charAt(retStr.length-2) == ";")
        	retStr =retStr.substring(0,retStr.length-2);
        retStr += "]</SPAN></DIV>";

        return retStr;
    };

    _pns.axis.prototype.getAxisPathLabel = function(axisPath, useLastLevel) {
    	var iFacet = 0;
        var axisPathLabelObj = this.getAxisPathLabelObj(axisPath, useLastLevel);
        var retStr = "";
        var facet = null;
        for (iFacet = 0; iFacet < axisPathLabelObj.length; iFacet++){
            facet = axisPathLabelObj[iFacet];
            if (facet.facetLevelLabelObj.length){
            	retStr += "<DIV><span style='font-weight: bold;'>"+ facet.facetLabel +": </span>" ;
                for ( var iFacetLevel = 0; iFacetLevel < facet.facetLevelLabelObj.length; iFacetLevel++){
                    var facetLevelLabel = facet.facetLevelLabelObj[iFacetLevel];
                    if(iFacetLevel == 0){
                    	retStr += facetLevelLabel;
                    }else{
                    	retStr += "->" + facetLevelLabel;	
                    } 
                }
                retStr += "</DIV>"; 
            }
        }
        return retStr;
    };


    _pns.axis.prototype.getAxisPathLabelObj =
        function(axisPath, useLastLevel, includeGroupByLevel, _pivotObject) {
            var facetPaths = axisPath.facetPaths;
            var axisLabelObj = [];
            for ( var facetIndex = 0; facetIndex < facetPaths.length; facetIndex++){
                var facetLabelObj = {
                	facetName : null,
                    facetLabel : null,
                    facetLevelLabelObj : [],
                    facetLevelNameObj : [],
                    facetRootLabel : null,
                };
                var rootNode = null;
                // Get the hierarchy in the correct facet;
                // Check if it's the measures section
                if (facetIndex == _pns.Constants.measureIdPrefix){
                    rootNode = this.getMeasuresParentNode(axisPath);
                }
                else{
                    var facet = this.facets[facetIndex];
                    if (!facet)
                        continue;
                    var facetPath = facetPaths[facetIndex];
                    facetLabelObj.facetName = facet.name;
                    if (!useLastLevel)
                        facetLabelObj.facetLabel = facet.getDisplayName();
                    else if (facet.facetLevels){
                        if (facetPath.length == 1 ){
                        	//If it's a scenario facet then no need to show scenario name, we are displaying scenario name already in tool bar.
                        	if(_pivotObject && _pivotObject._getCubeDefinition() && facet.name == _pivotObject._getCubeDefinition().scenariosDimensionKey ){
                        		continue;
                        	}
                        	facetLabelObj.facetLabel = facet.getRootLabel();
                    	}
                        else
                            facetLabelObj.facetLabel = facet.visibleLevels[facetPath.length - 2].attributeName;
                    }
                    facetLabelObj.facetRootLabel=facet.getRootLabel();
                    rootNode = facet.getFacetParentNode(this, axisPath);
                    var currNode = rootNode;
                    if (currNode && facet.showRoot && !useLastLevel){
                        facetLabelObj.facetLevelLabelObj.push(currNode.name);
                        facetLabelObj.facetLevelNameObj.push("_Total_");
                    }
                    for ( var i = 1; i < facetPath.length; i++){
                        if (!currNode)
                            break;
                        currNode = currNode.childrenMap[facetPath[i]];
                        if (!currNode)
                            break;
                        if (facet.visibleLevels&&facet.visibleLevels.length>=0&&(!useLastLevel || (i == facetPath.length - 1))){
                            facetLabelObj.facetLevelLabelObj.push(currNode.name);
                            //If includeGroupByLevel is set to true then sending level information for preparing intersection details.
                            if(includeGroupByLevel){
                            	var level = facet.visibleLevels[currNode.level - 1];
  	                            facetLabelObj.facetLevelNameObj.push(level);
                            }else{
	                            var memberName = null;
	                            memberName = currNode.level - 1 >= facet.visibleLevels?facet.visibleLevels[currNode.level - 1].attributeName:null;
	
	//                                    facet.showRoot ? facet.visibleLevels[currNode.level - 1].attributeName : facet.visibleLevels[currNode.level].attributeName;
	                            if (memberName) {
	                                facetLabelObj.facetLevelNameObj.push(memberName);
	                            }
                            }
                        }
                    }
                    axisLabelObj.push(facetLabelObj);
                }
            }
            return axisLabelObj;
        };

    _pns.axis.prototype.removeAxisPathChildrenNodes = function(facetIndex, facetPath) {
        var pathNodes = this.getAxisPathNodes();
        for ( var i = facetIndex; i < this.facets.length; i++){
            var currFacet = this.facets[i];
        }
    };
    _pns.axis.prototype.getNode = function(_facetIndex, axisPath) {
        var facetIndex = _facetIndex;
        var rootNode, currNode = null;
        // Get the hierarchy in the correct facet;
        // Check if it's the measures section
        if (facetIndex == _pns.Constants.measureIdPrefix){
            rootNode = this.getMeasuresParentNode(axisPath);
        }
        else{
            var facet = this.facets[facetIndex];
            if (!facet){
                return null;
            }
            rootNode = facet.getFacetParentNode(this, axisPath);
            currNode = rootNode;
            var facetPath = axisPath[facetIndex];
            for ( var i = 1; i < facetPath.length; i++){
                currNode = currNode.childrenMap[facetPath[i]];

            }
        }
        return currNode;
    };
    _pns.axis.prototype.getNodeParent = function(facetIndex, axisPath) {
        // Get the hierarchy in the correct facet;
        var facet = this.facets[facetIndex];
        var rootNode = facet.getFacetParentNode(this, axisPath);
        var currNode = rootNode;
        var parentNode = null;
        var facetPath = axisPath[facetIndex];
        for ( var i = 1; i < facetPath.length; i++){
            parentNode = currNode;
            currNode = currNode.childrenMap[facetPath[i]];
        }
        return parentNode;

    };
    _pns.axis.prototype.updateParentChild = function(partialAxisPathArray, facetIndex, expanded, pivot){
        var escapedAxisPath = '';
        escapedAxisPath= this.getAxisPathIdStr(partialAxisPathArray).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        var selfAxisPathStr = '^' + escapedAxisPath + '\($|:)';
        var preCompiledTruncatedFacetPath = new RegExp(selfAxisPathStr);
        var currDescendant = selfAxisPathStr;
        var axisCollection = (this.index === 0) ? pivot.data.order : pivot._columns;
        for(var currPathIndex=0; currPathIndex < axisCollection.length; currPathIndex++){
            var testVal = axisCollection[currPathIndex];
            if ((this.index !== 0)){
                testVal = testVal.id;
            }
            if (preCompiledTruncatedFacetPath.test(testVal)){
                if ((this.index !== 0)){
                    axisCollection[currPathIndex].dataNodes[facetIndex].isExpanded = expanded;
                }
                else{
                    currObject = pivot.data.pull[testVal];
                    currObject.dataNodes[facetIndex].isExpanded = expanded;
                }
            }
        }
    };
    /**
     * Utilty function to be called by getAxisPathCombination. It generates set of axispath combination
     * */
    _pns.axis.prototype.doCombination =function(combMap,len,id,curIndex,nxtIndex,stack,retVal){
    	
    	var arr=combMap[id];
    	stack.push(arr[curIndex]);
    	if(id+1<=len){
    		this.doCombination(combMap,len,id+1,nxtIndex,0,stack, retVal);
    		stack.pop();
    	}    	
    	else{
    		var str = this.dummyFacetConst,i=0;
    		while(i<stack.length){
    			str += _pns.Constants.axisPathSeperator + stack[i];
    			i++;
    		}    		
    		retVal[str]=1;
    		stack.pop();    		   		
    	}
    	
    	if(curIndex+1 < arr.length){
    		this.doCombination(combMap,len,id,curIndex+1,nxtIndex,stack,retVal);
    	}
    	
    };
    /**
     * Generate axispath combination to identify ancestor of current axispath . This function called by getAncestorAxisPath
     * */
    _pns.axis.prototype.getAxisPathCombination = function(axisPathStr){
    	var  splitStr = axisPathStr.split(_pns.Constants.axisPathSeperator);
    	var combMap={};
    	for(var i=1; i<splitStr.length; i++){
    		var facetStr = splitStr[i];
    		var comb =[];
    		comb.push(facetStr);
    		while(facetStr.indexOf(_pns.Constants.facetPathSeperator) >=0 ){
    			facetStr = facetStr.slice(0,facetStr.lastIndexOf(_pns.Constants.facetPathSeperator));
    			comb.push(facetStr);
    		}
    		combMap[i]=comb;
    	}
    	var combLen = Object.keys(combMap).length;
    	var stack =[];
    	var retVal ={};
    	this.doCombination(combMap,combLen,1,0,0,stack,retVal);
    	
    	return retVal;
    };
    /**
     * Get All Children Axis Path information of current axispath. 
     * @param pivot : pivot object
     * @param startingAxisPath : AxisPath Object of current axispath for which we need parent axispath
     * @return map   [key facet index , value array of child axispath] 
     * */
    _pns.axis.prototype.getAllChildren = 
    	function(pivot, startingAxisPath) {
    	var retVal = {};
		var axisPathArray = startingAxisPath.facetPaths.slice(0);
		var axisPathStr =this.getAxisPathIdStr(axisPathArray);
		var escapedAxisPath = '';        
        // calculating measureLength. As it is required during looping rowpath
        var measureLength = this.hasMeasures() ? pivot._getCubeDefinition().visiblemeasures.length : 1;
        
        var regexPostFix = '[\\' + _pns.Constants.facetPathSeperator +'][0-9]*';
        var notMatch = '(?![\\' + _pns.Constants.facetPathSeperator +'])';
        escapedAxisPath= axisPathStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        var splitStr = escapedAxisPath.split(_pns.Constants.axisPathSeperator);
        
        for(var i=1; i<splitStr.length; i++){
        	var j=1, fctArr=[];
        	var selfAxisPathStr = '^' + splitStr[0];
        	while(j<splitStr.length){
        		selfAxisPathStr+=_pns.Constants.axisPathSeperator+splitStr[j];
        		if(j==i)
        			selfAxisPathStr+=regexPostFix;
        		else
        			selfAxisPathStr+=notMatch;
        		j++;
        	}
        	        
            var preCompiledTruncatedFacetPath = new RegExp(selfAxisPathStr);
       
        	var axisCollection = (this.index === 0) ? pivot.data.order : pivot._columns;
      
	        for(var currPathIndex=0; currPathIndex < axisCollection.length; currPathIndex=currPathIndex+measureLength){
	        	var testVal = axisCollection[currPathIndex];
	        	if ((this.index !== 0)){
	                testVal = testVal.id;
	            }
	        	testVal=this.hasMeasures() ? testVal.substr(0, testVal.indexOf(_pns.Constants.measurePathSeperator)) : testVal;
	        	if (preCompiledTruncatedFacetPath.test(testVal) && (testVal !== axisPathStr)){       		
	        		fctArr.push(testVal);
	        	}
	        }
      
	        retVal[i]=fctArr;
        }
        return retVal;
    	
    };
    /**
     * Get Parent Axis Path information of current axispath. 
     * @param axisPath : AxisPath Object of current axispath for which we need parent axispath
     * @return array of string  [axispath id string] 
     * */
    _pns.axis.prototype.getParentAxisPath = function(axisPath){
    	var retVal =[];
    	var axisPathArray = axisPath.facetPaths.slice(0);    	
		for(var i=1; i<axisPathArray.length;  i++ ){	
			var clonedPath = this.cloneAxisPath(axisPathArray);
			var axisRowPath = clonedPath[i]; 
			if(axisRowPath.length>1){
				axisRowPath.pop();
				retVal.push(this.getAxisPathIdStr(clonedPath));
			}			
		}		
		return retVal;
    };
    /**
     * Get Ancestor Axis Path information of current axispath. 
     * @param pivot : pivot object
     * @param startingAxisPath : AxisPath Object of current axispath for which we need parent axispath
     * @return array of string  [axispath id string] 
     * */
    _pns.axis.prototype.getAncestorAxisPath = 
    	function(pivot, startingAxisPath) {    	
		var axisPathArray = startingAxisPath.facetPaths.slice(0);
		var axisPathStr = this.getAxisPathIdStr(axisPathArray);
		this.dummyFacetConst=axisPathStr.slice(0,axisPathStr.indexOf(_pns.Constants.axisPathSeperator));
		var allComb = this.getAxisPathCombination(axisPathStr);
		
		delete allComb[axisPathStr];		
        return Object.keys(allComb);
    };
    /**
     * Get Descendant Axis Path information of current axispath. 
     * @param pivot : pivot object
     * @param startingAxisPath : AxisPath Object of current axispath for which we need parent axispath
     * @return array of string  [axispath id string] 
     * */
    _pns.axis.prototype.getDescendantAxisPath = 
    	function(pivot, startingAxisPath) {
    	var retVal = [];
		var axisPathArray = startingAxisPath.facetPaths.slice(0);
		var axisPathStr =this.getAxisPathIdStr(axisPathArray);
		var escapedAxisPath = '';        
        // calculating measureLength. As it is required during looping rowpath
        var measureLength = this.hasMeasures() ? pivot._getCubeDefinition().visiblemeasures.length : 1;
        
        var regexPostFix = "";
        if (!this.hasMeasures() && axisPathArray.length == this.facets.length)
            regexPostFix += "(";
       // regexPostFix += '[\\' + _pns.Constants.axisPathSeperator;     
        regexPostFix += '([\\' + _pns.Constants.facetPathSeperator +'][0-9]*)*';      
       // regexPostFix += ']*';
        
        if (!this.hasMeasures() && axisPathArray.length == this.facets.length)
            regexPostFix += "|$)";
        
        escapedAxisPath= axisPathStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        var splitStr = escapedAxisPath.split(_pns.Constants.axisPathSeperator);
        var selfAxisPathStr = '^' + splitStr[0];
        for(var i=1; i<splitStr.length; i++){
        	selfAxisPathStr+=_pns.Constants.axisPathSeperator+splitStr[i]+ regexPostFix;
        }
        
        var preCompiledTruncatedFacetPath = new RegExp(selfAxisPathStr);
        var allMem = pivot.getAvailableMember(this.index);
        for(var m=0; m<allMem.length;m++){
        	if (preCompiledTruncatedFacetPath.test(allMem[m]) && (allMem[m] !== axisPathStr)){       		
        		retVal.push(allMem[m]);
        	}
        }
        

        var axisCollection = (this.index === 0) ? pivot.data.order : pivot._columns;
      
        for(var currPathIndex=0; currPathIndex < axisCollection.length; currPathIndex=currPathIndex+measureLength){
        	var testVal = axisCollection[currPathIndex];
        	if ((this.index !== 0)){
                testVal = testVal.id;
            }
        	testVal=this.hasMeasures() ? testVal.substr(0, testVal.indexOf(_pns.Constants.measurePathSeperator)) : testVal;
        	var hasTestVal =_.find(retVal,function(val){
				return val===testVal;
        	});
        	if ( !hasTestVal && preCompiledTruncatedFacetPath.test(testVal) && (testVal !== axisPathStr)){       		
        		retVal.push(testVal);
        	}
        }
      
        return retVal;
    };
    _pns.axis.prototype.findLastOccuranceofPartialAxisPath =
        function(pivot, startingAxisPath, partialAxisPathArray, isPartialFacetPath) {
		var retVal = [];
		var axisPathArray = startingAxisPath.facetPaths.slice(0);
		var escapedAxisPath = '';

        axisPathArray.push([ startingAxisPath.measure ]);
        var selfFullAxisPathStr = this.getAxisPathIdStr(axisPathArray);
        var regexPostFix = "";
        if (!this.hasMeasures() && partialAxisPathArray.length == this.facets.length)
            regexPostFix += "(";
        regexPostFix += '[\\' + _pns.Constants.measurePathSeperator + _pns.Constants.axisPathSeperator;
        if (isPartialFacetPath){
            regexPostFix += '\\' + _pns.Constants.facetPathSeperator;
        }
        regexPostFix += ']';
        if (!this.hasMeasures() && partialAxisPathArray.length == this.facets.length)
            regexPostFix += "|$)";
        escapedAxisPath= this.getAxisPathIdStr(partialAxisPathArray).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        
        var selfAxisPathStr = '^' + escapedAxisPath + regexPostFix;
        var preCompiledTruncatedFacetPath = new RegExp(selfAxisPathStr);
        var currDescendant = selfAxisPathStr;
        var currPathIndex =
                (this.index === 0) ? pivot.indexById(selfFullAxisPathStr) : pivot.columnIndex(selfFullAxisPathStr);

        var currAxisPathStr = selfAxisPathStr;
        var axisCollection = (this.index === 0) ? pivot.data.order : pivot._columns;
       /* var pivotRowCount = axisCollection.length;
        for (; pivotRowCount != currPathIndex; currPathIndex++){
            var testVal = axisCollection[currPathIndex];
            if ((this.index !== 0)){
                testVal = testVal.id;
            }
            if (preCompiledTruncatedFacetPath.test(testVal)){
                currAxisPathStr = testVal;
            }
            else{
                break;
            }

        }*/
        var found=0;
        for(currPathIndex=0; currPathIndex < axisCollection.length; currPathIndex++){
        	var testVal = axisCollection[currPathIndex];
        	if ((this.index !== 0)){
                testVal = testVal.id;
            }
        	if (preCompiledTruncatedFacetPath.test(testVal)){
        		currAxisPathStr = testVal;
        		found=1;
        	}
        	else if(found){
        		break;
        	}
        }
        // Go one back
        currPathIndex = found ? --currPathIndex : undefined;
        currAxisPathStr = axisCollection[currPathIndex];
        if(!currAxisPathStr)
        	return currPathIndex;            
        
        if ((this.index !== 0)){
            currAxisPathStr = currAxisPathStr.id;
        }
        if (currAxisPathStr){
            retVal = new _pns.axisPath(currAxisPathStr);
            // retVal=lastDescendantObj.facetPaths.slice(0);
            // retVal.push([lastDescendantObj.measure]);
        }

        return retVal;
    };

    _pns.axis.prototype.getLastDescendantAxisPath = function(pivot, facetIndex, axisPath) {
        var partialAxisPath = axisPath.facetPaths.slice(0, facetIndex + 1);
        var retVal = this.findLastOccuranceofPartialAxisPath(pivot, axisPath, partialAxisPath, false);
        return retVal;
    };

    _pns.axis.prototype.getLastCousinAxisPath = function(pivot, facetIndex, axisPath) {
        var partialAxisPath = axisPath.facetPaths.slice(0, facetIndex + 1);
        var retVal = this.findLastOccuranceofPartialAxisPath(pivot, axisPath, partialAxisPath, true);
        return retVal;

    };
    _pns.axis.prototype.hasTotalMemberAsFilter=function(facet){
    	
    	if(facet && facet.UIAttributes.Filters && (facet.UIAttributes.Filters.memberName.trim() === facet.totalMemberName)){		
    	  	return true;
    	}
    	
    	return false;
    };
    _pns.axis.prototype.hasFilterMember = function(member,filterName){
    	
    	var facetChildren = member.facetChildren;	
    	for(var i=0; i<facetChildren.length;i++){		
    		if(facetChildren[i].name === filterName || this.hasFilterMember(facetChildren[i],filterName)){
    			return true;
    		}
    	}	
    	return false;
    };
   
    _pns.axis.prototype.setFacetMembers =
        function(axisPath, facetId, members, measures, pivot) {


        var axisPathStr = this.getAxisPathIdStr(axisPath);
        var createdMemberCollection = {};
        // /////////////////////// New Logic /////////////////////
        // Check the facet the user has drilled into
        var facet = this.getFacetFromId(facetId);
        var facetIndex = facet.index;
        var facetPath = axisPath[facetIndex];

        if (facetPath){
            // Check if it's the first time we're drilling into the facet

            var facetRootNode = facet.getFacetParentNode(this, axisPath);
            if (!facetRootNode){
                facetRootNode = facet.createFacetParentNode(axisPath);
            }
            var currNode = facetRootNode;

            // Start drilling into the facet starting the second cell since
			// the
            // first is the facet root node facet path (AKA: this.rootId)
            // var level = facet.showRoot ? 1 : 0;
            var level = 1;
            for ( var i = facetRootNode.axisPath[facetIndex].length; i < facetPath.length; i++){
                var currNode = currNode.childrenMap[facetPath[i]];
                level++;
            }	
            if (members  && members.length){
                // We should be at the lowest level we priorly drilled into
				// with this
                // facet. Let's start adding the nodes.
                for ( var i = 0, j = members.length; i < j; i++){
                    currNode.childrenMap = currNode.childrenMap || {};
                    var currMember = members[i];
                    var memberId = currMember.id;
                    var canProceed = false;
                    
                    // Handle the member differently if facet has been filtered
                    if(facet.UIAttributes.Filters){
                    	// check for current member is filtered or it descendants has filtered member
                    	// If so, then identity its facet children or axischildren then do recursive call
                    	var filterMemberName = facet.UIAttributes.Filters.memberName.trim();
                    	if (filterMemberName === currMember.name ||
                    			this.hasFilterMember(currMember,filterMemberName)){
                    	                        	                         
	                        var facetChildren = currMember.facetChildren ? currMember.facetChildren :null ;
	                        var facetIndexFromId = this.getFacetIndexFromId(facetId);
	                        var axisParent =
	                            currMember.axisChildren && currMember.axisChildren.length && currMember.axisChildren[0];
	                        var axisChildren = axisParent ? axisParent.facetChildren :null; //axisParent && axisParent.facetChildren;
	                       
	                        var childFilterCreatedAxisMemberCollection = {};
	                        if (axisParent && ( axisParent.facetChildren || axisParent.axisChildren) ){
	                       	 childFilterCreatedAxisMemberCollection =
	                                    this.setFacetMembers(axisPath, this.facets[facetIndexFromId + 1].id, axisChildren, measures);
	                        } 
	                        if(this.hasTotalMemberAsFilter(this.facets[facetIndexFromId + 1])){
	                        	 axisParent = axisParent && axisParent.axisChildren && axisParent.axisChildren.length && axisParent.axisChildren[0];
	                        	 axisChildren = axisParent ? axisParent.facetChildren : null;
	                        	 facetIndexFromId = facetIndexFromId+1;
	                        	 if (axisParent && ( axisParent.facetChildren || axisParent.axisChildren) ){
	                        		 childFilterCreatedAxisMemberCollection = this.setFacetMembers(axisPath, this.facets[facetIndexFromId + 1].id, axisChildren, measures);
	                        	 }
	                        }
	                       	
	                        var childFilterCreatedMemberCollection = this.setFacetMembers(axisPath, facetId, facetChildren, measures);
	                        
	                        createdMemberCollection =
	                            $.extend(createdMemberCollection,childFilterCreatedAxisMemberCollection, childFilterCreatedMemberCollection);
	                        // if member collection is empty then all the facet on side axis has been filtered so we need to avoid breaking the loop
	                         canProceed = (_.isEmpty(createdMemberCollection) && facetIndexFromId === (this.facets.length-1) ) ? true :false;
	                         if(!canProceed){
	                        	 break;
	                         }
						}
                    	if(!canProceed){
                    		continue;
                        }
                    }
                    
                    var memberAxisPath = axisPath;
                    var memberSelStatus = pivot.getMemberSelectorStatus(this.index,axisPathStr);

                    var memberAxisPath2 = axisPath, memberAxisPath;

                    if (!this.isMeasureOnlyAxis() && !canProceed){
                    	memberAxisPath2 = _pns.utility.getMemberAxisPath(axisPath, memberId, facetIndex, facet);
                    }
                    var memberAxisPathRoot = memberAxisPath2;
                    //This will generate the number of row/columns associated with the current member (which is based on facet and axis information of current Member) 

                    var memberAxisPathArray = _pns.utility.getMemberAxisPathCollection(memberAxisPath2, axisPath, currMember);
                    
                    for(var memberIndex = 0; memberIndex < memberAxisPathArray.length; memberIndex++){
                    	memberAxisPath = memberAxisPathArray[memberIndex];

                    	var rowId = this.getAxisPathIdStr(memberAxisPath);
                    	var parentPath = this.getParentAxisPath(new _pns.axisPath(rowId));
                    	var parentStatus = pivot.getMemberSelectorStatus(this.index,parentPath);
                    	var rowSelector = pivot.getMemberSelectorStatus(this.index,rowId);
                    	if(!parentPath){
                    		parentStatus = memberSelStatus;
                    		parentPath = axisPathStr;
                    	}
                    	if(!rowSelector){
                    		 pivot.getMemberSelector(this.index)[rowId] ={};                    		
                    	}  
                    	var rowStatus = pivot.getMemberSelectorStatus(this.index,rowId);
                    	if(parentStatus==2 && rowStatus){
                    		  parentStatus = rowStatus;
                    	}
                    	pivot.setMemberSelectorStatus(this.index,rowId,parentStatus == undefined ? 0 : parentStatus,parentPath);                    	

	                    var memberNode = currNode.childrenMap[memberId]; 
	                    if(!memberNode){
	                    	memberNode =
	                    		new _pns.facetNode(memberId, currMember.name, currMember.hasFacetChildren, level,
	                    				memberAxisPath, currNode);
	
	                    	currNode.childrenMap[memberId] = memberNode;
	                	}
	                    currNode.isExpanded = true;
	                    this.updateParentChild(axisPath.slice(0, facetIndex+1), facetIndex, true, pivot);
	                	
	                    // Lets create the row for the member
	                    var currRow = {
	                        id : rowId,
	                        dataNodes : new Array(this.facets.length)
	                    };
	                    var currFacetNode = null;
	                    for ( var k = 0; k < this.facets.length; k++){
	                    	var currFacet = this.facets[k];
	                    		
	                        var memberFacetPath = memberAxisPath[k];
	                        var currlevel = memberFacetPath.length - 1;
	                        //Set selfExpansion to true if facet is expanded more than 1 level in the hierarchy
	                        var selfExpansion = ((currlevel > level) && (k == facetIndex) && !(members[0].id==='-999'));
	                        
	                        if(k>facetIndex || selfExpansion){
	                        	
	                        	var currlevel = memberFacetPath.length - 1;
	                        	memberAxisPathRoot = JSON.parse(JSON.stringify(memberAxisPath.slice(0,k+1)));
	                        	//memberAxisPathRoot = jQuery.extend(true,[], memberAxisPath.slice(0,k+1));
	                        	                                
	                            if(memberAxisPathRoot[k].length!=1){
	                            	memberAxisPathRoot[k].pop();
	                            }
	                            
	                			memberAxisPath2.slice(k+1).every(function(value, index){
	                				memberAxisPathRoot.push(value);
	                				return true;
	                			});                   
	                            //Let's find the parent node i.e currRootNode if it's not there then create it  
	                            var currRootNode = currFacet.getFacetParentNode(this, memberAxisPathRoot);
	                            if (!currRootNode){
	                                currRootNode = currFacet.createFacetParentNode(memberAxisPathRoot);
	                            }                                    
	                            for ( var m = 1; (m < memberAxisPathRoot[k].length) && (currRootNode.childrenMap[memberAxisPathRoot[k][m]]); m++)
	                            {
	                            	currRootNode = currRootNode.childrenMap[memberAxisPathRoot[k][m]];
	                            	currRootNode.isExpanded = true;
	                        	}
	                            
	                            
	                            var labelId = memberAxisPath[k][currlevel];
	                            //curMem2 is the child node for the currNode2
	                            
	                            var curMem2 = currMember;
	                            //for measure only Axis calls
	                            if(curMem2.axisChildren){
	                            	//Let's populate the current member i.e curMem2
	                            	for(var l = selfExpansion ? facetIndex : facetIndex + 1; l <= k; l++){
	                            		curMem2 = selfExpansion ? curMem2 : curMem2 && curMem2.axisChildren;
	                            		var levelIndex = selfExpansion? level + 1 : 1;
	                            		//Set the currMem2 to the current axisPath
	                            		if(curMem2)
	                            		{
	                            			if((this.facets[l].showRoot|| this.facets[l].visible == false) && !selfExpansion){
                                				// If showRoot set to true or the facet is hidden, axisChildren should 
		                            			// contain only the total node
		                            			curMem2 = curMem2[0];
	                                		}
	                                		else if((memberAxisPath[l].length > 1) && !selfExpansion){
	                                			var id1 = memberAxisPath[l][levelIndex];
                                				for(var x=0; x < curMem2.length; x++){
	                                            	if(curMem2[x].id == id1){
	                                            		levelIndex++;
	                                                	curMem2 = curMem2[x];
	                                                	break;
	                                            	}
                                				}
	                                		}
	                            	
	                            			//	Set the currMem2 to current facet Level Member                                    		
	                               			for( ; levelIndex < memberAxisPath[l].length; levelIndex++){
	                               				if(curMem2){
	                               					if(curMem2.facetChildren && curMem2.facetChildren.length > 0){
	                               						curMem2 = curMem2.facetChildren;
	                               					}	                               					
		                               				var id2 = memberAxisPath[l][levelIndex];
		                               				if(curMem2){
			                               				for(var x = 0; x < curMem2.length; x++){
			                               					if(curMem2[x].id == id2){
			                               						curMem2 = curMem2[x];
			                                                	break;
			                               					}
			                               				}
		                               				}
	                               				}
	                               			}
	                            		}
	                            	}
	                            }
	                            
	                            if(curMem2 && curMem2.id == -1){
	                            	//This means current member is the root noode, no need to add it to root node
	                            	currRootNode.isExpanded = Boolean(curMem2.hasFacetChildren && curMem2.facetChildren && curMem2.facetChildren.length);
	                            }
	                            else if(curMem2){
	                            	// Add the populated member as a children to its parent node
	                            	var memberNode2 = new _pns.facetNode(curMem2.id, curMem2.name, curMem2.hasFacetChildren, currlevel, memberAxisPath, currRootNode);
	                            	memberNode2.isExpanded = Boolean(curMem2.hasFacetChildren && curMem2.facetChildren && curMem2.facetChildren.length);
	                            	if(!currRootNode.childrenMap[curMem2.id]){
	                            		currRootNode.childrenMap[curMem2.id] = memberNode2;
	                            	}
	                        	}
	                        }
	                        var facetMemberLabelValue;
	                        if (memberFacetPath.length == 1 && currFacet.showRoot){
	                            facetMemberLabelValue = currFacet.getRootLabel();
	                            // Let's try to see if the row has a root node
								// in the facet
	                            currFacetNode = currFacet.getFacetParentNode(this, memberAxisPath);
	                            if (!currFacetNode){
	                                currFacetNode =
	                                        currFacet.createFacetParentNode(this.cloneAxisPath(memberNode.axisPath));
	                                // currFacetNode.isExpanded=true;
	                            }
	                            if (!this.isMeasureOnlyAxis())
	                                currRow.dataNodes[k] = currFacetNode;
	
	                        }
	                        else{
	                            // Otherwise populate the label with the correct
								// value.
	                            // Let's start with the proper hierarchy for the
								// facet
	                            currFacetNode = currFacet.getFacetParentNode(this, memberAxisPathRoot);
	                            // It could be that we havn't yet drilled in
								// this facet
	                            if (currFacetNode){
	                                for ( var m = 1; (m < memberFacetPath.length) &&
	                                        (currFacetNode.childrenMap[memberFacetPath[m]]); m++)
	                                {
	                                    currFacetNode = currFacetNode.childrenMap[memberFacetPath[m]];
	                                }
	                                facetMemberLabelValue = currFacetNode.name;
	                                if (!this.isMeasureOnlyAxis())
	                                    currRow.dataNodes[k] = currFacetNode;
	                            }
	                        }
	                        currRow[_pns.Constants.facetIdPrefix + currFacet.id] = facetMemberLabelValue;
	                    }

	                    // Fill the 'All' entries for the child columns
	                    // Now we'll check if we could just add the row or we'll
						// have to
	                    // create a row for each measure
	                    var childAxisPath = null;
	                    if (this.hasMeasures()){
	                        if (!this.isMeasureOnlyAxis()){
	                            var newCurrFaceNode = null;
	                            var iCurrNode = currRow.dataNodes.length - 1;
	                            while (!newCurrFaceNode && iCurrNode > -1){
	                                newCurrFaceNode = currRow.dataNodes[iCurrNode--];
	                            }
	                            currFacetNode = newCurrFaceNode;
	                        }else{
	                            currFacetNode = currNode;
	                        }
	                        var mainRowId = currRow.id;
	                        currFacetNode.measureNodes = currFacetNode.measureNodes ? currFacetNode.measureNodes : [];
	                        var measureIdPrefix = _pns.Constants.measureIdPrefix;
	                        var measurePathSeperator = _pns.Constants.measurePathSeperator;
	                        for ( var i2 = 0, j2 = measures.length; i2 < j2; i2++){
	                        	var currMeasure = measures[i2];
	                            // Append the measure node to the dataNodes collection
	                            var memberFullAxisPath = memberAxisPath.concat([ [ currMeasure.id ] ]);
	                            var measureMemberNode =
	                                    new _pns.facetNode(currMeasure.id, currMeasure.label,
	                                            currMeasure.hasFacetChildren ? true : false, currMeasure.level, memberFullAxisPath,
	                                            currFacetNode);
	                            // deep cloning for top axis and shallo cloning for side axis.
	                            var currMeasureRow;
	                            if(this.isSideAxis()){
	                            	currMeasureRow = _.clone(currRow);
	                            }else{
	                            	currMeasureRow =jQuery.extend(true, {}, currRow)
	                            	currMeasureRow.dataNodes.push(measureMemberNode);
	                            }
	                            currFacetNode.measureNodes.push(measureMemberNode);
	                            //currMeasureRow.id = this.getAxisPathIdStr(memberFullAxisPath);
	                            currMeasureRow.id = rowId + measurePathSeperator + currMeasure.id;
	                            currMeasureRow[measureIdPrefix] = currMeasure.label;
	                            // This one will include the measure
	                            // currRow.axisPath = memberFullAxisPath;
	                            currMeasureRow.axisPath = memberFullAxisPath;
	                            childAxisPath = memberFullAxisPath;
	
	                            //addedRows[currMeasureRow.id] = currMeasureRow;
	                            if (!(currMeasureRow.id in createdMemberCollection)){
	                            	createdMemberCollection[currMeasureRow.id] = currMeasureRow;
	                            }
	                        }
	                        //this.createMeasuresParentNode(memberAxisPath, currFacetNode);
	                        this.measuresMap[rowId] = currFacetNode;
	                    }
	                    else{
	                        // Clone the axis path
	                        var clonedArray = this.cloneAxisPath(memberAxisPath);
	                        currRow.axisPath = clonedArray;
	                        childAxisPath = clonedArray;
	
	                        //addedRows[currRow.id] = currRow;
	                        if (!(currRow.id in createdMemberCollection)){
                            	createdMemberCollection[currRow.id] = currRow;
                            }
	                    }
                    } // End of memberAxisPathArray iteration
                } // End of member iteration
            }
        }
        
        //var sortedCardinalityCollection=this.sortCardinality(createdMemberCollection);
        return createdMemberCollection;
    
    };
    _pns.axis.prototype.sortCardinality = function(createdMemberCollection) {
        var sortedMemberCollection = {};
        return sortedMemberCollection;
    },
        _pns.axis.prototype.getAxisPathArrayNoMeasure = function(memberAxisPath) {
            var retVal = memberAxisPath.slice(0, this.facets.length);
            return retVal;

        };

    _pns.axis.prototype.cloneAxisPath = function(memberAxisPath) {
        var clonedArray = [];
        for ( var k = 0; k < memberAxisPath.length; k++){
            clonedArray[k] = memberAxisPath[k].slice();
        }
        return clonedArray;

    };

    _pns.axis.prototype.getMeasureRowIdFromMainRowId = function(mainRowId, measureId) {
        return mainRowId + _pns.Constants.measurePathSeperator + measureId;
    };

    _pns.axis.prototype.getAttributeRowId =function(axisPath,attributeId){
        var axisPathStr = this.getAxisPathIdStr(axisPath);
        return axisPathStr + _pns.Constants.axisPathSeperator + attributeId;
    };
    _pns.axis.prototype.getMeasureRowIdFromAxisPath = function(axisPath, measureId) {
        var axisPathStr = this.getAxisPathIdStr(axisPath);
        if (measureId && measureId !== axisPathStr)
            return axisPathStr + _pns.Constants.measurePathSeperator + measureId;
        else
            return axisPathStr;
    };
    _pns.axis.prototype.addNodeToPivot = function(indexToAdd, memberNode) {
        order[indexToAdd] = memberNode.id;

    };

    _pns.axis.prototype.isMeasureOnlyAxis = function() {
        this.getVisibleFacets().length;
    };

    /***********************************************************************************************************************
     * Will return null if the facet is not in the axis, {last:true} - if only one in axis {last:false} - if not the only
     * one in axis
     */
    _pns.axis.prototype.isOnlyVisibleFacetInAxis = function(facetId) {
        for ( var index = 0; index < this.visibleFacetsIdx.length; index++){
            if (this.facets[this.visibleFacetsIdx[index]].id == facetId){
                if (this.visibleFacetsIdx.length == 1){
                    return true;
                }
                else{
                    return false;
                }
            }
        }
        return false;

    };

    /***********************************************************************************************************************
     * Will return true if the facet is the last one in the axis, otherwise it will return false
     */
    _pns.axis.prototype.isLastFacetInAxis = function(facetId) {
        var retVal = this.facets[this.facets.length - 1].id == facetId;
        return retVal;

    };
    
    //Need to check the method i.e. existing but without any internal logic in it.
    /*give the parent axis oath for current selected cell*/
    _pns.axis.prototype.getParentAxisPathStr = function(axisPath){
    	var retVal;
    	var axisPathArray = cloneAxisPathArray = axisPath.facetPaths.slice(0);
    	for(var i=1; i<axisPathArray.length;  i++ ){	
    		cloneAxisPathArray[i].pop();
    	}
    	retVal = this.getAxisPathIdStr(cloneAxisPathArray);
    	return retVal;
    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// CELL LOCATION  structure /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * @constructor
     */
    _pns.CellLocation = function(_cellId) {
        this._cellId = _cellId;
        // Do some duck punching to change the object to what we expect
        if (_cellId.axesFacet && _cellId.axesFacet.axisPath && _cellId.axesFacet.facetIndex){
            var facetPath = _cellId.axesFacet.axisPath[_cellId.axesFacet.facetIndex];
            var axisSection = _cellId.axisIndex ? 'column' : 'row';
            cellId[axisSection] = _cellId.axesFacet.axisPath;
        }
        var retVal = {};
        if (!_cellId)
            return null;
        var cellColumn = _cellId.column || (_.isArray(_cellId) && _cellId[1]);
        var cellRow = _cellId.row || (_.isArray(_cellId) && _cellId[0]);
        if (cellColumn){
            this.topAxisPath = new _pns.axisPath(cellColumn);
        }
        if (cellRow){
            this.sideAxisPath = new _pns.axisPath(cellRow);
        }

    };

    _pns.CellLocation.prototype = (function() {
        return {
            getCellId : function() {
                return _cellId;
            },
            getAxisArray : function(axisIndex) {
                return axisIndex ? this.topAxisPath.getPathArray() : this.sideAxisPath.getPathArray();
            },
            getTopAxisArray : function() {
                return this.topAxisPath.getPathArray();
            },
            getSideAxisArray : function() {
                return this.sideAxisPath.getPathArray();
            },
            getMeasureId : function() {
                return this.topAxisPath.getMeasureId() || this.sideAxisPath.getMeasureId();
            }
        };
    }());

 // $Log$
 // Revision 1.39  2017/02/14 11:23:46  mmuddukrishna
 // MDAP-2732-hiding single facet when move to side/drag n drop/swap facet, when the target axis has other facets.
 //
 // Revision 1.38  2017/02/10 13:16:32  mmuddukrishna
 // MDAP-2732 - Remove scenarios from hide/view facets. Revert back the old changes and fix for new functional change.
 //
 // Revision 1.37  2017/02/01 14:31:35  rpudi
 // MDAP-3306 : Pivot UI errors out when performing search 10K SKU's without hierarchy, Fixed issue not able to move facet from side to top when we have one dimension along with measure
 //
 // Revision 1.36  2017/02/01 12:29:57  mmuddukrishna
 // MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
 //
 // Revision 1.35  2017/02/01 11:57:28  mmuddukrishna
 // MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
 //
 // Revision 1.34  2017/02/01 07:30:36  rpudi
 // MDAP-3306 : Pivot UI errors out when performing search 10K SKU's without hierarchy
 //
 // Revision 1.33  2017/01/25 19:47:35  rpudi
 // Facet Level collapse is not working after expanding facet level
 //
 // Revision 1.32  2017/01/25 15:24:51  rpudi
 // MDAP-3306 : Pivot UI errors out when performing search 10K SKU's without hierarchy
 //
 // Revision 1.31  2017/01/19 13:25:04  rpudi
 // MDAP-3404 : Invalid Members are displaying in the second dimension
 //
 // Revision 1.30  2017/01/10 13:36:20  mmuddukrishna
 // MDAP-3405: Members Under "All Location" are not Displaying
 //
 // Revision 1.29  2017/01/04 10:51:56  rpudi
 // MDAP-2959 : Calculate needs Please Wait for long running actions
 //
 // Revision 1.28  2016/11/07 05:12:26  rpudi
 // MDAP-3122 : Clean up DHX customization from Pivot code
 //
 // Revision 1.27  2016/11/02 08:06:06  rpudi
 // MDAP-3122 : Clean up DHX customization from Pivot code,
 // Removed override functions from datatable_debug.js those are available in dhtmlx.js.
 //
 // Revision 1.26  2016/08/11 11:31:32  rpelluri
 // MDAP-2481 : Export data to Excel with D-MDAP ( negative number formatting based on user settings)
 //
 // Revision 1.25  2016/05/18 12:06:06  rpudi
 // changing _generateCommandId with adding random number,
 // There is a chance to get same generated id if we are placing two parallel ajax calls.
 //
 // Revision 1.24  2016/04/20 05:47:06  rpudi
 // MDAP-2248 : Long polling for DMDAP
 //
 // Revision 1.23  2016/01/04 05:23:01  rpudi
 // sending multiple scenario names from client to server.
 //
 // Revision 1.22  2015/12/15 10:34:32  rpudi
 // MDAP-1622 : Save graph configuration.
 //
 // Revision 1.21  2015/11/20 08:14:21  nvuppala
 // MDAP-1384 - The check box icon on the pivot for row/column selection is not consistent with the platform checkbox , MDAP-1607 CLONE: Partial selection check box is not shown in 9.0.1(working in 9.0 drop 5)
 //
 // Revision 1.20  2015/11/13 17:21:26  blivezey
 // MDAP-1524: permit the use of ':' and '$' in member names
 //
 // Revision 1.19  2015/11/10 21:13:04  blivezey
 // MDAP-1524 D360 - Unable to load data under worksheet for the intersections if facets or facet levels contains dots while using distributed MDAP.
 //
 // Revision 1.18  2015/10/28 13:13:22  rpudi
 // MDAP-1490 : Merge Import/Export changes to 9.1
 //
 // Revision 1.17  2015/10/28 07:00:16  rpudi
 // MDAP-1490 : Merge Import/Export changes to 9.1
 //
 // Revision 1.16  2015/08/17 19:36:28  blivezey
 // Support for scenarios in PivotMDAP and JDAPivot
 //
 // Revision 1.15  2015/08/12 06:07:01  rpelluri
 // Added multiedit constant
 //
 // Revision 1.14  2015/07/08 07:53:44  rpelluri
 // MDAP-1144 : jda_common_pivot.js has a NPE issue with x_scroll variable
 //
 // Revision 1.13  2015/07/07 09:08:05  rpelluri
 // MDAP-1137 : Port Copy & Paste feature to TIP (9.0.1)
 //
 // Revision 1.12  2015/06/30 07:12:11  rpelluri
 // MDAP-1057 : CLONE: Long Polling enhancement: add extra parameter lag time on HTTP request with default value as 1 sec.
 //
 // Revision 1.11  2015/05/12 01:38:38  misong
 // MDAP-968 Total: Invalid Member displaying in the dimension
 //
 // Revision 1.10  2015/05/11 02:02:02  misong
 // MDAP-968 Rollback previous fix.
 //
 // Revision 1.9  2015/05/09 20:56:25  misong
 // MDAP-968 Total: Invalid Member displaying in the dimension
 //
 // Revision 1.8  2015/05/04 12:44:11  rpelluri
 // Added version log for history details
 //
