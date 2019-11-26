//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/*jshint smarttabs:true */

// ////////////////////////////////

_pns.PowerArray = {
    insertArray : function(location, arr)
    {
    	//MDAP-3306 - splice.apply and insert the array in a one liner will blow up the stack in a stack overflow for large array.
    	//have to slice and and push each item of the inserted and remaining part of the original array for it to work. 
    	this.spliceArray(location, arr);
        return this;
    },
    
    spliceArray : function(index, insertedArray) {
    	   var postArray = this.splice(index);
    	   this.inPlacePush(this, insertedArray);
    	   this.inPlacePush(this, postArray);
    },
    
    inPlacePush : function(targetArray, pushedArray) {
		   // Not using forEach for browser compatability
	       var pushedArrayLength = pushedArray.length;
	       for (var index = 0; index < pushedArrayLength; index++) {
	           targetArray.push(pushedArray[index]);
	       }
	  
    },
    	
    last : function(location, arr)
    {
        var len = this.length;
        return len === 0 ? null : this[this.length - 1];
    },
    first : function(location, arr)
    {
        var len = this.length;
        return len === 0 ? null : this[0];
    },
    equals : function(arr)
    {
        if (this.length !== arr.length)
        {
            return false;
        }

        for ( var i = 0; i < arr.length; i++)
        {
            if (Object.prototype.toString.call(this[i]) === '[object Array]')
            {
                if (!this[i].equals(arr[i]))
                {
                    return false;
                }
                else
                {
                    continue;
                }
            }

            if (this[i] !== arr[i])
            {
                return false;
            }
        }
        return true;
    }

};

jdapivot.toArray = function(array)
{
    return jdapivot.extend(jdapivot.extend((array || []), dhtmlx.PowerArray, true), _pns.PowerArray, true);
};

jdapivot.eventRemoveType = function(type,element)
{

    if (!type)
        return;
    var eventsToRemove = [];
    type = type.toLowerCase();
    for ( var evKey in dhtmlx._events)
    {
        var ev = dhtmlx._events[evKey];
        if (ev[1] == type &&(!element||($(element).is($(ev[0])))))
        {
            eventsToRemove[evKey]=ev;
        }
    }
    for ( evKey in eventsToRemove)
    {
        if (eventsToRemove.hasOwnProperty(evKey))
            dhtmlx.eventRemove(evKey);
    }

};

// Set up the grid to have alternate colors for every "count"
// number of rows.
function setupAlternateRowColors(grid, count, evenColor, oddColor)
{
    for ( var i = 0; i < grid.getRowsNum(); i++)
    {
        var rowId = grid.getRowId(i);
        if (grid.doesRowExist(rowId) === false)
        {
            // row may not exist due to smart rendering
            continue;
        }
        if ((Math.floor(i / count) % 2) === 0)
        {
            grid.setRowColor(rowId, evenColor);
        }
        else
        {
            grid.setRowColor(rowId, oddColor);
        }
    }
}

// Set up the context menus on the grid header, one for each cell may not be
// the most efficient way ...
function getColumnPopupMenu(e)
{
}

// ///////////////////////////////////////////////////////////
// DHX 5 related changes ////////////////////////////////////
// ///////////////////////////////////////////////////////////
if (!window.jdapivot) 
	jdapivot={};


jdapivot.ajax = function(url, call, master, params)
{   
	
    // if parameters was provided - made fast call
    if (arguments.length !== 0)
    {   var xhr =undefined;
        var http_request = new jdapivot.ajax();
        if (master){
            http_request.master = master;
            http_request.master["sendAbortRequest"]=function(){
            	// initiate Cancel Request. Abort current ajax request
            	if(xhr){
            		pivotlog(" Request aborted %o",params);
            		xhr.aborted =true;
            		xhr.abort();       		
                	master.data.callEvent("initCancelRequest",[params]);
            	}
            };
        }
        
        
        xhr = http_request.post(url, params, call);
        // if time out happens during polling and segmentPolling is enabled 
        // then re-sending request for same param
        xhr.ontimeout=function(){
        	pivotlog(" Polling TIMED OUT "+xhr.timeout);
        	// checking is segmentPolling is active or not
        	var pivotCommandConfig = master.getCommandConfig(params.payload["@class"]);
        	if(master.data && pivotCommandConfig && pivotCommandConfig.enableLongPolling){       		
        		//params.pollingTimeout = master.config.segmentPolling;
        		//params.payload.pollingTimeout=master.config.segmentPolling;
        		pivotlog(" check request ...%o",params);
        		master.data.callEvent("initCheckRequest",[params]);
        		//jdapivot.ajax(url,call,master,params);
        	}
        	
        };
        
       /* xhr.onabort =function(){
        	pivotlog(" Request aborted %o",params);
        	master.data.callEvent("initCancelRequest",[params]);
        };*/
        
        return xhr;
    }
    if (!this.getXHR)
        return new jdapivot.ajax(); // allow to create new instance without direct
    // new declaration

    return this;
};
jdapivot.ajax.count = 0;
jdapivot.ajax.prototype = {
    
    // creates xmlHTTP object
    getXHR : function()
    {
            return new XMLHttpRequest();
    },
    /*
     * send data to the server params - hash of properties which will be added
     * to the url call - callback, can be an array of functions
     */
    send : function(url, params, call)
    {  //pivotlog(" sending request ...%o",params);
        var x = this.getXHR();
        if (!jdapivot.isArray(call))
            call = [ call ];
        // add extra params to the url
        var isJSON = false;
        if (typeof params == "object")
        {
            if (params.payload)
            {
                isJSON = true;
            }
            else
            {
                var t = [];
                for ( var a in params)
                {
                    var value = params[a];
                    if (value === null || value === dhx.undefined)
                        value = "";
                    var finalVal = this.post ? value : encodeURIComponent(value);
                    t.push(a + "=" + finalVal);// utf-8 escaping
                }
                params = t.join("&");
            }

        }
        if (params && !this.post)
        {
            url = url + (url.indexOf("?") != -1 ? "&" : "?") + params;
            params = null;
        }
         
        x.open(this.post ? "POST" : "GET", url, !this._sync);

        var pollingTimeout = (params && params.pollingTimeout)||15000; // default to 15 sec
        var pollingTimeoutServerDelta = (params && params.pollingTimeoutServerDelta )||1000 ; // default to 1 sec
        
        pivotlog("Sending "+ params.payload["@class"].substring(params.payload["@class"].lastIndexOf(".")+1) +" to server with PollingTimeout : "+pollingTimeout + " pollingTimeoutServerDelta : " + pollingTimeoutServerDelta);
        
        // x.timeout = ((params && params.pollingTimeout)||15000) + ((params && params.pollingTimeoutServerDelta )||1000); 
        x.timeout = pollingTimeout + pollingTimeoutServerDelta;


        if (this.post)
        {
            if (!isJSON)
                x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            else
            {
      //          params = JSON.stringify(params.payload).replace(/"/g, "'");
                try
                {
                    params = JSON.stringify(params.payload);
                }
                catch (e)
                {
                    pivotlog(e);
                }
                
                x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            }
        }

        // async mode, define loading callback
        var self = this;
        x.onreadystatechange = function()
        {
            if (!x.readyState || x.readyState == 4)
            {	if(x.aborted)
            	    return;
                if (dhx.debug_time)
                    dhtmlx.log_full_time("data_loading"); // log rendering time
                jdapivot.ajax.count++;
                
                if (call && self)
                {
                    for ( var i = 0; i < call.length; i++)
                        // there can be multiple callbacks
                        if (call[i])
                        { 
                            var method = (call[i].success || call[i]);
                            if (x.status >= 400 || (!x.status && !x.responseText))
                                method = call[i].error;
                            if (method)
                                method.call((self.master || self), x.responseText, x.responseXML, x);
                        }
                }
                if (self)
                    self.master = null;
                call = self = null; // anti-leak
            }
        };

        x.send(params || null);
        return x; // return XHR, which can be used in case of sync. mode
    },
    // GET request
    get : function(url, params, call)
    {
        this.post = false;
        return this.send(url, params, call);
    },
    // POST request
    post : function(url, params, call)
    {
        this.post = true;
        return this.send(url, params, call);
    },
    sync : function()
    {
        this._sync = true;
        return this;
    }
};

// ///////////////////////////////////////////////////////////////////////////////////////
// //////////////Extend the atomic data loader to deal with post request
// /////////////////
// ///////////////////////////////////////////////////////////////////////////////////////
//MDAP-4021- Removed the code as it's not in use.

// ///////////////////////////////////////////////////////////
// /// Create a sub component of DHX 5's grid /////////
// ///////////////////////////////////////////////////////////

jdapivot.protoUI(
                {
                    post : true,
                    name : "jdatable",
                    sandBoxDiv : null,
                    non_visible_row_members : [ '$select', 'id' ],
                    columnExpansionState : [],
                    _init : function(config)
                    {
                        this.sandBoxDiv = dhtmlx.html.create("DIV", {
                            "class" : "dhx_table_cell pivotSandBox"
                        }, "");
                        this.sandBoxDiv.style.cssText =
                                "white-space:nowrap; visibility:hidden; position:absolute; top:0px; left:0px;padding: 0px; margin: 0px; border: 0px;";
                        this.sandBoxDiv.id = "sandBox";

           //            this.errorDialog = dhtmlx.html.create("DIV", {}, "");
           //             this.errorDialog.style.cssText = "display:none; cursor: default;";
           //             this.errorDialog.id = "pivotErrorLayer";

                        this._setColumnsRenderers(config.columns);
                        this.measureOnRow = config.measureOnRow;

                        document.body.appendChild(this.sandBoxDiv);
               //         document.body.appendChild(this.errorDialog);
                        this.data.attachEvent("onStructureChanged", dhtmlx.bind(this._call_onstructchanged, this));
                        this.data.attachEvent("onStoreLoad", dhtmlx.bind(this._call_onstoreload, this));
                        // ////////////////////// Add support for counting
                        // properties for older browsers
                        if (!Object.keys)
                        {
                            /*		                    Object.keys = (function()
                             {
                             var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
                             toString : null
                             }).propertyIsEnumerable('toString'), dontEnums = [
                             'toString', 'toLocaleString',
                             'valueOf', 'hasOwnProperty',
                             'isPrototypeOf',
                             'propertyIsEnumerable', 'constructor' ], dontEnumsLength = dontEnums.length;

                             return function(obj)
                             {
                             if (typeof obj !== 'object' &&
                             typeof obj !== 'function' ||
                             obj === null)
                             throw new TypeError(
                             'Object.keys called on non-object');

                             var result = [];

                             for ( var prop in obj)
                             {
                             if (hasOwnProperty.call(obj, prop))
                             result.push(prop);
                             }

                             if (hasDontEnumBug)
                             {
                             for ( var i = 0; i < dontEnumsLength; i++)
                             {
                             if (hasOwnProperty.call(obj,
                             dontEnums[i]))
                             result.push(dontEnums[i]);
                             }
                             }
                             return result;
                             };
                             })();
                             */}
                    },
                    _create_scrolls : function()
                    {
                        if (this._settings.autoheight || this._settings.scrollY === false)
                            this._scrollSizeY = 0;
                        if (this._settings.autowidth || this._settings.scrollX === false)
                            this._scrollSizeX = 0;

                        if (!this.x_scroll)
                        {
                            this._x_scroll = new jdapivot.ui.vscroll({
                                container : this._footer.nextSibling,
                                scrollWidth : this._dtable_width,
                                scrollSize : this._scrollSizeX
                            });
                            this._x_scroll.attachEvent("onscroll", dhtmlx.bind(this._onscroll_x, this));
                        }

                        if (!this.y_scroll)
                        {
                            this._y_scroll = new jdapivot.ui.vscroll({
                                container : this._footer.nextSibling.nextSibling,
                                scrollHeight : 100,
                                scroll : "y",
                                scrollSize : this._scrollSizeY
                            });
                            this._y_scroll.mouseWheel(this._body);
                            this._y_scroll.attachEvent("onscroll", dhtmlx.bind(this._onscroll_y, this));
                        }
                        this._create_scrolls = function()
                        {
                        };
                    },
                    _syncFreezeColumnsHeight : function()
                    {
                        var maxMargin = this._getMaxHeaderMargin();
                        for ( var i = 0; i < this._columns.length; i++)
                        {
                            // We adjust only frozen columns
                            if (this._isFrozenColumn(i))
                            {
                                var headerNode = this._getColumnHeaderNode(this._columns[i].id);
                                if (headerNode) {
                                    headerNode.style.marginTop = maxMargin + 'px';
                                }
                            }

                        }
                        this._set_split_sizes_y();
                    },

                    _set_split_sizes_x : function()
                    {
                        if (!this._columns.length)
                            return;
                        if (dhx.debug_size)
                            dhtmlx.log("  - " + this.name + "@" + this._settings.id + " X sizing");

                        var index = 0;
                        this._left_width = 0;
                        this._right_width = 0;
                        this._center_width = 0;

                        while (index < this._settings.leftSplit)
                        {
                            this._left_width += this._columns[index].width;
                            index++;
                        }

                        index = this._columns.length - 1;

                        while (index >= this._rightSplit)
                        {
                            this._right_width += this._columns[index].width;
                            index--;
                        }

                        if (!this._content_width)
                            return;

                        if (this._settings.autowidth && this.resize())
                            return;

                        this._center_width =
                                this._content_width - this._right_width - this._left_width - this._scrollSizeY;

                        this._body.childNodes[1].firstChild.style.width = this._dtable_width + "px";

                        this._body.childNodes[0].style.width = this._left_width + "px";
                        this._body.childNodes[1].style.width = this._center_width + "px";
                        this._body.childNodes[2].style.width = this._right_width + "px";
                        this._body.style.width = this._right_width + this._left_width + this._center_width;
                        this._header.childNodes[0].style.width = this._left_width + "px";
                        this._header.childNodes[1].style.width = this._center_width + "px";
                        this._header.childNodes[2].style.width = this._right_width + "px";
                        this._header.style.width = this._right_width + this._left_width + this._center_width;
                        this._footer.childNodes[0].style.width = this._left_width + "px";
                        this._footer.childNodes[1].style.width = this._center_width + "px";
                        this._footer.childNodes[2].style.width = this._right_width + "px";

                        this._x_scroll.sizeTo(this._content_width - this._scrollSizeY);
                        this._x_scroll.define("scrollWidth", this._dtable_width + this._left_width + this._right_width);
                    },

                    _set_split_sizes_y : function()
                    {
                        if (!this._columns.length || isNaN(this._content_height * 1))
                            return;
                        if (dhx.debug_size)
                            dhtmlx.log("  - " + this.name + "@" + this._settings.id + " Y sizing");

                        var wanted_height =
                                this._dtable_height + this._header_height + this._footer_height +
                                        (this._scrollSizeX ? this._scrollSizeX : 0);
                        if (this._settings.autoheight && this.resize())
                            return;

                        if (this._y_scroll !== undefined)
                        {
                            this._y_scroll.sizeTo(this._content_height);
                            this._y_scroll.define("scrollHeight", wanted_height);
                        }
                        var height =
                                this._content_height - this._scrollSizeX - this._header_height - this._footer_height;
                        for ( var i = 0; i < 3; i++)
                        {
                            this._body.childNodes[i].style.height = height + "px";
                            if (this._settings.prerender)
                                this._body.childNodes[i].firstChild.style.height = this._dtable_height + "px";
                            else
                                this._body.childNodes[i].firstChild.style.height = height + "px";
                        }
                    },
                    _isFrozenColumn : function(ind)
                    {
                        return ((ind < this._settings.leftSplit) || (this._settings.rightSplit === 0 ? false : ind >= this._settings.rightSplit));
                    },
                    _getMaxHeaderMargin : function()
                    {
                        var max = 0;
                        for ( var i = 0; i < this._columns.length; i++)
                        {
                            // We check only non-frozen columns
                            if (this._isFrozenColumn(i))
                            {
                                continue;
                            }
                            var headerNode = this._getColumnHeaderNode(this._columns[i].id);
                            if (headerNode && headerNode.style.marginTop)
                            {
                                var marginVal =
                                        headerNode.style.marginTop.substring(0, headerNode.style.marginTop
                                                .indexOf('px'));
                                max = Math.max(max, parseInt(marginVal, 10));
                            }
                        }
                        return max;
                    },
                    _setColumnsRenderers : function(colList)
                    {
                        if (!colList)
                            return;
                        for ( var i = 0; i < colList.length; i++)
                        {
                            var currCol = colList[i];
                            var currType = currCol.type;
                            var templateName = "_" + currType + "Template";
                            if (this[templateName])
                            {
                                currCol.template = this[templateName];
                            }
                        }

                    },
                    /** ************************************************************************* */
                    /** * Our own set of renderers */
                    /** ************************************************************************* */
                    // Template for displaying the value in a cell. We can
                    // customize the
                    // appearances by data type and data value.
                    _dataTemplate : function(item, type, config, rowIndex)
                    {
                        var value = item[config.id];
                        type = config.type;

                        var color = "#000000"; // default black
                        var tip = value; // default tooltip
                        var displayValue = value;

                        if (type == "data")
                        {
                            value = parseFloat(value);
                            if (isNaN(value))
                            {
                                displayValue = "&#160;";
                            }
                            else
                            {
                                if (value > 10000.0)
                                {
                                    // show data value higher than 10k in red.
                                    color = "#ff0000"; // red
                                }
                                // format to always show two digits after the
                                // decimal point.
                                displayValue = value.toFixed(2);
                                displayValue =
                                        "<font color=\"" + color + "\" title=\"" + displayValue + "\">" + displayValue +
                                                "</font>";
                                if (value < 1000.0)
                                {
                                    // show extra icon for value lower than 1k.
                                    displayValue =
                                            displayValue +
                                                    "<img src=\"../images/comment.png\" align=\"right\" title=\"Show Comment\">";
                                }
                            }
                        }
                        else
                        {
                            // show non-data values in black.
                            displayValue = "<font color=\"" + color + "\" title=\"" + value + "\">" + value + "</font>";
                        }
                        return displayValue;
                    },
                    /** ************************************************************************* */
                    _truncateRange : function(begin, endEx)
                    {
                        /*
                         * for (var i=begin;i<endEx;i++) { var item =
                         * this.data.pull[this.data.order[i]]; if (item){ var
                         * id=item['id']; delete this.data.pull[id]; }
                         * this.data.order[i]=null; }
                         */
                    },
                    _removeChildren : function(column)
                    {
                        if (column && column.childrenIds)
                        {
                            var columns = jdapivot.toArray(this._columns);
                            var children = jdapivot.toArray(column.childrenIds);
                            for ( var i = 0; i < children.length; i++)
                            {
                                var currChildIndex = this.columnIndex(children[i]);
                                this._removeChildren(this._columns[currChildIndex]);
                                this._hideColumn(currChildIndex);
                                columns.removeAt(currChildIndex);
                            }
                            column.childrenIds = null;
                        }
                    },
                    _minimal_apply_header : function()
                    {
                        this._rightSplit = this._columns.length - this._settings.rightSplit;
                        this._dtable_width = 0;
                        var n = 0;

                        for ( var i = 0; i < this._columns.length; i++)
                        {
                            if (!this._columns[i].node)
                            {

                                var temp = dhtmlx.html.create("DIV");
                                temp.style.width = this._columns[i].width + "px";
                                this._columns[i].node = temp;
                            }
                            if (i >= this._settings.leftSplit && i < this._rightSplit)
                                this._dtable_width += this._columns[i].width;
                            if (this._columns[i].template)
                                this._columns[i].template = dhtmlx.Template(this._columns[i].template);
                        }

                        var marks = [];

                        if (this._settings.rightSplit)
                        {
                            n = this._columns.length - this._settings.rightSplit;
                            marks[n] = " dhx_first";
                            marks[n - 1] = " dhx_last";
                        }
                        if (this._settings.leftSplit)
                        {
                            n = this._settings.leftSplit;
                            marks[n] = " dhx_first";
                            marks[n - 1] = " dhx_last";
                        }
                        marks[0] = (marks[0] || "") + " dhx_first";
                        var last_index = this._columns.length - 1;
                        marks[last_index] = (marks[last_index] || "") + " dhx_last";

                        for (i = 0; i < this._columns.length; i++)
                        {
                            var node = this._columns[i].node;
                            node.setAttribute("column", i);
                            node.className = "dhx_column " + (this._columns[i].css || "") + (marks[i] || '');
                        }

                        this._set_columns_positions();

                    },
                    _render_initial : function()
                    {
                        this._scrollSizeX = this._scrollSizeY = this._settings.scrollSize;

                        // dhtmlx.html.addStyle("#"+this._top_id +" .dhx_cell {
                        // height:"+this._settings.rowHeight+"px;
                        // line-height:"+(this._settings.rowHeight-4)+"px;}");
                        if (this._settings.headerRowHeight != -1)
                        {
                            // dhtmlx.html.addStyle("#"+this._top_id +" .dhx_hcell
                            // { height:"+this._settings.headerRowHeight+"px;
                            // line-height:"+this._settings.headerRowHeight+"px;}");
                        }
                        else
                            dhtmlx.html.addStyle("#" + this._top_id + " .dhx_hcell { vertical-align:top");

                        this._render_initial = function()
                        {
                        };
                    },
                    /**
                     * Returns the column's header DOM element ID.
                     * 
                     * @param id
                     *            The ID or Index of the column
                     * @private
                     * @return {string} The header's DOM element ID.
                     */
                    _getHeaderDivID : function(reqId)
                    {
                        var id = reqId;
                        if (typeof reqId != "string")
                        {
                            // The parameter was an index
                            id = this._columns[reqId].id;
                        }
                        return "hdr_" + id;
                    },

                    _renderColumn : function(index, yr, force)
                    {
                        var col = this._columns[index];
                        var groupCol = col.groupValues;
                        if (!col.attached)
                        {
                            var split_column =
                                    index < this._settings.leftSplit ? 0 : (index >= this._rightSplit ? 2 : 1);
                            this._body.childNodes[split_column].firstChild.appendChild(col.node);
                            col.attached = true;
                            col.split = split_column;
                        }

                        // if columns not aligned during scroll - set correct
                        // scroll top value for each column
                        if (!this._settings.scrollAlignY && yr[2] != col._yr2)
                            col.node.style.top = yr[2] + "px";

                        if (!force && (col._yr0 == yr[0] && col._yr1 == yr[1]))
                            return;

                        var html = "";
                        var config = this._settings.columns[index];
                        var select = config.$select;
                        var currItem = null;
                        var currVal = null;
                        var currDiv = "";
                        var currGroupDiv = groupDivPrefix;
                        var groupItemCounter = 0;
                        var groupItemsCounter = 0;
                        var baseCss = "dhx_cell";
                        var css = null;
                        var groupCss = null;
                        var groupDivPrefix = null;
                        var i = 0;
                        for (i = yr[0]; i < yr[1]; i++)
                        {
                            css = baseCss;
                            groupCss = "dhx_cell dhx_cell_dimension";
                            if (!groupCol || groupItemCounter !== 0)
                            {
                                if ((i - yr[0]) % 2 === 0)
                                {
                                    css += " dhx_cell_even";
                                }
                                else
                                {
                                    css += " dhx_cell_odd";
                                }
                            }
                            var item = this.data.item(this.data.order[i]);
                            if (item)
                            {
                                var value = this._getValue(item, config, i);

                                // cell-selection
                                if ((item.$select && (item.$select.$row || item.$select[config.id])) || select)
                                    css += this._select_css;

                                if (!groupCol)
                                {
                                    if (item.$height)
                                        currDiv =
                                                "<div class='" + css + "' style='height:" + item.$height + "px'>" +
                                                        value + "</div>";
                                    else
                                        currDiv = "<div class='" + css + "'>" + value + "</div>";
                                    html += currDiv;
                                }
                                else
                                {
                                    if (currVal &&
                                            ((currVal != value) || !this._areValuesSameParents(item, currItem, index)))
                                    {
                                        if (groupItemsCounter % 2 === 0)
                                        {
                                            groupCss += " dhx_cell_even";
                                        }
                                        else
                                        {
                                            groupCss += " dhx_cell_odd";
                                        }
                                        currGroupDiv += "</div>";
                                        groupDivPrefix =
                                                "<div class='" + groupCss + "' style=" + "'padding:0px;height:";
                                        html +=
                                                (groupDivPrefix + this._settings.rowHeight * groupItemCounter + "px' >" + currGroupDiv);
                                        currGroupDiv = "";
                                        groupItemsCounter++;
                                        groupItemCounter = 0;
                                        css = baseCss;
                                    }
                                    groupItemCounter++;
                                    if (groupItemCounter == 1)
                                    {
                                        css = css + " dhx_cell_dimension";
                                        if (item.$height)
                                            currDiv =
                                                    "<div class='" + css + "' style='height:" + item.$height + "px'>" +
                                                            value + "</div>";
                                        else
                                            currDiv = "<div class='" + css + "'>" + value + "</div>";
                                        currGroupDiv = currDiv;
                                    }
                                    currVal = value;
                                    currItem = item;
                                }
                            }
                            else
                            {
                                // When do we reach this code?
                                currDiv = "<div class='" + css + "'></div>";
                                if (!this._data_request_flag)
                                    this._data_request_flag = {
                                        start : i,
                                        count : yr[1] - i
                                    };
                                else
                                    this._data_request_flag.last = i;
                            }
                        }

                        // If we are grouping rows in a column, need to generate
                        // the code for the
                        // last cell.
                        if (groupCol && currVal)
                        {
                            if (groupItemsCounter % 2 === 0)
                            {
                                groupCss += " dhx_cell_even";
                            }
                            else
                            {
                                groupCss += " dhx_cell_odd";
                            }
                            currGroupDiv += "</div>";
                            groupDivPrefix = "<div class='" + groupCss + "' style=" + "'padding:0px;height:";
                            html +=
                                    (groupDivPrefix + this._settings.rowHeight * groupItemCounter + "px' >" + currGroupDiv);
                            currGroupDiv = "";
                            groupItemsCounter++;
                            groupItemCounter = 0;
                            css = baseCss;
                        }
                        col.node.innerHTML = html;
                        col._yr0 = yr[0];
                        col._yr1 = yr[1];
                    },
                    _getValue : function(item, config, i)
                    {
                        var value;

                        if (config.template)
                            value = config.template(item, this.type, config, i);
                        else
                            value = item[config.id];

                        if (value === dhx.undefined)
                            value = "";

                        if (config.format && value !== "")
                            value = config.format(value);

                        return value;
                    },
                    _areValuesSameParents : function(val1, val2, colIndex)
                    {
                        return false;
                    },
                    _call_onstoreload : function(driver, data)
                    {

                    },
                    _call_onstructchanged : function(data)
                    {
                        var parentCol = data.parentCol;
                        var columnsData = data.columns;
                        var i = null;
                        if (dhx.debug_jda)
                            dhtmlx.log("_call_onstructchanged called");
                        var columns = jdapivot.toArray(this._settings.columns);

                        var colIndex = this.columnIndex(parentCol);
                        var childrenIds = [];
                        this._columns[colIndex].childrenIds = childrenIds;
                        for (i = 0; i < columnsData.length; i++)
                        {
                            var currColumn = columnsData[i];
                            columns.insertAt(currColumn, colIndex + i + 1);
                            childrenIds.push(currColumn.id);
                            if (!currColumn.node)
                            {

                                var temp = dhtmlx.html.create("DIV");
                                temp.style.width = currColumn.width + "px";
                                currColumn.node = temp;
                            }
                        }
                        this._setColumnsRenderers(columnsData);
                        var top = null;
                        var left = null;
                        var rowsData = data;
                        for (i = 0; i < rowsData.length; i++)
                        {
                            var rowData = rowsData[i];
                            var id = rowsData.id;
                            if (id && pull[id])
                            {
                                for ( var key in rowData)
                                {
                                    if ((key != "id"))
                                        this.pull[id][key] = rowData[key];
                                }
                            }
                        }
                        var xr = this._get_x_range(this._settings.prerender);
                        var yr = this._get_y_range(this._settings.prerender === true);

                        this._truncateRange(yr[1] + 1, this.data.order.length);
                        this._truncateRange(0, Math.max(yr[0], 0));

                        this._apply_headers();
                        // We need to override how the scroll bars sizeTo
                        // function behaves
                        for (i = 0; i < columnsData.length; i++)
                        {
                            this._renderColumn(colIndex + i + 1, yr, true);
                        }
                        this._adjustChangedColumns();
                        this._syncFreezeColumnsHeight();

                    },

                    /***************************************************************************************************
                     * _getColumnSize:function(ind, headers){ var i=null; var d =
                     * dhtmlx.html.create("DIV",{"class":"dhx_table_cell"},""); d.style.cssText = "white-space:nowrap;
                     * width:1px; visibility:hidden; position:absolute; top:0px; left:0px;";
                     * document.body.appendChild(d);
                     * 
                     * var config = this._settings.columns[ind]; var max = -Infinity;
                     * 
                     * for (i=0; i<this.data.order.length; i++){ var text =
                     * this._getValue(this.item(this.data.order[i]), config, i); d.innerHTML = text; max =
                     * Math.max(d.scrollWidth, max); }
                     * 
                     * if (headers) for (i=0; i<config.headers.length; i++){ var header = config.headers[i].text;
                     * d.innerHTML = header; max = Math.max(d.scrollWidth, max); }
                     * 
                     * document.body.removeChild(d); d = null;
                     * 
                     * return max; },
                     **************************************************************************************************/
                    _adjustChangedColumns : function()
                    {
                        var cols = this._settings.columns;
                        var i = null;
                        for (i = 0; i < cols.length; i++)
                        {
                            cols[i].headerOverrideWidth = true;
                            resize = this._adjustColumn(i, false, true) || this.resize();
                        }
                        this._set_columns_positions();
                        this._set_split_sizes_x();
                        this._render_header_and_footer();
                    },
                    _apply_headers : function()
                    {
                        this._rightSplit = this._columns.length - this._settings.rightSplit;
                        this._dtable_width = 0;
                        var i = 0;
                        var n = null;

                        for (i = 0; i < this._columns.length; i++)
                        {
                            if (!this._columns[i].node)
                            {

                                var temp = dhtmlx.html.create("DIV");
                                temp.style.width = this._columns[i].width + "px";
                                this._columns[i].node = temp;
                            }
                            if (i >= this._settings.leftSplit && i < this._rightSplit)
                                this._dtable_width += this._columns[i].width;
                            if (this._columns[i].template)
                                this._columns[i].template = dhtmlx.Template(this._columns[i].template);
                        }

                        var marks = [];

                        if (this._settings.rightSplit)
                        {
                            n = this._columns.length - this._settings.rightSplit;
                            marks[n] = " dhx_first";
                            marks[n - 1] = " dhx_last";
                        }
                        if (this._settings.leftSplit)
                        {
                            n = this._settings.leftSplit;
                            marks[n] = " dhx_first";
                            marks[n - 1] = " dhx_last";
                        }
                        marks[0] = (marks[0] || "") + " dhx_first";
                        var last_index = this._columns.length - 1;
                        marks[last_index] = (marks[last_index] || "") + " dhx_last";

                        for (i = 0; i < this._columns.length; i++)
                        {
                            var node = this._columns[i].node;
                            node.setAttribute("column", i);
                            node.className = "dhx_column " + (this._columns[i].css || "") + (marks[i] || '');
                        }

                        this._set_columns_positions();

                        if (!this._scrollLeft)
                            this._scrollLeft = 0;
                        if (!this._scrollTop)
                            this._scrollTop = 0;

                        this._create_scrolls();
                        var newSizeTo =
                                function(value)
                                {
                                    if (!this._settings.scrollSize)
                                    {
                                        this._viewobj.style.display = 'none';
                                    }
                                    else
                                    {
                                        this._viewobj.style[this._settings.scroll == "x" ? "width" : "height"] =
                                                value + "px";
                                        this._viewobj.style[this._settings.scroll == "x" ? "height" : "width"] =
                                                this._settings.scrollSize + 1 + "px";
                                    }
                                };

                        this._x_scroll.sizeTo = newSizeTo;
                        this._y_scroll.sizeTo = newSizeTo;
                        this._set_split_sizes_x();
                        this._render_header_and_footer();
                    },
                    _onscroll_y : function(value)
                    {
                        var that = this;
                        that._body.childNodes[1].scrollTop = that._scrollTop = value;
                        if (!that._settings.prerender)
                            that._check_rendered_cols();
                        else
                        {
                            var conts = this._body.childNodes;
                            for ( var i = 0; i < conts.length; i++)
                            {
                                conts[i].scrollTop = value;
                            }
                        }

                    },
                    _onscroll_x : function(value)
                    {
                        var that = this;
                        throttle(function(value)
                        {
                            that._body.childNodes[1].scrollLeft = that._scrollLeft = value;
                            if (that._settings.header)
                                that._header.childNodes[1].scrollLeft = value;
                            if (that._settings.footer)
                                that._footer.childNodes[1].scrollLeft = value;
                            if (that._settings.prerender === false)
                                that._check_rendered_cols(this._minimize_dom_changes ? false : true);
                        }, 250)(value);
                    },
                    hasCss : function(node, name)
                    {
                        var classes = node.className.split(" ");
                        for ( var i = 0; i < classes.length; i++)
                        {
                            if (classes[i] == name)
                                return true;
                        }
                        return false;
                    },
                    leftSplitColumns : function(columnId)
                    {
                        if (columnId)
                        {
                            this.config.leftSplit++;
                            this.hideColumn(columnId);
                            this.showColumn(columnId);
                        }
                    },
                    insertColumns : function(afterColumnId, newCols)
                    {
                        var columns = jdapivot.toArray(this._settings.columns);
                        var newColObj = {
                            header : newColLabel,
                            id : newColId,
                            width : 100
                        };
                        var colIndex = this.columnIndex(afterColumnId);
                        for ( var i = 0; i < newCols.length; i++)
                        {
                            columns.insertAt(newCols[i], colIndex);
                        }
                        this._updateColsSizeSettings();
                        this._refresh_columns();
                        this.render();

                    },
                    removeColumn : function(columnId)
                    {
                        var columns = jdapivot.toArray(this._columns);
                        var columnIndex = this.columnIndex(columnId);
                        var col = this._columns[columnIndex];
                        dhtmlx.html.remove(col.node);
                        col.attached = false;
                        columns.removeAt(columnIndex, 1);
                        // Update the rows inserting the new column in the
                        // correct location
                        var ids = this.data.order;
                        var result = [];
                        for ( var i = 0; i < ids.length; i++)
                        {
                            var row = this.data.pull[ids[i]];
                            if (row)
                            {
                                row[columnId] = null;
                                delete row[columnId];
                            }
                            else
                            {
                                break;
                            }
                        }
                        this._refresh_columns();
                        this.refresh();
                        if (dhx.debug_jda)
                            dhtmlx.log("Removing column \"" + columnId + "\" index " + columnIndex);
                        return result;

                    },
                    _check_rows : function(view, count, dir, exact)
                    {
                        if (dhx.debug_jda)
                            dhtmlx.log("_check_rows {view:{" + view + "},count:" + count + ",dir:" + dir + ",exact:" +
                                    exact + "}");
                        var start = view[0];
                        var end = start + count;
                        if (!dir)
                        {
                            start = view[0] - count;
                            // if (exact)
                            end = view[0];
                            // else
                            // end = view[1];
                        }

                        if (start < 0)
                            start = 0;
                        end = Math.min(end, this.data.order.length - 1);

                        var result = false;
                        for ( var i = start; i < end; i++)
                            if (this._areSomeColumnsMissingData(i))
                            {
                                if (!result)
                                {
                                    var backStart = Math.max(0, view[0] - this._settings.datafetch);
                                    result = {
                                        start : dir ? i : backStart,
                                        count : dir ? (i - start) : view[0] - backStart,
                                        last : i
                                    };
                                }
                                else
                                {
                                    result.last = i;
                                    result.count =
                                            Math.min((this._settings.datafetch), this.data.order.length - result.start);
                                }
                            }
                        if (dhx.debug_jda)
                            dhtmlx.log("about to _run_load_next {result:{" + result + "}");
                        if (result)
                        {
                            if (result.start !== null)
                            {
                                result.startId = this.data.order[start];
                                result.startId = this.data.order[result.start + (dir ? -1 : 1)];
                            }
                            if (result.count !== 0)
                                this._run_load_next(result, dir);
                            return true;
                        }
                    },
                    _areSomeColumnsMissingData : function(rowInd)
                    {
                        var rowId = this.data.order[rowInd];
                        if (rowId && this.data.pull[rowId])
                        {
                            var rowData = this.data.pull[rowId];
                            var numOfKeys = Object.keys(rowData).length;
                            var numberOfValues = numOfKeys;
                            // Remove some utility members from the calculation
                            for ( var i = 0; i < this.non_visible_row_members.length; i++)
                            {
                                if (this.non_visible_row_members[i] in rowData)
                                {
                                    numberOfValues--;
                                }
                            }
                            // if (dhx.debug_jda)
                            // dhtmlx.log("_areSomeColumnsMissingData
                            // {rowId:"+rowId+",numOfKeys:"+numOfKeys+",this._nonVisibleRowAttributes:"+this._nonVisibleRowAttributes+",this._columns.length="+this._columns.length+"}");

                            return numberOfValues != this._columns.length;
                        }
                        return true;
                    },
                    _set_columns_positions : function()
                    {
                        var left = 0;
                        for ( var i = 0; i < this._columns.length; i++)
                        {
                            if (i == this._settings.leftSplit || i == this._rightSplit)
                                left = 0;
                            if (this._columns[i].node)
                            {
                                // The columns seem to be offsetted more to the left than the header table cells
                                this._columns[i].node.style.left = left+ "px";
                                left += this._columns[i].width+(i >= this._settings.leftSplit?0:0);
                            }
                        }
                    },
                    /**
                     * Calculates the width of the column header width. It does
                     * not take into account the columns width of the row under
                     * the header.
                     * 
                     * @param id
                     *            The ID or Index of the column
                     * @private
                     * @return {number} The width of the header's DOM element.
                     */
                    _getColumnHeaderSize : function(id)
                    {
                        var headerNode = this._getColumnHeaderNode(id);
                        if (headerNode)
                        {
                            this.sandBoxDiv.innerHTML = headerNode.innerHTML;
                            return this.sandBoxDiv.scrollWidth;
                        }
                        return 0;

                    },
                    /**
                     * Returns the column's DOM element.
                     * 
                     * @param id
                     *            The ID or Index of the column
                     * @private
                     * @return {DOMElement} The header's DOM element.
                     */
                    _getColumnHeaderNode : function(id)
                    {
                        return dhtmlx.toNode(this._getHeaderDivID(id));

                    },
                    _run_load_next : function(conf, direction)
                    {
                        var count = Math.max(conf.count, (this._settings.datafetch || this._settings.loadahead || 0));
                        this.loadNext(conf);
                    },
                    /***********************************************************
                     * 
                     * @param conf
                     *            The parameters to send to the server related
                     *            to this call
                     * @param {function}
                     *            callback Callback function to call after the
                     *            handling of this call is done;
                     * @param url
                     *            The baseline URL sent to the server
                     * @param now
                     *            Whether to run the request immediately or wait
                     *            if data throttling is set.
                     */
                    loadNext : function(conf, callback, url, now)
                    {
                        var count = conf.count;
                        var start = conf.start;
                        var startId = conf.startId;
                        if (dhx.debug_proto)
                            dhtmlx.log("loadNext: count=" + count + " start=" + start);
                        if (this._settings.datathrottle && !now)
                        {
                            if (this._throttle_request)
                                window.clearTimeout(this._throttle_request);
                            this._throttle_request = dhtmlx.delay(function()
                            {
                                this.loadNext(conf, callback, url, true);
                            }, this, 0, this._settings.datathrottle);
                            return;
                        }

                        if (!start && start !== 0)
                        {
                            start = this.dataCount();
                        }
                        var exCols = [];
                        // Check if there are expanded columns. If so send their
                        // IDs.
                        for ( var i = 0; i < this._columns.length; i++)
                        {
                            var currCol = this._columns[i];
                            // We need to specify only those who are not in the
                            // root level
                            if (currCol.level > 1)
                            {
                                var prefix = "";
                                if ("json" != this._settings.requestType)
                                    prefix = "exCol=";
                                exCols.push(prefix + currCol.id);
                            }
                        }

                        this.data.url = this.data.url || url;
                        if (this.callEvent("onDataRequest", [ start, count, callback, url ]) && this.data.url)
                            this.data.feed.call(this, start, count, callback, null, null, exCols, startId);
                    },

                    load : function(url, call)
                    {
                        var ajax = jdapivot.AtomDataLoader.load.apply(this, arguments);
                        this._ajax_queue.push(ajax);

                        // prepare data feed for dyn. loading
                        if (!this.data.url)
                            this.data.url = url;
                    },
                    _feed : function(from, count, callback, columnID, colLevel, exCols, startId)
                    {

                        // allow only single request at same time
                        if (dhx.debug_jda)
                            dhtmlx.log("Feeding request from [" + from + "], count [" + count + "]");
                        if (this._load_count)
                            return this._load_count = [ from, count, callback ]; // save
                        // last
                        // ignored
                        // request
                        else
                            this._load_count = true;
                        var url = this.data.url;

                        var loadURL = url + ((url.indexOf("?") == -1) ? "?" : "&");
                        var params = null;
                        if ("json" == this._settings.requestType)
                        {
                            params = {
                                'payload' : JSON.stringify([ {
                                    'command' : 'OldPivotDataCommand',
                                    'cubeId' : 1,
                                    'cubeDefinitionTimeStamp' : 1,
                                    'rowCount' : rowCount,
                                    'colCount' : colCount,
                                    'colLevel' : colLevel === null ? 0 : colLevel,
                                    'columnId' : columnID === null ? '' : columnID,
                                    'exCols' : exCols === null ? [] : exCols,
                                    'continue' : true,
                                    'startPos' : from === null ? 0 : from,
                                    'startId' : startId === null ? '' : startId,
                                    'count' : count,
                                    'measureOnRow' : this._settings.measureOnRow ? true : false
                                } ])
                            };
                        }
                        else
                        {
                            var exColParam = "";
                            if (!exColParam)
                                exColParam = exCols.join("&");
                            loadURL =
                                    +(this.dataCount() ? ("continue=true&") : "") +
                                            (columnID ? ("columnID=" + columnID + "&") : "") +
                                            (colLevel ? ("colLevel=" + colLevel + "&") : "") + "start=" + from +
                                            "&count=" + count + "&" + exColParam +
                                            (startId ? "&startId=" + startId : "");
                        }
                        // GK: We add a placeholder for the JSON structure
                        this.load(loadURL, "jda_json", params, [ function()
                        {
                            // after loading check if we
                            // have some ignored
                            // requests
                            var temp = this._load_count;
                            this._load_count = false;
                            if (typeof temp == "object" &&
                                    (((temp[0] != from || temp[1] != count)) || (columnID !== null)))
                            {
                                if (temp.length != 6)
                                {
                                    temp[temp.length] = columnID;
                                    temp[temp.length] = colLevel;
                                    temp[temp.length] = exColParam;
                                    temp[temp.length] = startId;
                                }
                                this.data.feed.apply(this, temp); // load
                                // last
                                // ignored
                                // request
                            }
                        },
                                callback ]);
                    },

                    test_method : function(value)
                    {
                        if (!this.select)
                        {
                            jdapivot.extend(this, this._selections._commonselect);
                            jdapivot.extend(this, this._selections[value], true);
                        }
                        return value;
                    }
                }, jdapivot.ui.datatable, jdapivot.Settings, jdapivot.AtomDataLoader);

/*******************************************************************************
 * Extend the data table for editing support.
 ******************************************************************************/

// Install the trigger for editing once the table has been constructed.
dhx.attachEvent("onDataTable", function(table)
{
    table._install_edit_trigger();
});

jdapivot.extend(jdapivot.ui.jdatable, {

    _init : function()
    {
        // the editor that is currently being used for editing.
        // If none of the
        // cells in the table is being edited, this will be
        // null.
        this.$activeEditor = null;
        // keep track of installed event handler IDs to avoid
        // duplication.
        this._editKeyHandlerId = null;
        this._editDblClickHandlerId = null;
    },

    // Install the handlers that will manage the triggering of
    // editing
    // in the table.
    _install_edit_trigger : function()
    {
        // this.attachEvent("onAfterSelect", this._editArm);
        // this.attachEvent("onAfterUnselect",
        // this._editDisarm);
        var that = this;
        // Install a handler on the grid so we can capture
        // the keystrokes that will trigger the editig.
        if (this._editKeyHandlerId !== null)
        {
            dhtmlx.eventRemove(this._editKeyHandlerId);
            this._editKeyHandlerId = null;
        }
        // Install a handler on the grid so we can capture
        // the double click that will trigger the editig
        // immediately after selection.
        if (this._editDblClickHandlerId !== null)
        {
            dhtmlx.eventRemove(this._editDblClickHandlerId);
            this._editDblClickHandlerId = null;
        }
        $(this._viewobj).on({
            dblclick : function(event)
            {
                that._startEditOnDblClick(event);
            },
            keydown : function(event)
            {
                if (event.altKey)
                    return false;
                if ($(event.target).hasClass('dhx_cell')){
                	that._startEditOnKeyDown(event);
                	that._doScroll = false;
                }
            }
        }, '.dhx_cell.dhx_cell_select[tabindex]:not(.cell_editor)');
        $(this._viewobj).on(
                {
                    input : function(event)
                    {
                        dhtmlx.log("Entered jda_datatable.js $(this._viewobj).on $(this._activeEditor).val()=" +
                                $(that.$activeEditor).val());
                        if (that.validateEdit() === false)
                        {
                            event.preventDefault();
                            that.revertEdit();
                            return false;
                        }
                        return true;
                    },
                    keydown : function(event)
                    {
                        if (event.altKey)
                            return false;
                        var cellId = that.getSelected();
                        that._submitField(event, cellId);
                        event.preventDefault();
                    }

                }, '.dhx_cell.dhx_cell_select[tabindex] .cell_editor.dhx_table_cell');

    },
    isPivotVisible : function()
    {
        return ('.pivotLayerElement:visible').length;
    },
    validateEdit : function()
    {
        return true;
    },
    revertEdit : function()
    {
        var that = this;
        if (this.isPivotVisible() && !$('.cell_editor').is(":focus"))
        {
            $('.cell_editor').focus();
        }
        var lastValid = $(this.$activeEditor).attr('lastValid');
        dhtmlx.log("At jda_pivot.js validateEdit reverting to last valid with value " + lastValid);
        $(that.$activeEditor).val((lastValid !== null && lastValid !== undefined) ? lastValid : "");
    },

    // Disarm the table from the editing mode.
    _editDisarm : function(data)
    {
        dhtmlx.log("Entered jda_datatable.js _editDisarm");
        if (this._editKeyHandlerId !== null)
        {
            dhtmlx.eventRemove(this._editKeyHandlerId);
            this._editKeyHandlerId = null;
        }
        this._contentobj.ondblclick = null;
        if (this._editDblClickHandlerId !== null)
        {
            dhtmlx.eventRemove(this._editDblClickHandlerId);
            this._editDblClickHandlerId = null;
        }
    },

    // Handle double click on a cell after it is selected.
    _startEditOnDblClick : function(e)
    {
        dhtmlx.log("Entered jda_datatable.js _startEditOnDblClick");
        e = e || window.event;
        var trg = e.target || e.srcElement;
        var cellId = null;
        if (this.isEditing())
        {
            this.submitEdit();
        }

        while (trg && trg.parentNode)
        {
            if (trg.parentNode.getAttribute)
            {
                var column = trg.parentNode.getAttribute("column");
                if (column)
                {
                    var index = dhtmlx.html.index(trg) + this._columns[column]._yr0;
                    cellId = {
                        row : this.data.order[index],
                        column : this._columns[column].id
                    };
                    break;
                }
            }
            trg = trg.parentNode;
        }

        if (cellId !== null)
        {
            if (this.isCellEditable(cellId))
            {
                this.startEdit(cellId);
            }
        }
    },

    // Handles first key stroke after the table is armed for editing.
    _startEditOnKeyDown : function(e)
    {
        dhtmlx.log("Entered jda_datatable.js _startEditOnKeyDown");
        var cellId = this.getSelected();
        if (cellId === null)
        {
            return; // ignore if no selection
        }

        if (!cellId.row || !cellId.column)
        {
            // ignore if the selection wasn't on a cell.
            return;
        }

        var event = window.event || keyEvent;
        var keyCode = event.charCode || event.keyCode;
        // if for key stroke is for navigation, then navigate.
        // else if it is numeric or F2, then start editing
        // else ignore
        if (this._isKeyForNavigate(keyCode))
        {
            this._navigateByKey(e, cellId);
        }
        else if (this._isKeyForPressed(keyCode) || (keyCode == 113))
        { // F2 \
            if (this.isCellEditable(cellId))
            {
                this.startEdit(cellId);
                // once the editing is started, the input field will
                // handle furthur key strokes, so disarm the table.
                //	this._editDisarm();
            }
        }
    },

    /**
     * 
     * @param e key event
     * @param cellId {row : row_id , column : col_id}
     * @return true if the key event was recognized as a navigator trigger.
     * otherwise false.
     */
    isNavigating : false,
    // The preceding variable is a semaphore to prevent re-entry
    _submitField : function(e, cellId)
    {
        if (!this.isEditing())
            return;
        this._isNavigating = true;
        // Work around undefined e.keyCode on IE 8.
        var event = (window.event ? window.event : e);
        var keyCode = event.charCode ? event.charCode : event.keyCode;
        var cellId2 = null;
        var currCellDiv = this._locateCellDiv(cellId);
        if (!currCellDiv)
        {
            dhtmlx.html.preventEvent(event);
            this._isNavigating = false;
            return;
        }
        var xOffset = 0;
        var yOffset = 0;
        var movement = false;
        var isShiftDown = event.shiftKey;
        var rowIndex = this.indexById(cellId.row);
        var columnIndex = this.columnIndex(cellId.column);
        var startIndex = (this._settings.leftSplit ? this._settings.leftSplit : 0);
        if (keyCode == 13)
        { // return or down arrow
            dhtmlx.html.preventEvent(event);
            cellId2 = this._locateNextEditableCell(cellId, "down");
            if (cellId2)
            {
                this.unselect(cellId.row, cellId.column);
                if (this.isEditing())
                {
                    var validRes = this.validateEdit();
                    if (!validRes || validRes == '-' || validRes === '')
                    {
                        this.revertEdit();
                        return false;
                    }

                    this.submitEdit();
                }
                movement = true;
                yOffset = this._rowHeight;
            }
        }
        else if (keyCode == 27)
        { // escape
            dhtmlx.html.preventEvent(event);
            //      this.unselect(cellId.row, cellId.column);
            if (this.isEditing())
            {
                this.cancelEdit();
                this.updateFocusedCell();
            }
        }
        if (movement && !cellId2)
            cellId2 = cellId;
        if (cellId2)
        {

            var xr = this._get_x_range(this._settings.prerender);
            var yr = this._get_y_range(this._settings.prerender === true);
            if (((columnIndex - 1 == xr[0]) && (xOffset < 0)) || ((columnIndex + 2 == xr[1]) && (xOffset > 0)))
                this._x_scroll.scrollTo(this._x_scroll._settings.scrollPos + xOffset);
            if (((rowIndex - 1 == yr[0]) && (yOffset < 0)) || ((rowIndex + 2 == yr[1]) && (yOffset > 0)))
                this._y_scroll.scrollTo(this._y_scroll._settings.scrollPos + yOffset);

            this.select(cellId2.row, cellId2.column);
        }
        this._isNavigating = false;
        return true;
    },
    _navigateByKey : function(e, cellId)
    {
        if (this._isNavigating)
        {
            dhtmlx.html.preventEvent(event);
            return;
        }
        this._isNavigating = true;
        // Work around undefined e.keyCode on IE 8.
        var event = (window.event ? window.event : e);
        var keyCode = event.charCode ? event.charCode : event.keyCode;
        var cellId2 = null;
        var currCellDiv = this._locateCellDiv(cellId);
        if (!currCellDiv)
        {
            dhtmlx.html.preventEvent(event);
            this._isNavigating = false;
            return;
        }
        var xOffset = 0;
        var yOffset = 0;
        var movement = false;
        var isShiftDown = event.shiftKey;
        var rowIndex = this.indexById(cellId.row);
        var columnIndex = this.columnIndex(cellId.column);
        var startIndex = (this._settings.leftSplit ? this._settings.leftSplit : 0);
        if (keyCode == 13 || keyCode == 40)
        { // return or down arrow
            dhtmlx.html.preventEvent(event);
            cellId2 = this._locateNextEditableCell(cellId, "down");
            if (cellId2)
            {
                this.unselect(cellId.row, cellId.column);
                if (this.isEditing())
                {
                    this.submitEdit();
                }
                movement = true;
                yOffset = this._rowHeight;
            }
        }
        else if (keyCode == 27)
        { // escape
            dhtmlx.html.preventEvent(event);
            this.unselect(cellId.row, cellId.column);
            if (this.isEditing())
            {
                this.submitEdit();
            }
        }
        else if ((!isShiftDown && keyCode == 9) || keyCode == 39)
        { // tab or right arrow
            dhtmlx.html.preventEvent(event);
            cellId2 = this._locateNextEditableCell(cellId, "right");
            if (cellId2)
            {
                this.unselect(cellId.row, cellId.column);
                if (this.isEditing())
                {
                    this.submitEdit();
                }
                xOffset = this._columns[columnIndex].realSize;
                movement = true;
            }
        }
        else if (keyCode == 37 || (isShiftDown && keyCode == 9))
        { // left arrow or shift-tsb
            dhtmlx.html.preventEvent(event);
            cellId2 = this._locateNextEditableCell(cellId, "left");
            if (cellId2)
            {
                this.unselect(cellId.row, cellId.column);
                if (this.isEditing())
                {
                    this.submitEdit();
                }
                movement = true;
                if (startIndex != columnIndex)
                    xOffset = -this._columns[columnIndex - 1].realSize;
            }
        }
        else if (keyCode == 38)
        { // up arrow
            dhtmlx.html.preventEvent(event);
            cellId2 = this._locateNextEditableCell(cellId, "up");
            if (cellId2)
            {
                this.unselect(cellId.row, cellId.column);
                if (this.isEditing())
                {
                    this.submitEdit();
                }
                yOffset = -this._rowHeight;
                movement = true;
            }
        }
        if (movement && !cellId2)
            cellId2 = cellId;
        if (cellId2)
        {

            var xr = this._get_x_range(this._settings.prerender);
            var yr = this._get_y_range(this._settings.prerender === true);
            if (((columnIndex - 1 == xr[0]) && (xOffset < 0)) || ((columnIndex + 2 == xr[1]) && (xOffset > 0)))
                this._x_scroll.scrollTo(this._x_scroll._settings.scrollPos);
            if (((rowIndex - 1 == yr[0]) && (yOffset < 0)) || ((rowIndex + 2 == yr[1]) && (yOffset > 0)))
                this._y_scroll.scrollTo(this._y_scroll._settings.scrollPos + yOffset);

            this.select(cellId2.row, cellId2.column);
        }
        this._isNavigating = false;

    },
    /**	
     $setSize:function(x,y){
     if (this._last_size && this._last_size[0]==x && this._last_size[1]==y) {
     if (dhx.debug_size)
     dhtmlx.log("|- ignoring");
     return false;
     }
     if (dhx.debug_size)
     dhtmlx.log("|- "+this.name+"@"+this.config.id+" :"+x+","+y);
    
     this._last_size = [x,y];
     this._content_width = x;
     this._content_width = x-(this._settings.scroll&&(!jdapivot.Touch)?jdapivot.Scrollable.scrollSize:0);
     this._content_height = y-(this._settings.scroll&&(!jdapivot.Touch)?jdapivot.Scrollable.scrollSize:0)-this._header_height-this._footer_height;
     this.$width = this._content_width;
     this.$height = this._content_height;
     this._viewobj.style.width = x+"px";
     this._viewobj.style.height = y+"px";
     return true;
     },
     **/
    /**
     * Check if any one of the cells in the table is currently being edited.
     * 
     * @returns {Boolean} true or false.
     */
    isEditing : function()
    {
        return (this.$activeEditor !== null);
    },

    /**
     * Check if the cell identified by the given ID is editable.
     * 
     * @param cellId {row : rowId , column: colId}
     * @returns {Boolean} true or false.
     */
    isCellEditable : function(cellId)
    {
        var cellDiv = this._locateCellDiv(cellId);
        // Only allows editing on a data cell. Identify a data cell by checking
        // its class name ("dhx_cell" versus "dhx_hcell" in column header) and the data
        // type of its column ("data" versus "header" in row header cells).
        if (cellDiv.className && cellDiv.className.indexOf("dhx_cell") >= 0)
        {
            var colIndex = this.columnIndex(cellId.column);
            if (this._columns[colIndex].type == "data")
            {
                return true;
            }
        }
        return false;
    },

    /**
     * Get the {row, column} ID of the cell that is currently being edited.
     * 
     * @returns null if the table is not being edited. 
     */
    getEditingCell : function()
    {
        var cellId = null;
        if (this.isEditing())
        {
            cellId = this.$activeEditor.prop('cellId');
        }
        return cellId;
    },

    cancelEdit : function()
    {
        dhtmlx.log("Entered jda_datatable.js cancelEdit");
        if (this.isEditing())
        {
            // remove the active editor will trigger onblur, so
            // here we null the _activeEditor before removal.
            var editor = this.$activeEditor;
            $(editor).parent().removeClass('editingCell');
            this.$activeEditor.remove();
            this.$activeEditor = null;
            this.triggerEvent('handleToolbar',{enable:true});
            this.render();
        }
    },

    submitEdit : function()
    {
        dhtmlx.log("Entered jda_datatable.js submitEdit");
        if (this.isEditing())
        {
            var cellId = this.getEditingCell();
            var newValue = {};
            newValue.value = this.$activeEditor.val();
            cellId = (cellId ? cellId : this.getEditingCell());
            this.unselect(cellId.row, cellId.column);
            this.data.updateCell(cellId.row, cellId.column, newValue);
            var editor = this.$activeEditor;

            this.$activeEditor.parent().removeClass('editingCell');
            this.$activeEditor.remove();
            this.$activeEditor = null;
            this.render();
        }
    },

    // Locate the div DOM node that displays the data in the
    // given cell id.
    _locateCellDiv : function(cellId)
    {
        var rowIndex = this.indexById(cellId.row);
        var colIndex = this.columnIndex(cellId.column);
        var colDiv = this._columns[colIndex].node;
        return colDiv.childNodes[rowIndex];
    },

    // Locate the next cell to be edited after the one identified
    // by the given id, in the given direction.
    _locateNextEditableCell : function(cellId, direction)
    {
        var xr = this._get_x_range(this._settings.prerender);
        var yr = this._get_y_range(this._settings.prerender === true);
        var nextCellId;
        var safeGuardCounter = 0;
        var rowIndex = this.indexById(cellId.row);
        var colIndex = this.columnIndex(cellId.column);
        var cellEditable = false;
        var topBound = yr[0];
        var bottomBound = yr[1];
        var rightBound = xr[1] - 1;
        var leftBound = xr[0];
        /*
         var topBound=0;
         var bottomBound=this.data.order.length-1;
         var rightBound=this._settings.columns.length-1;
         var leftBound=this._settings.leftSplit;

         */do
        {
            safeGuardCounter++;
            if (direction == "right")
            {
                colIndex++; // advance to the cell to the right.
                if (colIndex > rightBound)
                {
                    rowIndex++;
                    if (rowIndex > bottomBound)
                    {
                        rowIndex = topBound;
                    }
                    colIndex = leftBound;
                }
            }
            else if (direction == "left")
            {
                colIndex--; // advance to the cell to the right.
                if (colIndex < leftBound)
                {
                    rowIndex--;
                    if (rowIndex < topBound)
                    {
                        rowIndex = bottomBound;
                    }
                    colIndex = rightBound;
                }
            }
            else if (direction == "down")
            {
                rowIndex++; // advance to the cell below.
                if (rowIndex > bottomBound)
                {
                    // wrap to the next column if we were at the last row.
                    colIndex++;
                    if (colIndex > rightBound)
                    {
                        colIndex = leftBound;
                    }
                    rowIndex = topBound;
                }
            }
            else if (direction == "up")
            {
                rowIndex--; // advance to the cell below.
                if (rowIndex < topBound)
                {
                    // wrap to the next column if we were at the last row.
                    colIndex--;
                    if (colIndex < leftBound)
                    {
                        colIndex = rightBound;
                    }
                    rowIndex = bottomBound;
                }
            }
            var colObj = this._columns[colIndex];
            var rowObj = this.data.order[rowIndex];
            if (colObj && rowObj)
            {
                var tmpNextCellId = {
                    row : rowObj,
                    column : colObj.id
                };
                cellEditable = this.isCellEditable(tmpNextCellId);
                if (cellEditable)
                {
                    nextCellId = tmpNextCellId;
                }
            }
        }
        while (!cellEditable && safeGuardCounter != 1000);

        return nextCellId;
    },

    // Check if the given keycode should be accepted as valid when
    // the user was entering a decimal number. 
    _isKeyForPressed : function(keyCode)
    {
        var c = String.fromCharCode(keyCode);
        var isWordcharacter = c.match(/\w/);
        var keyOK = isWordcharacter || // word character
        (keyCode == 8) || // backspace
        (keyCode == 12) || // clear
        (keyCode == 46) || // delete 
        (keyCode == 189) || // dash
        (keyCode == 109) || // substract 
        (keyCode == 110) || // decimal point 
        (keyCode == 190) || // period
        (keyCode == 96); // Zero from numpad
        return keyOK;
    },

    // Check if the given keycode is one that was designated
    // for selection navigation.
    _isKeyForNavigate : function(keyCode)
    {
        var keyOK = (keyCode >= 37 && keyCode <= 40) || // arrow keys
        (keyCode == 9) || // tab
        (keyCode == 27) || // escape
        (keyCode == 13); // enter
        return keyOK;
    },
    _refreshSelectedCellScrollPosition : function(scrollX,scrollY,cellId,e){        
        var that = this;
        that._y_scroll.scrollTo(scrollY);
        that._getDataArea().scrollTo(scrollX);
        setTimeout(function(){that._navigateByKey(e, cellId);},50);
     },
    
    _calculateSelectedCellScrollPosition : function(){
    	this._maintainSelected();
    	
    	var selectedFocused = $(this._viewobj).find('div.dhx_cell_select.dhx_value');
        if(this.lastSelectedCellId&&this._selectedCellDiv&&!this.isCellAvailableInView(selectedFocused)){
          var cellId = {
               sideAxis:null,
               topAxis:null
          };
          cellId.row = this.lastSelectedCellId.sideAxis;
          cellId.column = this.lastSelectedCellId.topAxis;
          var colIndex = this.columnIndex(cellId.column);
          var rowIndex = this.indexById(cellId.row);
          var scrollXVal = 0;
          var scrollYVal = 0;
          for(var i=0 ; i <colIndex;i++){
        	  if(this._isDataColumn(i)){
        		  scrollXVal = scrollXVal+this._columns[i].realSize;
        	  }        	  
          }
          scrollYVal = rowIndex * this._settings.rowHeight;
          this._lastScrollY= scrollYVal; // changes for key focus is not coming into view port data cells from out of view port
          this._lastScrollX = scrollXVal; // changes for key focus is not coming into view port data cells from out of view port
          
          this._doScroll = true;
          $(this.$view).focus();
          
        }
           }
	
});

/////////////////////////////////////////////////////
//////////////// JDA's Pivot data driver	/////////
/////////////////////////////////////////////////////
dhtmlx.DataDriver.jda_json = {
    //convert json string to json object if necessary
    toObject : function(data)
    {
        if (!data)
            data = "[]";
        if (typeof data == "string")
        {
        	data = JSON.parse(data);
        }
        if (data.columns && data.parenCol)
        {
            var columns = data.columns;
            data.parentCol = data.parenCol;
        }
        if (data.data)
        {
            var t = data.data;
            t.pos = data.pos;
            t.total_count = data.total_count;
            t.parentCol = data.parentCol;
            t.columns = data.columns;
            data = t;
        }

        return data;
    },

    //get array of records
    getRecords : function(data)
    {
        if (data && !jdapivot.isArray(data))
            return [ data ];
        return data;
    },

    //get hash of properties for single record
    getDetails : function(data)
    {
        return data;
    },

    //get count of data and position at which new data need to be inserted
    getInfo : function(data)
    {
        return {
            _size : (data.total_count || 0),
            _from : (data.pos || 0)
        };
    }
};

/////////////////////////////////////////////////////////////////
////////////////Extend the dhx HTML Helper	/////////////////
/////////////////////////////////////////////////////////////////
jdapivot.extend(dhtmlx.html, {

    /**
     * Append CSS class to the node.
     * @param {HTMLElement} node The node to add the CSS to 
     * @param {string} name The name of the CSS to add
     */
    addCss : function(node, name)
    {
        if (node.className.indexOf(name) == -1)
        {
            node.className = (node.className + " " + name);
        }
    },

    /**
     * Removes CSS class from the node
     * @param {HTMLElement} node The node to remove the CSS from 
     * @param {string} name The name of the CSS to remove
     */
    removeCss : function(node, name)
    {
        node.className = node.className.replace(RegExp(" " + name, "g"), "");
    },

    /**
     * Replaces CSS class from the node with a new one
     * @param {HTMLElement} node The node to remove the CSS from 
     * @param {string} originalCss The name of the CSS to replaced.
     * @param {string} newCss The name of the CSS to replace with.
     */
    replaceCss : function(node, originalCss, newCss)
    {
        node.className = node.className.replace(RegExp(" " + originalCss, "g"), newCss);
    }
});

/////////////////////////////////////////////////////////////////
////////////////Extend the default data store	/////////////////
/////////////////////////////////////////////////////////////////

jda_datastore = jdapivot.proto({
    // has to be named as "DataStore" for the data processor to be installed properly.
    name : "DataStore",
    _init : function(config)
    {
        this.name = "DataStore";

        jdapivot.extend(this, dhx.EventSystem);

        this.dp = new jda_dataprocessor({
            master : this,
            url : "../../MockupDHX5"
        });
        this.setDriver("jda_json"); //default data source is jda json
        this.pull = {}; //hash of IDs
        this.order = jdapivot.toArray(); //order of IDs		
    },

    // Override super class
    //process incoming raw data
    _parse : function(data)
    {
        this.callEvent("onParse", [ this.driver, data ]);
        if (this._filter_order)
            this.filter();

        //get size and position of data
        var info = this.driver.getInfo(data);
        //get array of records

        var recs = this.driver.getRecords(data);
        //		var from = (info._from||0)*1;
        var from = data.pos;
        var subload = true;

        if (from === 0 && this.order[0])
        { //update mode
            //		subload = false;
            //		from = this.order.length;
        }

        // If we have a result that contains information just for
        // few columns, we got to clear all the rows that are not included in this
        // result set so that the scrolling will recognize incomplete rows and retrieve them 
        // from the server.
        var participantRows = [];

        var j = 0;

        for ( var i = 0; i < recs.length; i++)
        {
            //get hash of details for each record
            var temp = this.driver.getDetails(recs[i]);
            var id = this.id(temp); //generate ID for the record
            var iOrder = i + from;
            var isNew = false;
            if (!this.pull[id])
            { //if such ID already exists - update instead of insert
                this.order[iOrder] = id;
                isNew = true;

                j++;
            }
            else if (subload && this.order[iOrder])
            {
                j++;
            }

            //		Logic changed. The following was not merging partial rows.
            if ((!isNew) && (this.pull[id]))
            {
                for ( var key in temp)
                {
                    if ((key != "id"))
                        this.pull[id][key] = temp[key];
                }
            }
            else
            {
                this.pull[id] = temp;
            }

            //if (this._format)	this._format(temp);

            if (this.extraParser)
                this.extraParser(temp);
            if (this._scheme)
            {
                if (this._scheme_init)
                    this._scheme_init(temp);
                else if (this._scheme_update)
                    this._scheme_update(temp);
            }
        }

        if (!this.order[info._size - 1])
            this.order[info._size - 1] = dhx.undefined;
        if (data.parentCol)
        {
            this._drilldownColumn(data);
        }
        else
        {
            this.callEvent("onStoreLoad", [ this.driver, data ]);
            //repaint self after data loading
            this.refresh();
        }
    },

    _drilldownColumn : function(data)
    {
        this.callEvent("onStructureChanged", [ data ]);
    },
    validate : function(obj)
    {
        dhtmlx.assert(this.callEvent, "using validate for eventless object");
        var result = true;
        var rules = this._settings.rules;
        if (rules)
        {
            var objrule = rules.$obj;
            if (!obj && this.getValues)
                obj = this.getValues();
            if (objrule && !objrule.call(this, obj))
                return false;

            var all = rules.$all;
            for ( var key in rules)
            {
                if (key.indexOf("$") !== 0)
                {
                    dhtmlx.assert(rules[key], "Invalid rule for:" + key);
                    if (rules[key].call(this, obj[key], obj, key) && (!all || all.call(this, obj[key], obj, key)))
                    {
                        if (this.callEvent("onValidationSuccess", [ key, obj ]) && this._clear_invalid)
                            this._clear_invalid(key, obj);
                    }
                    else
                    {
                        result = false;
                        if (this.callEvent("onValidationError", [ key, obj ]) && this._mark_invalid)
                            this._mark_invalid(key, obj);
                    }
                }
            }
        }
        return result;
    },

    /**
     * Update the value in the cell identified by the given rowId 
     * and colId. Will do nothing if no such cell exists.
     * 
     * @param rowId the row ID of the cell to be updated.
     * @param colId the column ID of the cell to be updated.
     * @param value the new value for the cell
     * @returns none.
     */
    updateCell : function(rowId, colId, value)
    {
        if (this.exists(rowId))
        {
            var item = this.item(rowId);
            if (colId in item)
            {
                if (item[colId] != value)
                {
                    if (this.dp.updateCell(rowId, colId, value))
                    {
                        item[colId] = value;
                    }
                }
            }
        }
    }
}, dhtmlx.DataStore);

/////////////////////////////////////////////////////////////////
////////////////Extend the data processor  //////////////////////
/////////////////////////////////////////////////////////////////
jda_dataprocessor = jdapivot.proto({

    _init : function(config)
    {
        // install the rules for validation.
        this._settings.rules = {
            data : jdapivot.rules.isNumber
        };
        // install handlers for validation outcome.
        this.attachEvent("onValidationSuccess", dhtmlx.bind(this._handleValidationSuccess, this));
        this.attachEvent("onValidationError", dhtmlx.bind(this._handleValidationError, this));
    },

    /**
     * Handle the case the validation succeeded.
     * 
     * @param key the string "data"
     * @param obj a numeric value in String form.
     */
    _handleValidationSuccess : function(key, obj)
    {
//        dhtmlx.log("Info", "Validation success!");
        return true;
    },

    /**
     * Handle the case the validation failed.
     * 
     * @param key the string "data"
     * @param obj a numeric value in String form.
     */
    _handleValidationError : function(key, obj)
    {
//        dhtmlx.log("Warning", "Validation Error!");
        return true;
    },

    /**
     * Callback from the Validator in case the validation succeeded.
     * 
     * @param key the string "data"
     * @param obj a numeric value in String form.
     */
    _clear_invalid : function(key, obj)
    {

    },

    /**
     * Callback from the Validator in case the validation failed.
     * 
     * @param key the string "data"
     * @param obj a numeric value in String form.
     */
    _mark_invalid : function(key, obj)
    {

    },

    /**
     * Update a cell with a new value.
     * 
     * @param rowId the row ID of the cell to be updated.
     * @param colId the column ID of the cell to be updated.
     * @param value the new value for the cell
     * @returns true if the new value has been successfully validated 
     *          and sent to the server.
     */
    // the default implemenation of save() only allows update
    // row by row.
    updateCell : function(rowId, colId, value)
    {
        var updateId = rowId + "_" + colId;
        var updateValue = {
            "data" : value
        };
        this.callEvent("onStoreUpdated", [ updateId, updateValue, "update" ]);
        //	return this._onStoreUpdated(updateId, updateValue, "update");
    }
}, jdapivot.DataProcessor);

/////////////////////////////////////////////////////////////////
////////////////Extend the dhx vertical scroll bar //////////////
/////////////////////////////////////////////////////////////////

jdapivot.extend(jdapivot.ui.vscroll, {
    // Override super class to bypass the installation of a click
    // handler on the table body that cancels the bubbling.
    mouseWheel : function(area)
    {
        dhtmlx.event(area, "mousewheel", this._on_wheel, this);
        // The following code disabled click handling on the entire table body, which
        // disabled the selection detection. We suspect this is used here only for 
        // the benefit of touch screens. So we put it into the dhx.env.touch check.
        if (dhtmlx.env.touch)
        {
            dhtmlx.event(area, "click", function(e)
            {
                e.cancelBubble = false;
            });
        }
        dhtmlx.event(area, "DOMMouseScroll", this._on_wheel, this);
    }
}, true); // true to force override

/////////////////////////////////////////////////////////////////
////////////////Extend the datatable selection///////////////////
/////////////////////////////////////////////////////////////////

jdapivot.extend(jdapivot.ui.datatable, {
    // The most recently selected cell.
    _selectedCellDiv : null,

    /**
     * Override superclass for better handling of cell selection.
     * 
     * @param data {row : row_id, column: col_id}
     * @param preserve whether to preserve the previous selection
     * @returns {Boolean} true or false.
     */
    _select : function(data, preserve)
    {
        var key = this._select_key(data);
        //don't allow selection on unnamed columns
        if (key === null)
            return;

        data.id = key;
        if (!this.callEvent("onBeforeSelect", [ data, preserve ]))
            return false;

        //ignore area, if it was already selected
        if (this._selected_pull[key] && preserve)
            return;

        if (!preserve)
            this._clear_selection();

        this._selected_areas.push(data);
        this._selected_pull[key] = true;

        this.callEvent("onAfterSelect", [ data, preserve ]);

        if (data.row && data.column)
        {
            // This is a request for cell selection.
            this._post_select(data);
            this._finalize_select_cell(data, preserve);
        }
        else
        {
            this._finalize_select(this._post_select(data));
        }
        return true;
    },
    _unselect : function(data)
    {
        var key = this._select_key(data);
        if (!key)
            return this._clear_selection();

        //ignore area, if it was already selected
        if (!this._selected_pull[key])
            return;

        if (!this.callEvent("onBeforeUnSelect", [ data ]))
            return false;

        for ( var i = 0; i < this._selected_areas.length; i++)
        {
            if (this._selected_areas[i].id == key)
            {
                this._selected_areas.splice(i, 1);
                break;
            }
        }

        delete this._selected_pull[key];
        var item = this.item(data.row);
        var val = item[data.column];
        delete val.$select;
        $(this.$view).find('.dhx_cell_select').removeClass('dhx_cell_select');
        this.callEvent("onAfterUnselect", [ data ]);
        this._finalize_select(0, this._post_unselect(data));
    },
    _clear_selection : function()
    {
        var i = 0;
        //if (!this.callEvent("onBeforeClearSelection",[])) return;
        if (!this._selected_areas.length)
            return false;

        for (i = 0; i < this._selected_rows.length; i++)
        {
            var item = this.item(this._selected_rows[i]);
            if (item)
            {

                var selectObj = item.$select;
                for ( var index in selectObj)
                {
                    if (selectObj.hasOwnProperty(index) && index != "$count")
                    {
                        var col = index;
                        delete item[col].$select;
                    }
                }

                item.$select = null;
            }
        }
        var cols = this._settings.columns;
        if (cols)
            for (i = 0; i < cols.length; i++)
            {
                cols[i].$select = null;
            }

        this._reinit_selection();
        return true;
        //this.callEvent("onAfterClearSelection",[]);
    },

    _finalize_select : function(id)
    {
        if (id)
            this._selected_rows.push(id);
        if (!this._silent_selection)
        {
            //   this.render();
            this.callEvent("onSelectChange", []);
        }
    },

    // On cell selection, update the appearance of the cell by directly
    // changing its css style, instead of calling render(), which will
    // regenerate all the cell divs and hinder the handling of double
    // clicking on a cell.
    _finalize_select_cell : function(data, preserve)
    {
        if (data && data.row)
            this._selected_rows.push(data.row);
        if (!this._silent_selection)
        {
            if (!preserve && this._selectedCellDiv !== null)
            {
                //	dhtmlx.html.removeCss(this._selectedCellDiv, this._select_css);
            }
            this._selectedCellDiv = this._locateCellDiv(data);
            //	dhtmlx.html.addCss(this._selectedCellDiv, this._select_css);
            this.callEvent("onSelectChange", []);
        }
    }
}, true); // true to force override
