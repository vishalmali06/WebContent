<!--=========================================================================================================	-->
<!--		Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.									-->
<!--		LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS			-->
<!--		SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION		-->
<!--		OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE		-->
<!--		SUCH AGREEMENT.																						-->
<!--		This product may be protected by one or more United States and foreign patents.						-->
<!--		For information on patents, see https://www.jda.com/legal/patents.									-->
<!--=========================================================================================================	-->
<DIV class="PivotTemplateClasses" style="display: none;">
    <!-- rc is the RequestContext in which the data is sent to the template -->
    <SCRIPT class="RedUnder18MillEaxmpleBasicCellTemplate PivotTemplate"  type="text/html">
            <div  {{=rc.dataAttribute}} {{if (rc.cellValue){console.log("Raw data %o",rc)} }} title="{{=rc.cellValue}}" {{=rc.titleAttr}} measure="{{=rc.currMeasureId}}" 
                class="{{=rc.isParentContainer ? ' parentContainer ' : ''}} {{=rc.css}} dhx_value label" data-rowaxispath="{{=rc.rowAxisPath}}">
                         {{=rc.expansionSpan}} {{=rc.metaInfoSpan}}
                            <span class='{{=rc.valueCss}}' 
                                {{ var numericData=rc.cellRawData&&rc.cellRawData.content&&parseFloat(rc.cellRawData.content);
                                    /*console.log("Numeric %o",numericData);*/}}
                                 {{   if (!isNaN(numericData)&&numericData<18000000){print(' style="color:red;" ')} }}>
                                {{=rc.cellValue}} 
                            </span>
            </div>          
    </SCRIPT>

    <SCRIPT class="BasicCellTemplateOld PivotTemplate"  type="text/html">
            <div  {{=rc.dataAttribute}} title="{{=rc.cellValue}}" {{=rc.titleAttr}} measure="{{=rc.currMeasureId}}" 
                class="{{=rc.isParentContainer ? ' parentContainer ' : ''}} {{=rc.css}} dhx_value label"  data-rowaxispath="{{=rc.rowAxisPath}}">
                         {{=rc.expansionSpan}} {{=rc.metaInfoSpan}}
                            <span class='{{=rc.valueCss}}' >
                                {{=rc.cellValue}} 
                            </span>
            </div>          
    </SCRIPT>
    <SCRIPT class="BasicCellTemplate PivotTemplate"  type="text/html">
            <div  {{=rc.dataAttribute}} title="{{=_.isObject(rc.cellValue)?null:rc.cellRawData&&rc.cellRawData.isElement?null: ((rc.cellRawData && rc.cellRawData.cmProps.cellAppMsg) || rc.cellValue)}}" {{=rc.titleAttr}} measure="{{=rc.currMeasureId}}" 
                class="{{=rc.isParentContainer ? ' parentContainer ' : ''}} {{=rc.cellRawData?rc.cellRawData.cmProps.cellAppCss+" "+rc.cellRawData.dtype+"-type":""}} {{=rc.css}} {{=rc.textAlign ? "cell-textalign-"+rc.textAlign.toLowerCase():""}} dhx_value label {{=rc.conditioinalformatclass}}"  data-rowaxispath="{{=rc.rowAxisPath}}" style="{{=rc.cellHeight?'height:'+rc.cellHeight+'px':''}}">
                         {{=rc.expansionSpan}} {{=rc.metaInfoSpan}}

                            <span class='{{=rc.cellRawData.cmProps.valueAppCss+" "+rc.valueCss}} ' >
                            {{  
                                
                               // console.log('rc=%o',rc);
                                var type=(rc&&rc.cellRawData&&rc.cellRawData.dtype)||"simple";
                                var typeTemplateFn=rc.pivotObj.getPivotCellTemplateForType(type+"-CellTemplate");
                             //   console.log('Type template %o',typeTemplateFn.source);
                                var renderAction={
                                        'image' : function(rc) {
                                               }} Img {{=rc.cellValue}}  {{ 
                                            },
                                        'string' : function(rc) {
												//console.log('My rc=%o',rc);
                                               }} {{= (rc.cellRawData&&rc.cellRawData.display !== undefined ? "display "+rc.cellRawData.display : rc.cellValue)}}  {{ 
                                            }
                                    }
                                    print(typeTemplateFn(rc));
                                    
                             }}                    
                            </span>
						 {{
    						if (rc.cellRawData&&rc.cellRawData.dtype=="image") { }}
  								<div class="ribbon-wrapper-blue">
    								<div class="ribbon-blue">{{=rc.cellValue.length}}</div>
  								</div>{{
     									} 
  						 }}
            </div>          
    </SCRIPT>
    <SCRIPT class="simple-CellTemplate PivotTemplate"  type="text/html">
                                {{=rc.cellRawData ? 
											(rc.cellRawData.display !== undefined ? rc.cellRawData.display :
															rc.cellRawData.isMultiple ? rc.pivotObj.getLocaleString('Multiple') : rc.cellValue
											) : rc.cellValue}}          
    </SCRIPT>
    <SCRIPT class="image-CellTemplate PivotTemplate"  type="text/html">
        <div class="imageGrid">
            
                {{ if (rc.cellValue&&rc.cellValue.length) {
            //       console.log('rc value is %o',rc);
                    var totalThumbsVisible=rc.maxDisplayedThumbnailsWidth*rc.maxDisplayedThumbnailsHeight;
                    _.each(rc.cellValue,function(item){
                 //       console.log('image item is %o',item);     
              
                    }}  <img {{=(totalThumbsVisible-->0?'':'style="display:none;"')}} src="{{=item.url_sq}}" data-imagedata='{{-JSON.stringify(item)}}'  /> {{
                }) ;
                    
                }
                else
                {
                   }}No image{{
                }
             }}
        </div>                                      

    </SCRIPT>
    
    <SCRIPT class="lightBoxMarkup" style='display: none;'   type="text/html">
            <div class="pp_pic_holder" > 
                        <div class="ppt">&nbsp;</div> 
                        <div class="pp_top"> 
                            <div class="pp_left"></div> 
                            <div class="pp_middle"></div> 
                            <div class="pp_right"></div> 
                        </div> 
                        <div class="pp_content_container"> 
                            <div class="pp_left"> 
                            <div class="pp_right"> 
                                <div class="pp_content"> 
                                    <div class="pp_loaderIcon"></div> 
                                    <div class="pp_fade"> 
                                        <a href="#" class="pp_expand" title="Expand the image">Expand</a> 
                                        <div class="pp_hoverContainer"> 
                                            <a class="pp_next" href="#">next</a> 
                                            <a class="pp_previous" href="#">previous</a> 
                                        </div> 
                                        <div id="pp_full_res"></div> 
                                        <div class="pp_details">                                            
                                            <DIV class='image-details ui-helper-clearfix'>
	                                            <fieldset>
                                                    <legend>Item attributes</legend>
                                                     <DIV>   
                                                        <label for="description">Description:</label>
                                                        <input name="description" value="{data.description}"></input>
                                                     </DIV>                                                       
                                                     <DIV>   
                                                        <label for="brand">Brand:</label>
                                                        <input name="brand" value="{data.brand}"></input>
                                                     </DIV>                                                       
                                                     <DIV>   
                                                        <label for="color">Color:</label>
                                                        <input name="color" value="{data.color}"></input>
                                                     </DIV>                                                       
                                                     <DIV>   
                                                        <label for="price_range">Price Range:</label>
                                                        <input name="price_range" value="{data.price_range}"></input>
                                                     </DIV>                                                       
                                                     <DIV>   
                                                        <label for="sleeve_length">Sleeve Length:</label>
                                                        <input name="sleeve_length" value="{data.sleeve_length}"></input>
                                                     </DIV>                                                       
<!--                                                     <DIV>   
	                                                    <label for="datetaken">Date taken:</label>
	                                                    <input name="datetaken" value="{data.date_taken}"></input>
                                                     </DIV>   
	
                                                     <DIV>   
	                                                    <label for="origHeight">Original height:</label>
	                                                    <input name="origHeight" value="{data.height_o}"></input>
                                                     </DIV>   
	                                                   
                                                     <DIV>   
                                                        <label for="origWidth">Original width:</label>
                                                        <input name="origWidth" value="{data.width_o}"></input>
                                                     </DIV>   
--> 
												</fieldset>
                                            </DIV>
                                            <div class="pp_nav" style="width:100%;"> 
                                                <a href="#" class="pp_arrow_previous">Previous</a> 
                                                <p class="currentTextHolder">0/0</p> 
                                                <a href="#" class="pp_arrow_next">Next</a> 
                                                <a class="pp_close" style="float:right;" href="#">Close</a>  
                                            </div> 
                                            <p class="pp_description"></p> 
                                            <div class="pp_social">{pp_social}</div> 
                                            
                                            </div> 
                                        
                                    </div> 
                                </div> 
                            </div> 
                            </div> 
                        </div> 
                        <div class="pp_bottom"> 
                            <div class="pp_left"></div> 
                            <div class="pp_middle"></div> 
                            <div class="pp_right"></div> 
                        </div> 
                    </div> 
                    <div class="pp_overlay"></div>  
          </div>
    </SCRIPT>

</DIV>

<DIV class="lorem" style="display: none;">
lorem
</DIV>
<DIV style="display: none;" >
	<input id="mdapImportExcel" class= "mdapImportExcel" type="file" name="mdapImportExcelFile" />
</DIV>