//javascript for controlling Transit Ridership App
//written by Bill Hereth February 2022

var dModeOptions = [
    { label: "All Transit"      , name: "all" , value: "0", selected: true },
    { label: "Local Bus"        , name: "lcl" , value: "4"                 },
    { label: "Core Route"       , name: "brt5", value: "5"                 },
    { label: "Express Bus"      , name: "exp" , value: "6"                 },
    { label: "Bus Rapid Transit", name: "brt9", value: "9"                 },
    { label: "Light Rail"       , name: "lrt" , value: "7"                 },
    { label: "Commuter Rail"    , name: "crt" , value: "8"                 }
];

var dRawOptions = [
     {value:"DYVOL",label:"Daily Volume (2-Way)"},
     {value:"PMSPD",label:"PM Period Speeds"},
     {value:"PMVC" ,label:"PM Period Volume-to-Capacity Ratio"},
     {value:"DYTRK",label:"Daily Trucks"}
];

var sRawOption = "DYVOL";

var sCBertGrad9 = "#Af2944"; //rgb(175,41,68)
var sCBertGrad8 = "#E5272d"; //rgb(229,39,45)
var sCBertGrad7 = "#Eb672d"; //rgb(235,103,45)
var sCBertGrad6 = "#E09d2e"; //rgb(224,157,46)
var sCBertGrad5 = "#8dc348"; //rgb(141,195,72)
var sCBertGrad4 = "#6cb74a"; //rgb(108,183,74)
var sCBertGrad3 = "#00a74e"; //rgb(0,167,78)
var sCBertGrad2 = "#1ba9e6"; //rgb(27,169,230)
var sCBertGrad1 = "#31398a"; //rgb(49,57,138)

var sCBertGrad0 = "#EEEEEE";

bertColorData = [sCBertGrad1,sCBertGrad2,sCBertGrad3,sCBertGrad4,sCBertGrad5,sCBertGrad6,sCBertGrad7,sCBertGrad8,sCBertGrad9];

//Tranist Variables
var curMode = "";
var curRawOption = sRawOption;
var lyrLinks;
var sLinks = "LinksWithRiders_v2";

var minScaleForLabels = 87804;
var labelClassOn;
var labelClassOff;
var sCWhite = "#FFFFFF";
var dHaloSize = 2.0;

var bindata;

var tttRM;

var iPixelSelectionTolerance = 5;

define(['dojo/_base/declare',
        'jimu/BaseWidget',
        'jimu/LayerInfos/LayerInfos',
        'dijit/registry',
        'dojo/dom',
        'dojo/dom-style',
        'dijit/dijit',
        'dojox/charting/Chart',
        'dojox/charting/themes/Claro',
        'dojox/charting/themes/Julie',
        'dojox/charting/SimpleTheme',
        'dojox/charting/plot2d/Scatter',
        'dojox/charting/plot2d/Markers',
        'dojox/charting/plot2d/Columns',
        'dojox/charting/widget/Legend',
        'dojox/charting/action2d/Tooltip',
        'dojox/layout/TableContainer',
        'dojox/layout/ScrollPane',
        'dijit/layout/ContentPane',
        'jimu/PanelManager',
        'dijit/form/TextBox',
        'dijit/form/ToggleButton',
        'jimu/LayerInfos/LayerInfos',
        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'esri/layers/FeatureLayer',
        'esri/dijit/FeatureTable',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/TextSymbol',
        'esri/symbols/Font',
        'esri/layers/LabelClass',
        'esri/InfoTemplate',
        'esri/Color',
        'esri/map',
        'esri/renderers/UniqueValueRenderer',
        'esri/geometry/Extent',
        'dojo/store/Memory',
        'dojox/charting/StoreSeries',
        'dijit/Dialog',
        'dijit/form/Button',
        'dijit/form/RadioButton',
        'dijit/form/MultiSelect',
        'dojox/form/CheckedMultiSelect',
        'dijit/form/Select',
        'dijit/form/ComboBox',
        'dijit/form/CheckBox',
        'dojo/store/Observable',
        'dojox/charting/axis2d/Default',
        'dojo/domReady!'],
function(declare, BaseWidget, LayerInfos, registry, dom, domStyle, dijit, Chart, Claro, Julie, SimpleTheme, Scatter, Markers, Columns, Legend, Tooltip, TableContainer, ScrollPane, ContentPane, PanelManager, TextBox, ToggleButton, LayerInfos, Query, QueryTask, FeatureLayer, FeatureTable, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol, Font, LabelClass, InfoTemplate, Color, Map, UniqueValueRenderer, Extent, Memory, StoreSeries, Dialog, Button, RadioButton, MutliSelect, CheckedMultiSelect, Select, ComboBox, CheckBox, Observable) {
    //To create a widget, you need to derive from BaseWidget.
    
    return declare([BaseWidget], {
        // DemoWidget code goes here

        //please note that this property is be set by the framework when widget is loaded.
        //templateString: template,

        baseClass: 'jimu-widget-demo',
        
        postCreate: function() {
            this.inherited(arguments);
            console.log('postCreate');
        },

        startup: function() {
            console.log('startup');

            tttRM = this;
            
            this.inherited(arguments);
            this.map.setInfoWindowOnClick(false); // turn off info window (popup) when clicking a feature
            
            //Widen the widget panel to provide more space for charts
            //var panel = this.getPanel();
            //var pos = panel.position;
            //pos.width = 500;
            //panel.setPosition(pos);
            //panel.panelManager.normalizePanel(panel);
            
            var parent = this;

            //when zoom finishes run changeZoom to update label display
            //this.map.on("zoom-end", function (){    
            //    parent.changeZoom();    
            //});    
            
            
            //Initialize Selection Layer, FromLayer, and ToLayer and define selection colors
            //var layerInfosObject = LayerInfos.getInstanceSync();
            //for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
            //    var currentLayerInfo = layerInfosObject._layerInfos[j];        
            //    if (currentLayerInfo.title == sLinks) { //must mach layer title
            //        console.log('Link Layer Found')
            //        lyrLinks = layerInfosObject._layerInfos[j].layerObject;
            //    } 
            //}
            //cmbMode = new Select({
            //    id: "selectMode",
            //    name: "selectModeName",
            //    RawOptions: dModeRawOptions,
            //    onChange: function(){
            //        curMode = this.value;
            //        console.log('Select Mode: ' + curMode)
            //        rW.updateDisplay();
            //    }
            //    }, "cmbMode");
            //curMode = "0";
            //cmbMode.startup();

            // create a text symbol to define the style of labels
            //var volumeLabel = new TextSymbol();
            //volumeLabel.font.setSize("8pt");
            //volumeLabel.font.setFamily("arial");
            //volumeLabel.font.setWeight(Font.WEIGHT_BOLD);
            //volumeLabel.setHaloColor(sCWhite);
            //volumeLabel.setHaloSize(dHaloSize);

            //Setup empty volume label class for when toggle is off
            //labelClassOff = ({
            //    minScale: minScaleForLabels,
            //    labelExpressionInfo: {expression: ""}
            //})
            //labelClassOff.symbol = volumeLabel;
        
            //Create a JSON object which contains the labeling properties. At the very least, specify which field to label using the labelExpressionInfo property. Other properties can also be specified such as whether to work with coded value domains, fieldinfos (if working with dates or number formatted fields, and even symbology if not specified as above)
            //labelClassOn = {
            //    minScale: minScaleForLabels,
            //    labelExpressionInfo: {expression: "$feature.LABEL"}
            //};
            //labelClassOn.symbol = volumeLabel;
            
            //Check box change events
            //dom.byId("chkLabels").onchange = function(isChecked) {
            //    parent.checkVolLabel();
            //};
            

            //setup click functionality
            //this.map.on('click', selectTAZ);

            //function pointToExtent(map, point, toleranceInPixel) {    
            //    var pixelWidth = parent.map.extent.getWidth() / parent.map.width;    
            //    var toleranceInMapCoords = toleranceInPixel * pixelWidth;    
            //    return new Extent(point.x - toleranceInMapCoords,    
            //        point.y - toleranceInMapCoords,    
            //        point.x + toleranceInMapCoords,    
            //        point.y + toleranceInMapCoords,    
            //        parent.map.spatialReference);    
            //}
            //
            ////Setup Function for Selecting Features
            //
            //function selectTAZ(evt) {
            //    console.log('selectFeatures');
            //        
            //        var query = new Query();    
            //        query.geometry = pointToExtent(parent.map, evt.mapPoint, iPixelSelectionTolerance);
            //        query.returnGeometry = false;
            //        query.outFields = ["*"];
            //        
            //        var tblqueryTaskTAZ = new QueryTask(lyrDispLayers[parent.getCurDispLayerLoc()].url);
            //        tblqueryTaskTAZ.execute(query,showTAZResults);
            //        
            //        //Segment search results
            //        function showTAZResults (results) {
            //            console.log('showTAZResults');
            //    
            //            var resultCount = results.features.length;
            //            if (resultCount>0) {
            //                //use first feature only
            //                var featureAttributes = results.features[0].attributes;
            //        }
            //    }
            //}
            //this.setLegendBar();
            //this.showLegend();

            var divRawOptions = dom.byId("divRawOptions");
            
            for (d in dRawOptions) {

                if (dRawOptions[d].value == sRawOption) {
                    bChecked = true;
                } else {
                    bChecked = false;
                }
                
                var rbRawOption = new RadioButton({ name:"RawOption", label:dRawOptions[d].label, id:"rb_RM_" + dRawOptions[d].value, value: dRawOptions[d].value, checked: bChecked});
                rbRawOption.startup();
                rbRawOption.placeAt(divRawOptions);
                
                var lblDOWPeak = dojo.create('label', {
                    innerHTML: dRawOptions[d].label,
                    for: rbRawOption.id
                }, divRawOptions);
                
                dojo.place("<br/>", divRawOptions);

                //Radio Buttons Change Event
                dom.byId("rb_RM_" + dRawOptions[d].value).onchange = function(isChecked) {
                    if(isChecked) {
                        curRawOption = this.value;
                        console.log('Radio button select: ' + curRawOption);
                        //rW.updateDisplay();
                    }
                }
            }
        },


        UpdateRawDisplayLayer: function() {
            console.log('UpdateRawDisplayLayer begin');

            tttRM.updateDisplay();

            var query, updateFeature;


            query = new Query();
            query.outFields = ["*"];
            query.returnGeometry = false;
            query.where = "FT_2019>="+ i;

            parent = this;

            lyrLinks.queryFeatures(query,function(featureSet) {
                //Update values
                var resultCount = featureSet.features.length;
                for (var i = 0; i < resultCount; i++) {
                    updateFeature = featureSet.features[i];
                    _linkID = updateFeature.attributes['LINKID']
                    //A: LinkID
                    //I: DY_VOL_2WY
                    _mainValue = 0;
                    _compValue = 0;
                    try {
                        _mainValue = dataRawModelMain.find(o => o.A === _linkID).I;
                        if (curScenarioComp!='none') {
                            try {
                                _compValue = dataRawModelComp.find(o => o.A === _linkID).I;
                                _displayValue = _mainValue - _compValue;
                            } catch(err) {
                            }
                        } else {
                            _displayValue = _mainValue;
                        }
                        updateFeature.attributes['SymbolNumber'] = _displayValue;
                        updateFeature.getLayer().applyEdits(null, [updateFeature], null);
                    } catch(err) {
                        updateFeature.attributes['SymbolNumber'] = 0;
                        updateFeature.getLayer().applyEdits(null, [updateFeature], null);
                    }
                } 
                console.log('UpdateRawDisplayLayer done');
            });
        },

        updateDisplay: function() {
            console.log('updateDisplay');
            
            var vcClassRenderer = new UniqueValueRenderer({
                type: "unique-value",    // autocasts as new UniqueValueRenderer()
                valueExpression: "var r = $feature.SymbolNumber;" +
                                 "if      (r==     0) { return 'class_0'; }" +
                                 "else if (r<   6000) { return 'class_1'; }" +
                                 "else if (r<  18000) { return 'class_2'; }" +
                                 "else if (r<  36000) { return 'class_3'; }" +
                                 "else if (r<  72000) { return 'class_4'; }" +
                                 "else if (r< 120000) { return 'class_5'; }" +
                                 "else if (r< 160000) { return 'class_6'; }" +
                                 "else if (r< 200000) { return 'class_7'; }" +
                                 "else if (r< 240000) { return 'class_8'; }" +
                                 "else if (r>=240000) { return 'class_9'; }",
                uniqueValueInfos: [{value:"class_0", label:         "No Volume", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCBertGrad0), 0.2)},
                                   {value:"class_1", label:   "Less than 6,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[0]), 0.7)},
                                   {value:"class_2", label:   "6,000 to 18,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[1]), 1.7)},
                                   {value:"class_3", label:  "18,000 to 36,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[2]), 2.7)},
                                   {value:"class_4", label:  "36,000 to 72,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[3]), 3.7)},
                                   {value:"class_5", label: "72,000 to 120,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[4]), 4.7)},
                                   {value:"class_6", label:"120,000 to 160,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[5]), 5.7)},
                                   {value:"class_7", label:"160,000 to 200,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[6]), 6.7)},
                                   {value:"class_8", label:"200,000 to 240,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[7]), 7.7)},
                                   {value:"class_9", label: "More than 240,000", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[8]), 8.7)}]
            });
            lyrLinks.setRenderer(vcClassRenderer);
            lyrLinks.refresh();
            lyrLinks.show();

        },

        numberWithCommas: function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },

        updateRenderer: function() {
            console.log('updateRenderer');

            if (typeof bindata !== 'undefined') {

                curLayer = this.getCurDispLayerLoc();
                curBin = sFNATOBinP + curArea

                //create renderer for display layers
                var defaultLine =    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCDefaultGrey), 1) 
                
                //initialize renderer with field name for current bin based on current area
                var _Rndr = new UniqueValueRenderer(null, curBin);
                            
                for (var i=0; i<bindata.length; i++) {
                    _Rndr.addValue({value: i,     symbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, defaultLine, Color.fromHex(bindata[i].Color)), label: bindata[i].Description});
                }
                if (curLayer >= 0) {
                    lyrDispLayers[curLayer].setRenderer(_Rndr);
                    lyrDispLayers[curLayer].setOpacity(0.65);
                    lyrDispLayers[curLayer].refresh();
                }
            }

        },
                
        setLegendBar: function() {
            console.log('setLegendBar');

            var _sLegend = 'Number of Daily Riders per Link'

            dom.byId("LegendName").innerHTML = _sLegend;

            if (typeof bertColorData !== 'undefined') {
                for (var i=0;i<bertColorData.length;i++)
                    dom.byId("divColor" + (i + 1).toString()).style.backgroundColor = bertColorData[i];
            }
        },

        showLegend: function(){
            console.log('showLegend');
            var pm = PanelManager.getInstance();
            var bOpen = false;
            
            //Close Legend Widget if open
            for (var p=0; p < pm.panels.length; p++) {
                if (pm.panels[p].label == "Legend") {
                    if (pm.panels[p].state != "closed") {
                        bOpen=true;
                        pm.closePanel(pm.panels[p]);
                    }
                }
            }
        
            if (!bOpen) {
                //pm.showPanel(this.appConfig.widgetOnScreen.widgets[WIDGETPOOLID_LEGEND]);
            }
        },

        checkVolLabel: function() {
            console.log('checkVolLabel');
            if (dom.byId("chkLabels").checked == true) {
                lyrLinks[this.getCurDispLayerLoc()].setLabelingInfo([ labelClassOn    ] );
            } else {
                lyrLinks[this.getCurDispLayerLoc()].setLabelingInfo([ labelClassOff ]);
            }
            
        },

        onOpen: function(){
            console.log('onOpen');
        },

        onClose: function(){
            //this.ClickClearButton();
            console.log('onClose');
        },

        onMinimize: function(){
            console.log('onMinimize');
        },

        onMaximize: function(){
            console.log('onMaximize');
        },

        onSignIn: function(credential){
            /* jshint unused:false*/
            console.log('onSignIn');
        },

        onSignOut: function(){
            console.log('onSignOut');
        },

        //added from Demo widget Setting.js
        setConfig: function(config){
            //this.textNode.value = config.districtfrom;
        var test = "";
        },

        getConfigFrom: function(){
            //WAB will get config object through this method
            return {
                //districtfrom: this.textNode.value
            };
        },

        //Receiving messages from other widgets
        onReceiveData: function(name, widgetId, data, historyData) {
            //filter out messages
            if(data.message=='rawmodel'){
                console.log('rawmodelupdate');
                tttRM.UpdateRawDisplayLayer();
            }
        },
    });
});