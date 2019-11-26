//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/******
Pivot Comment Widget 

	This widget is created for pivot where user can do CRUD operation on UI.

@Version: 1.0 (initial Draft)

@Author:	Mohamed Faizel Samsudeen
@Created:	13-May-2014

*******/
;(function($,document,window,undefined) {

	$.widget("jda.pivotComment", {
	/**
	 * Default Options available for pivot accordion
	 * It can be modified while creating widget
	 */
	 	constants:{
			ancestors:"ANCESTORS",
			self:"SELF",
			descendants:"DESCENDANTS"
		},
		options: {
			width:380,
			height:0,
			subMaxLength:255,
			descMaxLength:255,
			cellId:undefined,
			imgPath:"common/pivot/jda/images/",
			accordionOpen:3,
			maxHeight:360,
			disable:false,
			pivotHeight:0,
			needSegmentCall:false,
			enableReasonCodeSupport:false,
			reasonCodesArray : {},
			flyoutIsOpen:false,
			cellValue:undefined,
			text:function(text){
				if((text.replace(/#|@|\$|%|\^|&|~|<|>/g,'*')!==text))
				{  // if special characters found through error message
					return {msg : this.getLocaleString('Comment.InvalidCharacter')};
				}
				return false;	
			},	
			subject:function(text){
				if(text.length>this.subMaxLength){
					 // if length of characters exceed through error message 
					return {msg: this.getLocaleString('Comment.LengthExceed')};
				}
				return false;
			},
			description:function(text){
				if(text.length>this.descMaxLength){
					 // if length of characters exceed through error message
					return {msg: this.getLocaleString('Comment.LengthExceed')};
				}
				return false;
			}
		},
		
		
		/**
		 * this method calls only once in life cycle of widget (At the time of widget creation). 
		 * @param options
		 */
		_create:function(options){
			// bind all elements for particular event action (click,key up , key down)
			this._bindEvents();
			// set localized string to elements where text appears.
			this._setLocalizedValues();
		},
		
		/**
		 * This method called when widget is initialized.
		 * Here we are adding different div elements for  Adding comment through textArea, filter comment.
		 */
		_init: function(options) {	 
			var pivotAccordion = this;
			// self element 	
			var $self= this.element;
			
			var $wrapper =$('<div></div>').addClass("j-pvt-cmt-wrapper");
			var $centerPanel =$('<div></div>').addClass("j-pvt-cmt-center");
			// create center panel
			pivotAccordion._createCenterPanel($centerPanel);
			// Add panels to wrapper
			$wrapper.append($centerPanel);
			$self.append($wrapper);
			
			
		},
		/**
		 * Refresh Accordion if facet position changes (row to column,column to row)  and cell selection changes.
		 * @param cellId - cell Id Axis path
		 * @param intersection - selected cell position in details
		 */
		onCellChange:function(cellId,intersection){
			this.removeAccordion();
			this._setCellID(cellId);
			this._setIntersection(intersection);
			if(this.options.getPivotObj() && cellId){
				var pivotObj = this.options.getPivotObj();
				var value;
				if(pivotObj.item(cellId.sideAxis)){
					value = pivotObj.item(cellId.sideAxis)[cellId.topAxis];
				}
				if(value && (value.content == "__Nc__" || (value.content == "__Nv__" && value.write == "R"))){
					Ext.getCmp('commentwrapper').disable();
				}else{
					Ext.getCmp('commentwrapper').enable();
					this._sendCommentsRequest();
				}
			}
		},
		/**
		 * If Reason Code functionality enable, below method used for adding reason codes to dropdown.
		 */
		addReasonCodes:function(reasonCodes){
			var $reasonCodesCombo = $(this.element).find("#reasonCodesCombo");
			var $width = $(this.element).outerWidth();			
			this.getReasonCodesCombo($reasonCodesCombo, $width, reasonCodes);     	   	
		},
		sortByName:function(a, b){
			var aName = (a.dispValue || a.code).toLowerCase();
    		var bName = (b.dispValue || b.code).toLowerCase(); 
    		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		},
		/**
		 * Cell id -  axis path of cell where user selection made on pivot cell
		 */
		_setCellID:function(cellID){
			this.options.cellId=cellID;
			// Hide error header
			var $root =$(this.element);
			$root.find('.pvtAccChild').find('.errorHeader').hide();
			
		},
		_getCellID:function(){
			return this.options.cellId;
		},
		/**
		 * Create intersection name for selected cell on top of text area.
		 * @param intersection
		 */
		_setIntersection:function(intersection){
			var intr="";
			var spt=[];
			var levels=[];
			var $root=$(this.element);
			// Order the members that make up the intersection 
			// by the dimension names, with the measure name
			// always at the end.
			/*intersection.sort(function(a,b){
				if(a.facetLabel == "Measure"){
					return 1;
				}
				if(b.facetLabel == "Measure"){
					return -1;
				}
				if(a.facetLabel < b.facetLabel){
					return -1;
				}
				if(a.facetLabel > b.facetLabel){
					return 1;
				}
				return 0;
			});*/
			var intrLength =intersection.length;
			for(var i=0; i<intrLength;i++){
				spt = intersection[i].facetLevelLabelObj.toString().split(",");
				levels = intersection[i].facetLevelNameObj;
				if(spt.length==1 && spt[0].length==0){
					spt[0]=this.options.getLocaleString("TotalMemberName"); //this._getFacetFilterLevelName(intersection[i].facetLabel);
				}
				//If we are supporting group by levels then we need to display all attributes from top to bottom in intersection.
				if(levels && (levels instanceof Array) && levels.length > 0 && !(levels.length == 1 && levels[0] == "_Total_")){
					var facetAttrubites = "";
					var facetMember = "";
					var levelsLength = levels.length;
					for(var j=0; j<levelsLength; j++){
						if(levels[j] == "_Total_"){
							continue;
						}
						if(levels[j].groupByLevel){
							if(facetAttrubites != ""){
								facetAttrubites+= "<span>&#44;&nbsp;</span>";	
							}
							facetAttrubites+= spt[j];
						}else{
							facetMember = spt[j];
						}
					}
					if(intr != ""){
						intr+= "<span>&nbsp;&#8226;&nbsp;</span>";	
					}
					if(facetMember == ""){
						facetMember = intersection[i].facetRootLabel;
					}
					intr+= facetMember;
					if(facetAttrubites){
						intr+= "&nbsp;&#40;" +facetAttrubites + "&#41;";
					}
				}else{
					if(intr != ""){
						intr+= "<span>&nbsp;&#8226;&nbsp;</span>";	
					}
					intr += spt[spt.length-1];	
				}
				
			}
			var $cmtArea =$root.find(".j-pvt-cmt-center").find(".j-pvt-cmt-center-body").find(".newCommentPanel");
			var $cmtBody =$cmtArea.find('.cmtBody');				
			var $intersection = $cmtBody.find(".intersectionName");
			$intersection.text("");//reset to blank before appending new value.
			$intersection.append(intr);
			this._setDefaults(true,true,0);
		},
		
		
		initializeCommentArea : function()
		{
			this._setDefaults(true,true,0);
		}, 
		/**
		 * Set default value to subject, description, filter field.
		 */
		_setDefaults: function(west,center,index){
			if(center){
				var $centerPanel =$(this.element).find('div.j-pvt-cmt-center-header');
				$centerPanel.find('.filtertext').val(this.options.getLocaleString('Comment.DefaultFilterText')).addClass("default-value");
				var $expandAll = $centerPanel.find('.pvtExpandAll');
				var $collapseAll = $centerPanel.find('.pvtCollapseAll');
				$expandAll.removeClass("pvt-hidden");
				$collapseAll.removeClass("pvt-hidden");
				if(index>(this.options.accordionOpen)){
					$collapseAll.addClass("pvt-hidden");
				}else{
					$expandAll.addClass("pvt-hidden");
				}
			}
		},
		
		/**
		 * Add leading zero to time(minute,second,hours) if it is (0-9) it add extra zero to left (00...09)
		 * @param value
		 * @returns string 
		 */
		_getLeadingZero:function(value){
			
			if(value < 10){
			      return "0" + value.toString();
			   }
			   return value.toString();  
		},
		/**
		 * Check for show parents comments filter is turned on or off
		 * @returns true/false - on /off
		 */
		_hasParentFiltered:function(){
			
			var $root =$(this.element).find(".j-pvt-cmt-center-header");
			
			var $leftButton = $root.find(".parentCmtText .pvtToggleON");
			
			return $leftButton.hasClass("toggleOn");
			
		},
		/**
		 * Check for show children comments filter is turned on or off
		 * @returns true/false - on /off
		 */
		_hasDescendantsFiltered:function(){
			
			var $root =$(this.element).find(".j-pvt-cmt-center-header");
			
			var $leftButton = $root.find(".childCmtText .pvtToggleON");
			
			return $leftButton.hasClass("toggleOn");
		},
		/**
		 * Update the editable accordion on the screen
		 * @param $target - jquery object
		 * @param response comment objects
		 * @param value request params
		 */
		updateAccordion:function($target,response,value){
			var filter = value.cmtId;
			var $cmtId = $target.find("span.commentId").filter(function(){
				return ($(this).text().indexOf(filter) > -1);
			});
			
			var $pvtContent = $cmtId.parent().parent();
			// detach pvt content as it requeries to be added on first child
			$pvtContent= $pvtContent.detach();
			var commentObj =_.find(response, function(obj){ return obj.commentId == filter;});
			// clear editable mode
			this._clearEditableMode($pvtContent);
			var tempSubText =commentObj.subject.trim().replace(/\n\s*\n/g, '');
			var modifiedDate =this._getFormattedDate(commentObj);
			var enableReasonCodeSupport = this.options.enableReasonCodeSupport;
			var $subArea = (enableReasonCodeSupport) ? $pvtContent.find('#contentCmtSubject') : $pvtContent.find('.contentSubHeader');
			$subArea.text(tempSubText).attr("title",tempSubText);
			var $commentTextContent = $pvtContent.find("#commentTextContent");
			$commentTextContent.text(commentObj.description);
			$pvtContent.find(".pvtAccordionDate").text(modifiedDate);
			
			if(enableReasonCodeSupport){
				var reasonCode = commentObj.reasonCode;
				var $contentReasonCode = $pvtContent.find('.contentReasonCode');
				var reasonCodeObj = this.options.reasonCodesArray[commentObj.reasonCode];
				var tempReasonCodeText= (reasonCodeObj && reasonCodeObj.dispValue) || (commentObj.reasonCode);
				$contentReasonCode.text(tempReasonCodeText).attr('title',tempReasonCodeText).attr("value",commentObj.reasonCode);
				$contentReasonCode.removeClass("reasonCodeEditingMode");
				tempSubText ? $subArea.addClass("contentCmtSubject") : $subArea.removeClass("contentCmtSubject");
				commentObj.description ?  $commentTextContent.addClass("commentTextContent") : $commentTextContent.removeClass("commentTextContent");
			}
			$target.prepend($pvtContent);
			
		},
	    /**
		 * Add accordion for each comment object available on presence
		 * @param response - Array of comment object
		 */
		addAccordion:function(response,value){
			
			var commentSize = response.length;
			var $root =$(this.element);
		    var $pvtCmtAccordion =$root.find("div.pvtComments");
			if(value.operation === "update"){
				this.updateAccordion($pvtCmtAccordion,response,value);
			}
			else{
				$pvtCmtAccordion.empty();
			    var showAncestors = this._hasParentFiltered();
			    var showDescendants = this._hasDescendantsFiltered();
			    var i=0;
				for(i=0; i < commentSize; i++)
				{   
					var $pvtContent = this._createAccordion(response[i],showAncestors,showDescendants,i);				
					$pvtCmtAccordion.append($pvtContent);
					
					if(i>(this.options.accordionOpen-1))
						$pvtContent.find(".cmtBody").slideUp("0");
				}
				
				this._setDefaults(false, true, commentSize);
			}

		},
		/**
		 * Get Formated Date
		 * @param commentObj
		 * @returns modified date
		 */
		_getFormattedDate:function(commentObj){
			var date = new Date(commentObj.timestamp);
			var modifiedDate = this.options.getFormattedDate(commentObj.timestamp);
			if(!modifiedDate){
				// get modified date in time stamp from server 
				modifiedDate = commentObj.timestampStr;
			}
			if(!modifiedDate){
				modifiedDate = this._getLeadingZero(date.getDate())+"/"+(this._getLeadingZero(Number(date.getMonth()) + 1))+"/"+date.getFullYear()
				+"   "+this._getLeadingZero(date.getHours())+":"+this._getLeadingZero(date.getMinutes())+":"+this._getLeadingZero(date.getSeconds());
			}
			
			return modifiedDate;
		},
		/**
		 * Adding accordion based on parameters which available for commentObj
 		 *  @param hideAncestors - boolean true/false true to hide ancestor relation comment
		 *  @param hideDescendants - boolean true/false true to hide descendants relation comment
		 *  @param header - text need to be displayed on accordion header;
		 *  @param content -text need to be displayed on accordion content;
		 *  @param relation - identify relation (ANCESTORS,DESCENDANTS,SELF) of comment which required to 
		 *  					  separate accordion on different colors
		 *  @param isRemove - boolean information show or hide delete button
		 *  @param commentID - unique id to identify comment
		 */
		_createAccordion:function(commentObj,showAncestors,showDescendants,uId){
			var self =this;
			
			var header = commentObj.userId;
			var subject = commentObj.subject || "";
			var content = commentObj.description;
			var relation = commentObj.relationship;
			var commentID = commentObj.commentId;
			var intersection = commentObj.intersection;

			if(intersection){
				if(intersection.indexOf("_Total_") > -1){
					intersection = intersection.replace(/_Total_/g, (this.options.getLocaleString('TotalMemberName') || 'Total'));
				}else if(intersection.indexOf("_All_") > -1){
					intersection = intersection.replace(/_All_/g, (this.options.getLocaleString('All') || 'All'));
				}else if(intersection.indexOf("_All_Facet_") > -1){
					intersection = intersection.replace(/_All_Facet_/g, (this.options.getLocaleString('All') || 'All'));
				}
				intersection =intersection.replace( / \/ /g,' <span>&#8226;</span> ');
				//intersection =intersection.replace( / \. /g,'<span>&nbsp;&#47;&nbsp;</span>');
			}
			
			var modifiedDate = self._getFormattedDate(commentObj);
						
			var $pvtContent = $('<div></div>').addClass('pvtContent');
			
			var $pvtCmtHeader =$('<div></div>').addClass('cmtHeader');
			var $pvtCmtBody =$('<div></div>').addClass('cmtBody');
			var $cmtId=$('<span class="commentId pvt-hidden">'+commentID+'</span>');
			var $expand=$('<img class="expand pvt-hidden" src="'+self.options.imgPath+'expand'+'.png"/>');
			var $collapse=$('<img class="collapse " src="'+self.options.imgPath+'collapse'+'.png"/>');
			
			$pvtCmtHeader.append($cmtId).append($expand).append($collapse);
			
			var hdimg=$('<img class="signComment" src="'+self.options.imgPath+relation+'.png"/>');
			hdimg.attr("title",self.options.getLocaleString('Comment.Tooltip.'+relation));
			
			$pvtCmtHeader.append(hdimg);
			
			var enableReasonCodeSupport = this.options.enableReasonCodeSupport;
			var $intersectionData =$('<div class="intersectionName"></div>').html(intersection);
			$intersectionData.attr('title',$("<span>"+intersection+"</span>").text());
			
			if(enableReasonCodeSupport){
				this._createReasonCodeSupport(commentObj, $pvtCmtHeader, $pvtCmtBody, $intersectionData);
			}else{
				var tempSubText = subject.trim().replace(/\n\s*\n/g, '');
				var $spanSubHeader=$('<span class="contentSubHeader"></span>').text(tempSubText).attr('title',subject).addClass(relation);
				$pvtCmtHeader.append($spanSubHeader);
			}
			
			var $spanContentHeader =$('<span class="contentUserHeader"></span>').text(" - "+header).addClass(relation);
			$pvtCmtHeader.append($spanContentHeader);
			    
			var $editCommentWrapper = this._createEditCommentWrapper(commentObj);
			var $deleteCommentWrapper = this._createDeleteCommentWrapper(commentObj);
			var spanDate = $('<span class="pvtAccordionDate"></span>').text(modifiedDate);
									
			$pvtCmtHeader.append($deleteCommentWrapper);
			$pvtCmtHeader.append($editCommentWrapper);
			$pvtCmtHeader.append(spanDate);
			
			if(!enableReasonCodeSupport){
				var $pvtCommentTextContent= $('<div id="commentTextContent"></div>').html(content);
				content && $pvtCommentTextContent.addClass("commentTextContent"); 
				$pvtCmtBody.append($pvtCommentTextContent).append($intersectionData);
			}
			
			$pvtContent.append($pvtCmtHeader).append($pvtCmtBody);
			$pvtContent.addClass(relation);
			
			if( ((showAncestors === false) && (relation === this.constants.ancestors)) ||
			    ((showDescendants === false) && (relation === this.constants.descendants))	){
				$pvtContent.addClass("pvt-hidden");
			}
			if(uId>(self.options.accordionOpen-1))
			{ // no of accordion open by default exceeds then slide up other accordions
				$expand.removeClass("pvt-hidden");
				$collapse.addClass("pvt-hidden");
				
			}
			
			this._bindEvent($expand, this._events.expand);
			this._bindEvent($collapse, this._events.collapse);
			this._bindEvent($deleteCommentWrapper, this._events.deleteButton);
			this._bindEvent($editCommentWrapper, this._events.editButton);
						
			return $pvtContent;
		},
		_createReasonCodeSupport : function(commentObj, $pvtCmtHeader, $pvtCmtBody, $intersectionData){
			var reasonCode = commentObj.reasonCode;
			var subject = commentObj.subject;
			var content = commentObj.description;
			var relation = commentObj.relationship;
			var reasonCodeObj = this.options.reasonCodesArray[reasonCode];
			var reasonCodeDispText= (reasonCodeObj && reasonCodeObj.dispValue) || (reasonCode);
			var $spanReasonCode=$('<span class="contentReasonCode '+relation+'"></span>').text(reasonCodeDispText).attr('title',reasonCodeDispText).attr("value", reasonCode);
			$pvtCmtHeader.append($spanReasonCode);
			
			//appneding intersection details 
			$pvtCmtBody.append($intersectionData);
			//appending comment title
			var $pvtCommentSubject= $('<div id="contentCmtSubject"></div>').html(subject).attr('title',subject);
			subject && $pvtCommentSubject.addClass("contentCmtSubject");
			$pvtCmtBody.append($pvtCommentSubject);
			//appending comment description
			var $pvtCommentTextContent= $('<div id="commentTextContent"></div>').html(content);
			content && $pvtCommentTextContent.addClass("commentTextContent"); 
			$pvtCmtBody.append($pvtCommentTextContent);
			//appending reason code
			if(commentObj.value){
				var cellId = {row :this._getCellID().sideAxis,column : this._getCellID().topAxis};
				var oldValue = (commentObj.oldValue) ? this.options.getCellFormattedValue(cellId, commentObj.oldValue) : " ";
				var value = this.options.getCellFormattedValue(cellId, commentObj.value);
				var measureValues = this.options.getLocaleString("Comment.ValueModified", oldValue, value);
				var $pvtCommentMeasureValues= $('<div class="contentCmtMeasureValues"></div>').html(measureValues);
				$pvtCmtBody.append($pvtCommentMeasureValues);
			}
			
		},
		
		_createEditCommentWrapper:function(commentObj){
			var $editCommentWrapper = $('<span class="editCommentWrapper"></span>');
		    $editCommentWrapper.attr("title",this.options.getLocaleString('Comment.Tooltip.EditComment'));
			if(!commentObj.canModify){
				// disable the edit image if the comment can not be modified by the current user.Comment.Tooltip.DisableEditComment
				$editCommentWrapper.addClass("pvtDisable");
				$editCommentWrapper.attr("title",this.options.getLocaleString('Comment.Tooltip.DisableEditComment'));
			}
			return $editCommentWrapper;
		},
		_createDeleteCommentWrapper:function(commentObj){
			var $deleteCommentWrapper = $('<span class="deleteCommentWrapper"></span>');
		    $deleteCommentWrapper.attr("title",this.options.getLocaleString('Comment.Tooltip.DeleteComment'));
			if(!commentObj.canDelete){
				// disable the delete image if the comment can not be modified by the current user.
				$deleteCommentWrapper.addClass("pvtDisable");
				$deleteCommentWrapper.attr("title",this.options.getLocaleString('Comment.Tooltip.DisableDeleteComment'));
			}
			return $deleteCommentWrapper;
		},
	
		/**
		 * Filter Comment Area. It includes type ahead filter text box, check box filtering (parents comment , child comment)
		 * Expand All, Collapse All Comment Header. 
		 */ 
		_createCenterPanel:function($panel){
			
			   var $panelHeader = $('<div></div>').addClass("j-pvt-cmt-center-header");
			   
			   // Panel Header 
			    var $expand=$('<img class="expand" src="'+this.options.imgPath+'expand'+'.png"/>');
				var $collapse=$('<img class="collapse " src="'+this.options.imgPath+'collapse'+'.png"/>');
			   var $expandAll=$('<span class="pvtExpandAll pvt-hidden">'+this.options.getLocaleString('Comment.ExpandAll')+'</span>');
			   $expandAll.prepend($expand);
			   var $collapseAll=$('<span class="pvtCollapseAll">'+this.options.getLocaleString('Comment.CollapseAll')+'</span>');
			   $collapseAll.prepend($collapse);
			   
			   var needLeftButtonClick = true;
			   
			   var $parent=$('<label  class="parentCmtText"></label>');
			   var $parentContentText =$('<span class="parentContentText" ></span>').text(this.options.getLocaleString('Comment.ParentComment'));
			   $parentContentText.attr("title",this.options.getLocaleString('Comment.ParentComment'));
			   $parent.append($parentContentText);
			   this._getToggleButton($parent, 1, needLeftButtonClick);
			   
			   var $child =$('<label  class="childCmtText"></label>');
			   var $childContentText =$('<span class="childContentText"></span>').text(this.options.getLocaleString('Comment.ChildComment'));
			   $childContentText.attr("title",this.options.getLocaleString('Comment.ChildComment'));
			   $child.append($childContentText);
			   this._getToggleButton($child, 2, needLeftButtonClick);
			   
			   if(this.options.getPivotObj()){
				   if(this.options.getPivotObj().showCommentIndicator()){
					   this.options.getPivotObj().updateCellCommentRelation("SELF_ANCESTORS_DESCENDANTS");
				   }else{
					   needLeftButtonClick = false;
				   }
			   }
			   
			   var $showCommentIndicator=$('<label  class="showCmtText"></label>');
			   var $showCommentIndicatorText =$('<span class="showCmtContentText"></span>').text(this.options.getLocaleString('Comment.ShowCommentIndicator'));
			   $showCommentIndicatorText.attr("title", this.options.getLocaleString('Comment.ShowCommentIndicator'));
			   $showCommentIndicator.append($showCommentIndicatorText);
			   this._getToggleButton($showCommentIndicator, 0, needLeftButtonClick);
			   
			   //updating flag
			   this.options.needSegmentCall = true;
			  
			   $panelHeader.append($expandAll).append($collapseAll);
			   //Add Comment Button.
			   var $newcmtbtn = $('<span></span>').addClass("addComment");
			   $newcmtbtn.append(this._ui.addCommentButton);
			   $panelHeader.append($newcmtbtn);
			   this._bindEvent(this._ui.addCommentButton, this._events.addNewComment);
			   
			   $panelHeader.append($showCommentIndicator).append($parent).append($child).append(this._ui.filterComment);
				   
			   
			 		   
	           var $panelBody  =$('<div></div>').addClass("j-pvt-cmt-center-body");
	           //New add comment panel.
	           var $newCommentPanel = this._createNewCommentPanel();
        	   $panelBody.append($newCommentPanel);
        	   
	           $panelBody.append('<div class="pvtComments"></div>');
	           $panel.append($panelHeader).append($panelBody);
	           
	           this._bindEvent($expandAll, this._events.expandAll);
			   this._bindEvent($collapseAll, this._events.collapseAll);
			
		},
	
		  /**
		   * Create toggle Button 
		   * @param $target - create toggle button append to target
		   * @param id - id helps to differentiate different toggle button
		   */
		 _getToggleButton:function($target,id, needLeftButtonClick){
	    	  
			 var pivotComment =this;
			 var $toggleButton=$("<span class='toggleButton' style = 'padding: 6px; margin-top: 5px;' id='toggleButton"+id+"'></span>");
			 
			 var $toggleOnImg=$("<label class='switch'><input type='checkbox'><span class='slider"+id+" round' id='span"+id+"'></span></label>");
			 var $toggleOffImg=$("<label class='switch'><input type='checkbox'><span class='slider round' id='span"+id+"'></span></label>");
			 
			 
			 var $toggleOn=$('<span class="pvtToggleON"></span>');
			 $toggleOn.addClass('right'+id);
			 $toggleOn.append($toggleOnImg);
			
			 var $toggleOff=$('<span class="pvtToggleOFF"></span>');
			 $toggleOff.addClass('left'+id);
			 $toggleOff.append($toggleOffImg);			 
			 
			 $toggleOn.appendTo($toggleButton);			 
			 $toggleOff.appendTo($toggleButton);
			 
			 $target.append($toggleButton);
			 
			 /* Toggle should work in different way. i.e. when click on OFF should be ON and vice versa. 
			  * i.e. when click on toggleOn button, the indicator should turn off and hide the respective comments.
			  * same way, when click on toggleOff button, the indicator should turn on and display respective comments. 
			  * */
			 pivotComment._bindEvent($toggleOn, pivotComment._events.hideCommentDetails);
			 pivotComment._bindEvent($toggleOff, pivotComment._events.displayCommentDetails);
			 
			 if(needLeftButtonClick){
				 $toggleButton.find('.pvtToggleON').removeClass('pvt-hidden');
				 $toggleButton.find('.pvtToggleOFF').addClass('pvt-hidden');
				 $toggleOff.click();
			 }else{
				 $toggleButton.find('.pvtToggleON').addClass('pvt-hidden');
				 $toggleButton.find('.pvtToggleOFF').removeClass('pvt-hidden');

			 }	 
		 },
				       
		resize:function(width,height){
			pivotlog("Comment flyout resizing %o width, %o height",width,height);
			this.options.pivotHeight=height;
			var $root = $(this.element).width(width).height(height);
			var $pvtCommentContent =$root.find(".j-pvt-cmt-wrapper");
			
			var descHeight = height-(40+8+33+44); // header+ body + title + Buttons area
			//If the reson code enabled then we need to subtract reason codes drop down height.
			if(this.options.enableReasonCodeSupport){
				descHeight -= (25 + 33); //reason codes label + combo 
			}
			$pvtCommentContent.find(".j-pvt-cmt-west-body-desc").css("height",descHeight);
			
			//decresing or increasing reason code drop down
			 if(this.options.enableReasonCodeSupport){
			 	var $reasonCodesCombo = $(this.element).find("#reasonCodesCombo");
			 	var $centerBody = $pvtCommentContent.find(".j-pvt-cmt-center-body");
				$centerBody.css("height",height-45); // includes center header and paddings.
				$centerBody.css("overflow","auto");
			 	$reasonCodesCombo = this.getReasonCodesCombo($reasonCodesCombo, $(this.element).width());
			 }
		},
		
		
		/**
		 * Manually resetting the height of Accordion comment content area as a fix for IE9 and 10
		 * 
		 */
		_resetHeight : function(){
			var containerArea = $(this.element).find("div.pvtCommentContents");
			if(!containerArea.find('div.ANCESTORS:visible,div.DESCENDANTS:visible,div.SELF:visible').length){
				containerArea.css("height",'0px');
			}
			else{
				containerArea.css("height",'auto');
			}
		},
		
		/**
		 * Checking Invalid charaters for validation on subject and description
		 * 
		 */
		_checkForInvalidCharacters:function(text,isSubject){
			var msg;
			if(isSubject){
				// character checking for subject 
				msg = this.options.subject(text);
				if(msg == false)
					msg = this.options.text(text);
			}
			else{
				// character checking for description
				msg = this.options.description(text);
				if(msg == false)
					msg =this.options.text(text);
			}
			return msg;
		},
		  /** 	 function loops trough this._events and
		   * 	bind them to their respective elements. Notice
		   *	that it passes the widget object to the event 
		   *	callback to allow it to interact with the widget.
		   */
		_bindEvents: function() {
		        var widget = this;
		        $.each(this._events, function(node, events){
		            $.each(events, function(eventName, callback) {
		            	try {
		                $(widget._ui[node]).bind(eventName, function(e) {
		                    callback.apply(this, [e, widget]);
		                });
		              
		            }catch(e){};});
		        });
		    },
		    
       /**
        * Bind appropriate events to selector
        * @param selector
        * @param events
        */
	    _bindEvent: function(selector,events) {
		       var widget = this;
		            $.each(events, function(eventName, callback) {
		            	try {
		                $(selector).bind(eventName, function(e) {
		                    callback.apply(this, [e, widget]);
		                });
		              
		            }catch(e){};});
		    },  
		 /**
		  * Set localized values from specified  locale.
		  */  
		 _setLocalizedValues:function(){
			this._ui.addCommentButton.val(this.options.getLocaleString('Comment.AddComment'));
			this._ui.filterComment.prop("defaultValue",this.options.getLocaleString('Comment.DefaultFilterText'));
			this._ui.subComment.prop("defaultValue",this.options.getLocaleString('Comment.DefaultSubject'));
			this._ui.textComment.prop("defaultValue",this.options.getLocaleString('Comment.DefaultDescription'));
			this._ui.subComment.text(this.options.getLocaleString('Comment.DefaultSubject'));
			this._ui.textComment.text(this.options.getLocaleString('Comment.DefaultDescription'));
			this._ui.filterComment.text(this.options.getLocaleString('Comment.DefaultFilterText'));
		},   
		/**   	this object contain all the elements that compose 
		 * 		the UI making it easy to keep track UI components. 
		 *		It also allow easy access without using selectors.
		 */
	    _ui: {
				subComment:$('<input  class="cmtSubArea pvt-sub-cmt default-value"></input>'),
	    		textComment:$('<textarea  class="cmtDescArea pvt-desc-cmt default-value"></textarea>'),
	    		filterComment:$('<input class="filtertext" type="text" class="default-value"/>'),
	    		parentCheckBox:$('<input type="checkbox" class="checkbox cmtParentsCheckBox" checked=true  />'),
	    		childCheckBox:$('<input type="checkbox" class="checkbox cmtChildCheckBox" checked=true  />'),
	    		reasonCodes:$('<select id="reasonCodesCombo" class="reasonCodesCombo"/>'),
	    		addCommentButton :$('<input type="button"  class="j-pvt-primary-button"/>'),
	   
	    },
	  
	    /**
	     * clear editable state
	     * @param $pvtComment
	     */
	  _clearEditableMode:function($pvtComment){
		    
			var $cmtHeader =$pvtComment.find(".cmtHeader");
			
			$cmtHeader.removeClass("editingModeHeader");
			var enableReasonCodeSupport = this.options.enableReasonCodeSupport;
			var $subArea = (enableReasonCodeSupport) ? $pvtComment.find('#contentCmtSubject') : $cmtHeader.find('.contentSubHeader');;
			var $descArea =$pvtComment.find('#commentTextContent');
			var $editButton = $cmtHeader.find('.editCommentWrapper');
			var $cancelButton= $cmtHeader.find('.deleteCommentWrapper');
			if(enableReasonCodeSupport){
				var $contentReasonCode = $cmtHeader.find('.contentReasonCode');
				$contentReasonCode.empty();
				var tempReasonCodeText = $cmtHeader.data("reasonCode");
				$contentReasonCode.text(tempReasonCodeText).attr('title',tempReasonCodeText);
				$contentReasonCode.removeClass("reasonCodeEditingMode");
				!$cmtHeader.data("sub") && $subArea.removeClass("contentCmtSubject");
				!$cmtHeader.data("desc") && $descArea.removeClass("commentTextContent");
			}
			
			// Remove editing mode related class names
			$subArea.removeClass("editingMode");
			$editButton.removeClass("okButton");
			$cancelButton.removeClass("cancelButton");
			var editToolTip = $editButton.hasClass("pvtDisable")? this.options.getLocaleString("Comment.Tooltip.DisableEditComment"):
							  this.options.getLocaleString("Comment.Tooltip.EditComment");
			var deleteToolTip = $cancelButton.hasClass("pvtDisable")? this.options.getLocaleString("Comment.Tooltip.DisableDeleteComment"):
				  this.options.getLocaleString("Comment.Tooltip.DeleteComment");
			
			$editButton.attr("title",editToolTip);
			$cancelButton.attr("title",deleteToolTip);
			// Retrive sub and description from comment Header data
			var subCmt = $cmtHeader.data("sub");
			var descCmt = $cmtHeader.data("desc");
			$subArea.empty();
			$descArea.empty();
			
			$subArea.text(subCmt);
			$descArea.text(descCmt);  
	  },
	   /**
	    * Enable the save button which is disabled during validation error 
	    * @param $target
	    */
	  _hideError:function($target){
		  
		  $target.find('.saveComment').removeAttr("disabled").removeClass("pvtDisabled");
		  $target.find('.okButton').removeClass("pvt-update-disable");
		  //Remove the disability for the save button of new comment panel when no error present.
		  $target.find('.okButton').removeClass("saveComment-disable");

		  
	  },
	  /**
	   * show error msg when validation fails.
	   */
	  _showError:function($root,msg){
		  var that = this;
		  var $centerPanel =$root.parents('.pvtContent');
		  if($centerPanel && $centerPanel.length>0){
			  $centerPanel.find('.okButton').addClass("pvt-update-disable");			
		  }else{
			  var $cmtHeader = $root.parent().parent().find('.cmtHeader');
			  if($cmtHeader && $cmtHeader.length>0){
				  $cmtHeader.find('.okButton').addClass("saveComment-disable");
			  }
		  }
		  that.errorMsg = msg;
		 /* $root.find('div').remove();
		  $("<div>", {"class": "extremeRight"}).appendTo($root);*/
		 $root.on('mouseover',function(event){
			 var width = $(this).width();
			/* var pos = $(this).offset();*/
			 
			if(($(this).hasClass('pvtAlert') === false) ||(event.offsetX+20<width || event.offsetY>20)){
				event.stopImmediatePropagation();
				return;
			}
		  $root.qtip("destroy");
		  $root.qtip({
                      overwrite : false,
                      content : ' ',
                      position : {
                    	  my: "top right",
                          at: "top right",
                          adjust:{
                        	  x:-15,
                        	  y:20
                          }
                      },
                      show : {
                          delay : 10,
                          event : event.type,
                          ready : true,
                          solo : true
                      },
                      style : {
                    	  color: 'white',
                          textAlign: 'center',                     
                          name: 'red', 
                          classes : 'validationErrorToolTip'
                      },
                      hide : {
                          when : {
                              event : 'mousemove scroll mouseout mousewheel'
                          },
                          delay : 0
                      },
                      events : {
                    	  beforeShow : function(eventTip,api){
                        	  return false;
                          },
                    	  show : function(eventTip, api) {                          

                              api.set('content.text', that.errorMsg);
                          }
                      
                      }
                  }, event);

		 });
	  },
	   /**
	    * this object list all events, 
	    * classified by UI component
	    */    
	    
	  _events: {
		  hideCommentDetails:{
		    	click:function(e,widget){
		    		var target = e.srcElement || e.target;	
		    		var $parent = $(target).parents(".toggleButton");
		    		
		    		$parent.find(".pvtToggleON").addClass("pvt-hidden");
		    		$parent.find(".pvtToggleOFF").removeClass("pvt-hidden");
		    		
		    		$parent.find(".pvtToggleON").removeClass("toggleOn");
		    		
		    		if(widget.options.needSegmentCall && widget.options.getPivotObj()){
	    				widget._updateCellCommentRelation();
	    				widget.options.getPivotObj().initGetSegmentData(true);
	    			}
	    			// Hide div elements of either ancestors or descendants     
		    		var $centerPanel = $(target).parents(".j-pvt-cmt-center");
		    		var $target = $parent.find(".pvtToggleON");
		    		
		    		if($target.hasClass("right0")){
		    			widget.options.getPivotObj().updateShowCommentIndicator(false);
		    		}else  if($target.hasClass("right1")){
	    			  var $ancestors =$centerPanel.find("div.ANCESTORS");
	    			  $ancestors.addClass("pvt-hidden");
		    		}else{
		    			 var $descendants =$centerPanel.find("div.DESCENDANTS");
		    			 $descendants.addClass("pvt-hidden");
	    			}
		    	}
		    },
		    displayCommentDetails:{
		    	click:function(e,widget){
		    		var target = e.srcElement || e.target;	
		    		var $parent = $(target).parents(".toggleButton");
		    		$parent.find(".pvtToggleOFF").addClass("pvt-hidden");
		    		$parent.find(".pvtToggleON").removeClass("pvt-hidden");	
		    		var $centerPanel = $(target).parents(".j-pvt-cmt-center");
		    		var $target = $parent.find(".pvtToggleOFF");
		    		$parent.find(".pvtToggleON").addClass("toggleOn");
		    		
		    		if(widget.options.needSegmentCall && widget.options.getPivotObj()){
		    			widget._updateCellCommentRelation();
	    				widget.options.getPivotObj().initGetSegmentData(true);
	    			}
	    			
		    		if($target.hasClass("left0")){
		    			widget.options.getPivotObj().updateShowCommentIndicator(true);
		    		}else  if($target.hasClass("left1")){
	    			  var $ancestors =$centerPanel.find("div.ANCESTORS");
	    			  if($ancestors.length > 0){
	    				  $ancestors.removeClass("pvt-hidden");
	    			  }else{
	    				  widget._sendCommentsRequest(true);
	    			  }
		    		}else{		    			    			
		    			 var $descendants =$centerPanel.find("div.DESCENDANTS");
		    			 if($descendants.length > 0){
		    				 $descendants.removeClass("pvt-hidden");
		    			 }else{
		    				 widget._sendCommentsRequest(true);
		    			 }
	    			}
		    		
		    		
		    	}

		    },   
	    	// Events for Expand All div element
	    	expandAll:{
	    		click:function(e,widget){
	    			var target = e.srcElement || e.target;  
	    			var $grandParent = $(target).parents(".j-pvt-cmt-center");
	    			var cmtContent = $grandParent.find(".j-pvt-cmt-center-body .cmtBody");
	    			cmtContent.slideDown('1000');
	    			
	    			var cmtHeader = $grandParent.find(".j-pvt-cmt-center-body .cmtHeader");
	    			cmtHeader.find(".collapse").removeClass("pvt-hidden");
	    			cmtHeader.find(".expand").addClass("pvt-hidden");
	    			$grandParent.find(".pvtExpandAll").addClass("pvt-hidden");
	    			$grandParent.find(".pvtCollapseAll").removeClass("pvt-hidden");
	    		}
	    	},
	    	// Events for Collapse All div element
	    	collapseAll:{
	    		click:function(e,widget){
	    			var target = e.srcElement || e.target;  
	    			var $grandParent = $(target).parents(".j-pvt-cmt-center");
	    			var cmtContent = $grandParent.find(".j-pvt-cmt-center-body .cmtBody");
	    			cmtContent.slideUp('1000');
	    			
	    			var cmtHeader = $grandParent.find(".j-pvt-cmt-center-body .cmtHeader");
	    			cmtHeader.find(".expand").removeClass("pvt-hidden");
	    			cmtHeader.find(".collapse").addClass("pvt-hidden");
	    			$grandParent.find(".pvtCollapseAll").addClass("pvt-hidden");
	    			$grandParent.find(".pvtExpandAll").removeClass("pvt-hidden");
	    			
	    		}
	    	},
	    	// expand comment description
	    	expand:{
	    		click:function(e,widget){
	    			var target = e.srcElement || e.target;  
	    			var $grandParent = $(target).parent().parent();
	    			var cmtContent = $grandParent.find(".cmtBody");
	    			cmtContent.slideDown('1000');
	    			$grandParent.find(".expand").addClass("pvt-hidden");	    			
	    			$grandParent.find(".collapse").removeClass("pvt-hidden");
	    		}
	    	},
	    	// collapse comment description
	    	collapse:{
	    		click:function(e,widget){
	    			var target = e.srcElement || e.target;  
	    			var $grandParent = $(target).parent().parent();
	    			var cmtContent = $grandParent.find(".cmtBody");
	    			cmtContent.slideUp('1000');
	    			$grandParent.find(".collapse").addClass("pvt-hidden");	    			
	    			$grandParent.find(".expand").removeClass("pvt-hidden");
	    			
	    		}
	    	},
	    	// Events for Save Comment (save button)
	    	saveButton: {
	    		click: function(e, widget){
	    			var target = e.srcElement || e.target;
	    			$grandParent = $(target).parent().parent();
				    var $subArea =$grandParent.find('.cmtSubArea');
	    			var $descArea =$grandParent.find('.cmtDescArea');
	    			var $reasonCode =$grandParent.find('.reasonCodesCombo');

	    			var value={};
	    			value.cmtDesc = $descArea.val().trim();
	    			value.cmtSubj =$subArea.val().trim();
	    			value.operation="add";
	    			value.cmt="true";
	    			if(widget.options.enableReasonCodeSupport){
	    				value.cmtReasonCd = $reasonCode.val().trim();
	    			}

	    			var cellLocation = widget._getCellID();
	    			
	    			if(cellLocation === undefined){
	    				// cellLocation not available then cell is not selected. 
	    				// Can't proceed without cell selection
 						return;
	    			}
	    			
					if(_.contains(widget.options.mandatory,"subject")&&(value.cmtSubj===$subArea[0].defaultValue.trim() ||value.cmtSubj==="")){
						// Checking for subject field error
						widget._showError($subArea,widget.options.getLocaleString("Comment.ErrMsg01"));		    				
						$subArea.addClass("pvtAlert");
						$subArea.focus();
						return;
					}else if($(target).hasClass("saveComment-disable")){
	        			 e.stopImmediatePropagation();
	        			 return;
	        		}else if(!_.contains(widget.options.mandatory,"subject") && value.cmtSubj===$subArea[0].defaultValue.trim()){
						value.cmtSubj ="";
					}
					if(value.cmtDesc===$descArea[0].defaultValue.trim()){
						value.cmtDesc="";
					}
	    			
	    			var data={
	    					value:value,
	    					cell:cellLocation
	    			};
	    			// initiate app specific function before save
	    			widget.options.beforeSave(value);
	    			//Hide the add comment panel while saving the comment.
	    			widget.hideNewCommentPanel();
	    			// Generate new request save comment with provided information
					widget.options.executeAction(e,data);
					//$grandParent.find('.errorHeader').hide();
					widget._setDefaults(true,true,0);
					// initiate app specific function after save
					widget.options.afterSave(value, cellLocation);
	  			}	            
	        },
	        // update comment to server
	        updateButton:{
	        	click: function(e,widget){
	        		 var target = e.srcElement || e.target;
	        		 
	        		 if($(target).hasClass("pvt-update-disable")){
	        			 e.stopImmediatePropagation();
	        			 return;
	        		 }
	        		 
	        		 var $cmtHeader =$(target).parent();
		    		 var $pvtComment = $cmtHeader.parent();
		    		 
		    		 
		    		 var $subArea =$pvtComment.find('.editSubCmt');
		    		 var $descArea =$pvtComment.find('.editDescCmt');
		    		 var value={};
		    		 
		    		value.cmtSubj= $subArea.val().trim();
		    		value.cmtDesc= $descArea.val().trim();
		    		value.cmtId= $pvtComment.find('.commentId').text();
	    			value.operation="update";
	    			value.cmt="true";
	    			if(widget.options.enableReasonCodeSupport){
	    				value.cmtReasonCd = $pvtComment.find(".editReasonCodes").val().trim();
	    			}
	    			var cellLocation = widget._getCellID();
	    			if(_.contains(widget.options.mandatory,"subject") && (value.cmtSubj===$subArea[0].defaultValue.trim() ||value.cmtSubj==="")){
						// Checking for subject field error
						widget._showError($subArea,widget.options.getLocaleString("Comment.ErrMsg01"));		    				
						$subArea.addClass("pvtAlert");
						$subArea.focus();
						return;
					}else if(!_.contains(widget.options.mandatory,"subject") && value.cmtSubj===$subArea[0].defaultValue.trim()){
						value.cmtSubj ="";
					}
					if(value.cmtDesc===$descArea[0].defaultValue.trim()){
						value.cmtDesc="";
					}
	    			
	    			var data={
	    				value:value,
	    				cell:cellLocation
	    			};
	    			// Generate new request update comment with provided information
	    			widget.options.executeAction(e,data);
	    			// call application specific function after edit
	    			widget.options.afterEdit(value, cellLocation);
	        	}
	        },
	        // Events for Update Comment.
	        editButton: {
	    		click: function(e, widget){
	    		    var target = e.srcElement || e.target;
	    		    
	    		   // check if edited button pencil icon is modified to update button tick mark icon.
	    		   // If it has tick mark icon then delegate to update button call
	    		    if($(target).hasClass("okButton")){
	    		    	widget._events.updateButton.click(e,widget);
	    		    	return;
	    		    }
	    		    // Editable button has been disable. Return from further operation
	    		    if($(target).hasClass("pvtDisable")){
	    		    	return;
	    		    }
	    		      		    
	    		    var $cmtHeader =$(target).parent();
	    			var $pvtComment = $cmtHeader.parent();
		    		widget._events.expand.click(e,widget);
		    		var enableReasonCodeSupport = widget.options.enableReasonCodeSupport;
	    			
	    			$cmtHeader.addClass("editingModeHeader");
	    			
	    			var $subArea = (enableReasonCodeSupport) ? $pvtComment.find('#contentCmtSubject') : $cmtHeader.find('.contentSubHeader');
					var $descArea =$pvtComment.find('#commentTextContent');
					var $editButton = $cmtHeader.find('.editCommentWrapper');
					var $cancelButton= $cmtHeader.find('.deleteCommentWrapper');
					
					if(enableReasonCodeSupport) {
						//If reason code support enalbe then creating reason code drop down dynamically.
						var $reasonCode = $cmtHeader.find(".contentReasonCode");
						$cmtHeader.data("reasonCode",$reasonCode.text().trim());
						
			        	var $reasonCodesCombo = $('<select id="reasonCodesCombo" class="reasonCodesCombo"/>').addClass("editReasonCodes");
			        	var defaultReasonCode = widget.options.defaultReasonCode;
			        	defaultReasonCode && $reasonCodesCombo.append($('<option>', {value:defaultReasonCode, text:defaultReasonCode, title: defaultReasonCode}));
			        	
			        	var $width = $reasonCode.parent().width();
			        	$reasonCodesCombo = widget.getReasonCodesCombo($reasonCodesCombo, $width);
			        	
						var selectedReasonCode = ($reasonCode.attr("value")) ? $reasonCode.attr("value").trim() : defaultReasonCode ? defaultReasonCode : "";
						$reasonCodesCombo.val(selectedReasonCode);
						$reasonCode.empty();
			        	$reasonCode.append($reasonCodesCombo);
			        	$reasonCode.addClass("reasonCodeEditingMode");
			        	widget._bindEvent($reasonCodesCombo,widget._events.reasonCodesCombo);
	    			}
					
					var subText = $subArea.text().trim();
					var descText =$descArea.text().trim();
					$subArea.empty();
					$descArea.empty();
					// add sub & desc text to cmtHeader data such that we can use it later when user cancel edit operation
					$cmtHeader.data("sub",subText);
					$cmtHeader.data("desc",descText);
					
					// create editing fields
					var $subTextArea =$('<input></input>').addClass("editSubCmt").addClass("pvt-sub-cmt");
					var $descTextArea =$('<textarea></textarea>').addClass("editDescCmt").addClass("pvt-desc-cmt");
					
					$subTextArea.prop("defaultValue",widget.options.getLocaleString('Comment.DefaultSubject'));
					$descTextArea.prop("defaultValue",widget.options.getLocaleString('Comment.DefaultDescription'));
					
					// Bind appropriate events
					widget._bindEvent($subTextArea,widget._events.subComment);
					widget._bindEvent($descTextArea,widget._events.textComment);
					// set values to editable fields
					if(subText){
						$subTextArea.val(subText);
					}else{
						$subTextArea.val(widget.options.getLocaleString('Comment.DefaultSubject'))
						$subArea.addClass("contentCmtSubject"); 
					}
					
					if(descText){
						$descTextArea.val(descText);
					}else{
						$descTextArea.val(widget.options.getLocaleString('Comment.DefaultDescription'))
						$descArea.addClass("commentTextContent"); 
					}
					
					$subArea.append($subTextArea).addClass("editingMode");
					$descArea.append($descTextArea);
	    			
					$editButton.addClass("okButton");
					$cancelButton.addClass("cancelButton");
					$editButton.attr("title",widget.options.getLocaleString("Comment.Tooltip.UpdateButton"));
					$cancelButton.attr("title",widget.options.getLocaleString("Comment.Tooltip.CancelButton"));
									
	            }
	        },
	        // Events for Cancel button
	        cancelButton: {
	            click: function(e, widget){
	            	var target = e.srcElement || e.target;
	            	
	            	var $pvtComment =$(target).parent().parent();
	            	// clear editable mode
	    			widget._clearEditableMode($pvtComment);
										
					widget.options.onEditCancel();
					
						            

	            }
	        },
	        // Events for Delete Comment
	        deleteButton:{
	        	click:function(e,widget){
	        		var target = e.srcElement || e.target;
	        		var $parent = $(target).parent();
	        		 
	        		// check if delete button recycle bin icon is modified to cancel button cross mark icon.	    		   
	        		// If it has cross mark icon then delegate to cancel button call
	        		if($(target).hasClass("cancelButton")){
	        			// Delegate call to cancel Button ;
	        			widget._events.cancelButton.click(e,widget);
	    				return;
	    			}
	        		// Delete has been disable for the current user. Return immediately
	        		if($(target).hasClass("pvtDisable")){
	    		    	return;
	    		    }
	        		var value={};
	        		var commentId = $parent.find('.commentId').text();
	        		var cellLocation = widget._getCellID();
	        		value.cmtId =commentId;
	        		value.cmt = "true";
	        		value.operation = "delete";
	        		value.done=false;
	        		var data={
	    					value:value,
	    					cell:cellLocation	    					
	    					}; 
	        		// call app specific function before delete operation
	        		widget.options.beforeDelete(commentId);
	        		// Generate new request update comment with provided information
	    			widget.options.executeAction(e,data);
	        		// TO DO: Need to think how we can remove accordion from UI.
	        		$parent.parent().remove();
	        		
	        		//Handling accordions open based on configuration for deleting comment. 
	        		var $pvtComments = $(widget.element).find(".pvtContent");
	        		if($pvtComments){
	        			$.each($pvtComments, function(index,content){
	        				var cmtContent = $(content).find(".cmtBody");
	     	    			var $expand = $(content).find(".cmtHeader").find(".expand");	    			
	     	    			var $collapse = $(content).find(".cmtHeader").find(".collapse");
	     	    			if(widget.options.accordionOpen > index){
	     	    				cmtContent.slideDown('1000');
	        					$expand.addClass("pvt-hidden");
	        					$collapse.removeClass("pvt-hidden");
	        				}else{
	        					cmtContent.slideUp('1000');
	        					$expand.removeClass("pvt-hidden");
	        					$collapse.addClass("pvt-hidden");
	        				}
	 			        });
	        		}
	        		// call app specific function after delete operation
	        		widget.options.afterDelete(commentId);
	        	}
	        },
	        // Events for Description textarea.
	        textComment:{
	        	paste:function(e,widget){
	        		// setting time out to generate pasted comment on text area. 
	        		// usually it takes some millisecond to generate text during paste.        		
	        		setTimeout(function() {
	        			widget._events.textComment.keyup(e, widget);
	                  },100);
	        	},
	        	focus:function(e,widget){
	        	   	var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    // Changing border color on focus.
	        	    $(target).addClass('pvtTextFocus');
	        	    
	        	    var value = target.value;
	        	    if(value == defaultValue){
	        	    	target.value='';
	        	    	$(target).removeClass('default-value');
	        	    }
	        	},
	        	blur:function(e,widget){
	        		var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    $(target).removeClass('pvtTextFocus');
	        	    
	        	    var value = target.value;
	        	    if(value == ''){
	        	    	target.value=defaultValue;
	        	    	$(target).addClass('default-value');
	        	    }
	        	},
	        	keydown:function(e,widget){
	        		// Prevent Enter key inside text area
	        		if(e.keyCode == 13){
						e.preventDefault();
						return false;
					}
	        	},
	        	keyup:function(e,widget){
	        		var target = e.srcElement || e.target;
					var text = target.value;
					var $cmtArea = $(target);
					var $grandParent =$cmtArea.parent().parent().parent();
					
					// Checking for Invalid characters on key up for description
					var errorMsg = widget._checkForInvalidCharacters(text,false);
					
					if(errorMsg != false){
						// If error msg not false then show error
						$cmtArea.addClass("pvtAlert");
	    				widget._showError($cmtArea,errorMsg.msg);
	    				return;
					}
					
					$cmtArea.qtip("destroy");
					$cmtArea.removeClass("pvtAlert");
					 
					if($grandParent.find('.pvt-sub-cmt').hasClass("pvtAlert") === false){
						widget._hideError($grandParent);				   												
					 }

	        	}
	        },
	        // Events for Subject Text area.
	        subComment:{
	        	paste:function(e,widget){
	        		// setting time out to generate pasted comment on text area. 
	        		// usually it takes some millisecond to generate text during paste.
	        		  setTimeout(function () {
	        		    widget._events.subComment.keyup(e, widget);
	        		  }, 100);	        		
	        		
	        	},
	        	focus:function(e,widget){
	        	   	var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    // Changing border color on focus.
	        	    $(target).addClass('pvtTextFocus');      	  
	        	    var value = target.value;
	        	    if(value == defaultValue){
	        	    	target.value='';
	        	    	$(target).removeClass('default-value');
	        	    }
	        	},
	        	blur:function(e,widget){
	        		var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    $(target).removeClass('pvtTextFocus');
	        	    var value = target.value;
	        	    if(value == ''){
	        	    	target.value=defaultValue;
	        	    	$(target).addClass('default-value');
	        	    }
	        	},
	        	keydown:function(e,widget){
	        		// Prevent Enter key inside text area
	        		if(e.keyCode == 13){
						e.preventDefault();
						return false;
					}
	        	},
	        	keyup:function(e,widget){
	        		var target = e.srcElement || e.target;
					
					var text = target.value.trim();
					text= text.replace(/\n\s*\n/g, '');
					var $cmtArea = $(target);
					var $grandParent = $cmtArea.parent().parent().parent();
					// Checking for Invalid characters on key up for subject
					var errorMsg = widget._checkForInvalidCharacters(text,true);
					
					if(errorMsg != false){
						// If error msg not false then show error
	    				widget._showError($cmtArea,errorMsg.msg);
	    				$cmtArea.addClass("pvtAlert");
	    				return;
					}
					$cmtArea.qtip("destroy");
					$cmtArea.removeClass("pvtAlert");
					// hide error
					if($grandParent.find('.pvt-desc-cmt').hasClass("pvtAlert") === false){
						widget._hideError($grandParent);				   												
					 }

					
	        	}
	        },
	        // Events for Reason Codes Combo.
	        reasonCodesCombo:{
	        	change:function(e,widget){
	        		//handle on change relates stuff.
	        	}
	        },
	        // Events for Filter Comment 
	        filterComment:{
	        	focus:function(e,widget){
	        	   	var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    // Changing border color on focus.
	        	    $(target).addClass('pvtTextFocus');
	        	    var value = target.value;
	        	    if(value == defaultValue){
	        	    	target.value='';
	        	    	$(target).removeClass('default-value');
	        	    }
	        	},
	        	blur:function(e,widget){
	        		var target = e.srcElement || e.target;
	        	    var defaultValue = target.defaultValue;
	        	    $(target).removeClass('pvtTextFocus');
	        	    var value = target.value;
	        	    if(value == ''){
	        	    	target.value=defaultValue;
	        	    	$(target).addClass('default-value');
	        	    }
	        	},
	        	keyup:function(e,widget){
			        var target = e.srcElement || e.target;
			        var filter = target.value, count = 0;
			      // Filter comments based on each character compared with all comment Accordion subject and description   		    
			        var $panel = $(target).parents('.j-pvt-cmt-center');
				      // Filter comments based on each character compared with all comment Accordion subject and description   		        
				    //var $contents =$panel.find(".contentSubHeader");
				    var enableReasonCodeSupport = widget.options.enableReasonCodeSupport;
				    var $contents = (enableReasonCodeSupport) ? $panel.find('.contentReasonCode') : $panel.find('.contentSubHeader');
				    var $contentArea =$panel.find('.pvtComments');
			        
			        var $grandParent = $contentArea.parent();
			        $contentArea.detach();
			        $.each($contents, function(index,content){
			        	if($(content).parents('.pvtContent').hasClass("pvt-hidden") === false){
			        	//content.each(function () {
			        	var searchContent= $(content).text() + $(content).parents('.pvtContent').find('#commentTextContent').text();
			        	enableReasonCodeSupport && (searchContent += $(content).parents('.pvtContent').find("#contentCmtSubject").text())
			        	if (searchContent.split(' ').slice().join('').indexOf(filter) < 0) {
			        		$(content).parent().parent().hide();
			        	} else {
			        		$(content).parent().parent().show();
			        		count++;
			        	}
			        	
			        	}
			        });
			        $grandParent.append($contentArea);
	            }
	        	
	        },
	        
	        addNewComment:{
	    		click: function(e, widget){
	    			var target = e.srcElement || e.target;
	    			var $grandParent = $(target).parent().parent().parent();
	    			var $pvtCmtAccordion = $grandParent.find("div.j-pvt-cmt-center-body");
	    			var $newCommentPanel = $pvtCmtAccordion.find('.newCommentPanel');
	    			widget.showNewCommentPanel($newCommentPanel);
	    		}
	    	},
	    	
	    	cancelNewComment: {
	            click: function(e, widget){
	            	widget.hideNewCommentPanel();
	            }
	        },

	    },
	    // Remove all comment Accordion .This can be used for changing cell selection,moving facets. 
		removeAccordion:function(){
			$(this.element).find(".pvtComments").empty();
			//this._resetHeight();
		},
		_destroy:function(){
			$(this.element).remove();
		},
		pivotflyoutopen : function(){	 
			this.options.flyoutIsOpen=true;
			this._sendCommentsRequest();
		},
	    pivotflyoutclose : function(){
	    	this.options.flyoutIsOpen=false;
	    },
	    _sendCommentsRequest : function(forceCall) {
	    	if (this.options.flyoutIsOpen && this.options.getPivotObj() && this._getCellID()) {
				if (this.options.getPivotObj().showCommentIndicator() && !forceCall) {
					var cellId = {
							row : this._getCellID().sideAxis,
							column : this._getCellID().topAxis
					}
					var currCellValue = this.options.getPivotObj().data.getCellValFromCellId(cellId);
					if (currCellValue && currCellValue.cmtRelation && currCellValue.cmtRelation != 'UNRELATED') {
						this._callExecuteAction();
					}
				}else {
					this._callExecuteAction();
				}
			} 
		},
		_callExecuteAction : function() {
			var data = {
					value : {
						operation : "read",
						cmt : "true",
					},
					cell : this._getCellID()
			};
			this.options.executeAction(null, data);
		},
		_updateCellCommentRelation : function() {
			var cmtHeader  = $('.j-pvt-cmt-center-header');
			var commentRelation = "UNRELATED";
			if(cmtHeader.find('.right0').hasClass("toggleOn")){
				commentRelation = "SELF";
				if(cmtHeader.find('.right1').hasClass("toggleOn") && cmtHeader.find('.right2').hasClass("toggleOn")){
					commentRelation = "SELF_ANCESTORS_DESCENDANTS";
				}else if(cmtHeader.find('.right1').hasClass("toggleOn")){
					commentRelation = "SELF_ANCESTORS";
				}else if(cmtHeader.find('.right2').hasClass("toggleOn")){
					commentRelation = "SELF_DESCENDANTS";
				}
			}
			this.options.getPivotObj().updateCellCommentRelation(commentRelation);
		},
		
		//New Comment Panel implementation.
		
		_createNewCommentPanel:function(){
			var $newCommentPanel = $('<div></div>').addClass("newCommentPanel").addClass("pvt-hidden");
			
			var $newCommentHeader = $('<div></div>').addClass("cmtHeader").addClass("newCmtHeader");
			
      	    var $cancelComment = $('<span class="cancelComment"></span>').addClass("cancelButton");
      	    $cancelComment.attr("title",this.options.getLocaleString('Comment.Tooltip.Cancel'));
		    var $saveComment = $('<span class="saveComment"></span>').addClass("okButton");
		    $saveComment.attr("title",this.options.getLocaleString('Comment.Tooltip.SaveButton'));

		    this._bindEvent($saveComment,this._events.saveButton);
			this._bindEvent($cancelComment,this._events.cancelNewComment);
			
			var $expand=$('<img class="expand pvt-hidden" src="'+this.options.imgPath+'expand'+'.png"/>');
			var $collapse=$('<img class="collapse " src="'+this.options.imgPath+'collapse'+'.png"/>');
			
			this._bindEvent($expand, this._events.expand);
			this._bindEvent($collapse, this._events.collapse);
			
			var relation = this.constants.self;
			var hdimg=$('<img class="signComment" src="'+this.options.imgPath+relation+'.png"/>');
			hdimg.attr("title",this.options.getLocaleString('Comment.Tooltip.'+relation));
									 
		    $newCommentHeader.append($expand).append($collapse).append(hdimg);
		    if(this.options.enableReasonCodeSupport){
		    	var $reasonCodesCombo = this._ui.reasonCodes;				
				this._bindEvent($reasonCodesCombo,this._events.reasonCodesCombo);
				$newCommentHeader.append($reasonCodesCombo);
		    }
		    $newCommentHeader.append($cancelComment).append($saveComment);
		    
			var $cmtBody =$('<div></div>').addClass('cmtBody');           
			
			var $intersection = $('<span></span>').addClass("intersectionName");		
			var $subTextArea =$('<input></input>').addClass("cmtSubArea").addClass("pvt-sub-cmt");
			var $descTextArea =$('<textarea></textarea>').addClass("cmtDescArea").addClass("pvt-desc-cmt");
			
			$subTextArea.prop("defaultValue",this.options.getLocaleString('Comment.DefaultSubject'));
			$descTextArea.prop("defaultValue",this.options.getLocaleString('Comment.DefaultDescription'));
			
			this._bindEvent($subTextArea,this._events.subComment);
			this._bindEvent($descTextArea,this._events.textComment);
						
			$cmtBody.append($intersection).append($subTextArea).append($descTextArea);
			
			$newCommentPanel.append($newCommentHeader).append($cmtBody);
			
			return $newCommentPanel;
		},
		
		//Reset the values in add comment panel.
		resetNewCommentPanel: function($newCommentPanel){
			//reset to default value for reason codes drop down.
			if($newCommentPanel){
				var $cmtHeader = $newCommentPanel.find(".cmtHeader");
				var $reasonCodesCombo =  $cmtHeader.find(".reasonCodesCombo");
				$reasonCodesCombo.val(this.options.defaultReasonCode);
				
				//reset to default value(s) for comment subject and description.
				var $cmtBody = $newCommentPanel.find(".cmtBody");
	        	var $cmtSubject =  $cmtBody.find(".cmtSubArea");
	        	var $cmtDesc =  $cmtBody.find(".cmtDescArea");
	        	
	        	//Remove previous error icons if any in subject and description field.
	        	$cmtHeader.find('.okButton').removeClass("saveComment-disable");
	        	$cmtSubject.removeClass("pvtAlert");
	        	$cmtDesc.removeClass("pvtAlert");
	        	
	        	$cmtSubject.val(this.options.getLocaleString('Comment.DefaultSubject'))
	        	$cmtDesc.val(this.options.getLocaleString('Comment.DefaultDescription'));
			}
		},
		showNewCommentPanel: function($newCommentPanel){
			if($newCommentPanel){
				this.resetNewCommentPanel($newCommentPanel); // resetting the values in panel.
	        	$newCommentPanel.removeClass("pvt-hidden");
	        	var $centerPanel = $newCommentPanel.parent().parent();
	        	var $addCommentBtn = $centerPanel.find(".addComment"); //on hide the panel, need to enable 'Add Comment' button on header.
	        	this.disableAddCommentButton($addCommentBtn);
			}
		},
		//hide new comment panel. 
		hideNewCommentPanel: function(){
			var $newCommentPanel = $(this.element).find(".newCommentPanel");
        	$newCommentPanel.addClass("pvt-hidden");
        	var $addCommentBtn = $newCommentPanel.parent().parent().find(".addComment"); //on hide the panel, need to enable 'Add Comment' button on header.
        	this.enableAddCommentButton($addCommentBtn);
		},
		
		enableAddCommentButton: function($addCommentBtn){
			$addCommentBtn.attr('disabled' , false);
		},
		
		disableAddCommentButton: function($addCommentBtn){
			$addCommentBtn.attr('disabled' , true);
		},
		
		getReasonCodesCombo: function($reasonCodesCombo, $width, reasonCodes){
			$reasonCodesCombo.empty();
			var reasonCodesArray = this.options.reasonCodesArray;
			if(reasonCodes){// reasonCodes will pass only when loading the page. i.e. from addReasonCodes()
				reasonCodes = reasonCodes.sort(this.sortByName);
				//Add default reason code first time. 
				var defaultReasonCode = this.options.defaultReasonCode;
				var defaultReasonCodeItem = {value:defaultReasonCode, text:defaultReasonCode, title:defaultReasonCode, dispValue:defaultReasonCode};
				defaultReasonCode && $reasonCodesCombo.append($('<option>', defaultReasonCodeItem));
				reasonCodesArray[defaultReasonCode] = defaultReasonCodeItem;
			}else{
				reasonCodes = reasonCodesArray;
				reasonCodesArray = {};//clearing the 
			}
			if(reasonCodes){				
				var maxLength = ($width * 0.30)/8;
				$.each(reasonCodes, function (i, item) {
					var value = item.code;
					item.dispValue || (item.dispValue = value);
					var text = item.dispValue;
					var tooltip = text;
					 if (text.length > maxLength) {
						 text =  text.substr(0, maxLength) + '...';  
		     	      }
					$reasonCodesCombo.append($('<option>', {value:value, text:text, title:tooltip}));
					reasonCodesArray[value] = item;
				});
			}
			return $reasonCodesCombo;
		},
		
	});
	

})(jQuery,document,window);