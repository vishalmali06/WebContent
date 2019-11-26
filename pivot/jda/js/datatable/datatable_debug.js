/*
This software is allowed to use under GPL or you need to obtain Commercial or Enterise License
to use it in non-GPL project. 
*/
/*
2012 February 16
*/

if (!window.jdapivot) 
	jdapivot={};

//copies methods and properties from source to the target
jdapivot.extend = function(target, source, force){
	dhtmlx.assert(target,"Invalid mixing target");
	dhtmlx.assert(source,"Invalid mixing source");
	if (target._dhx_proto_wait)
		target = target._dhx_proto_wait[0];
	
	//copy methods, overwrite existing ones in case of conflict
	for (var method in source)
		if (!target[method] || force)
			target[method] = source[method];
		
	//in case of defaults - preffer top one
	if (source.defaults)
		jdapivot.extend(target.defaults, source.defaults);
	
	//if source object has init code - call init against target
	if (source._init)	
		source._init.call(target);
				
	return target;	
};

//copies methods and properties from source to the target from all levels
jdapivot.fullCopy = function(source){
	dhtmlx.assert(source,"Invalid mixing target");
	var target =  (source.length?[]:{});
	if(arguments.length>1){
		target = arguments[0];
		source = arguments[1];
	}
	for (var method in source){
		if(source[method] && typeof source[method] == "object" && !jdapivot.isDate(source[method])){
			target[method] = (source[method].length?[]:{});
			jdapivot.fullCopy(target[method],source[method]);
		}else{
			target[method] = source[method];
		}
	}

	return target;	
};

jdapivot.protoUI = function(){
	if (dhx.debug_proto)
		dhtmlx.log("UI registered: "+arguments[0].name);
		
	var origins = arguments;
	var selfname = origins[0].name;
	
	var t = function(data){
		if (origins){
			var params = [origins[0]];
			
			for (var i=1; i < origins.length; i++){
				params[i] = origins[i];
				
				if (params[i]._dhx_proto_wait)
					params[i] = params[i].call(dhx);

				if (params[i].prototype && params[i].prototype.name)
					jdapivot.ui[params[i].prototype.name] = params[i];
			}
		
			jdapivot.ui[selfname] = jdapivot.proto.apply(dhx, params);
			if (t._dhx_type_wait)	
				for (var i=0; i < t._dhx_type_wait.length; i++)
					dhtmlx.Type(jdapivot.ui[selfname], t._dhx_type_wait[i]);
				
			t = origins = null;	
		}
			
		if (this != dhx)
			return new jdapivot.ui[selfname](data);
		else 
			return jdapivot.ui[selfname];
	};
	t._dhx_proto_wait = arguments;
	return jdapivot.ui[selfname]=t;
};

jdapivot.proto = function(){
	
	if (dhx.debug_proto)
		dhtmlx.log("Proto chain:"+arguments[0].name+"["+arguments.length+"]");
		
	var origins = arguments;
	var compilation = origins[0];
	var has_constructor = !!compilation._init;
	var construct = [];
	
	dhtmlx.assert(compilation,"Invalid mixing target");
		
	for (var i=origins.length-1; i>0; i--) {
		dhtmlx.assert(origins[i],"Invalid mixing source");
		if (typeof origins[i]== "function")
			origins[i]=origins[i].prototype;
		if (origins[i]._init) 
			construct.push(origins[i]._init);
		if (origins[i].defaults){ 
			var defaults = origins[i].defaults;
			if (!compilation.defaults)
				compilation.defaults = {};
			for (var def in defaults)
				if (dhtmlx.isNotDefined(compilation.defaults[def]))
					compilation.defaults[def] = defaults[def];
		}
		if (origins[i].type && compilation.type){
			for (var def in origins[i].type)
				if (!compilation.type[def])
					compilation.type[def] = origins[i].type[def];
		}
			
		for (var key in origins[i]){
			if (!compilation[key])
				compilation[key] = origins[i][key];
		}
	}
	
	if (has_constructor)
		construct.push(compilation._init);
	
	
	compilation._init = function(){
		for (var i=0; i<construct.length; i++)
			construct[i].apply(this, arguments);
	};
	var result = function(config){
		this.$ready=[];
		dhtmlx.assert(this._init,"object without init method");
		this._init.apply(this,arguments);
		/*this._init(config);*/
		if (this._parseSettings)
			this._parseSettings(config, this.defaults);
		for (var i=0; i < this.$ready.length; i++)
			this.$ready[i].call(this);
	};
	result.prototype = compilation;
	
	compilation = origins = null;
	return result;
};

//common helpers

/*checks where an object is instance of Array*/
jdapivot.isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};
jdapivot.isDate = function(obj){
	return obj instanceof Date;
};
// dhtmlx.env.transform 
// dhtmlx.env.transition
(function(){
	if (navigator.userAgent.indexOf("Mobile")!=-1) 
		dhtmlx.env.mobile = true;
	if (dhtmlx.env.mobile || navigator.userAgent.indexOf("iPad")!=-1 || navigator.userAgent.indexOf("Android")!=-1)
		dhtmlx.env.touch = true;
	if (navigator.userAgent.indexOf('Opera')!=-1)
		dhtmlx.env.isOpera=true;
	else{
		//very rough detection, but it is enough for current goals
		dhtmlx.env.isIE=!!document.all;
		dhtmlx.env.isFF=!document.all;
		dhtmlx.env.isWebKit=(navigator.userAgent.indexOf("KHTML")!=-1);
		dhtmlx.env.isSafari=dhtmlx.env.isWebKit && (navigator.userAgent.indexOf('Mac')!=-1);
	}
	if(navigator.userAgent.toLowerCase().indexOf("android")!=-1)
		dhtmlx.env.isAndroid = true;
	dhtmlx.env.transform = false;
	dhtmlx.env.transition = false;
	var options = {};
	options.names = ['transform', 'transition'];
	options.transform = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
	options.transition = ['transition', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
	
	var d = document.createElement("DIV");
	for(var i=0; i<options.names.length; i++) {
		var coll = options[options.names[i]];
		
		for (var j=0; j < coll.length; j++) {
			if(typeof d.style[coll[j]] != 'undefined'){
				dhtmlx.env[options.names[i]] = coll[j];
				break;
			}
		}
	}
    d.style[dhtmlx.env.transform] = "translate3d(0,0,0)";
    dhtmlx.env.translate = (d.style[dhtmlx.env.transform])?"translate3d":"translate";

	var prefix = ''; // default option
	var cssprefix = false;
	if(dhtmlx.env.isOpera){
		prefix = '-o-';
		cssprefix = "O";
	}
	if(dhtmlx.env.isFF)
		prefix = '-Moz-';
	if(dhtmlx.env.isWebKit)
		prefix = '-webkit-';
	if(dhtmlx.env.isIE)
		prefix = '-ms-';

    dhtmlx.env.transformCSSPrefix = prefix;

	dhtmlx.env.transformPrefix = cssprefix||(dhtmlx.env.transformCSSPrefix.replace(/-/gi, ""));
	dhtmlx.env.transitionEnd = ((dhtmlx.env.transformCSSPrefix == '-Moz-')?"transitionend":(dhtmlx.env.transformPrefix+"TransitionEnd"));
})();

//html helpers

dhx.ready = function(code){
	if (this._ready) code.call();
	else this._ready_code.push(code);
};
dhx._ready_code = [];

//autodetect codebase folder
(function(){
	dhtmlx.event(window, "load", function(){
		dhx.callEvent("onReady",[]);
		dhtmlx.delay(function(){
			dhx._ready = true;
			for (var i=0; i < dhx._ready_code.length; i++)
				dhx._ready_code[i].call();
			dhx._ready_code=[];
		});
	});
	
})();

jdapivot.locale=jdapivot.locale||{};

dhx.ready(function(){
	dhtmlx.event(document.body,"click", function(e){
		dhx.callEvent("onClick",[e||event]);
	});
});



/*DHX:Depend core/dhx.js*/
/*DHX:Depend core/bind.js*/
/*DHX:Depend core/config.js*/
/*
	Behavior:Settings
	
	@export
		customize
		config
*/

/*DHX:Depend core/dhx.js*/

jdapivot.Settings={
	_init:function(){
		/* 
			property can be accessed as this.config.some
			in same time for inner call it have sense to use _settings
			because it will be minified in final version
		*/
		this._settings = this.config= {}; 
	},
	define:function(property, value){
		if (typeof property == "object")
			return this._parseSeetingColl(property);
		return this._define(property, value);
	},
	_define:function(property,value){
		dhtmlx.assert_settings.call(this,property,value);
		
		//method with name {prop}_setter will be used as property setter
		//setter is optional
		var setter = this[property+"_setter"];
		return this._settings[property]=setter?setter.call(this,value,property):value;
	},
	//process configuration object
	_parseSeetingColl:function(coll){
		if (coll){
			for (var a in coll)				//for each setting
				this._define(a,coll[a]);		//set value through config
		}
	},
	//helper for object initialization
	_parseSettings:function(obj,initial){
		//initial - set of default values
		var settings = {}; 
		if (initial)
			settings = jdapivot.extend(settings,initial);
					
		//code below will copy all properties over default one
		if (typeof obj == "object" && !obj.tagName)
			jdapivot.extend(settings,obj, true);	
		//call config for each setting
		this._parseSeetingColl(settings);
	},
	_mergeSettings:function(config, defaults){
		for (var key in defaults)
			switch(typeof config[key]){
				case "object": 
					config[key] = this._mergeSettings((config[key]||{}), defaults[key]);
					break;
				case "undefined":
					config[key] = defaults[key];
					break;
				default:	//do nothing
					break;
			}
		return config;
	}
};
/*DHX:Depend core/datastore.js*/
/*DHX:Depend core/load.js*/
/* 
	ajax operations 
	
	can be used for direct loading as
		dhx.ajax(ulr, callback)
	or
		dhx.ajax().item(url)
		dhx.ajax().post(url)

*/

/*DHX:Depend core/dhx.js*/

jdapivot.AtomDataLoader={
	_init:function(config){
		//prepare data store
		this.data = {}; 
		if (config){
			this._settings.datatype = config.datatype||"json";
			this.$ready.push(this._load_when_ready);
		}
	},
	_load_when_ready:function(){
		this._ready_for_data = true;
		
		if (this._settings.url)
			this.url_setter(this._settings.url);
		if (this._settings.data)
			this.data_setter(this._settings.data);
	},
	url_setter:function(value){
		if (!this._ready_for_data) return value;
		this.load(value, this._settings.datatype);	
		return value;
	},
	data_setter:function(value){
		if (!this._ready_for_data) return value;
		this.parse(value, this._settings.datatype);
		return true;
	},
	//loads data from external URL
	load:function(url,call){
		if (url.$proxy) {
			url.load(this, typeof call == "string" ? call : "json");
			return;
		}

		this.callEvent("onXLS",[]);
		if (typeof call == "string"){	//second parameter can be a loading type or callback
			this.data.driver = dhtmlx.DataDriver[call];
			call = arguments[2];
		}
		else
			this.data.driver = dhtmlx.DataDriver["json"];

		//load data by async ajax call
		//loading_key - can be set by component, to ignore data from old async requests
		var callback = [{
			success: this._onLoad,
			error: this._onErrorLoad
		}];
		
		if (call){
			if (jdapivot.isArray(call))
				callback.push.apply(callback,call);
			else
				callback.push(call);
		}
			

		return dhtmlx.ajax(url,callback,this);
	},
	//loads data from object
	parse:function(data,type){
		this.callEvent("onXLS",[]);
		this.data.driver = dhtmlx.DataDriver[type||"json"];
		this._onLoad(data,null);
	},
	//default after loading callback
	_onLoad:function(text,xml,loader,key){
		var driver = this.data.driver;
		var top = driver.getRecords(driver.toObject(text,xml))[0];
		this.data=(driver?driver.getDetails(top):text);
		this.callEvent("onXLE",[]);
	},
	_onErrorLoad:function(){
		this.callEvent("onXLE",[]);
		this.callEvent("onLoadingError",arguments);
	},
	_check_data_feed:function(data){
		if (!this._settings.dataFeed || this._ignore_feed || !data) return true;
		var url = this._settings.dataFeed;
		if (typeof url == "function")
			return url.call(this, (data.id||data), data);
		url = url+(url.indexOf("?")==-1?"?":"&")+"action=get&id="+encodeURIComponent(data.id||data);
		this.callEvent("onXLS",[]);
		dhtmlx.ajax(url, function(text,xml){
			this._ignore_feed=true;
			this.setValues(dhtmlx.DataDriver.json.toObject(text)[0]);
			this._ignore_feed=false;
			this.callEvent("onXLE",[]);
		}, this);
		return false;
	}
};

/*
	Abstraction layer for different data types
*/


/*DHX:Depend core/dhx.js*/

/*
	Behavior:DataLoader - load data in the component
	
	@export
		load
		parse
*/
jdapivot.DataLoader=jdapivot.proto({
	_init:function(config){
		//prepare data store
		config = config || "";
		name = "DataStore";

		//list of all active ajax requests
		this._ajax_queue = dhtmlx.toArray();

		this.data = (config.datastore)||(new dhtmlx.DataStore());
		this._readyHandler = this.data.attachEvent("onStoreLoad",dhtmlx.bind(this._call_onready,this));
		this.data.attachEvent("onClearAll",dhtmlx.bind(this._call_onclearall,this));
		this.data.feed = this._feed;

	},
	_feed:function(from,count,callback){
				//allow only single request at same time
				if (this._load_count)
					return this._load_count=[from,count,callback];	//save last ignored request
				else
					this._load_count=true;
		var url = this.data.url;
		this.load(url+((url.indexOf("?")==-1)?"?":"&")+(this.dataCount()?("continue=true&"):"")+"start="+from+"&count="+count,[function(){
					//after loading check if we have some ignored requests
					var temp = this._load_count;
					this._load_count = false;
					if (typeof temp =="object" && (temp[0]!=from || temp[1]!=count))
						this.data.feed.apply(this, temp);	//load last ignored request
		},callback]);
	},
	//loads data from external URL
	load:function(url,call){
		var ajax = jdapivot.AtomDataLoader.load.apply(this, arguments);
		this._ajax_queue.push(ajax);

		//prepare data feed for dyn. loading
		if (!this.data.url)
			this.data.url = url;
	},
	//load next set of data rows
	loadNext:function(count, start, callback, url, now){
		if (this._settings.datathrottle && !now){
			if (this._throttle_request)
				window.clearTimeout(this._throttle_request);
			this._throttle_request = dhtmlx.delay(function(){
				this.loadNext(count, start, callback, url, true);
			},this, 0, this._settings.datathrottle);
			return;
		}

		if (!start && start !== 0) start = this.dataCount();
		this.data.url = this.data.url || url;
		if (this.callEvent("onDataRequest", [start,count,callback,url]) && this.data.url)
			this.data.feed.call(this, start, count, callback);
	},
	//default after loading callback
	_onLoad:function(text,xml,loader){
		//ignore data loading command if data was reloaded 
		this._ajax_queue.remove(loader);

		this.data._parse(this.data.driver.toObject(text,xml));
		this.callEvent("onXLE",[]);
		if(this._readyHandler){
			this.data.detachEvent(this._readyHandler);
			this._readyHandler = null;
		}
	},
	scheme_setter:function(value){
		this.data.scheme(value);
	},	
	dataFeed_setter:function(value){
		this.data.attachEvent("onBeforeFilter", dhtmlx.bind(function(text, value){
			if (this._settings.dataFeed){

				var filter = {};				
				if (!text && !value) return;
				if (typeof text == "function"){
					if (!value) return;
					text(value, filter);
				} else 
					filter = { text:value };

				this.clearAll();
				var url = this._settings.dataFeed;
				var urldata = [];
				if (typeof url == "function")
					return url.call(this, value, filter);
				for (var key in filter)
					urldata.push("dhx_filter["+key+"]="+encodeURIComponent(filter[key]));
				this.load(url+(url.indexOf("?")<0?"?":"&")+urldata.join("&"), this._settings.datatype);
				return false;
			}
		},this));
		return value;
	},
	_call_onready:function(){
		if (this._settings.ready){
			var code = dhtmlx.toFunctor(this._settings.ready);
			if (code && code.call) code.apply(this, arguments);
		}
	},
	_call_onclearall:function(){
		for (var i = 0; i < this._ajax_queue.length; i++)
			this._ajax_queue[i].abort();

		this._ajax_queue = dhtmlx.toArray();
	}
},jdapivot.AtomDataLoader).prototype;

//reason to override this function is feed is getting null 
dhtmlx.DataStore.prototype.clearAll = function() {
    this.pull = {};
    this.order = dhtmlx.toArray();
    //this.feed = null;
    this._filter_order = null;
    this.callEvent("onClearAll", []);
    this.refresh()
},


//UI interface


/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend core/template.js*/
/*DHX:Depend core/movable.js*/
/*DHX:Depend core/dnd.js*/
/*
	Behavior:DND - low-level dnd handling
	@export
		getContext
		addDrop
		addDrag
		
	DND master can define next handlers
		onCreateDrag
		onDragIng
		onDragOut
		onDrag
		onDrop
	all are optional
*/

/*DHX:Depend core/dhx.js*/

/*DHX:Depend core/move.js*/
/*
	Behavior:DataMove - allows to move and copy elements, heavily relays on DataStore.move
	@export
		copy
		move
*/
/*DHX:Depend core/dhx.js*/

jdapivot.Scrollable = {
	_init:function(config){
		//do not spam unwanted scroll containers for templates 
		if (config && !config.scroll && this._one_time_scroll) 
			return this._dataobj = (this._dataobj||this._contentobj);
		
		(this._dataobj||this._contentobj).appendChild(dhtmlx.html.create("DIV",{ "class" : "dhx_scroll_cont" },""));
		this._dataobj=(this._dataobj||this._contentobj).firstChild;
	},
	/*defaults:{
		scroll:true
	},*/
	scrollSize:(jdapivot.Touch?0:18),
	scroll_setter:function(value){
		if (!value) return false;
		if (jdapivot.Touch){
			value =  (value=="x"?"x":(value=="xy"?"xy":"y"));
			this._dataobj.setAttribute("touch_scroll",value);
			if (this.attachEvent)
				this.attachEvent("onAfterRender", dhtmlx.bind(this._refresh_scroll,this));
			this._settings.touch_scroll = true;
		} else {
			this._dataobj.parentNode.style.overflowY=value?"scroll":"";
		}
		return value;
	},
	scrollState:function(){
		if (jdapivot.Touch){
			var temp = jdapivot.Touch._get_matrix(this._dataobj);
			return { x : -temp.e, y : -temp.f };
		} else
			return { x : this._dataobj.parentNode.scrollLeft, y : this._dataobj.parentNode.scrollTop };
	},
	scrollTo:function(x,y){
		if (jdapivot.Touch){
			y = Math.max(0, Math.min(y, this._dataobj.offsetHeight - this._content_height));
			x = Math.max(0, Math.min(x, this._dataobj.offsetWidth - this._content_width));
			jdapivot.Touch._set_matrix(this._dataobj, -x, -y, this._settings.scrollSpeed||"100ms");
		} else {
			this._dataobj.parentNode.scrollLeft=x;
			this._dataobj.parentNode.scrollTop=y;
		}
	},
	_refresh_scroll:function(){
		//this._dataobj.style.webkitTransformStyle="flat";
		if (this._settings.scroll.indexOf("x")!=-1 && !this._handleScrollSize){
			this._dataobj.style.width = this._content_width+"px";
			this._dataobj.style.width = this._dataobj.scrollWidth+"px";
		}
			
		if(jdapivot.Touch && this._settings.touch_scroll){
			jdapivot.Touch._clear_artefacts();
			jdapivot.Touch._scroll_end();
			jdapivot.Touch._set_matrix(this._dataobj, 0, 0, 0);
		}
	}
};
/*DHX:Depend core/single_render.js*/
/*
	REnders single item. 
	Can be used for elements without datastore, or with complex custom rendering logic
	
	@export
		render
*/

/*DHX:Depend core/template.js*/

jdapivot.AtomRender={
	//convert item to the HTML text
	_toHTML:function(obj){
		return this._settings.template(obj, this);
	},
	//render self, by templating data object
	render:function(){
		if (this.isVisible(this._settings.id)){
			if (dhx.debug_render)
				dhtmlx.log("Render: "+this.name+"@"+this._settings.id);
			if (!this.callEvent || this.callEvent("onBeforeRender",[this.data])){
				if (this.data)
					this._dataobj.innerHTML = this._toHTML(this.data);
				if (this.callEvent) this.callEvent("onAfterRender",[]);
			}
			return true;
		}
		return false;
	},
	template_setter:dhx.Template
};


/*DHX:Depend ui/content.js*/
/*DHX:Depend core/dhx.js*/


(function(){

var resize = [];
jdapivot.ui = undefined;
var ui = jdapivot.ui;

if (!jdapivot.ui){
	ui = jdapivot.ui = function(config, parent, id){
		dhx._ui_creation = true;
		var node = config;
		
		node = dhtmlx.toNode((config.container||parent)||document.body);
		if (node == document.body)
			jdapivot.ui._fixHeight();
		if (config._settings || (node && node._cells && !id)){
			var top_node = config;
		} else 
			var top_node = ui._view(config);
		
		if (node && node.appendChild){
			node.appendChild(top_node._viewobj);
			if (!top_node.setPosition  && node == document.body)
				resize.push(top_node);
			if (!config.skipResize)
				top_node.adjust();
		} else if (node && node._replace){
			if (top_node.getParent && top_node.getParent())
				top_node.getParent()._remove(top_node);
			node._replace(top_node, id);
		} else
			dhtmlx.error("not existing parent:"+config.container);
		
		dhx._ui_creation = false;
		return top_node;
	};
}

jdapivot.ui._uid = function(name){
	return name+(this._namecount[name] = (this._namecount[name]||0)+1);
};
jdapivot.ui._namecount = {};

jdapivot.ui._fixHeight = function (){
	dhtmlx.html.addStyle("html, body{ height:100%; }")
	jdapivot.ui._fixHeight = function(){};
};
jdapivot.ui.resize = function(){
	if (!jdapivot.ui._freeze)
		for (var i=0; i < resize.length; i++){
			resize[i].adjust();
		}
};
dhtmlx.event(window, "resize", jdapivot.ui.resize);

ui._delays = {};
ui.delay = function(config){
	jdapivot.ui._delays[config.id] = config;
};

jdapivot.ui.zIndex = function(){
	return jdapivot.ui._zIndex++;
};
jdapivot.ui._zIndex = 1;

jdapivot.styles = {};
ui._view = function(){
	var t = dhtmlx.html.create("DIV",{
		"class":"dhx_skin_settings"
	});
	document.body.appendChild(t);

	var styles = t.currentStyle || window.getComputedStyle(t,null);
	var color = styles["border-top-color"] || styles["borderTopColor"];
	jdapivot.styles.viewBorder = "1px solid "+color;
	jdapivot.styles.viewBorder0 = "0px solid "+color;

	dhtmlx.html.remove(t);
	ui._view = ui._view2;
	return ui._view.apply(this, arguments);
};
ui._view2 = function(config){
	if (config.view){
		var view = config.view;
		delete config.view;
		dhtmlx.assert(ui[view], "unknown view:"+view);
		return new ui[view](config);
	} else if (config.rows || config.cols)
		return new ui.layout(config);
	else if (config.cells)
		return new ui.multiview(config);
	else if (config.template || config.content)
		return new ui.template(config);	
	else return new ui.view(config);
};

ui.views = {};
ui.get = function(id){
	if (!id) return null;
	
	if (ui.views[id]) return ui.views[id];
	if (ui._delays[id]) return jdapivot.ui(ui._delays[id]);
	
	var name = id;
	if (typeof id == "object"){
		if (id._settings)
			return id;
		name = (id.target||id.srcElement)||id;
	}
	return ui.views[dhtmlx.html.locate({ target:dhtmlx.toNode(name)},"view_id")];
};
if (dhtmlx.isNotDefined(window.$$)) $$=ui.get;


jdapivot.protoUI({
	name:"baseview",
	//attribute , which will be used for ID storing
	_init:function(config){
		if (!config.id) 
			config.id = jdapivot.ui._uid(this.name);
		
		this._parent_cell = dhx._parent_cell;
		dhx._parent_cell = null;
		
		this._contentobj = this._viewobj = dhtmlx.html.create("DIV",{
			"class":"dhx_view"
		});
		this.$view = this._viewobj;
	},
	defaults:{
		width:-1,
		height:-1,
		gravity:1
	},
	getNode:function(){
		return this._viewobj;
	},
	getParent:function(){
		return this._parent_cell||null;	
	},
	isVisible:function(base_id, prev_id){
		if (this._settings.hidden && base_id){
			if (!this._hidden_render) {
				this._hidden_render = [];
				this._hidden_hash = {};
			}
			if (!this._hidden_hash[base_id]){
				this._hidden_hash[base_id] =  true;
				this._hidden_render.push(base_id);
			}
			return false;
		}
		
		var parent = this.getParent();
		if (parent) return parent.isVisible(base_id, this._settings.id);
		
		return true;
	},
	container_setter:function(value){
		dhtmlx.assert(dhtmlx.toNode(value),"Invalid container");
		return true;
	},
	css_setter:function(value){
		this._viewobj.className += " "+value;
		return value;
	},
	id_setter:function(value){
		if (dhx._global_collection && dhx._global_collection != this){
			var oldvalue = value;
			dhx._global_collection._elements[value] = this;
			value = jdapivot.ui._uid(this.name);
			dhx._global_collection._translate_ids[value]=oldvalue;
		}
		jdapivot.ui.views[value] = this;
		this._viewobj.setAttribute("view_id", value);
		return value;
	},
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
		this._content_height = y;
		this.$width = this._content_width;
		this.$height = this._content_height;
		this._viewobj.style.width = x+"px";
		this._viewobj.style.height = y+"px";
		return true;
	},
	$getSize:function(){
		var width = this._settings.width;
		var height = this._settings.height;
		var gravx, gravy;
		gravx = gravy = this._settings.gravity; 
		
		if (width == -1) width = 0; else {
			gravx = 0;
			width+=(this._settings.scroll&&(!jdapivot.Touch))?jdapivot.Scrollable.scrollSize:0;
		}
		if (height == -1) height = 0; else gravy = 0;
		return [ gravx, width, gravy, height ];
	},
	show:function(animate_settings){
		if (this.getParent()) {
			var parent = this.getParent();
			if(!animate_settings && this._settings.animate)
				if (parent._settings.animate)
					animate_settings = jdapivot.extend((parent._settings.animate?jdapivot.extend({},parent._settings.animate):{}), this._settings.animate, true);
			var show = arguments.length < 2;
			if (show?parent._show:parent._hide)
				(show?parent._show:parent._hide).call(parent, this, animate_settings);
		}
	},
	hidden_setter:function(value){
		if (value) this.hide();
		return this._settings.hidden;
	},
	hide:function(){
		this.show(null, true);
	},
	adjust:function(){
		var area = this._viewobj;
		if (!this._parent_cell)
			area = area.parentNode;

		if(!this._viewobj.parentNode)
			return false;

		var x = this._viewobj.parentNode.offsetWidth;
		var y = this._viewobj.parentNode.offsetHeight;

		var sizes=this.$getSize();
		
		if (sizes[0]) x = Math.max(x, sizes[1]); //use all avaiable space
		else x = sizes[1];
		if (sizes[2]) y = Math.max(y, sizes[3]); //use all avaiable space
		else y = sizes[3];
		
		this.$setSize(x,y);
	},
	resize:function(force){
		if (dhx._child_sizing_active) return;

		var sizes = this.$getSize();
		var x = sizes[1];  var y = sizes[3];
		var old = this._last_full_size || this._last_size;

		if (dhx.debug_resize)
			dhtmlx.log("[RESIZE] check");
		if (arguments.length == 2){
			var changed = false;
			if (x>0 && old[0] != x || force){
				this._settings.width = x;
				var changed = true;
			}
			if (y>0 && old[1] != y || force){
				this._settings.height = y;
				var changed = true;
			}
			if (!changed) return false;
		}
		if (dhx.debug_resize)
			dhtmlx.log("[RESIZE] "+this.name+"@"+this._settings.id+" "+x+","+y);
		var parent = this.getParent();
		if (parent){
			if (parent.resizeChildren)
				parent.resizeChildren();
		} else {
			/*if (x>0)
				this.$view.style.width = x+"px";
			if (y>0)
				this.$view.style.height = y+"px";*/

			this.$setSize((x||old[0]),(y||old[1]),true);
			return false;
		}
		return true;
	}
}, jdapivot.Settings, dhtmlx.Destruction, dhtmlx.BaseBind);



/*
	don't render borders itself , but aware of layout , which can set some borders
*/
jdapivot.protoUI({
	name:"view",
	_init:function(config){
		//this._contentobj = dhtmlx.html.create("DIV");
		//this._viewobj.appendChild(this._contentobj);
		this._contentobj.style.borderWidth="1px";
		

		if (this.setValue && dhx._parent_collection){
			dhtmlx.assert(config.name||config.id, "input missing both id and name");
			dhx._parent_collection.elements[config.name||config.id]=this;
		}
	},
	$getSize:function(){
		var _borders = this._settings._inner;
		var size = jdapivot.ui.baseview.prototype.$getSize.call(this);
		if (!_borders) return size;
		var dx = (_borders.left?0:1)+(_borders.right?0:1);
		var dy = (_borders.top?0:1)+(_borders.bottom?0:1);
		
		if (size[1] && dx) size[1]+=dx;
		if (size[3] && dy) size[3]+=dy;

		if (dhx.debug_size)
			dhtmlx.log("[get][layout] "+this.name+"@"+this._settings.id+" "+size.join(","));

		return size;
	},
	$setSize:function(x,y){
		if (dhx.debug_size)
			dhtmlx.log("[set] "+this.name+"@"+this.config.id+" :"+x+","+y);
			
		var _borders = this._settings._inner;
		this._last_full_size = [x,y];
		if (_borders){
			x -= (_borders.left?0:1)+(_borders.right?0:1);
			y -= (_borders.top?0:1)+(_borders.bottom?0:1);
		} else 
			this._contentobj.style.borderWidth="0px";
			
		return jdapivot.ui.baseview.prototype.$setSize.call(this,x,y);
	}/*,
	resize:function(x,y){
		var _borders = this._settings._inner;
		if (_borders){
			if (x>=0)
				x += (_borders.left?0:1)+(_borders.right?0:1);
			if (y>=0)
				y += (_borders.top?0:1)+(_borders.bottom?0:1);
		}
		return jdapivot.ui.baseview.prototype.resize.call(this,x,y);
	}*/
}, jdapivot.ui.baseview);



})();

jdapivot.ui.view.call(dhx);

/*DHX:Depend ui/layout.js*/
/*DHX:Depend ui/view.js*/

jdapivot.protoUI({
	name:"baselayout",
	_init:function(){
		this.$ready.push(this._parse_cells);
		this._dataobj  = this._contentobj;
	},
	rows_setter:function(value){
		this._vertical_orientation = 1;
		this._cssFloat = "";
		this._collection = value;
	},
	cols_setter:function(value){
		this._vertical_orientation = 0;
		this._cssFloat = "left";
		this._collection = value;
	},
	_remove:function(view){
		dhtmlx.PowerArray.removeAt.call(this._cells, dhtmlx.PowerArray.find.call(this._cells, view));
		this.resizeChildren(true);
	},
	_replace:function(new_view,target_id){
		if (dhtmlx.isNotDefined(target_id)){
			for (var i=0; i < this._cells.length; i++)
				this._cells[i].destructor();
			this._collection = new_view;
			this._parse_cells();
		} else {
			if (typeof target_id == "number"){
				if (target_id<0 || target_id > this._cells.length)
					target_id = this._cells.length;
				var prev_node = (this._cells[target_id]||{})._viewobj;
				dhtmlx.PowerArray.insertAt.call(this._cells, new_view, target_id);
				dhtmlx.html.insertBefore(new_view._viewobj, prev_node, this._dataobj);
			} else {
				var source = jdapivot.ui.get(target_id);
				target_id = dhtmlx.PowerArray.find.call(this._cells, source);
				dhtmlx.assert(target_id!=-1, "Attempt to replace the non-existing view");
				source._viewobj.parentNode.insertBefore(new_view._viewobj, source._viewobj);
				source.destructor();	
				this._cells[target_id] = new_view;
			}
			//IE8COMPAT
			new_view._viewobj.style.cssFloat = new_view._viewobj.style.styleFloat = this._cssFloat;
			this._cells[target_id]._parent_cell = this;
		}
		this.resizeChildren(true);
	},
	reconstruct:function(){
		for (var i=0; i<this._cells.length; i++)
			dhtmlx.html.remove(this._cells[i]._viewobj);
		this._parse_cells();
		this.$setSize(this._last_size[0], this._last_size[1]);
	},
	_hide:function(obj, settings, silent){
		if (obj._settings.hidden) return;
		obj._settings.hidden = true;
		dhtmlx.html.remove(obj._viewobj);
		this._hiddencells++;
		if (!silent && !dhx._ui_creation)
			this.resizeChildren(true);	
	},
	resizeChildren:function(){
		if (this._layout_sizes){
			var parent = this.getParent();
			if (parent && parent.resizeChildren)
				parent.resizeChildren();
				
			var sizes = this.$getSize();

			var x = this._layout_sizes[0];
			var y = this._layout_sizes[1];
			this._set_child_size(x,y);
		}
	},
	index:function(obj){
		if (obj._settings)
			obj = obj._settings.id;
		for (var i=0; i < this._cells.length; i++)
			if (this._cells[i]._settings.id == obj)
				return i;
		return -1;
	},
	_show:function(obj, settings, silent){
		if (!obj._settings.hidden) return;
		obj._settings.hidden = false;
		dhtmlx.html.insertBefore(obj._viewobj, (this._cells[this.index(obj)+1]||{})._viewobj, (this._dataobj||this._viewobj));
		this._hiddencells--;
		if (!silent)
			this.resizeChildren(true);
	},
	showBatch:function(name){
		if (this._settings.visibleBatch == name) return;
		this._settings.visibleBatch = name;
		
		var show = [];
		for (var i=0; i < this._cells.length; i++){
			if (!this._cells[i]._settings.batch) 
				show.push(this._cells[i]);
			if (this._cells[i]._settings.batch == name)
				show.push(this._cells[i]);
			else
				this._hide(this._cells[i], null, true);
		}
		for (var i=0; i < show.length; i++)
			this._show(show[i], null, true);
		
		this.resizeChildren();
	},
	_parse_cells:function(collection){
		collection = this._collection||collection; this._collection = null;
		
		this._cells=[];
		this._viewobj.style.verticalAlign="top";
		
		for (var i=0; i<collection.length; i++){
			dhx._parent_cell = this;
			this._cells[i]=jdapivot.ui._view(collection[i], this);
			if (!this._vertical_orientation)
				//IE8COMPAT
				this._cells[i]._viewobj.style.cssFloat  = this._cells[i]._viewobj.style.styleFloat = "left";
				
			if (this._settings.visibleBatch && this._settings.visibleBatch != this._cells[i]._settings.batch && this._cells[i]._settings.batch)
				this._cells[i]._settings.hidden = true;
				
			if (!this._cells[i]._settings.hidden)
				(this._dataobj||this._contentobj).appendChild(this._cells[i]._viewobj);
		}
		
	},
	$getSize:function(){
		var width  = 0; 
		var height = 0;
		var xgrav = 0;
		var ygrav = 0;
		this._sizes=[];
		for (var i=0; i < this._cells.length; i++) {
			
			if (this._cells[i]._settings.hidden)
			//	this._sizes[i] = [0,0,0,0];
				continue;
			
					
			var sizes = this._sizes[i] = this._cells[i].$getSize();
			if (this._vertical_orientation){
				width = Math.max(width, sizes[1]);
				xgrav = Math.max(xgrav, sizes[0]);
				
				height += sizes[3];
				ygrav+=sizes[2];
			} else {
				height = Math.max(height, sizes[3]);
				ygrav = Math.max(ygrav, sizes[2]);
				
				 
				width += sizes[1];
				xgrav += sizes[0];
			}
		}
		
		this._master_size = [ xgrav, width, ygrav, height ];
		
		if (this._settings.height > -1){
			height = this._settings.height;
			ygrav = 0;
		}
		if (this._settings.width > -1){
			width = this._settings.width;
			xgrav = 0;
		}
		if (this._vertical_orientation){
			if (width) xgrav  = 0;
			if (ygrav) height = 0;
		} else {
			if (height) ygrav  = 0;
			if (xgrav) width = 0;
		}
		
		if (dhx.debug_size)
			dhtmlx.log("[get][layout] "+this.name+"@"+this._settings.id+" "+[xgrav, width, ygrav, height].join(","));
			
		return [ xgrav, width, ygrav, height ];
	},
	$setSize:function(x,y){ 
		this._layout_sizes = [x,y];
		if (dhx.debug_size)
			dhtmlx.log("[set] "+this.name+"@"+this.config.id+" :"+x+","+y);
		jdapivot.ui.baseview.prototype.$setSize.call(this,x,y);
		this._set_child_size(x,y);
	},
	_set_child_size:function(x,y){
		dhx._child_sizing_active = (dhx._child_sizing_active||0)+1;

		var delta_x = x-this._master_size[1];
		var delta_y = y-this._master_size[3];
		
		var control_x = this._master_size[0], control_y=this._master_size[2];
		var limit =  this._cells.length-1;
		for (var i=0; i < this._cells.length; i++){
			if (this._cells[i]._settings.hidden)
				continue;

			if (this._vertical_orientation){
				var width = x;
				var height;
				if (this._sizes[i][2]){
					height = Math.round(this._sizes[i][2]*delta_y/control_y);
					delta_y-=height; control_y-=this._sizes[i][2];
				} else {
					height = this._sizes[i][3];
					if (i == limit && delta_y > 0) height+=delta_y;
				}
			} else {
				var width;
				var height = y;
				if (this._sizes[i][0]){
					width = Math.round(this._sizes[i][0]*delta_x/control_x);
					delta_x-=width; control_x-=this._sizes[i][0];
				} else {
					width = this._sizes[i][1];
					if (i == limit && delta_x > 0) width+=delta_x;
				}
			}
			this._cells[i].$setSize(width,height);
		}
		dhx._child_sizing_active -= 1;
	},
	_next:function(obj, mode){
		var index = this.index(obj);
		if (index == -1) return null;
		return this._cells[index+mode];
	}, 
	first:function(){
		return this._cells[0];
	}
}, jdapivot.ui.baseview);




jdapivot.protoUI({
	name:"layout",
	_init:function(){
		this._hiddencells = 0;
	},
	_parse_cells:function(){
		this._viewobj.className += " dhx_layout_"+(this._settings.type||"");
		if (this._settings.margin)
			this._margin = this._settings.margin;
		if (this._settings.padding)
			this._padding = this._settings.padding;
	
		
		var collection = this._collection;
		if (!this._settings._inner){
			this._settings._inner = { top:true, left:true, right:true, bottom:true};
		}
		
		this._beforeResetBorders(collection);
		jdapivot.ui.baselayout.prototype._parse_cells.call(this, collection);
		this._afterResetBorders(collection);
	},
	$getSize:function(){ 
		var size = jdapivot.ui.baselayout.prototype.$getSize.call(this);
		var correction = this._margin*(this._cells.length-this._hiddencells-1);
		if (this._vertical_orientation) {
			if (size[3]) size[3]+=correction;
		} else {
			if (size[1]) size[1]+=correction;
		}
		if (this._padding){
			if (size[1]) size[1]+=this._padding*2;
			if (size[3]) size[3]+=this._padding*2;
			if (this._margin>-1){
				var _borders = this._settings._inner;
				if (_borders){
					var dx = (_borders.left?0:1)+(_borders.right?0:1);
					var dy = (_borders.top?0:1)+(_borders.bottom?0:1);
					if (size[1] && dx) size[1]+=dx;
					if (size[3] && dy) size[3]+=dy;
				}
			}
		}
		return size;
	},
	$setSize:function(x,y){
		this._layout_sizes = [x,y];

		if (dhx.debug_size)
			dhtmlx.log("[set] " +this.name+"@"+this.config.id+" :"+x+","+y);

		var result;
		if (this._padding && this._margin>0)
			result = jdapivot.ui.view.prototype.$setSize.call(this,x,y);
		else	
			result = jdapivot.ui.baseview.prototype.$setSize.call(this,x,y);
		
		//if (result || force)
		this._set_child_size(this._content_width, this._content_height);
	},
	_set_child_size:function(x,y){
		var correction = this._margin*(this._cells.length-this._hiddencells-1);

		if (this._vertical_orientation){
			y-=correction+this._padding*2;
			x-=this._padding*2;
		}
		else {
			x-=correction+this._padding*2;
			y-=this._padding*2;
		}
		return jdapivot.ui.baselayout.prototype._set_child_size.call(this, x, y);
	},
	resizeChildren:function(structure_changed){ 
		if (structure_changed && this.type !="clean"){
			var config = [];
			for (var i = 0; i < this._cells.length; i++){
				var cell = this._cells[i];
				config[i] = cell._settings;
				var n = cell._layout_sizes?"0px":"1px";
				cell._viewobj.style.borderTopWidth=cell._viewobj.style.borderBottomWidth=cell._viewobj.style.borderLeftWidth=cell._viewobj.style.borderRightWidth=n;
			}
			
			this._beforeResetBorders(config);
			this._afterResetBorders(this._cells);
		}

		jdapivot.ui.baselayout.prototype.resizeChildren.call(this);
	},
	_beforeResetBorders:function(collection){
		if (this._padding && this._margin){
			for (var i=0; i < collection.length; i++)
				collection[i]._inner={ top:false, left:false, right:false, bottom:false};
		} else {
			for (var i=0; i < collection.length; i++)
				collection[i]._inner=dhtmlx.copy(this._settings._inner);
			var mode = false;
			if (this._settings.type=="clean")
				mode = true;
				
			if (this._vertical_orientation){
				for (var i=1; i < collection.length-1; i++)
					collection[i]._inner.top = collection[i]._inner.bottom = mode;
				if (collection.length>1){
					if (this._settings.type!="head")
						collection[0]._inner.bottom = mode;
					collection[collection.length-1]._inner.top = mode;
				}
			}
			else {
				for (var i=1; i < collection.length-1; i++)
					collection[i]._inner.left = collection[i]._inner.right= mode;
				if (collection.length>1){
					if (this._settings.type!="head")
						collection[0]._inner.right= mode;
					collection[collection.length-1]._inner.left = mode;
				}
			}
		}
	},
	_afterResetBorders:function(collection){
		var start = 0; 
		for (var i=0; i<collection.length; i++){
			var cell = this._cells[i];
			if (cell._settings.hidden && this._cells[i+1]){
				this._cells[i+1]._settings._inner = cell._settings._inner;
				if (i==start) start++;
			}
				
			//if (cell._cells && !cell._render_borders) continue; 
			var _inner = cell._settings._inner;
			if (_inner.top) 
				cell._viewobj.style.borderTopWidth="0px";
			if (_inner.left) 
				cell._viewobj.style.borderLeftWidth="0px";
			if (_inner.right) 
				cell._viewobj.style.borderRightWidth="0px";
			if (_inner.bottom) 
				cell._viewobj.style.borderBottomWidth="0px";
		}

		var style = this._vertical_orientation?"marginLeft":"marginTop";
		var contrstyle = this._vertical_orientation?"marginTop":"marginLeft";

		if (this._padding){
			for (var i=0; i<collection.length; i++)
				this._cells[i]._viewobj.style[style] = this._padding+"px";
		}

		this._cells[start]._viewobj.style[contrstyle] = (this._padding||0)+"px";
		for (var index=start+1; index<collection.length; index++)
			this._cells[index]._viewobj.style[contrstyle]=this._margin+"px";
		
	},
	type_setter:function(value){
		this._margin = this._margin_set[value];
		this._padding = this._padding_set[value];
		if (this._padding && this._margin>0){
			this._contentobj.style.borderWidth="1px";
		}

		return value;
	},
	_margin_set:{ space:10, wide:4, clean:0, head:4, line:-1 },
	_padding_set:{ space:10, wide:0, clean:0, head:0, line:0 },
	_margin:-1,
	_padding:0
}, jdapivot.ui.baselayout);

jdapivot.ui.layout.call(dhx);
/*DHX:Depend ui/template.js*/
/*DHX:Depend ui/view.js*/


jdapivot.protoUI({
	name:"template",
	_init:function(config){
		this.attachEvent("onXLE",this.render);
	},
	setValues:function(obj){
		this.data = obj;
		this.render();
	},
	defaults:{
		template:dhtmlx.Template.empty,
		loading:true
	},
	_probably_render_me:function(){
		if (!this._not_render_me){
			this.render();
			this._not_render_me = true;
		}
	},
	src_setter:function(value){
		this._not_render_me = true;
		
		this.callEvent("onXLS",[]);
		dhtmlx.ajax(value, dhtmlx.bind(function(text){
			this._settings.template = dhtmlx.Template.fromHTML(text);
			this._not_render_me = false;
			this._probably_render_me();
			this.callEvent("onXLE",[]);
		}, this));
		return value;
	},
	content_setter:function(config){
		if (config){
			this._not_render_me = true;
			this._dataobj.appendChild(dhtmlx.toNode(config));
		}
	},
	refresh:function(){
		this.render();
	},
	waitMessage_setter:function(value){
		jdapivot.extend(this, jdapivot.ui.overlay);
		return value;
	},
	$setSize:function(x,y){
		if (jdapivot.ui.view.prototype.$setSize.call(this,x,y)){
			this._probably_render_me();
		}
	},
	_one_time_scroll:true //scroll will appear only if set directly in config
}, jdapivot.Scrollable, jdapivot.AtomDataLoader, jdapivot.AtomRender, dhtmlx.EventSystem, jdapivot.ui.view);


jdapivot.protoUI({
	name:"iframe",
	defaults:{
		loading:true
	},
	_init:function(){
		this._dataobj = this._contentobj;
		this._contentobj.innerHTML = "<iframe style='width:100%; height:100%' frameborder='0' src='about:blank'></iframe>";
	},
	load:function(value){
		this.src_setter(value);
	},
	src_setter:function(value){
		this._contentobj.childNodes[0].src = value;
		this.callEvent("onXLS",[]);
		dhtmlx.delay(this._set_frame_handlers, this);
		return value;
	},
	_set_frame_handlers:function(){
		try {
			dhtmlx.event(this.getWindow(), "load", dhtmlx.bind(function(){
				this.callEvent("onXLS",[]);
			}, this));
		} catch (e){
			this.callEvent("onXLE",[]);
		}
	},
	getWindow:function(){
		return this._contentobj.childNodes[0].contentWindow;
	},
	waitMessage_setter:function(value){
		jdapivot.extend(this, jdapivot.ui.overlay);
		return value;
	}
}, jdapivot.ui.view, dhtmlx.EventSystem);

jdapivot.ui.overlay = {
	_init:function(){
		if (dhtmlx.isNotDefined(this._overlay) && this.attachEvent){
			this.attachEvent("onXLS", this.showOverlay);
			this.attachEvent("onXLE", this.hideOverlay);
			this._overlay = null;
		}
	},
	showOverlay:function(message){
		if (!this._overlay){
			this._overlay = dhtmlx.html.create("DIV",{ "class":"dhx_loading_overlay" },(message||""));
			dhtmlx.html.insertBefore(this._overlay, this._viewobj.firstChild, this._viewobj);
		}
	},
	hideOverlay:function(){
		if (this._overlay){
			dhtmlx.html.remove(this._overlay);
			this._overlay = null;
		}
	}
};

/*scrollable view with another view insize*/
jdapivot.protoUI({
	name:"scrollview",
	defaults:{
		scroll:"x",
		scrollSpeed:"0ms"
	},
	_init:function(){
		this._viewobj.className += " dhx_scrollview";
	},
	content_setter:function(config){
		this._body_cell = jdapivot.ui._view(config);
		this._body_cell._parent_cell = this;
		this._dataobj.appendChild(this._body_cell._viewobj);
	},
	body_setter:function(config){
		return this.content_setter(config);
	},
	$getSize:function(){
		this._content_desired = this._body_cell.$getSize();
		if(this._settings.scroll=="x"&&this._content_desired[3]>0)
			this._settings.height = this._content_desired[3];
		else if(this._settings.scroll=="y"&&this._content_desired[1]>0){
			this._settings.width = this._content_desired[1];
		}
		return jdapivot.ui.view.prototype.$getSize.call(this);
	},
	$setSize:function(x,y){
		if (jdapivot.ui.view.prototype.$setSize.call(this,x,y)){
			this._body_cell.$setSize(Math.max(this._content_desired[1], this._content_width),Math.max(this._content_desired[3], this._content_height));
			this._dataobj.style.width = this._body_cell._content_width+"px";
			this._dataobj.style.height = this._body_cell._content_height+"px";
		}
	},
	_replace:function(new_view){
		this._body_cell.destructor();
		this._body_cell = new_view;
		this._body_cell._parent_cell = this;
		
		this._bodyobj.appendChild(this._body_cell._viewobj);
		this.resize();
	}
}, jdapivot.Scrollable, jdapivot.ui.view);
/*DHX:Depend core/mouse.js*/
/*
	Behavior:MouseEvents - provides inner evnets for  mouse actions
*/
/*DHX:Depend core/dhx.js*/
dhtmlx.MouseEvents={
	_init: function(){
		//attach dom events if related collection is defined
		if (this.on_click)
			dhtmlx.event(this._contentobj,"click",this._onClick,this);
		if (this.on_context)
			dhtmlx.event(this._contentobj,"contextmenu",this._onContext,this);
		
		if (this.on_dblclick)
			dhtmlx.event(this._contentobj,"dblclick",this._onDblClick,this);
		if (this.on_mouse_move){
			dhtmlx.event(this._contentobj,"mousemove",this._onMouse,this);
			dhtmlx.event(this._contentobj,(dhtmlx.env.isIE?"mouseleave":"mouseout"),this._onMouse,this);
		}

	},
	//inner onclick object handler
	_onClick: function(e) {
		return this._mouseEvent(e,this.on_click,"ItemClick");
	},
	//inner ondblclick object handler
	_onDblClick: function(e) {
		return this._mouseEvent(e,this.on_dblclick,"ItemDblClick");
	},
	//process oncontextmenu events
	_onContext: function(e) {
		if (this._mouseEvent(e, this.on_context, "BeforeContextMenu")){
			this._mouseEvent(e, {}, "AfterContextMenu");
			return dhtmlx.html.preventEvent(e);
		}
	},
	/*
		event throttler - ignore events which occurs too fast
		during mouse moving there are a lot of event firing - we need no so much
		also, mouseout can fire when moving inside the same html container - we need to ignore such fake calls
	*/
	_onMouse:function(e){
		if (dhtmlx.env.isIE)	//make a copy of event, will be used in timed call
			e = document.createEventObject(event);
			
		if (this._mouse_move_timer)	//clear old event timer
			window.clearTimeout(this._mouse_move_timer);
				
		//this event just inform about moving operation, we don't care about details
		this.callEvent("onMouseMoving",[e]);
		//set new event timer
		this._mouse_move_timer = window.setTimeout(dhtmlx.bind(function(){
			//called only when we have at least 100ms after previous event
			if (e.type == "mousemove")
				this._onMouseMove(e);
			else
				this._onMouseOut(e);
		},this),500);
	},

	//inner mousemove object handler
	_onMouseMove: function(e) {
		if (!this._mouseEvent(e,this.on_mouse_move,"MouseMove"))
			this.callEvent("onMouseOut",[e||event]);
	},
	//inner mouseout object handler
	_onMouseOut: function(e) {
		this.callEvent("onMouseOut",[e||event]);
	},
	//common logic for click and dbl-click processing
	_mouseEvent:function(e,hash,name){
		e=e||event;
		var trg=e.target||e.srcElement;
		var css = "";
		var id = null;
		var found = false;
		//loop through all parents
		while (trg && trg.parentNode){
			if (!found && trg.getAttribute){													//if element with ID mark is not detected yet
				id = trg.getAttribute(this._id);							//check id of current one
				if (id){
					if (trg.callEvent){
						if (trg.getAttribute("userdata"))
							this.callEvent("onLocateData",[id,trg]);
						if (!this.callEvent("on"+name,[id,e,trg])) return;		//it will be triggered only for first detected ID, in case of nested elements
					}
					found = true;											//set found flag
				}
			}
			css=trg.className;
			if (css){		//check if pre-defined reaction for element's css name exists
				css = css.split(" ");
				css = css[0]||css[1]; //FIXME:bad solution, workaround css classes which are starting from whitespace
				if (hash[css]){
					var res =  hash[css].call(this,e,id||dhtmlx.html.locate(e, this._id),trg);
					if(typeof res!="undefined"&&res!==true)
					return;
				}
			}
			trg=trg.parentNode;
		}		
		return found;	//returns true if item was located and event was triggered
	}
};
/*DHX:Depend ui/scroll.js*/
/*DHX:Depend ui/scroll.css*/

jdapivot.protoUI({
	name:"vscroll",
	defaults:{
		scroll:"x",
		scrollStep:40,
		scrollPos:0,
		scrollSize:18
	},
	_init:function(config){
		var dir = config.scroll||"x";
		var node = this._viewobj = dhtmlx.toNode(config.container);
		node.className += " dhx_vscroll_"+dir;
		node.innerHTML="<div class='dhx_vscroll_body'></div>";
		dhtmlx.event(node,"scroll", this._onscroll,this);
	},
	scrollWidth_setter:function(value){
		this._viewobj.firstChild.style.width = value+"px";
		return value;		
	},
	scrollHeight_setter:function(value){
		this._viewobj.firstChild.style.height = value+"px";
		return value;
	},
	sizeTo:function(value){
		if (!this._settings.scrollSize){
			this._viewobj.style.display = 'none';
		} else {
			this._viewobj.style[this._settings.scroll == "x"?"width":"height"] = value+"px";
			this._viewobj.style[this._settings.scroll == "x"?"height":"width"] = this._settings.scrollSize*2+"px";
		}
	},
	getScroll:function(){
		return this._settings.scrollPos*1;
	},
	getSize:function(){
		return (this._settings.scrollWidth||this._settings.scrollHeight)*1;
	},
	scrollTo:function(value){
		if (value<0)
			value = 0;
		this._viewobj[this._settings.scroll == "x"?"scrollLeft":"scrollTop"] = value;
		this._settings.scrollPos = value;
	},
	_onscroll:function(){			
		this._settings.scrollPos = this._viewobj[this._settings.scroll == "x"?"scrollLeft":"scrollTop"];
		this.callEvent("onScroll",[this._settings.scrollPos]);
	},
	mouseWheel:function(area){
		dhtmlx.event(area,"mousewheel",this._on_wheel,this);
		dhtmlx.event(area,"click",function(e){
			e.cancelBubble = true;
		});
		dhtmlx.event(area,"DOMMouseScroll",this._on_wheel,this);
	},
	_on_wheel:function(e){
		var dir  = e.wheelDelta/-40;
		if (dhtmlx.isNotDefined(e.wheelDelta))
			dir = e.detail;
		this.scrollTo(this._settings.scrollPos + dir*this._settings.scrollStep);
		return dhtmlx.html.preventEvent(e);
	}
}, dhtmlx.EventSystem, jdapivot.Settings);

jdapivot.Number={
	format: function(value, config){
		config = config||jdapivot.i18n;
		value = parseFloat(value);
		var str = value.toFixed(config.decimalSize).toString();
		str = str.split(".");

		var int_value = "";
		if (config.groupSize){
			var step = config.groupSize;
			var i=str[0].length;
			do {
				i-=step;
				var chunk = (i>0)?str[0].substr(i,step):str[0].substr(0,step+i);
				int_value = chunk+(int_value?config.groupDelimiter+int_value:"");
			} while(i>0);
		} else
			int_value = str[0];

		if (config.decimalSize)
			return int_value + config.decimalDelimeter + str[1];
		else
			return int_value;
	},
	numToStr:function(config){
		return function(value){
			return jdapivot.Number.format(value, config);
		};
	}
};


jdapivot.i18n = {
	dateMethods:["fullDateFormat", "timeFormat", "dateFormat", "longDateFormat"],
    dateFormat:"%d.%m.%Y",
    timeFormat:"%H:%i",
    longDateFormat:"%l, %d %F %Y",
    fullDateFormat:"%d-%m-%Y %H:%i",

    groupDelimiter:".",
    groupSize:3,
    decimalDelimeter:",",
    decimalSize:2,
    numberFormat:jdapivot.Number.format,


    setLocale:function(){
    	var helpers = jdapivot.i18n.dateMethods;
    	for( var i=0; i<helpers.length; i++){
    		var key = helpers[i];
    		var utc = jdapivot.i18n[key+"UTC"];
    		jdapivot.i18n[key+"Str"] = dhtmlx.Date.date_to_str(jdapivot.i18n[key], utc);
    		jdapivot.i18n[key+"Date"] = dhtmlx.Date.str_to_date(jdapivot.i18n[key], utc);
		}
    }
};
jdapivot.i18n.setLocale("en");

/*
dhx.debug_resize = true;
dhx.debug_size = true;
dhx.debug_render = true;
*/

jdapivot.protoUI({
	name:"datatable",
	defaults:{
		leftSplit:0,
		rightSplit:0,
		columnWidth:100,
		minColumnWidth:20,
		minColumnHeight:26,
		scrollSize:17,
		prerender:false,
		autoheight:false,
		autowidth:false,
		header:true,
		fixedRowHeight:true,
		scrollAlignY:true
	},
	on_click:{
	},
	on_context:{
	},
	_init:function(config){
		this.on_click = {};
		if (!config || !config.borderless)
			this._settings._inner = {};

		var html  = "<div class='dhx_ss_header'><div class='dhx_hs_left'></div><div class='dhx_hs_attr'></div><div class='dhx_hs_center'></div><div class='dhx_hs_right'></div></div><div class='dhx_ss_body'><div class='dhx_ss_left'><div class='dhx_ss_center_scroll'></div></div>";
		    html += "<div class='dhx_ss_attr'><div class='dhx_ss_center_scroll'></div></div><div class='dhx_ss_center'><div class='dhx_ss_center_scroll'></div></div>";
		    html += "<div class='dhx_ss_right' ><div class='dhx_ss_center_scroll'></div></div></div><div class='dhx_ss_footer'><div class='dhx_hs_left'></div><div class='dhx_hs_attr'></div><div class='dhx_hs_center'></div><div class='dhx_hs_right'></div></div>";
		    html += "<div class='dhx_ss_hscroll'></div><div class='dhx_ss_vscroll'></div>";

		this._contentobj.innerHTML = html;
		this._top_id = this._contentobj.id = this.name+dhtmlx.uid();
		this._contentobj.className +=" dhx_dtable";

		this._header = this._contentobj.firstChild;
		this._body = this._header.nextSibling;
		this._footer = this._body.nextSibling;

		this.data.provideApi(this, true);
		this.data.attachEvent("onStoreUpdated", dhtmlx.bind(this.render, this));
		//this.data.attachEvent("onStoreUpdated", dhtmlx.bind(this.refreshHeaderContent, this));
		this.data.attachEvent("onStoreLoad", dhtmlx.bind(this.refreshHeaderContent, this));
		this.data.attachEvent("onParse", dhtmlx.bind(this._call_onparse, this));


		dhtmlx.event(this._header, "click", this._on_header_click, this);
		
		this.$ready.push(this.render);

		this._columns = [];
		this._active_headers = {};
		this._filter_elements = {};
		this._header_height = this._footer_height = 0;

		dhx.callEvent("onDataTable", [this, config]);
	},
	empty:function(x,y){
		var dummy_config = [];
		for (var i = 0; i < x; i++)
			dummy_config[i] = { id:"col"+i };
		this.define("columns", dummy_config);

		var data = [];
		for (var i = 1; i <= y; i++){
			this.data.order[i-1]=i;
			this.data.pull[i]=({ id:i });
		}

		this.render();
	},
	_render_initial:function(){
		this._scrollSizeX = this._scrollSizeY = this._settings.scrollSize;

		dhtmlx.html.addStyle("#"+this._top_id +" .dhx_cell { height:"+this._settings.rowHeight+"px; line-height:"+(this._settings.rowHeight-4)+"px;}");
		dhtmlx.html.addStyle("#"+this._top_id +" .dhx_hcell { height:"+this._settings.headerRowHeight+"px; line-height:"+this._settings.headerRowHeight+"px;}");
		this._render_initial = function(){};
	},
	refresh:function(){
		this.render();
	},
	render:function(id, mode, details){
		this._render_initial();

		if (!this._columns.length){
			if (!this._settings.columns) return;
			this._define_structure();
		}

		if (this._content_width)
			this._check_rendered_cols(true, true);

		if (!id || mode!="update"){
			this._dtable_height = this._get_total_height();
			this._set_split_sizes_y();
		}
	},
	_define_structure:function(){
		if (this._settings.columns){
			this._columns = this._settings.columns;
			for (var i = 0; i < this._columns.length; i++)
				this._columns[i].width = this._columns[i].width||this._settings.columnWidth;
		}
		this.callEvent("onStructureLoad",[]);
		this._apply_headers();

	},
	_apply_headers:function(){
		this._rightSplit = this._columns.length-this._settings.rightSplit;
		this._dtable_width = 0;

		for (var i = 0; i < this._columns.length; i++){
			if (!this._columns[i].node){

				var temp = dhtmlx.html.create("DIV");
				temp.style.width = this._columns[i].width + "px";
				this._columns[i].node = temp;
			}
			if (i>=this._settings.leftSplit && i<this._rightSplit)
				this._dtable_width += this._columns[i].width;
			if (this._columns[i].template)
				this._columns[i].template = dhtmlx.Template.fromHTML(this._columns[i].template);
		}

		var marks = [];
		
		if (this._settings.rightSplit){
			var n = this._columns.length-this._settings.rightSplit;
			marks[n]  =" dhx_first";
			marks[n-1]=" dhx_last";
		}
		if (this._settings.leftSplit){
			var n = this._settings.leftSplit;
			marks[n]  =" dhx_first";
			marks[n-1]=" dhx_last";
		}
		marks[0]  = (marks[0]||"")+" dhx_first";
		var last_index = this._columns.length-1;
		marks[last_index] = (marks[last_index]||"")+" dhx_last";


		for (var i=0; i<this._columns.length; i++){
			var node = this._columns[i].node;
			node.setAttribute("column", i);
			node.className = "dhx_column "+(this._columns[i].css||"")+(marks[i]||'');
		}
		
		this._set_columns_positions();

		this._scrollLeft = 0;
		this._scrollTop = 0;

		this._create_scrolls();
		this._set_split_sizes_x();
		this._render_header_and_footer();
	},
	_set_columns_positions:function(){
		var left = 0;
		for (var i = 0; i < this._columns.length; i++){
			if (i == this._settings.leftSplit || i == this._rightSplit)
				left = 0;
			this._columns[i].node.style.left = left+"px";
			left += this._columns[i].width;
		}
	},
	_render_header_and_footer:function(){
		if (this._settings.header) {
			this._header_height = (this._settings.headerRowHeight+1)*this._normalize_headers("header");
			this._render_header();
		}
		if (this._settings.footer){
			this._footer_height = (this._settings.headerRowHeight+1)*this._normalize_headers("footer");
			this._render_footer();
		}		
	},
	_normalize_headers:function(collection){
		var rows = 0;
		
		for (var i=0; i<this._columns.length; i++){
			var data = this._columns[i][collection];
			if (!data || typeof data != "object" || !data.length){
				if (dhtmlx.isNotDefined(data)){
					if (collection == "header")
						data = this._columns[i].id;
					else
						data = null;
				}
				data = [data]; 
			}
			for (var j = 0; j < data.length; j++){
				if (typeof data[j] != "object")
					data[j] = { text:data[j] };
			}
			rows = Math.max(rows, data.length);
			this._columns[i][collection] = data;
		}

		for (var i=0; i<this._columns.length; i++){
			var data = this._columns[i][collection];
			if (data.length < rows)
				data[data.length-1].rowspan = rows - data.length + 1;
			for (var j = data.length; j < rows; j++)
				data[j]=null;
		}

		return rows;
	},
	showIndex:function(ind){
		var summ = 0;
		for (var i = 0; i < ind; i++)
			summ+=this._getHeightByIndex(i);

		if (!this._dtable_height){
			this._dtable_height = this._get_total_height();
			this._set_split_sizes_y();
		}
		
		this._scrollTop = summ;
		this._y_scroll.scrollTo(summ);
	},
	showItem:function(id){
		return this.showIndex(this.indexById(id));
	},
	refreshHeaderContent:function(){
		if (this._settings.header)
			this._refreshHeaderContent(this._header);
		if (this._settings.footer)
			this._refreshHeaderContent(this._footer);
	},
	_refreshHeaderContent:function(sec){
		if (this._has_active_headers){
			var alltd = sec.getElementsByTagName("TD");
			
			for (var i = 0; i < alltd.length; i++){
				if (alltd[i].getAttribute("active_id")){
					var obj = this._active_headers[alltd[i].getAttribute("active_id")];
					var node = alltd[i];
					this.headerContent[obj.content].refresh.call(this, node, obj);
				}
			}
		}
	},
	headerContent:[],
	_render_header:function(){
		this._render_header_section(this._header, "header");
	},
	_render_footer:function(){
		this._render_header_section(this._footer, "footer");
	},
	_create_scrolls:function(){
		if (this._settings.autoheight || this._settings.scrollY === false)
			this._scrollSizeY = 0;
		if (this._settings.autowidth || this._settings.scrollX === false)
			this._scrollSizeX = 0;

		if (!this.x_scroll){
			this._x_scroll = new jdapivot.ui.vscroll({
				container:this._footer.nextSibling,
				scrollWidth:this._dtable_width,
				scrollSize:this._scrollSizeX
			});
			this._x_scroll.attachEvent("onScroll", dhtmlx.bind(this._onscroll_x, this));
		}

		if (!this.y_scroll){
			this._y_scroll = new jdapivot.ui.vscroll({
				container:this._footer.nextSibling.nextSibling,
				scrollHeight:100,
				scroll:"y",
				scrollSize:this._scrollSizeY
			});
			this._y_scroll.mouseWheel(this._body);
			this._y_scroll.attachEvent("onScroll", dhtmlx.bind(this._onscroll_y, this));
		}
		this._create_scrolls = function(){};
	},
	posToName:function(pos){
		return [this.data.order[pos[0]], this._columns[pos[1]].id];
	},
	columnId:function(index){
		return this._columns[index].id;
	},
	columnIndex:function(id){
		for (var i = 0; i < this._columns.length; i++)
			if (this._columns[i].id == id) 
				return i;
		return -1;
	},
	_getNodeBox:function(rid, cid){
		var xs=0, xe=0, ye=0, ys=0;
		var i; var zone = 0;
		for (i = 0; i < this._columns.length; i++){
			if (this._rightSplit == i || this._settings.leftSplit == i){
				xs=0; zone++;
			}
			if (this._columns[i].id == cid) 
				break;
			xs+=this._columns[i].width;
		}
		xe+=this._columns[i].width;

		for (i = 0; i < this.data.order.length; i++){
			if (this.data.order[i] ==rid) 
				break;
			ys+=this._getHeightByIndex(i);
		}
		ye+=this._getHeightByIndex(i);
		return [xs,xe,ys-this._scrollTop,ye, this._body.childNodes[zone]];
	},
	locateCell:function(node){
		node = node.target||node.srcElement||node;
		while (node){
			if (node.getAttribute("view_id"))
				break;
			var cs = node.className;
			if (cs.indexOf("dhx_cell")!=-1)
				return this.posToName(this.locate(node));
			if (cs.indexOf("dhx_hcell")!=-1)
				return this.locate(node);
			node = node.parentNode;
		}
		return null;
	},
	locate:function(node){
		var cdiv = node.parentNode;
		
		var column = cdiv.getAttribute("column")*1;
		var row = 0;
		for (var i = 0; i < cdiv.childNodes.length; i++){
			if (cdiv.childNodes[i] == node) 
				row = i+this._columns[column]._yr0;
		}
		return [row, column];
	},
	_updateColsSizeSettings:function(){
		this._set_columns_positions();
		this._set_split_sizes_x();
		this._render_header_and_footer();
		this._check_rendered_cols(false, false);
	},
	setColumnWidth:function(col, width, skip_update){
		if (isNaN(width)) return;
		if (width<this._settings.minColumnWidth)
			width = this._settings.minColumnWidth;

		var old = this._columns[col].width;
		if (old !=width){
			if (col>=this._settings.leftSplit && col<=this._rightSplit)
				this._dtable_width += width-old;
			
			this._columns[col].width = width;
			if (this._columns[col].node)
				this._columns[col].node.style.width = width+"px";

			if(!skip_update)
				this._updateColsSizeSettings();
			return true;
		}
		return false;
	},
	_getHeightByIndex:function(index){
		var id = this.data.order[index];
		if (!id) return this._settings.rowHeight;
		return this.data.pull[id].$height || this._settings.rowHeight;
	},
	
	_get_total_height:function(){
		var pager  = this._settings.pager;
		var start = 0;
		var max = this.data.order.length;
		
		if (pager){
			start = pager.size * pager.page;
			max = Math.min(max, start + pager.size);
		}

		if (this._settings.fixedRowHeight)	
			return (max-start) * this._settings.rowHeight;
		else {
			var height = 0;
			for (var i=start; i<max; i++)
				height+=this._getHeightByIndex(i);
			return height;
		}
	},
	setRowHeight:function(rowId, height){
		if (isNaN(height)) return;
		if (height<this._settings.minColumnHeight)
			height = this._settings.minColumnHeight;

		var item = this.item(rowId);
		var old_height = item.$height||this._settings.rowHeight;

		if (old_height != height){
			item.$height = height;
			this.render();
		}
	},	
	_onscroll_y:function(value){
		this._body.childNodes[1].scrollTop = this._scrollTop = value;
		if (!this._settings.prerender)
			this._check_rendered_cols();
		else{
			var conts = this._body.childNodes;
			for (var i = 0; i < conts.length; i++){
				conts[i].scrollTop = value;
			}
		}
	},
	_onscroll_x:function(value){ 
		this._body.childNodes[1].scrollLeft = this._scrollLeft = value;
		if (this._settings.header)
			this._header.childNodes[1].scrollLeft = value;
		if (this._settings.footer)
			this._footer.childNodes[1].scrollLeft = value;
		if (this._settings.prerender===false)
			this._check_rendered_cols(this._minimize_dom_changes?false:true);
	},
	_get_x_range:function(full){
		if (full) return [0,this._columns.length];

		var t = this._scrollLeft;
		
		var xind = this._settings.leftSplit;
		while (t>0){
			t-=this._columns[xind].width;
			xind++;
		}
		var xend = xind;
		if (t) xind--;

		t+=this._center_width;
		while (t>0 && xend<this._rightSplit){
			t-=this._columns[xend].width;
			xend++;
		}

		return [xind, xend];
	},
	//returns info about y-scroll position
	_get_y_range:function(full){
		var t = this._scrollTop;
		var start = 0; 
		var end = this.dataCount();

		var pager = this._settings.pager;
		if (pager){
			var start = pager.page*pager.size;
			var end = Math.min(end, start+pager.size);
		}

		if (full) return [start, end];
		var xind = start;
		while (t>0){
			t-=this._getHeightByIndex(xind);
			xind++;
		}

		//how much of the first cell is scrolled out
		var xdef = xind>0?-(this._getHeightByIndex(xind-1)+t):0;
		var xend = xind;
		if (t) xind--;

		t+=this._content_height;
		
		while (t>0 && xend<end){
			t-=this._getHeightByIndex(xend);
			xend++;
		}

		return [xind, xend, xdef];
	},	
	_check_rendered_cols:function(x_scroll, force){
		if (!this._columns.length) return;

		if (force)
			this._clearColumnCache();

		if (dhx.debug_render)
			dhtmlx.log("Render: "+this.name+"@"+this._settings.id);

		var xr = this._get_x_range(this._settings.prerender);
		var yr = this._get_y_range(this._settings.prerender === true);

		if (x_scroll){
			for (var i=this._settings.leftSplit; i<xr[0]; i++)
				this._hideColumn(i, force);
			for (var i=xr[1]; i<this._rightSplit; i++)
				this._hideColumn(i, force);
		}
		
		for (var i=0; i<this._settings.leftSplit; i++)
			this._renderColumn(i,yr,force);
		for (var i=xr[0]; i<xr[1]; i++)
			this._renderColumn(i,yr,force);
		for (var i=this._rightSplit; i<this._columns.length; i++)
			this._renderColumn(i,yr,force);


		this._check_load_next(yr);
	},
	_check_load_next:function(yr){
		var paging = this._settings.pager;
		var fetch = this._settings.datafetch;
		
		var direction = (!this._last_valid_render_pos || yr[0] >= this._last_valid_render_pos);
		this._last_valid_render_pos = yr[0];

		if (this._data_request_flag){
			if (paging && (!fetch || fetch >= paging.size))
				if (this._check_rows([0,paging.size*paging.page], Math.max(fetch, paging.size), true)) 
					return this._data_request_flag = null;
					
			this._run_load_next(this._data_request_flag, direction);
			this._data_request_flag = null;
		} else {
			if (this._settings.loadahead)
				var check = this._check_rows(yr, this._settings.loadahead, direction);
		}
	},
	_check_rows:function(view, count, dir){
		var start = view[1];
		var end = start+count;
		if (!dir){
			start = view[0]-count;
			end = view[0];
		}

		if (start<0) start = 0;
		end = Math.min(end, this.data.order.length-1);

		var result = false;			
		for (var i=start; i<end; i++)
			if (!this.data.order[i]){
				if (!result)
					result = { start:i, count:(end-start) };
				else {
					result.last = i;
					result.count = (i-start);
				}
			}
		if (result){			
			this._run_load_next(result, dir);
			return true;
		}
	},
	_run_load_next:function(conf, direction){
		var count = Math.max(conf.count, (this._settings.datafetch||this._settings.loadahead||0));
		if (direction) //scroll-down
			this.loadNext(count, conf.start);	
		else //scroll-up
			this.loadNext(count, conf.last-count+1);
	},
	_hideColumn:function(index){
		var col = this._columns[index];
		dhtmlx.html.remove(col.node);
		col.attached = false;
	},
	_clearColumnCache:function(){
		for (var i = 0; i < this._columns.length; i++)
				this._columns[i]._yr0 = -1;
	},
	_getValue:function(item, config, i){
		var value;

		if (config.template)
			value = config.template(item, this.type, config, i);
		else
			value = item[config.id];

		if (value === dhx.undefined)
			value = "";

		if (config.format && value!=="")
			value = config.format(value);

		return value;
	},
	_renderColumn:function(index,yr,force){
		var col = this._columns[index];
		if (!col.attached){
			var split_column = index<this._settings.leftSplit ? 0 :( index >= this._rightSplit ? 2 : 1);
			this._body.childNodes[split_column].firstChild.appendChild(col.node);
			col.attached = true;
			col.split = split_column;
		}

		//if columns not aligned during scroll - set correct scroll top value for each column
		if (!this._settings.scrollAlignY && yr[2] != col._yr2)
			col.node.style.top = yr[2]+"px";

		if (!force && (col._yr0 == yr[0] && col._yr1 == yr[1])) return;

		var html="";
		var config = this._settings.columns[index];
		var select = config.$select;
		
		for (var i = yr[0]; i < yr[1]; i++){
			var item = this.data.item(this.data.order[i]);
			var value;
			if (item){
				var value = this._getValue(item, config, i);
				var css = "dhx_cell";

				//cell-selection
				if ((item.$select && (item.$select.$row || item.$select[config.id]))||select||value.$select) css+=this._select_css;

				if (item.$height)
					html+="<div class='"+css+"' style='height:"+item.$height+"px'>"+value+"</div>";
				else
					html+="<div class='"+css+"'>"+value+"</div>";
			} else {
				html+="<div class='dhx_cell'></div>";
				if (!this._data_request_flag)
					this._data_request_flag = {start:i, count:yr[1]-i};
				else
					this._data_request_flag.last = i;
			}
		}
		col.node.innerHTML = html;
		col._yr0=yr[0];
		col._yr1=yr[1];
	},
	_set_split_sizes_y:function(){
		if (!this._columns.length || isNaN(this._content_height*1)) return;
		if (dhx.debug_size) dhtmlx.log("  - "+this.name+"@"+this._settings.id+" Y sizing");

		var wanted_height = this._dtable_height+this._header_height+this._footer_height+(this._scrollSizeX?this._scrollSizeX:0);
		if (this._settings.autoheight && this.resize())
			return;

		this._y_scroll.sizeTo(this._content_height);
		this._y_scroll.define("scrollHeight", wanted_height);
		var height =  this._content_height-this._scrollSizeX-this._header_height-this._footer_height;
		for (var i = 0; i < 3; i++){
			this._body.childNodes[i].style.height = height+"px";
			if (this._settings.prerender)
				this._body.childNodes[i].firstChild.style.height = this._dtable_height+"px";
			else
				this._body.childNodes[i].firstChild.style.height = height+"px";
		}
	},
	_set_split_sizes_x:function(){
		if (!this._columns.length) return;
		if (dhx.debug_size) dhtmlx.log("  - "+this.name+"@"+this._settings.id+" X sizing");

		var index = 0; 
		this._left_width = 0;
		this._right_width = 0;
		this._center_width = 0;

		while (index<this._settings.leftSplit){
			this._left_width += this._columns[index].width;
			index++;
		}

		index = this._columns.length-1;
		
		while (index>=this._rightSplit){
			this._right_width += this._columns[index].width;
			index--;
		}

		if (!this._content_width) return; 

		if (this._settings.autowidth && this.resize())
			return;

		this._center_width = this._content_width - this._right_width - this._left_width - this._scrollSizeY;

		this._body.childNodes[1].firstChild.style.width = this._dtable_width+"px";

		this._body.childNodes[0].style.width = this._left_width+"px";
		this._body.childNodes[1].style.width = this._center_width+"px";
		this._body.childNodes[2].style.width = this._right_width+"px";
		this._header.childNodes[0].style.width = this._left_width+"px";
		this._header.childNodes[1].style.width = this._center_width+"px";
		this._header.childNodes[2].style.width = this._right_width+"px";
		this._footer.childNodes[0].style.width = this._left_width+"px";
		this._footer.childNodes[1].style.width = this._center_width+"px";
		this._footer.childNodes[2].style.width = this._right_width+"px";

		this._x_scroll.sizeTo(this._content_width-this._scrollSizeY);
		this._x_scroll.define("scrollWidth", this._dtable_width+this._left_width+this._right_width);
	},
	$getSize:function(){
		if (this._settings.autoheight && this._settings.columns)
			this._settings.height = Math.max(this._dtable_height+(this._scrollSizeX?this._scrollSizeX:0)-1, (this._settings.minheight||0))+this._header_height+this._footer_height;
		if (this._settings.autowidth && this._settings.columns)
			this._settings.width = Math.max(this._dtable_width+this._left_width+this._right_width+this._scrollSizeY,(this._settings.minwidth||0));

		return jdapivot.ui.view.prototype.$getSize.call(this);
	},
	$setSize:function(x,y){
		if (jdapivot.ui.view.prototype.$setSize.apply(this, arguments)){
			this.callEvent("onResize",[]);
			this._set_split_sizes_x();
			//this.render();
		}
	},
	_on_header_click:function(e){
		var cell = this.locateCell(e||event);
		if (!cell) return;
		var col = this._columns[cell[1]];
		if (!col.sort) return;

		var order = 'asc';
		if (col.id == this._last_sorted)
			order = this._last_order == "asc" ? "desc" : "asc";
		
		this._sort(col.id, order, col.sort);
	},
	markSorting:function(column, order){
		if (!this._sort_sign)
			this._sort_sign = dhtmlx.html.create("DIV");
		dhtmlx.html.remove(this._sort_sign);

		if (order){
			var cell = this._get_header_cell(this.columnIndex(column));
			this._sort_sign.className = "dhx_ss_sort_"+order;
			cell.style.position = "relative";
			cell.appendChild(this._sort_sign);
		}
	},
	_get_header_cell:function(column){
		var cells = this._header.getElementsByTagName("TD");
		for (var i = cells.length - 1; i >= 0; i--)
			if (cells[i].getAttribute("column") == column && !cells[i].getAttribute("active_id"))
				return cells[i].firstChild;
		return null;
	},
	_sort:function(col_id, direction, type){
		this._last_sorted = col_id;
		this._last_order = direction;
		this.markSorting(col_id, direction);
		if (typeof type == "function")
			this.data.sort(type, direction || "asc");
		else
			this.data.sort("#"+col_id+"#", direction || 'asc', type || "string");
	},

	//because we using non-standard rendering model, custom logic for mouse detection need to be used
	_mouseEvent:function(e,hash,name){
		e=e||event;
		var trg=e.target||e.srcElement;

		//define some vars, which will be used below
		var css_call = [];
		var css='';
		var id = null;
		var found = false;

		//loop through all parents
		while (trg && trg.parentNode){
			if (css = trg.className) {
				css = css.split(" ");
				css = css[0]||css[1];
				if (hash[css])
					css_call.push(hash[css]);
			}

			if (trg.parentNode.getAttribute){
				var column = trg.parentNode.getAttribute("column");
				if (column){
					found = true;
					var index = dhtmlx.html.index(trg) + this._columns[column]._yr0;
					id = { row:this.data.order[index], column:this._columns[column].id};

					//some custom css handlers was found
					if (css_call.length){
						for (var i = 0; i < css_call.length; i++) {
							var res = css_call[i].call(this,e,id,trg);
							if (res===false) return;
						}
					}
					
					//call inner handler
					this.callEvent("on"+name,[id,e,trg]);
					break;
				} 
			}
			
			trg=trg.parentNode;
		}		
		return found;	//returns true if item was located and event was triggered
	},
	



	showOverlay:function(message){
		if (!this._datatable_overlay){
			var t = dhtmlx.html.create("DIV", { "class":"dhx_datatable_overlay" }, "");
			this._body.appendChild(t);
			this._datatable_overlay = t;
		}
		this._datatable_overlay.innerHTML = message;
	},
	hideOverlay:function(){
		if (this._datatable_overlay){
			dhtmlx.html.remove(this._datatable_overlay);
			this._datatable_overlay = null;
		}
	},
	mapCells: function(startrow, startcol, numrows, numcols, callback) {
		if (startrow === null && this.data.order.length > 0) startrow = this.data.order[0];
		if (startcol === null) startcol = this.columnId(0);
		if (numrows === null) numrows = this.data.order.length;
		if (numcols === null) numcols = this._settings.columns.length;

		if (!this.exists(startrow)) return;
		startrow = this.indexById(startrow);
		startcol = this.columnIndex(startcol);
		if (startcol === null) return;

		for (var i = 0; i < numrows && (startrow + i) < this.data.order.length; i++) {
			var row_ind = startrow + i;
			var row_id = this.data.order[row_ind];
			var item = this.item(row_id);
			for (var j = 0; j < numcols && (startcol + j) < this._settings.columns.length; j++) {
				var col_ind = startcol + j;
				var col_id = this.columnId(col_ind);
				item[col_id] = callback(item[col_id], row_id, col_id, i, j);
			}
		}
	},

	_call_onparse: function(driver, data) {
		if (!this._settings.columns && driver.getConfig)
			this.define("columns", driver.getConfig(data));
	}
}, jdapivot.DataLoader, dhtmlx.MouseEvents, jdapivot.ui.view, dhtmlx.EventSystem, jdapivot.Settings);


/*DHX:Depend ui/datatable/datatable_filter.js*/
jdapivot.extend(jdapivot.ui.datatable,{
	headerContent:{
		"summColumn":{
			getValue:function(){},
			setValue: function(){},
			refresh:function(node,value,data){ 
				var result = 0;
				this.mapCells(null, value.columnId, null, 1, function(value){
					value = value*1;
					if (!isNaN(value))
						result+=value;
					return value;
				});
				node.innerHTML = result;
			},
			render:function(){ return ""; }
		},
		"textFilter":{
			getInput:function(node){ return node.firstChild.firstChild; },
			getValue:function(node){ return this.getInput(node).value;  },
			setValue:function(node, value){ this.getInput(node).value=value;  },
			refresh:function(node, value){ 
				var self = this.headerContent[value.content];

				node.component = this._settings.id;
				this.setFilter(node, value, self);

				node._comp_id = this._settings.id;
				if (value.value) self.setValue(node, value.value);
				node.onclick = dhtmlx.html.preventEvent;
				dhtmlx.event(node, "keydown", self._on_key_down);
			},
			render:function(column){  column.css = "dhx_ss_filter"; return "<input "+(column.placeholder?('placeholder="'+column.placeholder+'" '):"")+"type:'text'>"; },
			_on_key_down:function(e, node, value){
				var id = this._comp_id;
				if (this._filter_timer) window.clearTimeout(this._filter_timer);
				this._filter_timer=window.setTimeout(function(){
					jdapivot.ui.get(id).filterByAll();
				},500);
			}
		},
		"selectFilter":{
			getInput:function(node){ return node.firstChild.firstChild; },
			getValue:function(node){ return this.getInput(node).value;  },
			setValue:function(node, value){ this.getInput(node).value=value; },
			refresh:function(node, value){ 
				var self = this.headerContent[value.content];

				node.component = this._settings.id;
				this.setFilter(node, value, self);

				if (value.options)
					var data = value.options;
				else
					var data = value.options = this.collectValues(value.columnId);

				var html = "";
				for (var i = 0; i < data.length; i++)
					html += "<option value='"+data[i]+"'>"+data[i]+"</option>";
				node.firstChild.firstChild.innerHTML = html;

				node._comp_id = this._settings.id;
				if (value.value) self.setValue(node, value.value);
				node.onclick = dhtmlx.html.preventEvent;
				dhtmlx.event(node, "change", self._on_change);
			},
			render:function(column){  column.css = "dhx_ss_filter"; return "<select></select>"; },
			_on_change:function(e, node, value){
				jdapivot.ui.get(this._comp_id).filterByAll();
			}
		}
	},
	filterByAll:function(){
		this.data.silent(function(){
			this.filter();
			var first = false;
			for (var key in this._filter_elements){
				dhtmlx.assert(key, "empty column id for column with filtering");

				var record = this._filter_elements[key];
				var inputvalue = record[2].getValue(record[0]);
				//saving last filter value, for usage in getState
				record.value = inputvalue;
				var compare = record[1].compare;

				if (inputvalue === "") continue;
				if (compare)
					this.filter(function(obj, value){
						var test = obj[key];
						return compare(test, value, obj);
					}, inputvalue, first);
				else
					this.filter("#"+key+"#", inputvalue, first);
				first = true;
			}
		}, this);
		this.refresh();
	},
	getFilter:function(columnId){
		var filter = this._filter_elements[columnId];
		dhtmlx.assert(filter, "Filter doesn't exists for column in question");

		return filter[2].getInput(filter[0]);
	},
	setFilter:function(node, config, obj){
		this._filter_elements[config.columnId] = [node, config, obj];
	},
	collectValues:function(id){
		var values = [ "" ];
		var checks = { "" : true };
		this.data.each(function(obj){
			var value = obj[id];
			if (!checks[value]){
				checks[value] = true;
				values.push(value);
			}
		});
		return values;
	}
}, true);
/*DHX:Depend ui/datatable/datatable_selection.js*/
jdapivot.extend(jdapivot.ui.datatable, {
	select_setter:function(value){
		if (!this.select){
			jdapivot.extend(this, this._selections._commonselect);
			jdapivot.extend(this, this._selections[value], true);
		}
		return value;
	},
	_selections:{
		//shared methods for all selection models
		_commonselect:{
			_select_css:' dhx_cell_select',
			_init:function(){
				this._reinit_selection();
				this.on_click.dhx_cell = dhtmlx.bind(this._click_before_select, this);
			},
			_reinit_selection:function(){
				//list of selected areas
				this._selected_areas=[];
				//key-value hash of selected areas, for fast search
				this._selected_pull={};
				//used to track selected cell objects
				this._selected_rows = [];
			},
			getSelected:function(asArray){
				//if multiple selections was created - return array
				//in case of single selection, return value or array, when asArray parameter provided
				if (this._selected_areas.length > 1 || asArray)
					return this._selected_areas;
				else
					return this._selected_areas[0];
			},
			getSelectedId:function(asArray){
				var data = this.getSelected(true);
				if (data.length > 1 || asArray){
					var res = [];
					for (var i = 0; i < data.length; i++)
						res[i]=data[i].id;
					return res;
				} else return ((data[0]||{}).id||null); //return null if there is no selection
			},
			_select:function(data, preserve){
				var key = this._select_key(data);
				//don't allow selection on unnamed columns
				if (key === null) return;
				data.id = key;

				if (!this.callEvent("onBeforeSelect",[data, preserve])) return false;

				//ignore area, if it was already selected
				if (this._selected_pull[key] && preserve) return;

				if (!preserve)
					this._clear_selection();

				this._selected_areas.push(data);
				this._selected_pull[key] = true;

				this.callEvent("onAfterSelect",[data, preserve]);

				
				this._finalize_select(this._post_select(data));
				return true;
			},
			_clear_selection:function(){
				//if (!this.callEvent("onBeforeClearSelection",[])) return;
				if (!this._selected_areas.length) return false; 

				for (var i=0; i<this._selected_rows.length; i++){
					var item = this.item(this._selected_rows[i]);
					if (item)
						item.$select = null;
				}
				var cols = this._settings.columns;
				if (cols)
					for (var i = 0; i < cols.length; i++) {
						cols[i].$select = null;
					}
					
				this._reinit_selection();
				return true;
				//this.callEvent("onAfterClearSelection",[]);
			},
			clearSelection:function(){
				if (this._clear_selection()){
					this.callEvent("onSelectChange",[]);
					this.render();
				}
			},
			_unselect:function(data){
				var key = this._select_key(data);
				if (!key)
					return this._clear_selection();

				//ignore area, if it was already selected
				if (!this._selected_pull[key]) return;

				if (!this.callEvent("onBeforeUnSelect",[data])) return false;

				for (var i = 0; i < this._selected_areas.length; i++){
					if (this._selected_areas[i].id == key){
						this._selected_areas.splice(i,1);
						break;
					}
				}
				
				delete this._selected_pull[key];

				this.callEvent("onAfterUnselect",[data]);
				this._finalize_select(0, this._post_unselect(data));
			},
			_add_item_select:function(id){
				var item = this.item(id);
				return item.$select = (item.$select || { $count : 0 });
			},
			_finalize_select:function(id){
				if (id)
					this._selected_rows.push(id);
				if (!this._silent_selection){
					this.render();
					this.callEvent("onSelectChange",[]);	
				}
			},
			_click_before_select:function(e, id){
				var preserve = e.ctrlKey;
				var range = e.shiftKey;

				if (!this._settings.multiselect)
					preserve = range = false;

				if (range && this._selected_areas.length){
					var last = this._selected_areas[this._selected_areas.length-1];
					this._selectRange(id, last);
				} else {
					if (preserve && this._selected_pull[this._select_key(id)])
						this._unselect(id);
					else
						this._select(id, preserve);
				}
			},
			_mapSelection:function(callback, column, row){
				var cols = this._settings.columns;
				//selected columns only
				if (column){
					var temp = [];
					for (var i=0; i<cols.length; i++)
						if (cols[i].$select)
							temp.push(cols[i]);
					cols = temp;
				}

				var rows = this.data.order;
				var row_ind = 0;

				for (var i=0; i<rows.length; i++){
					var item = this.item(rows[i]);
					if (item.$select || column){
						var col_ind = 0;
						for (var j = 0; j < cols.length; j++){
							var id = cols[j].id;
							if (row || column || item.$select[id]){
								if (callback)
									item[id] = callback(item[id], rows[i], id, row_ind, col_ind);
								else
									return {row:rows[i], column:id};
								col_ind++;
							}
						}
						//use separate row counter, to count only selected rows
						row_ind++;
					}
				}
			}
		}, 

		row : {
			_select_css:' dhx_row_select',
			_select_key:function(data){ return data.row; },
			select:function(row_id, preserve){
				this._select({ row:row_id }, preserve);
			},
			_post_select:function(data){
				this._add_item_select(data.row).$row = true;
				return data.row;
			},
			unselect:function(row_id){
				this._unselect({row : row_id});
			},
			_post_unselect:function(data){
				var item = this.item(data.row);
				if (item) {
					item.$select = null;
					return data.row;
				}
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, false, true);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.row, b.row);
			},
			selectRange:function(row_id, end_row_id){
				var row_start_ind = this.indexById(row_id);
				var row_end_ind = this.indexById(end_row_id);

				if (row_start_ind>row_end_ind){
					var temp = row_start_ind;
					row_start_ind = row_end_ind;
					row_end_ind = temp;
				}
				
				this._silent_selection = true;
				for (var i=row_start_ind; i<=row_end_ind; i++)
					this.select(this.idByIndex(i),true);
				this._silent_selection = false;
				this._finalize_select();
			}
		},

		cell:{
			_select_key:function(data){
				if (!data.column) return null;
			 	return data.row+"_"+data.column; 
			},
			select:function(row_id, column_id, preserve){
				this._select({row:row_id, column:column_id,section:_pns.Constants.dataCellsSection}, preserve);
			},
			_post_select:function(data){
					var sel = this._add_item_select(data.row);
					sel.$count++;
					sel[data.column]=true;
					return data.row;
			},
			unselect:function(row_id, column_id){
				this._unselect({row:row_id, column:column_id});
			},
			_post_unselect:function(data){
				var sel = this._add_item_select(data.row);
					sel.$count-- ;
					sel[data.column] = false;
					if (sel.$count<=0)
						this.item(data.row).$select = null;
					return data.row;
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, false, false);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.row, a.column, b.row, b.column);
			},

			selectRange:function(row_id, column_id, end_row_id, end_column_id){
				var row_start_ind = this.indexById(row_id);
				var row_end_ind = this.indexById(end_row_id);

				var col_start_ind = this.columnIndex(column_id);
				var col_end_ind = this.columnIndex(end_column_id);

				if (row_start_ind>row_end_ind){
					var temp = row_start_ind;
					row_start_ind = row_end_ind;
					row_end_ind = temp;
				}
				
				if (col_start_ind>col_end_ind){
					var temp = col_start_ind;
					col_start_ind = col_end_ind;
					col_end_ind = temp;
				}

				this._silent_selection = true;
				for (var i=row_start_ind; i<=row_end_ind; i++)
					for (var j=col_start_ind; j<=col_end_ind; j++)
						this.select(this.idByIndex(i),this.columnId(j),true);
				this._silent_selection = false;
				this._finalize_select();
			}
		},

		column:{
			_select_css:' dhx_column_select',
			_select_key:function(data){ return data.column; },
			//returns box-like area, with ordered selection cells
			select:function(column_id, preserve){
				this._select({ column:column_id }, preserve);
			},
			_post_select:function(data){
				this._settings.columns[this.columnIndex(data.column)].$select = true;
				if (!this._silent_selection)
					this._render_header_and_footer();
			},
			unselect:function(column_id){
				this._unselect({column : column_id});
			},
			_post_unselect:function(data){
				this._settings.columns[this.columnIndex(data.column)].$select = null;
				this._render_header_and_footer();
			},
			mapSelection:function(callback){
				return this._mapSelection(callback, true, false);
			},
			_selectRange:function(a,b){
				return this.selectRange(a.column, b.column);
			},
			selectRange:function(column_id, end_column_id){
				var column_start_ind = this.columnIndex(column_id);
				var column_end_ind = this.columnIndex(end_column_id);

				if (column_start_ind>column_end_ind){
					var temp = column_start_ind;
					column_start_ind = column_end_ind;
					column_end_ind = temp;
				}
				
				this._silent_selection = true;
				for (var i=column_start_ind; i<=column_end_ind; i++)
					this.select(this.columnId(i),true);
				this._silent_selection = false;

				this._render_header_and_footer();
				this._finalize_select();
			}
		}
	}
});


/*DHX:Depend ui/datatable/datatable_blockselect.js*/
jdapivot.extend(jdapivot.ui.datatable, {		
	blockselect_setter:function(value){
		if (value && this._block_sel_flag){
			dhtmlx.event(this._viewobj, "mousemove", this._bs_move, this);
			dhtmlx.event(this._viewobj, "mousedown", this._bs_down, this);
			dhtmlx.event(document.body, "mouseup", this._bs_up, this);
			this._block_sel_flag = this._bs_ready = this._bs_progress = false;	
		}
		return value;
	},
	_block_sel_flag:true,
	_childOf:function(e, tag){
		var src = e.target||e.srcElement;
		while (src){
			if (src == tag)
				return true;
			src = src.parentNode;
		}
		return false;
	},
	_bs_down:function(e){
		e = e||event;
		if (this._childOf(e, this._body)){
			this._bs_position = dhtmlx.html.offset(this._body);
			this._bs_ready = [e.pageX - this._bs_position.x, e.pageY - this._bs_position.y];
		}
	},
	_bs_up:function(){
		if (this._block_panel){
			var start = this._locate_cell_xy.apply(this, this._bs_ready);
			var end = this._locate_cell_xy.apply(this, this._bs_progress);
			this._selectRange(start, end);
			this._block_panel = dhtmlx.html.remove(this._block_panel);
		}
		this._bs_ready = this._bs_progress = false;	
	},
	_bs_start:function(){
		this.clearSelection();
		this._block_panel = dhtmlx.html.create("div", {"class":"dhx_block_selection"},"");
		this._body.appendChild(this._block_panel);
	},
	_bs_move:function(e){
		if (this._bs_ready !== false){
			if (this._bs_progress === false)
				this._bs_start(e);

			this._bs_progress = [e.pageX - this._bs_position.x, e.pageY - this._bs_position.y];
			this._setBlockPosition(this._bs_ready[0], this._bs_ready[1], this._bs_progress[0], this._bs_progress[1]);
		}
	},
	_setBlockPosition:function(x1,y1,x2,y2){
		var style = this._block_panel.style;
		
		var startx = Math.min(x1,x2);
		var endx = Math.max(x1,x2);

		var starty = Math.min(y1,y2);
		var endy = Math.max(y1,y2);

		style.left = startx+"px";
		style.top = starty+"px";

		style.width = (endx-startx)+"px";
		style.height = (endy-starty)+"px";
	},
	_locate_cell_xy:function(x,y){
		if (this._right_width && x>this._left_width + this._center_width)
			x+= this._x_scroll.getSize()-this._center_width-this._left_width-this._right_width; 
		else if (!this._left_width || x>this._left_width)
			x+= this._x_scroll.getScroll();

			
		y+= this._y_scroll.getScroll();

		var row = null;
		var column = null;

		if (x<0) x=0;
		if (y<0) y=0;

		var cols = this._settings.columns;
		var rows = this.data.order;

		var summ = 0; 
		for (var i=0; i<cols.length; i++){
			summ+=cols[i].width;
			if (summ>=x){
				column = cols[i].id;
				break;
			}
		}
		if (!column)
			column = cols[cols.length-1].id;

		if (this._settings.fixedRowHeight){
			row = rows[Math.floor(y/this._settings.rowHeight)];
		} else for (var i=0; i<rows.length; i++){
			summ+=this._getHeightByIndex(i);
			if (summ>=y){
				row = rows[i];
				break;
			}
		}
		if (!row || row>=rows.length)
			row = rows[rows.length-1];

		return {row:row, column:column};
	}
});
/*DHX:Depend ui/datatable/datatable_resize.js*/
jdapivot.extend(jdapivot.ui.datatable, {

	resizeRow_setter:function(value){
		this._settings.scrollAlignY = false;
		this._settings.fixedRowHeight = false;
		return this.resizeColumn_setter(value);
	},
	resizeColumn_setter:function(value){
		if (value && this._rs_init_flag){
			dhtmlx.event(this._viewobj, "mousemove", this._rs_move, this);
			dhtmlx.event(this._viewobj, "mousedown", this._rs_down, this);
			dhtmlx.event(this._viewobj, "mouseup", this._rs_up, this);
			this._rs_init_flag = false;
		}
		return value;
	},

	_rs_init_flag:true,

	_rs_down:function(e){
		if (!this._rs_ready) return;
		e = e||event;
		this._rs_process = [e.pageX, e.pageY,this._rs_ready[2]];
	},
	_rs_up:function(){
		this._rs_process = false;	
	},
	_rs_start:function(e){
		e = e||event;

		var dir  = this._rs_ready[0];
		var node = this._rs_process[2];
		var obj  = this.locate(node);

		if (dir == "x"){
			var start = dhtmlx.html.offset(node).x+this._rs_ready[1] - dhtmlx.html.offset(this._body).x;
			var eventPos = this._rs_process[0];
			if (!this._rs_ready[1]) obj[1]-=(node.parentNode.colSpan||1);
		} else {
			var start = dhtmlx.html.offset(node).y+this._rs_ready[1] - dhtmlx.html.offset(this._body).y;
			var eventPos = this._rs_process[1];
			if (!this._rs_ready[1]) obj[0]--;
		}
		if (obj[1]>=0 && obj[0]>=0){
			this._rs_progress = [dir, obj, start];
			var resize = new jdapivot.ui.resizearea({
				container:this._body,
				dir:dir,
				eventPos:eventPos,
				start:start
			});
			resize.attachEvent("onResizeEnd", dhtmlx.bind(this._rs_end, this));
		}
		this._rs_down = this._rs_ready = false;
	},
	_rs_end:function(result){
		if (this._rs_progress){
			var dir = this._rs_progress[0];
			var obj = this._rs_progress[1];
			var newsize = result-this._rs_progress[2];
			if (dir == "x"){
				var oldwidth = this._columns[obj[1]].width;
				this.setColumnWidth(obj[1], oldwidth + newsize);
			}
			else {
				var rid = this.idByIndex(obj[0]);
				var oldheight = this.item(rid).$height||this._settings.rowHeight;
				this.setRowHeight(rid, oldheight + newsize);
			}
			this._rs_progress = false;
		}
	},
	_rs_move:function(e){
		if (this._rs_ready && this._rs_process)
			return this._rs_start(e);

		e = e||event;
		var node = e.target||e.srcElement;
		if (node.tagName == "TD" || node.tagName == "TABLE") return;
		var element_class = node.className||"";
		var in_body = element_class.indexOf("dhx_cell")!=-1;
		var in_header = element_class.indexOf("dhx_hcell")!=-1;
		this._rs_ready = false;

		if (in_body || in_header){
			var dx = node.offsetWidth;
			var dy = node.offsetHeight;
			if (in_body && this._settings.resizeRow){
				if (e.offsetY<3){
					this._rs_ready = ["y", 0, node];
				} else if (dy-e.offsetY<4){
					this._rs_ready = ["y", dy, node];
				}
			}
			if (this._settings.resizeColumn){
				if (e.offsetX<3){
					this._rs_ready = ["x", 0, node];
				} else if (dx-e.offsetX<4){
					this._rs_ready = ["x", dx, node];
				}
			}
			//this._viewobj.style.cursor=this._rs_ready?"pointer":"default";
		}
	}
});


jdapivot.protoUI({
	name:"resizearea",
	defaults:{
		dir:"x"
	},
	_init:function(config){
		var dir = config.dir||"x";
		var node = dhtmlx.toNode(config.container);
		this._key_property = (dir == "x"?"left":"top");

		this._viewobj = dhtmlx.html.create("DIV",{
			"class"	: "dhx_resize_area"
		});
		this._dragobj = dhtmlx.html.create("DIV",{
			"class"	: "dhx_resize_handle_"+dir
		});
		this._originobj = dhtmlx.html.create("DIV",{
			"class"	: "dhx_resize_origin_"+dir
		});

		this._moveev =	dhtmlx.event(node, "mousemove", this._onmove, this);
		this._upev =	dhtmlx.event(document.body, "mouseup", this._onup, this);
		
		this._dragobj.style[this._key_property] = this._originobj.style[this._key_property] = config.start+"px";

		node.appendChild(this._viewobj);
		node.appendChild(this._dragobj);
		node.appendChild(this._originobj);
	},
	_onup:function(){
		this.callEvent("onResizeEnd", [this._last_result]);

		dhtmlx.eventRemove(this._moveev);
		dhtmlx.eventRemove(this._upev);

		dhtmlx.html.remove(this._viewobj);
		dhtmlx.html.remove(this._dragobj);
		dhtmlx.html.remove(this._originobj);

		this._settings.initEvent = this._viewobj = this._dragobj = this._originobj = null;
	},
	_onmove:function(e){
		var left = e.pageX;
		var top = e.pageY;
		
		this._last_result = (this._settings.dir == "x" ? left : top)+this._settings.start-this._settings.eventPos;
		
		this._dragobj.style[this._key_property] = this._last_result+"px";
		this.callEvent("onResize", [this._last_result]);
	}
}, dhtmlx.EventSystem, jdapivot.Settings);
/*DHX:Depend ui/datatable/datatable_math.js*/
jdapivot.extend(jdapivot.ui.datatable,{

	/*math_setter:function(value){
		if (value)
			this._math_init();
		return value;
	},*/

	_math_pref: '$',

	/*_math_init: function() {
		this.attachEvent("onAfterEditStop", this._parse_cell_math);
		this.attachEvent("onXLE", this._parse_math);
	},*/

	/*_parse_cell_math: function(pos, _inner_call) {
		var item = this.item(pos[1]);

		// if it's outer call we should use inputted value otherwise to take formula, not calculated value
		var col = pos[2];
		if (_inner_call === true)
			var value = item[this._math_pref + col] || item[col];
		else {
			var value = item[col];
			this._math_recalc = {};
		}

		if (value.length > 0 && value.substr(0, 1) === '=') {
			// calculate math value
			if ((typeof(item[this._math_pref + col]) === 'undefined') || (_inner_call !== true))
				item[this._math_pref + col] = item[col];
			item[col] = this.calculate(value, pos[1], col);
			this.update(item);
		} else {
			// just a string
			if (typeof(item[this._math_pref + col]) !== 'undefined')
				delete item[this._math_pref + col];
			// remove triggers if they were setted earlier
			this._remove_old_triggers(pos[1], col);
		}
		// recalculate depending cells
		if (typeof(item.depends) !== 'undefined' && typeof(item.depends[col]) !== 'undefined') {
			for (var i in item.depends[col]) {
				var name = item.depends[col][i][0] + '__' + item.depends[col][i][1];
				if (typeof(this._math_recalc[name]) === 'undefined') {
					this._math_recalc[name] = true;
					this._parse_cell_math([null, item.depends[col][i][0], item.depends[col][i][1]], true);
				}
			}
		}
	},*/

	_set_original_value: function(row, col) {
		var item = this.item(row);
		if (typeof(item[this._math_pref + col]) !== 'undefined')
			item[col] = item[this._math_pref + col];
	},

	/*_parse_math: function() {
		this._exprs_by_columns();

		for (var i = 0; i < this.dataCount(); i++) {
			var row = this.idByIndex(i);
			for (var j = 0; j < this._columns.length; j++){
				var col = this.columnId(j);
				this._parse_cell_math([null, row, col]);
			}
		}
	},*/

	_exprs_by_columns: function() {
		for (var i = 0; i < this._columns.length; i++){
			if (this._columns[i].math) {
				var col = this.columnId(i);
				var math = '=' + this._columns[i].math;
				math = math.replace(/\$r/g, '#$r#');
				math = math.replace(/\$c/g, '#$c#');
				for (var j = 0; j < this.dataCount(); j++) {
					var id = this.idByIndex(j);
					var item = this.item(id);
					item[col] = this._parse_relative_expr(math, id, col);
				}
			}
		}
	},

	_parse_relative_expr: function(expr, row, col) {
		return (dhtmlx.Template.fromHTML(expr))({ '$r': row, '$c': col });
	},

	/*_get_calc_value: function(row, col) {
		if (this.exists(row) && typeof(this.item(row)[col]) !== 'undefined')
			var item = this.item(row);
		else
			return '#out_of_range';
		var value = item[this._math_pref + col] || item[col];
		value = value.toString();
		if (value.substring(0, 1) !== '=')
			// it's a string
			return value;
		else {
			// TODO: check if value shouldn't be recalculated
			// and return value calculated earlier

			// calculate math expr value right now
			if (typeof(item[this._math_pref + col]) === 'undefined')
				item[this._math_pref + col] = item[col];
			item[col] = this.calculate(value, row, col, true);
			return item[col];
		}
	},*/

	/*calculate: function(value, row, col, _inner_call) {
		// add coord in math trace to detect self-references
		if (_inner_call === true) {
			if (this._in_math_trace(row, col))
				return '#selfreference';
		} else
			this._start_math_trace();
		this._to_math_trace(row, col);

		var item = this.item(row);
		value = value.substring(1);

		// get operations list
		var operations = this._get_operations(value);
		var triggers = this._get_refs(value);

		if (operations) {
			value = this._replace_refs(value, triggers);
			value = this._parse_args(value, operations);
		} else {
			value = this._replace_refs(value, triggers, true);
			var triggers = [];
		}

		var exc = this._math_exception(value);
		if (exc !== false)
			return exc;

		// remove from coord from trace when calculations were finished - it's important!
		this._from_math_trace(row, col);

		// process triggers to know which cells should be recalculated when one was changed
		this._remove_old_triggers(row, col);
		for (var i = 0; i < triggers.length; i++) {
			this._add_trigger([row, col], triggers[i]);
		}
		var exc = this._math_exception(value);
		if (exc !== false)
			return exc;

		// there aren't any operations here. returns number or value of another cell
		if (operations === null) return value;

		// process mathematical expression and getting final result
		value = this._compute(value);
		var exc = this._math_exception(value);
		if (exc !== false)
			return exc;
		return value;
	},*/

	_get_operations: function(value) {
		// gettings operations list (+-*/)
		var splitter = /(\+|\-|\*|\/)/g;
		var operations = value.match(splitter);
		return operations;
	},

	/*! gets list of referencies in formula
	 **/
	_get_refs: function(value) {
		var reg = /\[([^\]]+),([^\]]+)\]/g;
		var cells = value.match(reg);
		if (cells === null) cells = [];

		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var tmp = cell;
			cell = cell.substr(1, cell.length - 2);
			cell = cell.split(',');
			cell[0] = this._trim(cell[0]);
			cell[1] = this._trim(cell[1]);
			if (cell[0].substr(0, 1) === ':')
				cell[0] = this.idByIndex(cell[0].substr(1));
			if (cell[1].substr(0, 1) === ':')
				cell[1] = this.columnId(cell[1].substr(1));
			cell[2] = tmp;
			cells[i] = cell;
		}

		return cells;
	},

	// replace given list of references by their values
	_replace_refs: function(value, cells, clean) {
		var dell = "(", delr = ")";
		if (clean) dell = delr = "";
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			var cell_value = this._get_calc_value(cell[0], cell[1]);
			value = value.replace(cell[2], dell + cell_value + delr);
		}
		return value;
	},

	_parse_args: function(value, operations) {
		var args = [];
		for (var i = 0; i < operations.length; i++) {
			var op = operations[i];
			var temp = this._split_by(value, op);
			args.push(temp[0]);
			value = temp[1];
		}
		args.push(value);

		var reg = /^(-?\d|\.|\(|\))+$/;
		for (var i = 0; i < args.length; i++) {
			var arg = this._trim(args[i]);
			if (reg.test(arg) === false)
				return '#error';
			args[i] = arg;
		}

		var expr = "";
		for (var i = 0; i < args.length - 1; i++) {
			expr += args[i] + operations[i];
		}
		expr += args[args.length - 1];
		return expr;
	},

	/*_compute: function(expr) {
		try {
			dhx.temp_value = '';
			expr = 'dhx.temp_value = ' + expr;
			eval(expr);
		} catch(ex) {
			dhx.temp_value = '#error';
		}
		var result = dhx.temp_value;
		dhx.temp_value = null;
		return result.toString();
	},*/

	_split_by: function(value, splitter) {
		var pos = value.indexOf(splitter);
		var before = value.substr(0, pos);
		var after = value.substr(pos + 1);
		return [before, after];
	},

	_trim: function(value) {
		value = value.replace(/^ */g, '');
		value = value.replace(/ *$/g, '');
		return value;
	},

	get_value: function(value) {
		var pos = value.substr(1, value.length - 2);
		pos = pos.split(',');
		pos[0] = this.trim(pos[0]);
		pos[1] = this.trim(pos[1]);
		if (pos[0].substr(0, 1) === ':')
			pos[0] = this.idByIndex(pos[0].substr(1));
		if (pos[1].substr(0, 1) === ':')
			pos[1] = this.columnId(pos[1].substr(1));
		value = this.item(pos[0])[pos[1]];
		return value;
	},

	_start_math_trace: function() {
		this._math_trace = [];
	},
	_to_math_trace: function(row, col) {
		this._math_trace[row + '__' + col] = true;
	},
	_from_math_trace: function(row, col) {
		if (typeof(this._math_trace[row + '__' + col]) !== 'undefined')
			delete this._math_trace[row + '__' + col];
	},
	_in_math_trace: function(row, col) {
		if (typeof(this._math_trace[row + '__' + col]) !== 'undefined')
			return true;
		else
			return false;
	},

	_add_trigger: function(depends, from) {
		var item = this.item(from[0]);
		if (typeof(item.depends) === 'undefined')
			item.depends = {};
		if (typeof(item.depends[from[1]]) === 'undefined')
			item.depends[from[1]] = {};
		item.depends[from[1]][depends[0] + '__' + depends[1]] = depends;

		item = this.item(depends[0]);
		if (typeof(item.triggers) === 'undefined')
			item.triggers = {};
		if (typeof(item.triggers[depends[1]]) === 'undefined')
			item.triggers[depends[1]] = {};
		item.triggers[depends[1]][from[0] + '__' + from[1]] = from;
	},

	_remove_old_triggers: function(row, col) {
		var item = this.item(row, col);
		if (typeof(item.triggers) === 'undefined') return;
		for (var i in item.triggers[col]) {
			var depend = item.triggers[col][i];
			delete this.item(depend[0]).depends[depend[1]][row + '__' + col];
		}
	},

	// check if exception syntax exists and returns exception text or false
	_math_exception: function(value) {
		var reg = /#\w+/;
		var match = value.match(reg);
		if (match !== null && match.length > 0)
			return match[0];
		return false;
	}

});
/*DHX:Depend ui/datatable/datatable_paging.js*/
/*DHX:Depend ui/pager.js*/
/*
	UI:paging control
*/

/*DHX:Depend core/template.js*/
/*DHX:Depend ui/pager.css*/


jdapivot.protoUI({
	defaults:{
		size:10,	//items on page
		page: 0,	//current page
		group:5,
		template:"{common.pages()}"
	},

	name:"pager",
	on_click:{
		//on paging button click
		"dhx_pager_item":function(e,id){
			this.select(id);
		}
	},
	$getSize:function(){
		return [1,0,0,25];
	},
	_init:function(config){
		this.data = this._settings;
		this._dataobj = this._viewobj;
	},
	select:function(id){
		if (this.$master && this.$master.name == "pager")
			return this.$master.select(id);
		//id - id of button, number for page buttons
		switch(id){
			case "next":
				id = this._settings.page+1;
				break;
			case "prev":
				id = this._settings.page-1;
				break;
			case "first":
				id = 0;
				break;
			case "last":
				id = this._settings.limit-1;
				break;
			default:
				//use incoming id
				break;
		}
		if (id<0) id=0;
		if (id>=this.data.limit) id=this.data.limit-1;
		//if (this.callEvent("onBeforePageChange",[this._settings.page,id])){
		this.data.page = id*1; //must be int
		if (this.refresh())
			this.$master.refresh();
		
		//	this.callEvent("onAfterPageChange",[id]);	
		//}
	},
	_id:"dhx_p_id",
	template_setter:dhx.Template,
	type:{
		template:function(a,b){ return a.template(a,b); },
		//list of page numbers
		pages:function(obj){
			var html="";
			//skip rendering if paging is not fully initialized
			if (obj.page == -1) return "";
			//current page taken as center of view, calculate bounds of group
			obj.min = obj.page-Math.round((obj.group-1)/2);
			obj.max = obj.min + obj.group-1;
			if (obj.min<0){
				obj.max+=obj.min*(-1);
				obj.min=0;
			}
			if (obj.max>=obj.limit){
				obj.min -= Math.min(obj.min,obj.max-obj.limit+1);
				obj.max = obj.limit-1;
			}
			//generate HTML code of buttons
			for (var i=(obj.min||0); i<=obj.max; i++)
				html+=this.button({id:i, index:(i+1), selected:(i == obj.page ?"_selected":"")});
			return html;
		},
		page:function(obj){
			return obj.page+1;
		},
		//go-to-first page button
		first:function(){
			return this.button({ id:"first", index:jdapivot.locale.pager.first, selected:""});
		},
		//go-to-last page button
		last:function(){
			return this.button({ id:"last", index:jdapivot.locale.pager.last, selected:""});
		},
		//go-to-prev page button
		prev:function(){
			return this.button({ id:"prev", index:jdapivot.locale.pager.prev, selected:""});
		},
		//go-to-next page button
		next:function(){
			return this.button({ id:"next", index:jdapivot.locale.pager.next, selected:""});
		},
		button:dhtmlx.Template.fromHTML("<div dhx_p_id='{obj.id}' class='dhx_pager_item{obj.selected}'>{obj.index}</div>")
	},
	clone:function(pager){
		if (!pager.$view){
			pager.view = "pager";
			pager = jdapivot.ui(pager);
		}

		this._clone = pager;
		pager.$master = this;
	},
	refresh:function(){
		var s = this._settings;
		if (!s.count) return;

		//max page number
		s.limit = Math.ceil(s.count/s.size);
		s.page = Math.min(s.limit-1, s.page);
		
		var id = s.page;
		if (id>=0 && (id!=s.old_page) || (s.limit != s.old_limit)){ 
			//refresh self only if current page or total limit was changed
			this.render();
			if (this._clone){
				this._clone._settings.count = s.count;
				this._clone._settings.page = s.page;
				this._clone.refresh();
			}
			s.old_limit = s.limit;	//save for onchange check in next iteration
			s.old_page = s.page;
			return true;
		}
	}
}, dhtmlx.MouseEvents, dhtmlx.SingleRender, jdapivot.ui.view);

jdapivot.locale.pager = {
	first: " &lt;&lt; ",
	last: " &gt;&gt; ",
	next: " &gt; ",
	prev: " &lt; "
}


jdapivot.extend(jdapivot.ui.datatable,{
	pager_setter:function(pager){
		if (!pager.$view){
			pager.view = "pager";
			pager = jdapivot.ui(pager);
		}
		this._pager = pager;
		pager.$master = this;
		this.data.attachEvent("onStoreUpdated", function(){
			pager._settings.count = this.dataCount();
			pager.refresh();
		});
		return pager._settings;
	},
	setPage:function(value){
		if (this._pager)
			this._pager.select(value);
	},
	getPage:function(){
		return this._pager._settings.page;
	},
	getPager:function(){
		return this._pager;
	}
});
/*DHX:Depend ui/datatable/datatable_clipboard.js*/
/*DHX:Depend core/clipbuffer.js*/
jdapivot.clipbuffer = {

	_area: null,
	_blur_id: null,
	_last_active: null,
	_ctrl: new Date(),
	_timeout: 250,

	/*! create textarea or returns existing
	 **/
	_init: function() {
		// returns existing textarea
		if (this._area !== null)
			return this._area;

		// creates new textarea
		this._area = document.createElement('textarea');
		this._area.style.width = '1px';
		this._area.style.height = '1px';
		this._area.style.left = '3px';
		this._area.style.top = '3px';
		this._area.style.position = 'fixed';
		// TODO: set invisible styles

		this._area.style.opacity = '0';
		this._area.style.mozOpacity = '0';
		this._area.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity=0)";

		document.body.appendChild(this._area);

		var self = this;
		dhtmlx.event(this._area, 'keyup', function(e) {
			var key = e.keyCode;
			var ctrl = e.ctrlKey ? true : false;
			if (key === 86 && (new Date() - self._ctrl < self._timeout || ctrl === true))
				self._paste();
			// we have to save info that ctrl was pressed
			if (key === 17)
				self._ctrl = new Date();
			self.focus();
		});
		return this._area;
	},
	/*! set text into buffer
	 **/
	set: function(text, last_active) {
		this._init();
		this._area.value = text;
		this._last_active = last_active;
		this.focus();
	},
	/*! select text in textarea
	 **/
	focus: function() {
		this._area.focus();
		this._area.select();
	},
	/*! process ctrl+V pressing
	 **/
	_paste: function() {
		var text = this._area.value;
		this.focus();
		if (this._last_active)
			this._last_active.callEvent("onPaste", [text]);
	},
	autofocus_setter: function(value) {
		this._init();
		if (value === true) {
			// enable autofocus
			if (this._blur_id === null) {
				var self = this;
				this._blur_id = dhtmlx.event(this._area, 'blur', function(e) {
					dhtmlx.delay(function() {
						self.focus();
					});
				});
			}
			this.focus();
		} else {
			// disable autofocus
			if (this._blur_id !== null)
				dhtmlx.eventRemove(this._blur_id);
			this._blur_id = null;
		}
	}

};
jdapivot.extend(jdapivot.clipbuffer, dhtmlx.EventSystem);
jdapivot.extend(jdapivot.clipbuffer, jdapivot.Settings);
/*DHX:Depend core/csv.js*/
jdapivot.csv = {
	escape:true,
	delimeter:{
		rows: "\n",
		cols: "\t"
	},
	parse:function(text, sep){
		sep = sep||this.delimeter;
		if (!this.escape)
			return this._split_clip_data(text, sep);

		var lines = text.split(sep.rows);

		var i = 0;
		while (i < lines.length - 1) {
			if (this._substr_count(lines[i], '"') % 2 === 1) {
				lines[i] += sep.rows + lines[i + 1];
				delete lines[i + 1];
				i++;
			}
			i++;
		}
		var csv = [];
		for (i = 0; i < lines.length; i++) {
			if (typeof(lines[i]) !== 'undefined') {
				var line = lines[i].split(sep.cols);
				for (var j = 0; j < line.length; j++) {
					if (line[j].indexOf('"') === 0)
						line[j] = line[j].substr(1, line[j].length - 2);
					line[j] = line[j].replace('""', '"');
				}
				csv.push(line);
			}
		}
		return csv;
	},
	_split_clip_data: function(text) {
		var lines = text.split(sep.rows);
		for (var i = 0; i < lines.length; i++) {
			lines[i] = lines[i].split(sep.cols);
		}
		return lines;
	},
	/*! counts how many occurances substring in string
	 **/
	_substr_count: function(string, substring) {
		var arr = string.split(substring);
		return arr.length - 1;
	},
	stringify:function(data, sep){
		sep = sep||this.delimeter;

		if (!this.escape){
			for (var i = 0; i < data.length; i++)
				data[i] = data[i].join(sep.cols);
			return data.join(sep.rows);
		}

		var reg = /\n|\"|;|,/;
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < data[i].length; j++) {
				if (reg.test(data[i][j])) {
					data[i][j] = data[i][j].replace(/"/g, '""');
					data[i][j] = '"' + data[i][j] + '"';
				}
			}
			data[i] = data[i].join(sep.cols);
		}
		data = data.join(sep.rows);
		return data;
	}
};

jdapivot.extend(jdapivot.ui.datatable, {
	clipboard_setter:function(value){
		if (value === true || value === 1)
			value = "block";
		
		jdapivot.clipbuffer._init();
		this.attachEvent("onSelectChange",this._sel_to_clip);
		this.attachEvent("onPaste", this._clip_to_sel);

		return value;
	},
	
	_sel_to_clip: function() {
		var data = this._get_sel_text();
		jdapivot.clipbuffer.set(data, this);
	},

	_get_sel_text: function() {
		var sep = this._settings.delimiter;
		var data = [];
		this.mapSelection(function(value, row, col, row_ind, col_ind) {
			if (!data[row_ind]) data[row_ind] = [];
			data[row_ind].push(value);
			return value;
		});

		return jdapivot.csv.stringify(data, this._settings.delimiter);
	},


	_clip_to_sel: function(text) {
		var data = jdapivot.csv.parse(text, this._settings.delimiter);
		if (this._settings.clipboard == "selection")
			this._paste_sel(data);
		else if (this._settings.clipboard == "repeat")
			this._paste_repeat(data);
		else if (this._settings.clipboard == "block")
			this._paste_block(data);
	},

	
	_paste_block: function(data) {
		// detecting the first selected cell
		var row_id = null, col_id = null;
		var id = this._get_selection;

		var leftTop = this.mapSelection(null);
		if (!leftTop) return;

		// filling cells with data
		this.mapCells(leftTop.row, leftTop.column, data.length, null, function(value, row, col, row_ind, col_ind) {
			if (data[row_ind] && data[row_ind].length>col_ind) {
				return data[row_ind][col_ind];
			}
			return value;
		});
		this.render();
	},

	_paste_sel: function(data) {
		this.mapSelection(function(value, row, col, row_ind, col_ind) {
			if (data[row_ind] && data[row_ind].length>col_ind)
				return data[row_ind][col_ind];
			return value;
		});
		this.render();
	},


	_paste_repeat: function(data) {
		this.mapSelection(function(value, row, col, row_ind, col_ind) {
			row = data[row_ind%data.length];
			value = row[col_ind%row.length];
			return value;
		});
		this.render();
	}
});
/*DHX:Depend ui/datatable/datatable_export.js*/
/*
	Export for jdapivot.ui.datatable
*/

(function(){

function _get_export_xml(grid){
	var xml = '<rows profile="color">';
	xml += _get_export_abstract('header', 'head', grid);
	if (grid.config.footer)
		xml += _get_export_abstract('footer', 'foot', grid);
	xml += _get_export_data(grid);
	xml += '</rows>';
	return xml;
}

function _get_export_abstract(section, tag, grid){
	var xml = "<" + tag + ">";
	var max = 1;
	var cols = grid._settings.columns;

	// detects the bigger value of header/footer rows
	for (var i = 0; i < cols.length; i++)
		if (cols[i][section].length > max)
			max = cols[i][section].length;
	var cols = grid._settings.columns;
	for (var i = 0; i < max; i++) {
		xml += '<columns>';
		for (var j = 0; j < cols.length; j++) {
			xml += '<column';
			xml += cols[j].width ? ' width="' + cols[j].width + '"' : '';
			xml += (cols[j][section][i] && cols[j][section][i].colspan) ? ' colspan="' + cols[j][section][i].colspan + '"' : '';
			xml += (cols[j][section][i] && cols[j][section][i].rowspan) ? ' rowspan="' + cols[j][section][i].rowspan + '"' : '';
			xml += ' align="left"';
			xml += '><![CDATA[';
			xml += cols[j][section][i] ? cols[j][section][i].text : '';
			xml += ']]></column>';
		}
		xml += '</columns>';
	}
	xml += "</" + tag + ">";
	return xml;
}


function _get_export_scheme(grid){
	var scheme = [];
	var cols = grid._settings.columns;
	for (var i = 0; i < cols.length; i++) {
		scheme[i] = cols[i].id;
	}
	return scheme;
}
	
function _get_export_data(grid){
	var xml = '';
	
	var scheme = _get_export_scheme(grid);
	
	var data = grid.data;
	for (var i = 0; i < data.order.length; i++) {
		var id = data.order[i];
		var item = data.pull[id];
		xml += '<row id="' + id + '">';
		for (var j = 0; j < scheme.length; j++)
			xml += '<cell><![CDATA[' + (item[scheme[j]] !== 'undefined' ? item[scheme[j]] : '') + ']]></cell>';
		xml += '</row>';
	}

	return xml;
}

})();

/*DHX:Depend ui/datatable/datatable_state.js*/
/*DHX:Depend core/storage.js*/
if(!window.dhx)
	dhx = {};

if(!jdapivot.storage)
	jdapivot.storage = {};

jdapivot.storage.local = {
	put:function(name, data){
		if(name && window.JSON && window.localStorage){
			window.localStorage.setItem(name, window.JSON.stringify(data));
		}
	},
	get:function(name){
		if(name && window.JSON && window.localStorage){
			var json = window.localStorage.getItem(name);
			if(!json)
				return null;
			return dhtmlx.DataDriver.json.toObject(json);
		}else
			return null;
	},
	remove:function(name){
		if(name && window.JSON && window.localStorage){
			window.localStorage.remove(name);
		}
	}
};

jdapivot.storage.session = {
	put:function(name, data){
		if(name && window.JSON && window.sessionStorage){
			window.sessionStorage.setItem(name, window.JSON.stringify(data));
		}
	},
	get:function(name){
		if(name && window.JSON && window.sessionStorage){
			var json = window.sessionStorage.getItem(name);
			if(!json)
				return null;
			return dhtmlx.DataDriver.json.toObject(json);
		}else
			return null;
	},
	remove:function(name){
		if(name && window.JSON && window.sessionStorage){
			window.sessionStorage.remove(name);
		}
	}
};

jdapivot.storage.cookie = {
	put:function(name, data, domain, expires ){
		if(name && window.JSON){
			document.cookie = name + "=" + window.JSON.stringify(data) +
			(( expires && (expires instanceof Date)) ? ";expires=" + expires.toUTCString() : "" ) +
			(( domain ) ? ";domain=" + domain : "" );
		}
	},
	delete_cookie:function( name, domain ){
		if(this._get_cookie(name)) document.cookie = name + "=" +
		(( domain ) ? ";domain=" + domain : "") +
		";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	},
	_get_cookie:function(check_name){
		// first we'll split this cookie up into name/value pairs
		// note: document.cookie only returns name=value, not the other components
		var a_all_cookies = document.cookie.split( ';' );
		var a_temp_cookie = '';
		var cookie_name = '';
		var cookie_value = '';
		var b_cookie_found = false; // set boolean t/f default f

		for (var i = 0; i < a_all_cookies.length; i++ ){
			// now we'll split apart each name=value pair
			a_temp_cookie = a_all_cookies[i].split( '=' );

			// and trim left/right whitespace while we're at it
			cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

			// if the extracted name matches passed check_name
			if (cookie_name == check_name ){
				b_cookie_found = true;
				// we need to handle case where cookie has no value but exists (no = sign, that is):
				if ( a_temp_cookie.length > 1 ){
					cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
				}
				// note that in cases where cookie is initialized but no value, null is returned
				return cookie_value;
			}
			a_temp_cookie = null;
			cookie_name = '';
		}
		if ( !b_cookie_found ){
			return null;
		}
		return null;
	},
	get:function(name){
		if(name && window.JSON){
			var json = this._get_cookie(name);
			if(!json)
				return null;
			return dhtmlx.DataDriver.json.toObject(json);
		}else
			return null;
	},
	remove:function(name, domain){
		if(name){
			this.delete_cookie(name, domain);
		}
	}
};

jdapivot.extend(jdapivot.ui.datatable, {
	getState:function(){
		var cols_n = this.config.columns.length;
		var columns = this.config.columns;
		var settings = {};
		settings.ids = [];
		settings.size = [];
		for(var i = 0; i < cols_n; i++){
			settings.ids.push(columns[i].id);
			settings.size.push(columns[i].width);
		}

		if(this._last_sorted){
			settings.sort={
				id:this._last_sorted,
				dir:this._last_order
			};
		}
		if (this._filter_elements) {
			var filter = {};
			for (var key in this._filter_elements) {
				var f = this._filter_elements[key];
				filter[key] = f[2].getValue(f[0]);
			}
			settings.filter=filter;
		}
		return settings;
	},
	setState:function(obj){
		var columns = this.config.columns;
		if(!obj || !obj.ids || !obj.size)
			return;
		
		if (obj.filter){
			for (var key in obj.filter) {
				var value = obj.filter[key];
				if (!this._filter_elements[key]) continue;
				var f = this._filter_elements[key];
				f[2].setValue(f[0], value);
				this._active_headers[f[1].contentId].value = value;
			}
			this.filterByAll();
		}

		var cols_n = obj.ids.length;
		for(var i = 0; i < cols_n; i++){
			if(columns[i] && columns[i].width != obj.size[i])
				this.setColumnWidth( i, obj.size[i], true);
		}
		this._updateColsSizeSettings();
		if(obj.sort){
			this._sort(obj.sort.id, obj.sort.dir, columns[this.columnIndex(obj.sort.id)].sort);

		}
	}
});
/*DHX:Depend ui/datatable/datatable_jquery.js*/
if (window.jQuery){

(function( $ ){
	var methods =  {
	};

	$.fn.datatable = function(config) {
		if (typeof(config) === 'string') {
			if (methods[config] ) {
				return methods[config].apply(this, []);
			}else {
				$.error('Method ' +  config + ' does not exist on jQuery.datatable');
			}
		} else {
			jdapivot.ui.themeroller();
			var grids = [];
			this.each(function() {
				var grid=false;
				var id = false;
				if (this.firstChild && this.firstChild.getAttribute && (id = this.firstChild.getAttribute("view_id")))
					grid = jdapivot.ui.get(id);

				if (!grid){
					var copy = jdapivot.fullCopy(config||{ autoheight:true, autowidth:true });
					copy.view = "datatable";

					if (this.tagName.toLowerCase() === 'table') {
						var div = dhtmlx.html.create("div",{},"");
						this.parentNode.insertBefore(div, this);
						copy.container = div;
						grid = jdapivot.ui(copy);
						grid.parse(this, "htmltable");
					} else {
						copy.container = this;
						grid = jdapivot.ui(copy);
					}
				}
				grids.push(grid);
			});
			
			if (grids.length === 1) return grids[0];
			return grids;
		}
	};


var themeroller = {
	fill: false,
	_done: false,
	_border: {
		// border styles
		"borderLeftWidth": null,
		"borderLeftStyle": null,
		"borderLeftColor": null
	},
	_bg: {
		// bg styles
		"backgroundColor": null,
		"backgroundImage": null,
		"backgroundPosition": null,
		"backgroundRepeat": null
	},
	_font: {
		// font styles
		"color": null,
		"fontFamily": null,
		"fontSize": null,
		"fontWeight": null,
		"fontStyle": null
	},

	make_style: function(force) {
		// jquery isn't included or style is already created
		if ((!force) && (this._done || !this._is_jquery_style())) {
			this._done = true;
			return false;
		}
		this.fill = false;

		var sep = "\n\n";
		var css = this._get_main() + sep;
		css += this._get_header() + sep;
		css += this._get_selection() + sep;

		this._css_to_page(css);
		this._done = true;
		return true;
	},

	// checks if there is stylesheet with jquery name
	_is_jquery_style: function() {
		var els = document.getElementsByTagName("link");
		for (var i = 0; i < els.length; i++) {
			var name = els[i].getAttribute("href");
			var disabled = els[i].getAttribute("disabled");
			if (name && name.indexOf("jquery") !== -1 && !disabled)
				return true;
		}
		return false;
	},


	_get_main: function() {
		var rules = [];
		var el_content = this._append_tmp(["ui-widget", "ui-widget-content"]);
		var css_content = this._get_styles(el_content, this._multiextend(this._bg, this._border, this._font));
		var el_default = this._append_tmp(["ui-state-default"]);
		var css_default = this._get_styles(el_default, {
			"backgroundColor": null
		});
		var el_active = this._append_tmp(["ui-state-active"]);
		var css_active = this._get_styles(el_active, {
			"background-color": null
		});

		// datatable background color
		rules.push(this._make_css(".dhx_view.dhx_dtable", {
			"background-color": css_content["background-color"]
		}));


		// even rows background
		// if selection and bg colors are similar then we have to fill all cells with one color
		if (this.fill || css_content["background-color"] === css_active["background-color"] || css_default["background-color"] === css_active["background-color"]) {
			this.fill = true;
			rules.push(this._make_css(".dhx_column>div:nth-child(even)", {
				"background-color": css_content["background-color"]
			}));
		} else
			rules.push(this._make_css(".dhx_column>div:nth-child(even)", css_default));

		// deletes bg styles and applies just border and font
		delete css_content["background-color"];
		delete css_content["background-image"];
		var border = this._replace_border(css_content);
		css_content["border-right"] = css_content["border-bottom"] = border;

		// datatable main border
		rules.push(this._make_css(".dhx_view", {
			"border": border
		}));
		rules.push(this._make_css(".dhx_column>div", css_content));

		this._remove_tmp(el_content);
		this._remove_tmp(el_default);
		this._remove_tmp(el_active);
		return rules.join("\n\n");
	},

	// header/footer styles
	_get_header: function() {
		var rules = [];
		var el_header = this._append_tmp(["ui-widget", "ui-widget-header"]);
		var css_header = this._get_styles(el_header, this._multiextend(this._bg, this._border, this._font));
		var border = this._replace_border(css_header);

		rules.push(this._make_css(".dhx_ss_header TR, .dhx_ss_footer TR", css_header));
		rules.push(this._make_css(".dhx_sel_hcell", {
			"background-color": css_header["background-color"]
		}));
		
		css_header["background-color"] = "transparent";
		css_header["background-image"] = "none";
		rules.push(this._make_css(".dhx_ss_header TD, .dhx_ss_footer TD", css_header));

		rules.push(this._make_css(".dhx_ss_header td", {
			"border-right": border,
			"border-bottom": border
		}));
		rules.push(this._make_css(".dhx_ss_footer td", {
			"border-right": border,
			"border-top": border
		}));
		rules.push(this._make_css(".dhx_ss_right .dhx_column.dhx_first>div, .dhx_hs_right td.dhx_first", {
			"border-left": border
		}));
		rules.push(this._make_css(".dhx_ss_left .dhx_column.dhx_last>div", {
			"border-right": border
		}));
		this._remove_tmp(el_header);
		return rules.join("\n\n");
	},

	// selection styles
	_get_selection: function() {
		var rules = [];
		var el_active;
		// if cells color is the same for even and odd (fill mode) we have to use another selection color
		if (this.fill)
			el_active = this._append_tmp(["ui-state-default"]);
		else
			el_active = this._append_tmp(["ui-widget", "ui-state-active"]);

		var css_active = this._get_styles(el_active, this._multiextend(this._bg, this._border));
		var border_color = css_active["borderLeftColor"];
		var border = this._replace_border(css_active);
		rules.push(this._make_css(".dhx_column>div.dhx_cell_select, .dhx_column>div.dhx_column_select, .dhx_column>div.dhx_row_select", css_active));

		rules.push(this._make_css(".dhx_column>div.dhx_cell_select", {
			border: border
		}));

		rules.push(this._make_css(".dhx_column>div.dhx_row_select", {
			"border-bottom": border,
			"border-top": border
		}));
		rules.push(this._make_css(".dhx_column>div.dhx_column_select", {
			"border-right": border,
			"border-left": border
		}));
		rules.push(this._make_css(".dhx_block_selection", {
			"border-color": border_color
		}));

		this._remove_tmp(el_active);
		return rules.join("\n\n");
	},


	/*! gets styles of element
	 *	@param el
	 *		html element
	 *	@param hash
	 *		hash of css-styles
	 **/
	_get_styles: function(el, hash) {
		if (typeof(hash["backgroundPosition"]) !== 'undefined')
			hash["backgroundPositionX"] = hash["backgroundPositionY"] = null;

		for (var i in hash)
			hash[i] = this._get_style(el, i);

		hash = this._get_css_names(hash);
		return hash;
	},
	
	/*! make css text by selector name and hash of css props
	 *	@param rule
	 *		css selector
	 *	@param css
	 *		hash of css props
	 *	@return
	 *		css text
	 **/
	_make_css: function(rule, css) {
		var text = rule + " {\n";
		for (var i in css)
			text += "\t" + i + ":" + css[i] + ";\n";
		text += "}";
		return text;
	},
	/*! append a list of html elements with according classNames
	 *	each next element is a child of previous one
	 *	@param els
	 *		list of css-classes or one class name
	 *	@return
	 *		last inserted element handler
	 **/
	_append_tmp: function(els) {
		if (typeof(els) === "string")
			els = [els];

		var el = document.body;
		for (var i = 0; i < els.length; i++) {
			var temp = document.createElement("div");
			temp.className = els[i];
			el.appendChild(temp);
			el = temp;
		}
		return temp;
	},
	/*! remove the whole branch of elements from body
	 **/
	_remove_tmp: function(el) {
		var parent = el.parentNode;
		while (parent !== document.body) {
			el = el.parentNode;
			parent = parent = el.parentNode;
		}
		document.body.removeChild(el);
	},
	/*! process css names after getting style
	 **/
	_get_css_names: function(hash) {
		if (typeof(hash["backgroundPosition"]) !== 'undefined' && hash["backgroundPosition"] === "") {
			hash["backgroundPosition"] = hash["backgroundPositionX"] + " " + hash["backgroundPositionY"];
			delete hash["backgroundPositionX"];
			delete hash["backgroundPositionY"];
		}

		var replace = {
			"backgroundColor": "background-color",
			"backgroundImage": "background-image",
			"backgroundRepeat": "background-repeat",
			"backgroundPosition": "background-position",
			"fontFamily": "font-family",
	//		"fontSize": "font-size",
			"fontWeight": "font-weight",
			"fontStyle": "font-style"
		};
		for (var i in replace) {
			if (hash[i]) {
				hash[replace[i]] = hash[i];
				delete hash[i];
			}
		}
		return hash;
	},
	_replace_border: function(css) {
		var border = css["borderLeftWidth"]+ " " + css["borderLeftStyle"] + " " + css["borderLeftColor"];
		delete css["borderLeftWidth"];
		delete css["borderLeftStyle"];
		delete css["borderLeftColor"];
		return border;
	},
	/*! gets css style of element
	 **/
	_get_style: function(node, style){
		return (window.getComputedStyle?(window.getComputedStyle(node, null)[style]):(node.currentStyle?node.currentStyle[style]:null))||"";
	},
	/*! combine a lot of objects
	 **/
	_multiextend: function() {
		var els = arguments;
		var result = {};
		for (var i = 0; i < els.length; i++) {
			jdapivot.extend(result, els[i]);
		}
		return result;
	},
	/*! create stylesheet element and place css-text there
	 **/
	_css_to_page: function(css) {
		this.clear();

		var st = document.createElement("style");
		st.setAttribute("type", "text/css");
		if(st.styleSheet)
			st.styleSheet.cssText = css;
		else {
			css = document.createTextNode(css);
			st.appendChild(css);
		}
		document.body.appendChild(st);
		this._st = st;
	},

	clear: function() {
		if (this._st) this._st.parentNode.removeChild(this._st);
		this._st = null;
	}
};

jdapivot.ui.themeroller = function(mode){
	if (mode === false)
	 	themeroller.clear();
	 else
	 	themeroller.make_style(mode);
};

})(jQuery);

}
/*DHX:Depend ui/datatable/datatable_touch.js*/
/*DHX:Depend core/touch.js*/
/*DHX:Depend core/touch.css*/

/*DHX:Depend core/dhx.js*/

(function(){
var t = jdapivot.Touch = {
	config:{
		longTouchDelay:1000,
		scrollDelay:150,
		gravity:500,
		deltaStep:30,
		speed:"0ms",
		finish:1500,
		ellastic:true
	},
	limit:function(value){
		t._limited = value !== false;	
	},
	disable:function(){
		t._disabled = true;
	},
	enable:function(){
		t._disabled = false;
	},
	_init:function(){
		t._init = function(){};

		if (dhtmlx.env.touch){
			dhtmlx.event(document.body,"touchstart",	t._touchstart);
			dhtmlx.event(document.body,"touchmove", 	t._touchmove);
			dhtmlx.event(document.body,"touchend", 		t._touchend);
		}
		else {
			t._get_context = t._get_context_m;
			dhtmlx.event(document.body,"mousedown",		t._touchstart);
			dhtmlx.event(document.body,"mousemove",		t._touchmove);
			dhtmlx.event(document.body,"mouseup",			t._touchend);
			document.body.style.overflowX = document.body.style.overflowY = "hidden";
		}
		dhtmlx.event(document.body,"dragstart",function(e){
			return dhtmlx.html.preventEvent(e);
		});
		dhtmlx.event(document.body,"touchstart",function(e){
			if (t._disabled || t._limited) return;
			//fast click mode for iOS
			//To have working form elements Android must not block event - so there are no fast clicks for Android
			//Selects still don't work with fast clicks
			if (dhtmlx.env.isSafari) {
				var tag = e.srcElement.tagName.toLowerCase();
				if (tag == "input" || tag == "textarea" || tag == "select" || tag=="label")
					return true;

				t._fire_fast_event = true;
				return dhtmlx.html.preventEvent(e);
			}
		});

		t._clear_artefacts();
		t._scroll = [null, null];
	},
	_clear_artefacts:function(){
		t._start_context = t._current_context = t._prev_context = null;
		t._scroll_mode = t._scroll_node = t._scroll_stat = null;
		//dhtmlx.html.remove(t._scroll);
		//t._scroll = [null, null];
		t._delta = 	{ _x_moment:0, _y_moment:0, _time:0 };

		if (t._css_button_remove){
			dhtmlx.html.removeCss(t._css_button_remove,"dhx_touch");
			t._css_button_remove = null;
		}
		
		window.clearTimeout(t._long_touch_timer);
		t._was_not_moved = true;
		t._axis_x = true;
		t._axis_y = true;
		if (!t._active_transion)
			t._scroll_end();
	},
	_touchend:function(e){ 
		if (t._start_context){
			if (!t._scroll_mode){
				if (t._axis_y && !t._axis_x){
					t._translate_event("onSwipeX");
				} else if (t._axis_x && !t._axis_y){
					t._translate_event("onSwipeY");
				} else {
					if (dhtmlx.env.isSafari && t._fire_fast_event){ //need to test for mobile ff and blackbery 
						t._fire_fast_event = false;
						var target = t._start_context.target;
	
						//dark iOS magic, without delay it can skip repainting
						dhtmlx.delay(function(){
							var click_event = document.createEvent('MouseEvents');
							click_event.initEvent('click', true, true);
							target.dispatchEvent(click_event);							
						});
						
					}					
				}
			} else {

				
				var temp = t._get_matrix(t._scroll_node);
				var x = temp.e;
				var y = temp.f;
				var finish = t.config.finish;
				
				var	delta = t._get_delta(e, true);
				
				if (delta._time){ 
					var nx = x + t.config.gravity * delta._x_moment/delta._time;
					var ny = y + t.config.gravity * delta._y_moment/delta._time;
					
					var cnx = t._scroll[0]?t._correct_minmax( nx, false, false, t._scroll_stat.dx, t._scroll_stat.px):x;
					var cny = t._scroll[1]?t._correct_minmax( ny, false, false , t._scroll_stat.dy, t._scroll_stat.py):y;
					

					var size = Math.max(Math.abs(cnx-x),Math.abs(cny-y));
					if (size < 150) 
						finish = finish*size/150;
					
					if (cnx != x || cny != y)
						finish = Math.round(finish * Math.max((cnx-x)/(nx-x),(cny-y)/(ny-y)));
					
					var result = { e:cnx, f:cny };

					//sending event to the owner of the scroll only
					var view = jdapivot.ui.get(t._scroll_node);
					if (view && view.callEvent){
						if (!view.callEvent("onAfterScroll",[result]))
							result = {e:x,f:y};
					}
						
						
					//finish = Math.max(100,(t._fast_correction?100:finish));
					finish = Math.max(100,finish);

						
					if (x != result.e || y!=result.f){
						t._set_matrix(t._scroll_node, result.e, result.f, finish+"ms");
						if (t._scroll_master)
							t._scroll_master._sync_scroll(result.e, result.f, finish+"ms");
						t._set_scroll(result.e,result.f,finish+"ms");
					} else {
						t._scroll_end();
					}
				} else 
					t._scroll_end();
			}
		
			t._translate_event("onTouchEnd");
			t._clear_artefacts();
		}
	},
	_touchmove:function(e){
		if (!t._start_context) return;
		var	delta = t._get_delta(e);
		t._translate_event("onTouchMove");

		if (t._scroll_mode){
			t._set_scroll_pos(delta);
		} else {
			t._axis_x = t._axis_check(delta._x, "x", t._axis_x);
			t._axis_y = t._axis_check(delta._y, "y", t._axis_y);
			if (t._scroll_mode){
				var view = t._get_event_view("onBeforeScroll");
				if (view){
					var data = {};
					view.callEvent("onBeforeScroll",[data]);
					if (data.update){
						t.config.speed = data.speed;
						t.config.scale = data.scale;
					}
				}
				t._init_scroller(delta); //apply scrolling
			}
		}

		return dhtmlx.html.preventEvent(e);
	},
	_set_scroll_pos:function(){
		if (!t._scroll_node) return;
		var temp = t._get_matrix(t._scroll_node);
		var be = temp.e, bf = temp.f;
		var prev = t._prev_context || t._start_context;
		
		if (t._scroll[0])
			temp.e = t._correct_minmax( temp.e - prev.x + t._current_context.x , t.config.ellastic, temp.e, t._scroll_stat.dx, t._scroll_stat.px);
		if (t._scroll[1])
			temp.f = t._correct_minmax( temp.f - prev.y + t._current_context.y , t.config.ellastic, temp.f, t._scroll_stat.dy, t._scroll_stat.py);

		t._set_matrix(t._scroll_node, temp.e, temp.f, "0ms");
		if (t._scroll_master)
			t._scroll_master._sync_scroll(temp.e, temp.f, "0ms");
		t._set_scroll(temp.e, temp.f, "0ms");
	},
	_set_scroll:function(dx, dy, speed){
		
		var edx = t._scroll_stat.px/t._scroll_stat.dx * -dx;
		var edy = t._scroll_stat.py/t._scroll_stat.dy * -dy;
		if (t._scroll[0])
			t._set_matrix(t._scroll[0], edx, 0 ,speed);
		if (t._scroll[1])
			t._set_matrix(t._scroll[1], 0, edy ,speed);
	},
	_set_matrix:function(node, xv, yv, speed){
		t._active_transion = true;
		if (node){
			var trans = t.config.translate || dhtmlx.env.translate;
        	node.style[dhtmlx.env.transformPrefix+"Transform"] = trans+"("+Math.round(xv)+"px, "+Math.round(yv)+"px"+((trans=="translate3d")?", 0":"")+")";
			node.style[dhtmlx.env.transformPrefix+"TransitionDuration"] = speed;
		}
	},
	_get_matrix:function(node){
		var matrix = window.getComputedStyle(node)[dhtmlx.env.transformPrefix+'Transform'];
		var tmatrix;

		if (matrix == "none")
			tmatrix = {e:0, f:0};
		else {
            if(window.WebKitCSSMatrix)
                tmatrix = new WebKitCSSMatrix(matrix);
			else {
	            // matrix(1, 0, 0, 1, 0, 0) --> 1, 0, 0, 1, 0, 0
	            var _tmatrix = matrix.replace(/(matrix\()(.*)(\))/gi, "$2");
	            // 1, 0, 0, 1, 0, 0 --> 1,0,0,1,0,0
	            _tmatrix = _tmatrix.replace(/\s/gi, "");
	            _tmatrix = _tmatrix.split(',');

	            var tmatrix = {};
	            var tkey = ['a', 'b', 'c', 'd', 'e', 'f'];
	            for(var i=0; i<tkey.length; i++){
	                tmatrix[tkey[i]] = parseInt(_tmatrix[i], 10);
	            }
	        }
        }

        if (t._scroll_master)
        	t._scroll_master._sync_pos(tmatrix);

        return tmatrix;
	},	
	_correct_minmax:function(value, allow, current, dx, px){
		if (value === current) return value;
		
		var delta = Math.abs(value-current);
		var sign = delta/(value-current);
	//	t._fast_correction = true;
		
		
		if (value>0) return allow?(current + sign*Math.sqrt(delta)):0;
		
		var max = dx - px;
		if (max + value < 0)	
			return allow?(current - Math.sqrt(-(value-current))):-max;
			
	//	t._fast_correction = false;
		return value;
	},	
	_init_scroll_node:function(node){
		if (!node.scroll_enabled){ 
			node.scroll_enabled = true;	
			node.parentNode.style.position="relative";
			var prefix = dhtmlx.env.transformCSSPrefix;
			node.style.cssText += prefix+"transition: "+prefix+"transform; "+prefix+"user-select:none; "+prefix+"transform-style:flat;";
			node.addEventListener(dhtmlx.env.transitionEnd,t._scroll_end,false);
		}
	},
	_init_scroller:function(delta){
		if (t._scroll_mode.indexOf("x") != -1)
			t._scroll[0] = t._create_scroll("x", t._scroll_stat.dx, t._scroll_stat.px, "width");
		if (t._scroll_mode.indexOf("y") != -1)
			t._scroll[1] = t._create_scroll("y", t._scroll_stat.dy, t._scroll_stat.py, "height");
			
		t._init_scroll_node(t._scroll_node);
		window.setTimeout(t._set_scroll_pos,1);
	},
	_create_scroll:function(mode, dy, py, height){
		if (dy - py <2){
			t._scroll_mode.replace(mode,"");
			return "";
		}

		var scroll = dhtmlx.html.create("DIV", {
			"class":"dhx_scroll_"+mode
		},"");
		
		scroll.style[height] = Math.max((py*py/dy-7),10) +"px";
		t._scroll_node.parentNode.appendChild(scroll);
		
		return scroll;
	},
	_axis_check:function(value, mode, old){
		if (value > t.config.deltaStep){
				if (t._was_not_moved){
					t._long_move(mode);
					t._locate(mode);
					if ((t._scroll_mode||"").indexOf(mode) == -1) t._scroll_mode = "";
				}
				return false;
		}
		return old;
	},
	_scroll_end:function(){
		if (!t._scroll_mode){
			dhtmlx.html.remove(t._scroll);
			t._scroll = [null, null];
		}
		t._active_transion = false;
	},
	_long_move:function(mode){
		window.clearTimeout(t._long_touch_timer);
		t._was_not_moved = false;	
	},	
	_stop_old_scroll:function(e){
		if (t._scroll[0] || t._scroll[1]){
			t._stop_scroll(e, t._scroll[0]?"x":"y");
		}else
			return true;
	},
	_touchstart :function(e){ 
		if (t._disabled) return;
		
		

		t._start_context = t._get_context(e);
		if (t._limited && !t._is_scroll()){
			t._stop_old_scroll(e);
			t._start_context = null;
			return;
		}

		t._translate_event("onTouchStart");

		if (t._stop_old_scroll(e))
			t._long_touch_timer = window.setTimeout(t._long_touch, t.config.longTouchDelay);
		
		var element = jdapivot.ui.get(e);
		var target = e.target || event.srcElement;
		if (element && element.touchable && (!target.className || target.className.indexOf("dhx_view")!==0)){
			t._css_button_remove = element.getNode(e);
			dhtmlx.html.addCss(t._css_button_remove,"dhx_touch");
		}	
			
	},
	_long_touch:function(e){
		t._translate_event("onLongTouch");
		dhx.callEvent("onClick", [t._start_context]);
		t._clear_artefacts();
	},
	_stop_scroll:function(e, stop_mode){ 
		t._locate(stop_mode);
		var scroll = t._scroll[0]||t._scroll[1];
		if (scroll){
			var view = t._get_event_view("onBeforeScroll");
			if (view)
				view.callEvent("onBeforeScroll", [t._start_context,t._current_context]);
		}
		if (scroll && (!t._scroll_node || scroll.parentNode != t._scroll_node.parentNode)){
			t._clear_artefacts();
			t._scroll_end();
			t._start_context = t._get_context(e);
		}
		t._touchmove(e);
	},	
	_get_delta:function(e, ch){
		t._prev_context = t._current_context;
		t._current_context = t._get_context(e);
			
		t._delta._x = Math.abs(t._start_context.x - t._current_context.x);
		t._delta._y = Math.abs(t._start_context.y - t._current_context.y);
		
		if (t._prev_context){
			if (t._current_context.time - t._prev_context.time < t.config.scrollDelay){
				t._delta._x_moment = t._delta._x_moment/1.3+t._current_context.x - t._prev_context.x;
				t._delta._y_moment = t._delta._y_moment/1.3+t._current_context.y - t._prev_context.y;
			}
			else {
				t._delta._y_moment = t._delta._x_moment = 0;
			}
			t._delta._time = t._delta._time/1.3+(t._current_context.time - t._prev_context.time);
		}
		
		return t._delta;
	},
	_get_sizes:function(node){
		t._scroll_stat = {
			dx:node.offsetWidth,
			dy:node.offsetHeight,
			px:node.parentNode.offsetWidth,
			py:node.parentNode.offsetHeight
		};
	},
	_is_scroll:function(locate_mode){
		var node = t._start_context.target;
		if (!dhtmlx.env.touch && !dhtmlx.env.transition && !dhtmlx.env.transform) return null;
		while(node && node.tagName!="BODY"){
			if(node.getAttribute){
				var mode = node.getAttribute("touch_scroll");
				if (mode && (!locate_mode || mode.indexOf(locate_mode)!=-1))
					return [node, mode];
			}
			node = node.parentNode;
		}
		return null;
	},
	_locate:function(locate_mode){
		var state = this._is_scroll(locate_mode);
		if (state){
			t._scroll_mode = state[1];
			t._scroll_node = state[0];
			t._get_sizes(state[0]);
		}
		return state;
	},
	_translate_event:function(name){
		dhx.callEvent(name, [t._start_context,t._current_context]);
		var view = t._get_event_view(name);
		if (view)
			view.callEvent(name, [t._start_context,t._current_context]);
	},
	_get_event_view:function(name){
		var view = jdapivot.ui.get(t._start_context);
		if(!view) return null;
		
		while (view){
			if (view.hasEvent&&view.hasEvent(name))	
				return view;
			view = view.getParent();
		}
		
		return null;
	},	
	_get_context:function(e){
		if (!e.touches[0]) {
			var temp = t._current_context;
			temp.time = new Date();
			return temp;
		}
			
		return {
			target:e.target,
			x:e.touches[0].pageX,
			y:e.touches[0].pageY,
			time:new Date()
		};
	},
	_get_context_m:function(e){
		return {
			target:e.target,
			x:e.pageX,
			y:e.pageY,
			time:new Date()
		};
	}
};

dhx.ready(function(){
	if (dhtmlx.env.touch)
		t._init();
});


})();


dhx.attachEvent("onDataTable", function(table, config){
	if (dhtmlx.env.touch){
		jdapivot.Touch._init();
		config.scrollSize = 0;
		jdapivot.extend(table, (config.prerender===true)?table._touchNative:table._touch);
	}
});

jdapivot.extend(jdapivot.ui.datatable, {
	_touchNative:{
		_init:function(){ 
			jdapivot.Touch.limit();
			this.defaults.scrollAlignY = false;

			this._body.setAttribute("touch_scroll","xy");
			this.attachEvent("onBeforeScroll", function(){ 
				jdapivot.Touch._scroll_node = this._body.childNodes[1].firstChild;
				jdapivot.Touch._get_sizes(jdapivot.Touch._scroll_node);
				jdapivot.Touch._scroll_master = this;
			});
			this.attachEvent("onTouchEnd", function(){
				jdapivot.Touch._scroll_master = null;
			});

			jdapivot.Touch._init_scroll_node(this._body.childNodes[1].firstChild);
			jdapivot.Touch._set_matrix(this._body.childNodes[1].firstChild, 0,0,"0ms");
			this._sync_scroll(0,0,"0ms");
		},
		_sync_scroll:function(x,y,t){
			if (this._settings.leftSplit)
				jdapivot.Touch._set_matrix(this._body.childNodes[0].firstChild,0,y,t);
			if (this._settings.rightSplit)
				jdapivot.Touch._set_matrix(this._body.childNodes[2].firstChild,0,y,t);
			if (this._settings.header)
				jdapivot.Touch._set_matrix(this._header.childNodes[1].firstChild,x,0,t);
			if (this._settings.footer)
				jdapivot.Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);
		},
		_sync_pos:function(){}
	},
	_touch:{
		_init:function(){
			jdapivot.Touch.limit();
			this.defaults.scrollAlignY = false;

			this._body.setAttribute("touch_scroll","xy");
			this.attachEvent("onBeforeScroll", function(){
				var t = jdapivot.Touch;

				t._scroll_node = this._body.childNodes[1].firstChild;
				t._get_sizes(t._scroll_node);
				t._scroll_stat.dy = this._dtable_height;
				t._scroll_master = this;
				this._touch_ellastic = t.config.ellastic;
				this._touch_gravity = t.config.gravity;
				
				t.config.ellastic = false;
				t.config.gravity = 0;
			});
			this.attachEvent("onAfterScroll", function(result){
				jdapivot.Touch._scroll_master = null;
				jdapivot.Touch._fix_f = null;
				jdapivot.Touch.config.ellastic = this._touch_ellastic;
				jdapivot.Touch.config.gravity = this._touch_gravity;
				
				
				this._scrollTop = 0;

				//ipad can delay content rendering if 3d transformation applied
				//switch back to 2d
				var temp = jdapivot.Touch.config.translate;
				jdapivot.Touch.config.translate = "translate";
				this._sync_scroll(result.e, 0, "0ms");
				jdapivot.Touch.config.translate = temp;

				this._scrollLeft = - result.e;
				this._scrollTop = -result.f;


				this.render();
				
				return false;
			});

			jdapivot.Touch._init_scroll_node(this._body.childNodes[1].firstChild);
			jdapivot.Touch._set_matrix(this._body.childNodes[1].firstChild, 0,0,"0ms");
			this._sync_scroll(0,0,"0ms");
		},
		_sync_scroll:function(x,y,t){
			y += this._scrollTop;
			jdapivot.Touch._set_matrix(this._body.childNodes[1].firstChild, x, y, t);
			if (this._settings.leftSplit)
				jdapivot.Touch._set_matrix(this._body.childNodes[0].firstChild,0,y,t);
			if (this._settings.rightSplit)
				jdapivot.Touch._set_matrix(this._body.childNodes[2].firstChild,0,y,t);
			if (this._settings.header)
				jdapivot.Touch._set_matrix(this._header.childNodes[1].firstChild,x,0,t);
			if (this._settings.footer)
				jdapivot.Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);
		},
		_sync_pos:function(matrix){
			matrix.f -= this._scrollTop;

		}
	}
});
/*DHX:Depend ui/datatable/datatable_size.js*/
dhx.attachEvent("onDataTable", function(grid){
	grid.attachEvent("onXLE", grid._adjustColumns);
	grid.attachEvent("onResize", grid._resizeColumns);
});

jdapivot.extend(jdapivot.ui.datatable, {
	_adjustColumns:function(){ 
		if (!this.dataCount()) return;

		var resize = false;
		var cols = this._settings.columns;
		for (var i = 0; i < cols.length; i++)
			if (cols[i].adjust)
				resize = this._adjustColumn(i, false, true) || resize;

		if (resize) 
			this._updateColsSizeSettings();
	},
	_resizeColumns:function(){
		var cols = this._settings.columns;
		if (cols)
			for (var i = 0; i < cols.length; i++)
				if (cols[i].fillspace)
					this._fillColumnSize(i);
	},
	_fillColumnSize:function(ind){
		var cols = this._settings.columns;
		if (!cols) return;
		var width = this._content_width - this._scrollSizeY;
		for (var i=0; i<cols.length; i++)
			if (i != ind) width -= cols[i].width;

		if (width>0)
			this.setColumnWidth(ind, width);
	},
	_adjustColumn:function(ind, headers, ignore){
		var width = this._getColumnSize(ind, headers);
		return this.setColumnWidth(ind, width, ignore);
	},
	adjustColumn:function(id, headers){
		this._adjustColumn(this.columnIndex(id), headers);
	}
});
/*DHX:Depend ui/datatable/datatable_integration.js*/
if (window.dhtmlx){

	if (!dhtmlx.attaches)
		dhtmlx.attaches = {};

	dhtmlx.attaches.attachAbstract=function(conf){
		var obj = dhtmlx.html.create("div",{
			id:"CustomObject_"+dhtmlx.uid()
		});
		obj.style.width = obj.style.height = "100%";
		obj.cmp = "grid";
		document.body.appendChild(obj);

		this.attachObject(obj.id);
		
		conf.container = obj.id;

		var that = this.vs[this.av];
		conf.borderless = true;
		that.grid = jdapivot.ui(conf);
		
		that.gridId = obj.id;
		that.gridObj = obj;
		
			
		that.grid.setSizes = function(){
			if (this.adjust) this.adjust();
			else this.render();
		};
		
		var method_name="_viewRestore";
		return this.vs[this[method_name]()].grid;
	};

	dhtmlx.attaches.attachDataTable = function(config){
		config.view = "datatable";
		return this.attachAbstract(config);
	};
}
/*DHX:Depend ui/datatable/datatable_columns.js*/
jdapivot.extend(jdapivot.ui.datatable, {
	_init:function(){
		this._hidden_column_hash = {};
		this._hidden_column_order = [];
		this._hidden_split=[0,0];
	},
	hideColumn:function(id, mode){
		var cols = this._settings.columns;
		var horder = this._hidden_column_order;
		var hhash = this._hidden_column_hash;

		if (mode!==false){
			if (!horder.length){
				for (var i=0; i<cols.length; i++)
					horder[i] = cols[i].id;
				this._hidden_split = [this._settings.leftSplit, this._rightSplit];
			}

			var index = this.columnIndex(id);
			dhtmlx.assert(index != -1, "Invalid column ID in hideColumn command");

			if (index<this._settings.leftSplit)
				this._settings.leftSplit--;
			if (index>=this._rightSplit)	
				this._settings.rightSplit--;

			this._hideColumn(index);
			var column  = hhash[id] = cols.splice(index, 1)[0];
			column._yr0 = -1;
		} else {
			var column = hhash[id];
			dhtmlx.assert(column, "showColumn with invalid id");

			var prev = null;
			var i = 0;
			for (i; i<horder.length; i++){
				if (horder[i] == id)
					break;
				if (!hhash[horder[i]])
					prev = horder[i];
			}
			var index = prev?this.columnIndex(prev)+1:0;

			dhtmlx.PowerArray.insertAt.call(cols,column, index);

			if (i<this._hidden_split[0])
				this._settings.leftSplit++;
			if (i>=this._hidden_split[1])	
				this._settings.rightSplit++;
							
			hhash[id] = null;
		}
		this._refresh_columns();
	},
	refreshColumns:function(){
		//clear rendered data
		for (var i=0; i<this._columns.length; i++){
			var col = this._columns[i];
			col.attached = col.node = null;
		}
		for (var i=0; i<3; i++)
			this._body.childNodes[i].firstChild.innerHTML = "";

		//render new structure
		this._define_structure();
		this.render();	
	},
	_refresh_columns:function(){
		this._apply_headers();
		this.render();
	},
	showColumn:function(id){
		return this.hideColumn(id, false);
	}
});

/*DHX:Depend core/dataprocessor.js*/
/*DHX:Depend core/config.js*/
/*DHX:Depend core/load.js*/
/*DHX:Depend core/validation.js*/
/*DHX:Depend core/dhx.js*/

jdapivot.ValidateData = {
	validate:function(obj) {
		dhtmlx.assert(this.callEvent, "using validate for eventless object");
		var result =true;
		var rules = this._settings.rules;
		if (rules){
			var objrule = rules.$obj;
			if(!obj&&this.getValues)
				obj = this.getValues();
			if (objrule && !objrule.call(this, obj)) return false;
			
			var all = rules.$all;
			for (var key in rules){
				if (key.indexOf("$")!==0){
					dhtmlx.assert(rules[key], "Invalid rule for:"+key);
					if (rules[key].call(this, obj[key], obj, key) && (!all || all.call(this, obj[key], obj, key))){
						if(this.callEvent("onValidationSuccess",[key, obj])&&this._clear_invalid)
							this._clear_invalid(key, obj);
					}
					else {
						result =false;
						if(this.callEvent("onValidationError",[key, obj])&&this._mark_invalid)
							this._mark_invalid(key, obj);
					}
				}
			}
		}
		return result;
	}
};


jdapivot.rules = {
	isNumber: function(value) {
		return (parseFloat(value) == value);
	},

	isNotEmpty: function(value) {
		return (value=="0" || value);
	}
};

jdapivot.DataProcessor = jdapivot.proto({
	defaults: {
		autoupdate:true,
		mode:"post"
	},

	/*! constructor
	 **/
	_init: function() {
		this._updates = [];
		this._linked = [];
		this._cursor = null;
		this._ignore = false;
		this.name = "DataProcessor";
		this.$ready.push(this._after_init_call);
	},
	master_setter:function(value){
		var store = value;
		if (value.name != "DataStore")
			store = value.data;

		this._settings.store = store;
		return value;
	},
	/*! attaching onStoreUpdated event
	 **/
	_after_init_call: function() {
		dhtmlx.assert(this._settings.store, "store or master need to be defined for the dataprocessor");
		this._settings.store.attachEvent("onStoreUpdated", dhtmlx.bind(this._onStoreUpdated, this));
		if (this._settings.url && this._settings.url.$proxy)
			this.attachEvent("onBeforeDataSend", dhtmlx.bind(this._settings.url._items_from_storage, this._settings.url));
	},
	
	ignore:function(code,master){
		var temp = this._ignore;
		this._ignore = true;
		code.call((master||this));
		this._ignore = temp;
	},
	off:function(){
		this._ignore = true;
	},
	on:function(){
		this._ignore = false;
	},

	_copy_data:function(source){
		var obj = {};
		for (var key in source)	
			if (key.indexOf("$")!==0)
				obj[key]=source[key];
		return obj;
	},
	save:function(id, operation){
		operation = operation || "update";
		this._onStoreUpdated(id, this._settings.store.item(id), operation);
	},
	/*! callback for onStoreUpdated event.
	 *	@param id
	 *		item id
	 *	@param index
	 *		item index
	 *	@param operation
	 *		type of operation ("update", "add", "delete", "move", null)
	 **/
	_onStoreUpdated: function(id, obj, operation) {
		if (this._ignore === true || !operation) return true;
		var update = {id: id, data:this._copy_data(obj) };
		switch (operation) {
			case 'update':
				update.operation = "update";
				break;
			case 'add':
				update.operation = "insert";
				break;
			case 'delete':
				update.operation = "delete";				
				break;
			default:
				return true;
		}
		if (update.operation != "delete" && !this.validate(update.data)) return false;
		if (this._check_unique(update))
			this._updates.push(update);
		
		if (this._settings.autoupdate)
			this.send();
			
		return true;
	},
	_check_unique:function(check){
		for (var i = 0; i < this._updates.length; i++){
			var one = this._updates[i];
			if (one.id == check.id){
				if (check.operation == "delete"){
					if (one.operation == "insert")
						this._updates.splice(i,1);
					else 
						one.operation = "delete";
				}
				one.data = check.data;
				return false;
			}
		}
		return true;
	},
	send:function(){
		this._sendData();
	},
	
	_sendData: function(){
		if (!this._settings.url){
			//dhtmlx.log("DataProcessor works in silent mode, maybe you have forgot to set url property","");
			return;
		}
		var marked = this._updates;
		var to_send = [];
		for (var i = 0; i < marked.length; i++) {
			var id = marked[i].id;
			var operation = marked[i].operation;

			if (this._settings.store.exists(id))
				marked[i].data = jdapivot.fullCopy(this._settings.store.item(id));
			
			if (!this.callEvent("onBefore"+operation, [id, marked[i].data]))
				continue;
			
			to_send.push(marked[i]);
		}
		if (!to_send.length && !this._settings.url.$proxy) return;
		if (!this.callEvent("onBeforeDataSend", [to_send]))
			return;
		if (this._settings.url.$proxy)
			this._settings.url._send(to_send, this._settings.mode, this);
		else
			this._send(this._settings.url, this._updatesToParams(to_send), this._settings.mode);
	},
	

	/*! process updates list to POST and GET params according dataprocessor protocol
	 *	@param updates
	 *		list of objects { id: "item id", data: "data hash", operation: "type of operation"}
	 *	@return
	 *		object { post: { hash of post params as name: value }, get: { hash of get params as name: value } }
	 **/

	_updatesToParams: function(updates) {
		var post_params = {};

		if (!this._settings.single){
			var ids = [];
			for (var i = 0; i < updates.length; i++) {
				var action = updates[i];
				ids.push(action.id);
				this._updatesData(action.data, post_params, action.id+"_", action.operation);
			}
			post_params.ids = ids.join(",");
		} else
			this._updatesData(updates[0].data, post_params, "", updates[0].operation);

		return post_params;
	},

	_updatesData:function(source, target, prefix, operation){
		for (var j in source){
			if (j.indexOf("$")!==0)
				target[prefix + j] = source[j];
		}
		target[prefix + '!nativeeditor_status'] = operation;
	},



	/*! send dataprocessor query to server
	 *	and attach event to process result
	 *	@param url
	 *		server url
	 *	@param get
	 *		hash of get params
	 *	@param post
	 *		hash of post params
	 *	@mode
	 *		'post' or 'get'
	 **/
	_send: function(url, post, mode) {
		dhtmlx.assert(url, "url was not set for DataProcessor");
		if (typeof url == "function")
			return url(post);
		
		url += (url.indexOf("?") == -1) ? "?" : "&";
		url += "editing=true";

		dhtmlx.ajax()[mode](url, post, dhtmlx.bind(this._processResult, this));
	},

	// process saving from result
	_processResult: function(text,data,loader) {
		this.callEvent("onBeforeSync", [hash, text, data, loader]);
		
		var xml = dhtmlx.DataDriver.xml;
		data = xml.toObject(text, xml);
				
		var actions = xml.xpath(data, "//action");
		var hash = [];
		for (var i = 0; i < actions.length; i++) {
			var obj = xml.tagToObject(actions[i]);
			hash.push(obj);
			
			var index = -1;
			for (var ii=0; ii < this._updates.length; ii++){
				if (this._updates[ii].id == obj.sid)
					index = ii;
					break;
			}
					
			if (obj.type == "error" || obj.type == "invalid"){
				if (!this.callEvent("onDBError", [obj, this._updates[index]])){
					continue;
				}
			}
			
			if  (index>=0)
				this._updates.splice(index,1);
			
			if (obj.tid != obj.sid)
				this._settings.store.changeId(obj.sid, obj.tid);
			
			if (!this.callEvent("onAfter"+obj.type, [obj]))
				continue;
		}
		
		this.callEvent("onAfterSync", [hash, text, data, loader]);
	},


	/*! if it's defined escape function - call it
	 *	@param value
	 *		value to escape
	 *	@return
	 *		escaped value
	 **/
	escape: function(value) {
		if (this._settings.escape)
			return this._settings.escape(value);
		else
			return encodeURIComponent(value);
	}

}, jdapivot.Settings, dhtmlx.EventSystem, jdapivot.ValidateData);