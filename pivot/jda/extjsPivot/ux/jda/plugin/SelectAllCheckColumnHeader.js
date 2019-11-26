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
 * This plugin is intended to use for grids which has measure as store.
 * Expand capability will be added to row which has dataIndex and expandValue matches
 */

Ext.define('Jda.ux.plugin.SelectAllCheckColumnHeader', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.selectallcheckcolumnheader',

    init: function (cmp) {
        /*
         * @cfg checked Boolean initial state of checkbox. Defaults to false
         */
        var me = this;
        me.checked = !!me.checked;       
        var text = cmp.text;
   	    cmp.text = '';
        // class that make the div look like a checkbox
        me._checkClass = Ext.baseCSSPrefix + 'grid-checkcolumn'
        cmp.afterText = function(out, values) {
        	out.push(
        			'<div class="', me._checkClass, '" src="' + Ext.BLANK_IMAGE_URL + '"></div> <span class="gridCheckColumnHeaderText"> '+ text +'</span>'
        	)
        }
        
        // Position the checkbox
        // - Make sure that checkbox show right of the header text instead of under it
        // - Also horizontal align the checkbox better
        cmp.cls = 'select-all-checkcolumn-header'
        Ext.util.CSS.createStyleSheet([
          '.', cmp.cls, ' .', Ext.baseCSSPrefix, 'column-header-text {',
          '  display: inline;',
          '}',
          '.', cmp.cls, ' .', me._checkClass, ' {',
          '  display: inline;',
          '  padding-left: 5px;',
          '}',
        ].join(''), 'plugin_selectallcheckcolumnheader');

        // initial display of checkbox or not based on me.checked
        cmp.on('render', me.checkCheckbox, me);
        // listen to header clicks, but only handle the onces exactly on the checkbox
        cmp.on('headerclick', me.onHeaderClick, me);
        // event fired by clicking on the checkbox and (un)checks all checkboxes in the grid
        cmp.on('selectall', me.onSelectAll, me);
        
    },

    onHeaderClick: function(headerCt, header, e, clickedElement) {
        var me = this;
        var cmp = me.cmp;
        var grid = headerCt.grid;

        if (!Ext.get(clickedElement).hasCls(me._checkClass)) {
          // It was not the particular checkbox that was clicked inside the header.
          // The column header should proceed doing other stuff like sorting
          return
        }
        me.checked = !me.checked;

        cmp.fireEvent('selectall', grid.getStore(), header, me.checked);
        me.checkCheckbox()
    },

    checkCheckbox: function() {
      var me = this;
      var cmp = this.cmp;
      var checkboxEl = cmp.getEl().down('.' + me._checkClass);

      checkboxEl[me.checked ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
    },

    onSelectAll: function(store, column, checked) {
        var dataIndex = column.dataIndex;
        var recordCount = store.getCount();
        var filterIds = [];
        for (var i = 0; i < recordCount; i++) {
            var record = store.getAt(i);
            if(dataIndex === "activate"){
            	if(!(record.disabledFilters) ){
            		filterIds.push(record.id);
            		record.set(dataIndex, checked);
                }
            }else{
            	if(!(record.disabledFormatCell) ){
            		filterIds.push(record.id);
                	record.set(dataIndex, checked);
                }	
            } 
        }
        this.cmp.dataFilterController.applyCFRules(null,checked, filterIds);
    }
});