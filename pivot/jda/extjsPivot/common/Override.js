//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================

/*

Ext.define('Ext.button.NgButton',{
	 override :'Ext.button.Button',
	 initComponent: function() {
	        var me = this;
	        console.log(arguments);
	        var uix = me.ui;
	        if(me.xtype == 'button'  && (!me.ui || me.ui == 'default'))
	        	uix = 'actionbtn';	        
	        Ext.apply(me, {
	        	height : 22,
	        	minWidth : 22,
	        	ui : uix
	        });
	        me.autoEl = {
	            tag: 'a',
	            hidefocus: 'on',
	            unselectable: 'on'
	        };
	        me.addCls(Ext.baseCSSPrefix + 'unselectable');
	        me.callParent(arguments);
		        me.addEvents('click', 'toggle', 'mouseover', 'mouseout', 'menushow', 'menuhide', 'menutriggerover', 'menutriggerout', 'textchange', 'iconchange', 'glyphchange');
	        if (me.menu) {
	            me.split = true;
	            me.menu = Ext.menu.Manager.get(me.menu);
	            me.menu.ownerButton = me;
	        }
	        if (me.url) {
	            me.href = me.url;
	        }
	        if (me.href && !me.hasOwnProperty('preventDefault')) {
	            me.preventDefault = false;
	        }
	        if (Ext.isString(me.toggleGroup) && me.toggleGroup !== '') {
	            me.enableToggle = true;
	        }
	        if (me.html && !me.text) {
	            me.text = me.html;
	            delete me.html;
	        }
	        me.glyphCls = me.baseCls + '-glyph';
	    }
});
*/
//////////////////////////Next Gen global overrides//////////////////////////////
Ext.define('Ext.view.TableOverride',{
    override: 'Ext.view.Table',
    markDirty: false
});

// Make sure that when the autoselect flag is set (true-by default) the first value is selected. Wrong behavior by ExtJS is just selected the first when opening the picker.
//ACT team raised MDAP-3354(combo box is selecting value by default due to below code) 
/*Ext.define('Ext.form.field.ComboBoxOverride',{
    override: 'Ext.form.field.ComboBox',
    doAutoSelect: function() {
        var me = this,
            picker = me.picker,
            lastSelected, itemNode;
        if (me.autoSelect && me.store.getCount() > 0) {
            var rec = me.store.getAt(0);
            me.setValue(rec.get(me.valueField));
            if (picker) {
                // Highlight the last selected item and scroll it into view
                lastSelected = picker.getSelectionModel().lastSelected;
                itemNode = picker.getNode(lastSelected || 0);
                if (itemNode) {
                    picker.highlightItem(itemNode);
                    picker.listEl.scrollChildIntoView(itemNode, false);
                }

            }
        }
    }
});
*/
/*Ext.define('Ext.tab.CenteredPanel',{
    override: 'Ext.tab.Panel',
    tabBar: {
        layout: { pack: 'center' },
        plain : true
    }
});*/


Ext.define('Jda.ngr.view.grid.plugin.LabelEditingPatched', {
    alias: 'plugin.Jda-labelediting',
    override: 'Ext.ux.DataView.LabelEditor',
    // on mousedown show editor
    // initialize events
    bindEvents: function() {
        this.mon(this.view.getEl(), {
            click: {
                fn: this.onClick,
                scope: this
            }
        });
    },
    onClick: function(e, target) {
        var me = this,
            item, record,
            fly = Ext.fly(target);

        if ((fly.hasCls(me.labelSelector)||((fly=fly.parent()).hasCls(me.labelSelector))) && !me.editing && !e.ctrlKey && !e.shiftKey) {
            e.stopEvent();
            item = me.view.findItemByChild(target);
            record = me.view.store.getAt(me.view.indexOf(item));
            me.startEdit(fly.el, record.data[me.dataIndex]);
            me.activeRecord = record;
        } else if (me.editing) {
            me.field.blur();
            e.preventDefault();
        }
    }

});

/*
Ext.define('Ext.panel.NgTool',{
    override :'Ext.panel.Tool',
    height: 16,
    width: 16,
    margin: '0 0 0 3',
    renderTpl: ['<span id="{id}-toolElWrap" class="{baseCls}-{type}">',
            '<img id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' +
            '{childElCls}" role="presentation"/></span>'
    ]
});
*/

Ext.define('Ext.ux.CheckColumnPatch', {
    override: 'Ext.grid.column.Check',

    /**
     * @cfg {Boolean} [columnHeaderCheckbox=false]
     * True to enable check/uncheck all rows
     */
    columnHeaderCheckbox: false,

    constructor: function (config) {
        var me = this;
        me.callParent(arguments);

        //me.addEvents('beforecheckallchange', 'checkallchange');

        if (me.columnHeaderCheckbox) {
            me.on('headerclick', function () {
                this.updateAllRecords();
            }, me);

            me.on('render', function (comp) {
                var grid = comp.up('grid');
                this.mon(grid, 'reconfigure', function () {
                    if (this.isVisible()) {
                        this.bindStore();
                    }
                }, this);

                if (this.isVisible()) {
                    this.bindStore();
                }

                this.on('show', function () {
                    this.bindStore();
                });
                this.on('hide', function () {
                    this.unbindStore();
                });
            }, me);
        }
    },

    onStoreDateUpdate: function () {
        var allChecked,
            image;

        if (!this.updatingAll) {
            allChecked = this.getStoreIsAllChecked();
            if (allChecked !== this.allChecked) {
                this.allChecked = allChecked;
                image = this.getHeaderCheckboxImage(allChecked);
                this.setText(image);
            }
        }
    },

    getStoreIsAllChecked: function () {
        var me = this,
            allChecked = true;
        me.store.each(function (record) {
            if (!record.get(this.dataIndex)) {
                allChecked = false;
                return false;
            }
        }, me);
        return allChecked;
    },

    bindStore: function () {
        var me = this,
            grid = me.up('grid'),
            store = grid.getStore();

        me.store = store;

        me.mon(store, 'datachanged', function () {
            this.onStoreDateUpdate();
        }, me);
        me.mon(store, 'update', function () {
            this.onStoreDateUpdate();
        }, me);

        me.onStoreDateUpdate();
    },

    unbindStore: function () {
        var me = this,
            store = me.store;

        me.mun(store, 'datachanged');
        me.mun(store, 'update');
    },

    updateAllRecords: function () {
        var me = this,
            allChecked = !me.allChecked;

        if (me.fireEvent('beforecheckallchange', me, allChecked) !== false) {
            this.updatingAll = true;
            me.store.each(function (record) {
                record.set(this.dataIndex, allChecked);
            }, me);

            this.updatingAll = false;
            this.onStoreDateUpdate();
            me.fireEvent('checkallchange', me, allChecked);
        }
    },

    getHeaderCheckboxImage: function (allChecked) {
        var cls = [],
            cssPrefix = Ext.baseCSSPrefix;

        if (this.columnHeaderCheckbox) {
            allChecked = this.getStoreIsAllChecked();
            //Extjs 4.2.x css
            cls.push(cssPrefix + 'grid-checkcolumn');
            //Extjs 4.1.x css
            cls.push(cssPrefix + 'grid-checkheader');

            if (allChecked) {
                //Extjs 4.2.x css
                cls.push(cssPrefix + 'grid-checkcolumn-checked');
                //Extjs 4.1.x css
                cls.push(cssPrefix + 'grid-checkheader-checked');
            }
        }
        return '<div style="margin:auto" class="' + cls.join(' ') + '">&#160;</div>'
    }
});

//Action Column support for glyph
Ext.define('Override.grid.column.Action', {
    override : 'Ext.grid.column.Action',

    iconTpl : '<tpl for=".">' +
        '<tpl if="glyph">' +
        '<div class="{cls}" style="font-family:{glyphFamily}; <tpl if="style&&style.fontSize">font-size:{style.fontSize};</tpl> <tpl if="style&&style.lineHeight">line-height:{style.lineHeight};</tpl>"<tpl if="tooltip"> data-qtip="{tooltip}"</tpl>>&#{glyph};</div>' +
        '<tpl else>' +
        '<img role="button" alt="{alt}" class="{cls}"<tpl if="tooltip"> data-qtip="{tooltip}"</tpl> />' +
        '</tpl>' +
        '</tpl>',

    defaultRenderer : function(v, meta, record, rowIdx, colIdx, store, view) {
        var me            = this,
            prefix        = Ext.baseCSSPrefix,
            scope         = me.origScope || me,
            items         = me.items,
            altText       = me.altText,
            disableAction = me.disableAction,
            enableAction  = me.enableAction,
            iconCls       = me.iconCls,
            len           = items.length,
            i             = 0,
            iconTpl       = new Ext.XTemplate(me.iconTpl),
            datas         = [],
            item, itemScope, ret, disabled, tooltip, glyph, cls, data;

        // Allow a configured renderer to create initial value (And set the other values in the "metadata" argument!)
        // Assign a new variable here, since if we modify "v" it will also modify the arguments collection, meaning
        // we will pass an incorrect value to getClass/getTip
        ret = Ext.isFunction(me.origRenderer) ? me.origRenderer.apply(scope, arguments) || '' : '';

        meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';

        for (; i < len; i++) {
            item      = items[i];
            itemScope = item.scope || scope;
            disabled  = item.disabled || (item.isDisabled ? item.isDisabled.call(itemScope, view, rowIdx, colIdx, item, record) : false);
            tooltip   = disabled ? null : (item.tooltip || (item.getTip ? item.getTip.apply(itemScope, arguments) : null));
            glyph     = item.glyph || item.getGlyph;
            cls       = Ext.String.trim(prefix + 'action-col-icon ' + prefix + 'action-col-' + String(i) + ' ' + (disabled ? prefix + 'item-disabled' : ' ') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(itemScope, arguments) : (item.iconCls || iconCls || '')));
            data      = {
                cls     : cls,
                tooltip : tooltip,
                glyphFamily : Ext._glyphFontFamily
            };

            // Only process the item action setup once.
            if (!item.hasActionConfiguration) {
                // Apply our documented default to all items
                item.stopSelection          = me.stopSelection;
                item.disable                = Ext.Function.bind(disableAction, me, [i], 0);
                item.enable                 = Ext.Function.bind(enableAction, me, [i], 0);
                item.hasActionConfiguration = true;
            }

            if (glyph) {
                if (Ext.isFunction(glyph)) {
                    glyph = glyph.call(itemScope, view, rowIdx, colIdx, item, record);
                }

                if (glyph) {
                    if (typeof glyph === 'string') {
                        glyphParts = glyph.split('@');
                        data.glyph = glyphParts[0];
                        data.glyphFamily = glyphParts[1];
                    } else
                    {
                        data.glyph = glyph;
                    }
                } else {
                    data = false;
                }
            } else {
                data.alt = item.altText || altText;
                data.src = item.icon || Ext.BLANK_IMAGE_URL;
            }

            data && datas.push(data);
        }

        len && (ret += iconTpl.apply(datas));

        return ret;
    }
});

Ext.define('myCheckboxSelectionModel', {
    override: 'Ext.selection.CheckboxModel',
    getHeaderConfig: function () {
        // obtain default column configuration
        var config = this.callParent();
        // pass renderer from selModel block to the check column config
        config.renderer = this.renderer;
        return config;
    }
});

// The below code added for MDAP-4482 defect, it was broken in Extjs 6.5 version after upgrade and working fine in Extjs 6.2 version 
// we can remove below code once EXTJS-23620 bug fixed.
Ext.define(null, {
	override: 'Ext.view.DropZone',

	positionIndicator: function(node, data, e) {
		var me = this,
			view = me.view,
			pos = me.getPosition(e, node),
			overRecord = view.getRecord(node),
			draggingRecords = data.records,
			indicatorY, scrollable, scrollableEl, container, /* FIX: */ containerY;

		if (!Ext.Array.contains(draggingRecords, overRecord) && (
			pos === 'before' && !me.containsRecordAtOffset(draggingRecords, overRecord, -1) ||
			pos === 'after' && !me.containsRecordAtOffset(draggingRecords, overRecord, 1)
		)) {
			me.valid = true;

			if (me.overRecord !== overRecord || me.currentPosition !== pos) {
				scrollable = me.view.getScrollable();
				scrollableEl = scrollable && scrollable.getElement();
				
				container = (scrollableEl && /* FIX: */ scrollableEl.isScrollable()) ? scrollableEl : Ext.fly(view.getNodeContainer());
				/* FIX: */ containerY = container.getY();
				/* FIX: */ indicatorY = Ext.fly(node).getY() - containerY - 1;
				if (pos === 'after') {
					indicatorY += Ext.fly(node).getHeight();
				}

				me.getIndicator().setWidth(Ext.fly(view.el).getWidth()).showAt(0, indicatorY);
				
				// Cache the overRecord and the 'before' or 'after' indicator.
				me.overRecord = overRecord;
				me.currentPosition = pos;
			}
		} else {
			me.invalidateDrop();
		}
	}
});