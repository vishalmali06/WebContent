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
 * Various utilities created for the JDA Pivot control
 */

var console = console || {
    "log" : function()
    {
    }
}; 
dhx.debug = true;
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP && oThis
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

function triggerRightClick(cssSelector) {
	var found = $(cssSelector);
	if (found.length) {
		if (document.createEvent ) {
		    var ev = document.createEvent('HTMLEvents');
		    ev.initEvent('contextmenu', true, false);
		    found[0].dispatchEvent(ev);
		} else { // Internet Explorer
		    found[0].fireEvent('oncontextmenu');
		}
	} else {
		pivotlog('Could not find %o to right click',cssSelector);
	}
}

function namespace(namespaceString)
{
    var parts = namespaceString.split('.'), parent = window, currentPart = '';

    for ( var i = 0, length = parts.length; i < length; i++)
    {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
}

var pivotNamespace = _pns = pivotNamespace || namespace('jda.pivot');

// Try to match an HTML string
_pns.htmlRE = /^<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/i;


var generatejQueryButton=function (handler, iconSet, iconName,dataObject ){
    var createdButton=$('<button>Clear button</button>').button({
        icons : {
            primary : iconSet+" "+iconName
        },
        text : false
    }).removeAttr("title").click(handler);
    if (typeof dataObject === 'object')
    {
        createdButton.data(dataObject);
    }
    return createdButton;
};

function throttle(func, wait) {
    var args,
        result,
        thisArg,
        timeoutId,
        lastCalled = 0;

    function trailingCall() {
      lastCalled = new Date;
      timeoutId = null;
      result = func.apply(thisArg, args);
    }

    return function() {
      var now = new Date,
          remain = wait - (now - lastCalled);

      args = arguments;
      thisArg = this;

      if (remain <= 0) {
        clearTimeout(timeoutId);
        lastCalled = now;
        result = func.apply(thisArg, args);
      }
      else if (!timeoutId) {
        timeoutId = setTimeout(trailingCall, remain);
      }
      return result;
    };
  }

var pivotLogConstractors={};
var pviotCTorRE = /function\s*(\w+)/;
function getObjectClass(obj)
{
    if (obj && obj.constructor && obj.constructor.toString)
    {
        var strCtor=obj.constructor.toString();
        var strCtorVal=pivotLogConstractors[strCtor];
        if (strCtorVal !== undefined)
        {
            
            var arr = strCtor.match(pviotCTorRE);
    
            if (arr && arr.length == 2)
            {
                pivotLogConstractors[strCtor]=arr[1];
                return arr[1];
            }

        }
    }
    return undefined;
}

function detachElement(node, async, fn) {
    var parent = node.parentNode;
    var next = node.nextSibling;
    // No parent node? Abort!
    if (!parent) { return; }
    // Detach node from DOM.
    parent.removeChild(node);
    // Handle case where optional `async` argument is omitted.
    if (typeof async !== "boolean") {
      fn = async;
      async = false;
    }
    // Note that if a function wasn't passed, the node won't be re-attached!
    if (fn && async) {
      // If async == true, reattach must be called manually.
      fn.call(node, reattach);
    } else if (fn) {
      // If async != true, reattach will happen automatically.
      fn.call(node);
      reattach();
    }
    // Re-attach node to DOM.
    function reattach() {
      parent.insertBefore(node, next);
    }
  }

/**
 * Remove an element and provide a function that inserts it into its original position
 * @param element {Element} The element to be temporarily removed
 * @return {Function} A function that inserts the element into its original position
 **/
function removeToInsertLater(element) {
  var parentNode = element.parentNode;
  var nextSibling = element.nextSibling;
  var domRemovedTs=Date.now();
  pivotlog("Remvoed element on %s",domRemovedTs);
  parentNode.removeChild(element);
  return function() {
    if (nextSibling) {
      parentNode.insertBefore(element, nextSibling);
    } else {
      parentNode.appendChild(element);
    }
    pivotlog('Adding element from %s',domRemovedTs);
  };
}

window.resizeMainArea=function(pivotObj)
{
	if (pivotObj) {
		pivotObj.resizePivot();
	}
	return;
	var $pivotElement=$((pivotObj&&pivotObj.$view)||$('.pivotLayerElement.dhx_view').first().show());
    var wWidth = $(window).width();
    var wHeight = $(window).height();
    var heightThreashold=90;
    var prevHeight=0;
    var pHeight=0;
    var $parent=$pivotElement.parent().show();
    while ((pHeight=$parent.height())<heightThreashold) {
    	prevHeight=pHeight;
    	$parent=$parent.parent().show();
    	if ($parent.length==0) {
    		break;
    	}
    }
    pHeight=pHeight-prevHeight;
    var flyoutSideOffset=pivotObj&&pivotObj.isCommentEnabled()?25:0;
    var flyoutBottomOffset=pivotObj&&pivotObj.isGraphEnabled()?50:0;
    var pWidth=$parent.width()-6-flyoutSideOffset;
    pHeight=pHeight-flyoutBottomOffset;
//    console.log('resizinging');
//    console.dir('pHeight %o  pWidth %o $parent %o',pHeight,pWidth,$parent);
//    pivotlog('pHeight %o  pWidth %o $parent visible %o',pHeight,pWidth,$parent);
    $pivotElement.height(pHeight).width(pWidth);
    if (pivotObj) {
        pivotObj.adjust();
        pivotObj.render();
    }

};

// Tell IE9 to use its built-in console
if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function') &&
        typeof console.log == "object"&&!(console && (console.firebuglite)))
{
    [ "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd" ].forEach(function(method)
    {
//        var newMethod=method==="log"?"dir":method;
        var newMethod=method;
        console[method] = this.call(console[newMethod], console);
    }, Function.prototype.bind);
}

function jsonLogFilter(key, value)
{
    var objClass = getObjectClass(value);
     console.log("key="+key+" value="+value+" type of="+typeof value+" objClass="+objClass);
    switch (objClass)
    {
        case "Function":
            return undefined;
        case "PivotLinkedMap":
            return value.toString();
    }
    return value;
}

function applyCss(a){
    var sheets = document.styleSheets, o = {};
    for(var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for(var r in rules) {
            if(a.is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
            }
        }
    }
    return o;
}

function findCss(regEx){
    var foundRules={};
    var regExpObj=new RegExp(regEx,'i');
    var sheets = document.styleSheets;
    for(var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for(var r in rules) {
            var regExResult=null;
            var selectorText=rules[r].selectorText;
            regExResult=regExpObj.exec(selectorText);
            if(regExResult) {
                var foundRule={};
                var key=regExResult[1]!==undefined?regExResult[1]:selectorText;
                foundRules[key]=($.extend(foundRule,rules[r] ));
            }
        }
    }
    return foundRules;
}

function getContrastYIQ(hexcolor){
    var r = parseInt(hexcolor.substr(1,2),16);
    var g = parseInt(hexcolor.substr(3,2),16);
    var b = parseInt(hexcolor.substr(5,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

RGBtoHEX = function(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    r = (r.length < 2) ? "0"+r : r;
    g = (g.length < 2) ? "0"+g : g;
    b = (b.length < 2) ? "0"+b : b;
    return '#'+(r+g+b).toUpperCase();
};

function normalizeColorValue(color)
{
    if (!color)
        return color;
    var colorRe = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    var colors=colorRe.exec(color);
    if (colors&&colors.length==4)
    {
        return RGBtoHEX(parseInt(colors[1],10),parseInt(colors[2],10),parseInt(colors[3],10));
    }
    return color;
}

dhtmlx.html.addStyle=function(rules){
	rules=_.isArray(rules)?rules:
				(rules)?[rules]:[];

//    pivotlog ("Adding rule %s",rule);
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("isPivotCSS", "true");
    /*IE8*/
//    if (style.styleSheet)
//        style.styleSheet.cssText = rule;
//    else
    _.each(rules,function(rule, index, list){
    	style.appendChild(document.createTextNode(rule));
    });
       
    document.getElementsByTagName("head")[0].appendChild(style);
};

function css2json(css){
        var s = {},
            i = null;
        if(!css) return s;
        if(css instanceof CSSStyleDeclaration) {
            for(i in css) {
                if((css[i]).toLowerCase) {
                    s[(css[i]).toLowerCase()] = (css[css[i]]);
                }
            }
        } else if(typeof css == "string") {
            css = css.split("; ");          
            for (i in css) {
                var l = css[i].split(": ");
                s[l[0].toLowerCase()] = (l[1]);
            }
        }
        return s;
    }

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

pivotlog = function ()
{
    if (dhx.debug_jda)
    {

   //      var now = new Date();
  //      var timestamp = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        var args = Array.prototype.slice.call(arguments);
        var newArgs = [];
        if (BrowserUtilities.isIE() )
        {
            {
                for (i=1;i<args.length;i++)
                {
                    args[i]=JSON.stringify(JSON.decycle(args[i])); 
                } 
                    
            }
            if (args.length>1)
            {
                args[0]=args[0].replace(/%o/,"%s");
            }
            if (console && console.log && console.log.apply)
            {
                console.log.apply(console.log, args);
            }
        }
        else
        {
            console.log.apply(console, args);
        }



    }
}

if (!Array.prototype.filter)
{
    Array.prototype.filter = function(fun /* , thisp */)
    {
        "use strict";

        if (this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        var res = [];
        var thisp = arguments[1];
        for ( var i = 0; i < len; i++)
        {
            if (i in t)
            {
                var val = t[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to)
{
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
Array.prototype.lastElement = function()
{
    for ( var i = this.length - 1; i >= 0; i--)
    {
        if (this[i])
            return i;
    }
    return 0;
};

// //
if (typeof String.prototype.startsWith != 'function')
{
    String.prototype.startsWith = function(str)
    {
        return this.slice(0, str.length) == str;
    };
}

function clone(obj)
{
    if (obj === null || typeof (obj) != 'object')
        return obj;

    var temp = new obj.constructor();
    for ( var key in obj)
        temp[key] = clone(obj[key]);

    return temp;
}
// // Mimic linked hash map

function PivotLinkedMap(linkEntries)
{
    this.current = undefined;
    this.size = 0;
    this.isLinked = true;

    if (linkEntries === false)
        this.disableLinking();
}

PivotLinkedMap.from = function(obj, foreignKeys, linkEntries)
{
    var map = new PivotLinkedMap(linkEntries);

    for ( var prop in obj)
    {
        if (foreignKeys || obj.hasOwnProperty(prop))
            map.put(prop, obj[prop]);
    }

    return map;
};
PivotLinkedMap.prototype.getSize = function()
{
    return this.size;
};

PivotLinkedMap.noop = function()
{
    return this;
};

PivotLinkedMap.illegal = function()
{
    throw new Error('can\'t do this with unlinked maps');
};

PivotLinkedMap.prototype.disableLinking = function()
{
    this.isLinked = false;
    this.link = PivotLinkedMap.noop;
    this.unlink = PivotLinkedMap.noop;
    this.disableLinking = PivotLinkedMap.noop;
    this.next = PivotLinkedMap.illegal;
    this.key = PivotLinkedMap.illegal;
    this.value = PivotLinkedMap.illegal;
    this.removeAll = PivotLinkedMap.illegal;
    this.each = PivotLinkedMap.illegal;
    this.flip = PivotLinkedMap.illegal;
    this.drop = PivotLinkedMap.illegal;
    this.listKeys = PivotLinkedMap.illegal;
    this.listValues = PivotLinkedMap.illegal;

    return this;
};

PivotLinkedMap.prototype.hash =
        function(value)
        {
            return value instanceof Object ? (value.__hash || (value.__hash = 'object ' + arguments.callee.current)) : (typeof value) +
                    ' ' + String(value);
        };

PivotLinkedMap.prototype.hash.current = 0;

PivotLinkedMap.prototype.link = function(entry)
{
    if (this.size === 0)
    {
        entry.prev = entry;
        entry.next = entry;
        this.current = entry;
    }
    else
    {
        entry.prev = this.current.prev;
        entry.prev.next = entry;
        entry.next = this.current;
        this.current.prev = entry;
    }
};

PivotLinkedMap.prototype.unlink = function(entry)
{
    if (this.size === 0)
        this.current = undefined;
    else
    {
        entry.prev.next = entry.next;
        entry.next.prev = entry.prev;
        if (entry === this.current)
            this.current = entry.next;
    }
};

PivotLinkedMap.prototype.get = function(key)
{
    var entry = this[this.hash(key)];
    return typeof entry === 'undefined' ? undefined : entry.value;
};

PivotLinkedMap.prototype.put = function(key, value)
{
    var hash = this.hash(key);

    if (this.hasOwnProperty(hash))
        this[hash].value = value;
    else
    {
        var entry = {
            key : key,
            value : value
        };
        this[hash] = entry;

        this.link(entry);
        ++this.size;
    }

    return this;
};

PivotLinkedMap.prototype.remove = function(key)
{
    var hash = this.hash(key);

    if (this.hasOwnProperty(hash))
    {
        --this.size;
        this.unlink(this[hash]);

        delete this[hash];
    }

    return this;
};

PivotLinkedMap.prototype.removeAll = function()
{
    while (this.size)
        this.remove(this.key());

    return this;
};



PivotLinkedMap.prototype.contains = function(key)
{
    return this.hasOwnProperty(this.hash(key));
};

PivotLinkedMap.prototype.isUndefined = function(key)
{
    var hash = this.hash(key);
    return this.hasOwnProperty(hash) ? typeof this[hash] === 'undefined' : false;
};

PivotLinkedMap.prototype.next = function()
{
    this.current = this.current.next;
};

PivotLinkedMap.prototype.key = function()
{
    return this.current.key;
};

PivotLinkedMap.prototype.value = function()
{
    return this.current.value;
};
PivotLinkedMap.prototype.last = function()
{
    var list = this.listValues();
    return list[list.length - 1];
};

PivotLinkedMap.prototype.each = function(func, thisArg)
{
    if (typeof thisArg === 'undefined')
        thisArg = this;

    for ( var i = this.size; i--; this.next())
    {
        var n = func.call(thisArg, this.key(), this.value(), i > 0);
        if (typeof n === 'number')
            i += n; // allows to add/remove entries in func
    }

    return this;
};

PivotLinkedMap.prototype.flip = function(linkEntries)
{
    var map = new PivotLinkedMap(linkEntries);

    for ( var i = this.size; i--; this.next())
    {
        var value = this.value(), list = map.get(value);

        if (list)
            list.push(this.key());
        else
            map.put(value, [ this.key() ]);
    }

    return map;
};

PivotLinkedMap.prototype.drop = function(func, thisArg)
{
    if (typeof thisArg === 'undefined')
        thisArg = this;

    for ( var i = this.size; i--;)
    {
        if (func.call(thisArg, this.key(), this.value()))
        {
            this.remove(this.key());
            --i;
        }
        else
            this.next();
    }

    return this;
};

PivotLinkedMap.prototype.listValues = function()
{
    var list = [];

    for ( var i = this.size; i--; this.next())
        list.push(this.value());

    return list;
};

PivotLinkedMap.prototype.listKeys = function()
{
    var list = [];

    for ( var i = this.size; i--; this.next())
        list.push(this.key());

    return list;
};

PivotLinkedMap.prototype.toString = function()
{
    var string = '{';

    function addEntry(key, value, hasNext)
    {
        string += '     ' + this.hash(key) + ' : ' + value + ' ' + (hasNext ? ',' : '') + '\n';
    }

    if (this.isLinked && this.size)
    {
        string += '\n';
        this.each(addEntry);
    }

    string += '}';
    return string;
};

PivotLinkedMap.reverseIndexTableFrom = function(array, linkEntries)
{
    var map = new PivotLinkedMap(linkEntries);

    for ( var i = 0, len = array.length; i < len; ++i)
    {
        var entry = array[i], list = map.get(entry);

        if (list)
            list.push(i);
        else
            map.put(entry, [ i ]);
    }

    return map;
};

PivotLinkedMap.cross = function(map1, map2, func, thisArg)
{
    var linkedMap  = null, 
        otherMap   = null;

    if (map1.isLinked)
    {
        linkedMap = map1;
        otherMap = map2;
    }
    else if (map2.isLinked)
    {
        linkedMap = map2;
        otherMap = map1;
    }
    else
        PivotLinkedMap.illegal();

    for ( var i = linkedMap.size; i--; linkedMap.next())
    {
        var key = linkedMap.key();
        if (otherMap.contains(key))
            func.call(thisArg, key, map1.get(key), map2.get(key));
    }

    return thisArg;
};

PivotLinkedMap.uniqueArray = function(array)
{
    var map = new PivotLinkedMap();

    for ( var i = 0, len = array.length; i < len; ++i)
        map.put(array[i]);

    return map.listKeys();
};

var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
        "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
        "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
        "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
        "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
        "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
        "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
        "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
        "honeydew":"#f0fff0","hotpink":"#ff69b4",
        "indianred ":"#cd5c5c","indigo ":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
        "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
        "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
        "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
        "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
        "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
        "navajowhite":"#ffdead","navy":"#000080",
        "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
        "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
        "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
        "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
        "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
        "violet":"#ee82ee",
        "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
        "yellow":"#ffff00","yellowgreen":"#9acd32"};

function colorNameToHex(color,defaultVal)
{

    if (typeof colors[color.toLowerCase()] != 'undefined')
        return colors[color.toLowerCase()];

    return defaultVal?defaultVal:false;
}
var pad = function(num, totalChars) {
    var pad = '0';
    num = num + '';
    while (num.length < totalChars) {
        num = pad + num;
    }
    return num;
};

// Ratio is between 0 and 1
var changeColor = function(color, ratio, darker) {
    // Trim trailing/leading whitespace
    color = color.replace(/^\s*|\s*$/, '');

    // Expand three-digit hex
    color = color.replace(
        /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i,
        '#$1$1$2$2$3$3'
    );

    // Calculate ratio
    var difference = Math.round(ratio * 256) * (darker ? -1 : 1),
        // Determine if input is RGB(A)
        rgb = color.match(new RegExp('^rgba?\\(\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '\\s*,\\s*' +
            '(\\d|[1-9]\\d|1\\d{2}|2[0-4][0-9]|25[0-5])' +
            '(?:\\s*,\\s*' +
            '(0|1|0?\\.\\d+))?' +
            '\\s*\\)$',
         'i'));
        alpha = !!rgb && rgb[4] !== null ? rgb[4] : null,

        // Convert hex to decimal
        decimal = !!rgb? [rgb[1], rgb[2], rgb[3]] : color.replace(
            /^#?([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])([a-f0-9][a-f0-9])/i,
            function() {
                return parseInt(arguments[1], 16) + ',' +
                    parseInt(arguments[2], 16) + ',' +
                    parseInt(arguments[3], 16);
            }
        ).split(/,/);

    // Return RGB(A)
    return !!rgb ?
        'rgb' + (alpha !== null ? 'a' : '') + '(' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ) + ', ' +
            Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ) +
            (alpha !== null ? ', ' + alpha : '') +
            ')' :
        // Return hex
        [
            '#',
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[0], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[1], 10) + difference, darker ? 0 : 255
            ).toString(16), 2),
            pad(Math[darker ? 'max' : 'min'](
                parseInt(decimal[2], 10) + difference, darker ? 0 : 255
            ).toString(16), 2)
        ].join('');
};
var lighterColor = function(color, ratio) {
    return changeColor(color, ratio, false);
};
var darkerColor = function(color, ratio) {
    return changeColor(color, ratio, true);
};

function getResourceString(interimString)
{

    var args = Array.prototype.slice.call(arguments, 1);
    return interimString.replace(/\{(\d+)\}/g, function()
    {
        return args[arguments[1]];
    });

}

/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
 retrocycle, stringify, test, toString
 */

        if (typeof JSON.decycle !== 'function') {
            JSON.decycle = function decycle(object) {
                'use strict';

        // Make a deep copy of an object or array, assuring that there is at most
        // one instance of each object or array in the resulting structure. The
        // duplicate references (which might be forming cycles) are replaced with
        // an object of the form
//              {$ref: PATH}
        // where the PATH is a JSONPath string that locates the first occurance.
        // So,
//              var a = [];
//              a[0] = a;
//              return JSON.stringify(JSON.decycle(a));
        // produces the string '[{"$ref":"$"}]'.

        // JSONPath is used to locate the unique object. $ indicates the top level of
        // the object or array. [NUMBER] or [STRING] indicates a child member or
        // property.

                var objects = [],   // Keep a reference to each unique object or array
                    paths = [];     // Keep the path to each unique object or array

                return (function derez(value, path) {

        // The derez recurses through the object, producing the deep copy.

                    var i,          // The loop counter
                        name,       // Property name
                        nu;         // The new object or array

                    switch (typeof value) {
                    case 'object':

        // typeof null === 'object', so get out if this value is not really an object.
        // Also get out if it is a weird builtin object.

                        if (value === null ||
                                value instanceof Boolean ||
                                value instanceof Date    ||
                                value instanceof Number  ||
                                value instanceof RegExp  ||
                                value instanceof String) {
                            return value;
                        }

        // If the value is an object or array, look to see if we have already
        // encountered it. If so, return a $ref/path object. This is a hard way,
        // linear search that will get slower as the number of unique objects grows.

                        for (i = 0; i < objects.length; i += 1) {
                            if (objects[i] === value) {
                                return {$ref: paths[i]};
                            }
                        }

        // Otherwise, accumulate the unique value and its path.

                        objects.push(value);
                        paths.push(path);

        // If it is an array, replicate the array.

                        if (Object.prototype.toString.apply(value) === '[object Array]') {
                            nu = [];
                            for (i = 0; i < value.length; i += 1) {
                                nu[i] = derez(value[i], path + '[' + i + ']');
                            }
                        } else {

        // If it is an object, replicate the object.

                            nu = {};
                            for (name in value) {
                                if (Object.prototype.hasOwnProperty.call(value, name)) {
                                    nu[name] = derez(value[name],
                                        path + '[' + JSON.stringify(name) + ']');
                                }
                            }
                        }
                        return nu;
                    case 'number':
                    case 'string':
                    case 'boolean':
                        return value;
                    }
                }(object, '$'));
            };
        }


        if (typeof JSON.retrocycle !== 'function') {
            JSON.retrocycle = function retrocycle($) {
                'use strict';

        // Restore an object that was reduced by decycle. Members whose values are
        // objects of the form
//              {$ref: PATH}
        // are replaced with references to the value found by the PATH. This will
        // restore cycles. The object will be mutated.

        // The eval function is used to locate the values described by a PATH. The
        // root object is kept in a $ variable. A regular expression is used to
        // assure that the PATH is extremely well formed. The regexp contains nested
        // * quantifiers. That has been known to have extremely bad performance
        // problems on some browsers for very long strings. A PATH is expected to be
        // reasonably short. A PATH is allowed to belong to a very restricted subset of
        // Goessner's JSONPath.

        // So,
//              var s = '[{"$ref":"$"}]';
//              return JSON.retrocycle(JSON.parse(s));
        // produces an array containing a single element which is the array itself.

                var px =
                    /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

                (function rez(value) {

        // The rez function walks recursively through the object looking for $ref
        // properties. When it finds one that has a value that is a path, then it
        // replaces the $ref object with a reference to the value that is found by
        // the path.

                    var i, item, name, path;

                    if (value && typeof value === 'object') {
                        if (Object.prototype.toString.apply(value) === '[object Array]') {
                            for (i = 0; i < value.length; i += 1) {
                                item = value[i];
                                if (item && typeof item === 'object') {
                                    path = item.$ref;
                                    if (typeof path === 'string' && px.test(path)) {
                                        value[i] = eval(path);
                                    } else {
                                        rez(item);
                                    }
                                }
                            }
                        } else {
                            for (name in value) {
                                if (typeof value[name] === 'object') {
                                    item = value[name];
                                    if (item) {
                                        path = item.$ref;
                                        if (typeof path === 'string' && px.test(path)) {
                                            value[name] = eval(path);
                                        } else {
                                            rez(item);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }($));
                return $;
            };
        }
        
//---------------------------------------------------

function extJSPivotAlert(pivotObj, alertType, message, okCallbackFn, callbackScope) {
    if (Ext.isReady) {
    	_extJSPivotAlert(pivotObj, alertType, message, okCallbackFn, callbackScope);
    } else {
        Ext.onReady(function(){
        	_extJSPivotAlert(pivotObj, alertType, message, okCallbackFn, callbackScope);
        });
    }
}


function _extJSPivotAlert(pivotObj, alertType, message, okCallbackFn, callbackScope)
{
    var topExtWindow = findTopMostExtPivotWindow();

    //Need to get percentage from vpPopupDialog, but some dependency issue
    //Max size for dialog in percentage
    var maxDialogPct = 80;

    var size = Ext.getDoc().getViewSize();
    var maxWidth = size.width * maxDialogPct / 100;

    //defaultFocus and defaultButton doesn't work.
    var dialog = topExtWindow.Ext.create('Ext.window.MessageBox', {
        buttonAlign: 'center',
        multiline: true,
        maxWidth: maxWidth,
        closable: false,
        buttons: [{
            text: pivotObj.getLocaleString("Button.Ok"),
            ui: 'j-primary-button',
            itemId: 'okButton',
            //height is set in SASS
            handler: function() {
                if (okCallbackFn) {
                    okCallbackFn.call(callbackScope);
                }
                dialog.close();
            }
        }],
        listeners: {
            show: function() {
                //defaultFocus and defaultButton doesn't work.
                var okButton = dialog.down("#okButton");
                okButton.focus();
            }
        }
    });

    var imsgIcon =  Ext.MessageBox.INFO; // Default is info
    var title =  pivotObj.getLocaleString("MsgBox.Info.Title");
    if(alertType == 'wrn'){
    	imsgIcon = Ext.MessageBox.WARNING;
    	title =  pivotObj.getLocaleString("Plan.Worksheet.MsgBox.Warn.Title");
    }
    message = message.replace(/\n/g, '<br>');
    dialog.show({
        title: pivotObj.getLocaleString("MsgBox.Info.Title"),
        icon: imsgIcon,
        msg: message
    });
}

/**
 * Find the top most window that contains Ext. This will make sure that messages triggered from inside a frame won't get truncated by the frame container.
 * @returns ptr to top window
 */
function findTopMostExtPivotWindow() {
    var extWindow = null;

    for (var currentWindow = window; currentWindow != top; currentWindow = currentWindow.parent) {
        if (currentWindow.Ext) { //if defined
            extWindow = currentWindow;
        }
    }
    //if top window has Ext
    if (currentWindow.Ext) {
        extWindow = currentWindow;
    }

    return extWindow;
}

        
