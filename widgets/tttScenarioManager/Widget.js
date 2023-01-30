//javascript for controlling Transit Ridership App
//written by Bill Hereth February 2022

var curScenarioMain = "id_37001244863cadd40e1b8f7.52642706";  //v9 Beta 2019
//var curScenarioComp = "id_112358168963ceca332cc148.76455495" //v9 2019 Observed
var curScenarioComp = "none";

var lastOpenedWidget = "none";

var lyrSegments;
//var curMasterNetworkLinks = "master20211115";
var curSegments = "Road and Transit Segments";

var minScaleForLabels = 87804;
var labelClassOn;
var labelClassOff;
var sCWhite = "#FFFFFF";
var dHaloSize = 2.0;

var bindata;

var tttSM;

var iPixelSelectionTolerance = 5;

var dataRawModelMain = [];
var dataRawModelComp = [];

var dataRoadMain;
var dataRoadComp;
var dataTransitModeMain;
var dataTransitModeComp;
var dataTransitRouteMain;
var dataTransitRouteComp;

var pm; // panel manager

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

var sCLaneGrad9 = "#000000"; //rgb(175,41,68)
var sCLaneGrad8 = "#222222"; //rgb(229,39,45)
var sCLaneGrad7 = "#800000"; //rgb(235,103,45)
var sCLaneGrad6 = "#FF0000"; //rgb(224,157,46)
var sCLaneGrad5 = "#66023C"; //rgb(141,195,72)
var sCLaneGrad4 = "#3c59ff"; //rgb(108,183,74)
var sCLaneGrad3 = "#86DC3D"; //rgb(0,167,78)
var sCLaneGrad2 = "#333333"; //rgb(27,169,230)
var sCLaneGrad1 = "#CCCCCC"; //rgb(49,57,138)

var sCVCGrad9 = "#000000"; //rgb(175,41,68)
var sCVCGrad8 = "#750227"; //rgb(229,39,45)
var sCVCGrad7 = "#AC131C"; //rgb(235,103,45)
var sCVCGrad6 = "#FF0D0D"; //rgb(224,157,46)
var sCVCGrad5 = "#FF0000"; //rgb(141,195,72)
var sCVCGrad4 = "#FD9A01"; //rgb(108,183,74)
var sCVCGrad3 = "#FEFB01"; //rgb(0,167,78)
var sCVCGrad2 = "#87FA00"; //rgb(27,169,230)
var sCVCGrad1 = "#00ED01"; //rgb(49,57,138)

var sCBertGrad0 = "#EEEEEE";

laneColorData = [sCLaneGrad1,sCLaneGrad2,sCLaneGrad3,sCLaneGrad4,sCLaneGrad5,sCLaneGrad6,sCLaneGrad7,sCLaneGrad8,sCLaneGrad9];
bertColorData = [sCBertGrad1,sCBertGrad2,sCBertGrad3,sCBertGrad4,sCBertGrad5,sCBertGrad6,sCBertGrad7,sCBertGrad8,sCBertGrad9];
vcColorData   = [sCVCGrad1,sCVCGrad2,sCVCGrad3,sCVCGrad4,sCVCGrad5,sCVCGrad6,sCVCGrad7,sCVCGrad8,sCVCGrad9];

//Typical Colors
var sCLightGrey     = "#EEEEEE";
var sCDefaultGrey   = "#CCCCCC";
var sCBlue1         = "#BED2FF";
var sCBlue2         = "#73B2FF";
var sCBlue3         = "#0070FF";
var sCBlue4         = "#005CE6";
var sCBlue5         = "#004DA8";
var sCRed1          = "#FFBEBE";
var sCRed2          = "#FF7F7F";
var sCRed3          = "#E60000";
var sCRed4          = "#730000";
var sCGreen1        = "#54ff00";
var sCGreen2        = "#4ce600";
var sCWhite         = "#ffffff";
var sSelectionColor = "#ffff00";//"#FF69B4"; //Hot Pink

var aCR_Change9  = new Array(sCBlue4,sCBlue3,sCBlue2,sCBlue1,sCDefaultGrey,sCRed1,sCRed2,sCRed3,sCRed4);

define(['dojo/_base/declare',
        'jimu/BaseWidget',
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
        'esri/layers/GraphicsLayer',
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
function(declare, BaseWidget, registry, dom, domStyle, dijit, Chart, Claro, Julie, SimpleTheme, Scatter, Markers, Columns, Legend, Tooltip, TableContainer, ScrollPane, ContentPane, PanelManager, TextBox, ToggleButton, LayerInfos, Query, QueryTask, GraphicsLayer, FeatureLayer, FeatureTable, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol, Font, LabelClass, InfoTemplate, Color, Map, UniqueValueRenderer, Extent, Memory, StoreSeries, Dialog, Button, RadioButton, MutliSelect, CheckedMultiSelect, Select, ComboBox, CheckBox, Observable) {
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

            tttSM = this;
            
            pm = PanelManager.getInstance();

            this.inherited(arguments);
            this.map.setInfoWindowOnClick(false); // turn off info window (popup) when clicking a feature
            
            //Widen the widget panel to provide more space for charts
            //var panel = this.getPanel();
            //var pos = panel.position;
            //pos.width = 500;
            //panel.setPosition(pos);
            //panel.panelManager.normalizePanel(panel);

            //when zoom finishes run changeZoomExtents to display
            this.map.on("zoom-end", function () {
                tttSM._updateDisplay();
            });
            
            //when pan finishes run changeZoomExtents to display
            this.map.on("pan-end", function () {
                tttSM._updateDisplay();
            });

            //Initialize Selection Layer, FromLayer, and ToLayer and define selection colors
            var layerInfosObject = LayerInfos.getInstanceSync();
            for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
                var currentLayerInfo = layerInfosObject._layerInfos[j];
                if (currentLayerInfo.title == curSegments) { //must mach layer title
                    console.log('Segment Layer Found')
                    lyrSegments = layerInfosObject._layerInfos[j].layerObject;
                } 
            }


            //Get Scenarios
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/scenarios.json",
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log('scenarios.json');
                    scenarios = obj;
                    cmbScenarioMain = new Select({
                        options: scenarios,
                        onChange: function() {
                            curScenarioMain = this.value;
                            tttSM.readInScenarioMainJSON();
                        }
                    }, "cmbScenarioMain");
                    cmbScenarioMain.startup();
                    cmbScenarioMain.set("value",curScenarioMain);

                    cmbScenarioComp = new Select({
                        options: scenarios,
                        onChange: function() {
                            curScenarioComp = this.value;
                            tttSM.readInScenarioCompJSON();
                        }
                    }, "cmbScenarioComp");
                    cmbScenarioComp.startup();
                    cmbScenarioComp.set("value",curScenarioComp);

                    //cW.initializeChart();
                },
                error: function(err) {
                        /* this will execute if the response couldn't be converted to a JS object,
                                or if the request was unsuccessful altogether. */
                }
            });
        },

        _updateDisplay: function() {
          tttSM.publishData({message: lastOpenedWidget});
        },

        readInScenarioMainJSON: function() {
            console.log('readInScenarioMainJSON');

            if (curScenarioMain=='none') {
                console.log('no scenario selected');
                return;
            }

            //Get roadscenariofile
            strRoadMain = (curScenarioMain).replace('id_', 'ss_') + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/segsummaries/" + strRoadMain,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strRoadMain);
                    dataRoadMain = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataRoadMain = [];
                    tttSM._updateDisplay();
                }
            });

            //Get transit mode file
            strTransitRouteMain = curScenarioMain + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/transitdetailbyroute/" + strTransitRouteMain,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strTransitRouteMain);
                    dataTransitRouteMain = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataTransitRouteMain = [];
                    tttSM._updateDisplay();
                }
            });

            //Get transit mode file
            strTransitModeMain = curScenarioMain + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/transitdetailbymode/" + strTransitModeMain,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strTransitModeMain);
                    dataTransitModeMain = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataTransitModeMain = [];
                    tttSM._updateDisplay();
                }
            });
        },

        readInScenarioCompJSON: function() {
            console.log('readInScenarioCompJSON');

            if (curScenarioMain=='none') {
                console.log('no compare scenario selected');
                return;
            }

            //Get roadscenariofile
            strRoadComp = (curScenarioComp).replace('id_', 'ss_') + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/segsummaries/" + strRoadComp,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strRoadComp);
                    dataRoadComp = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataRoadComp = [];
                    tttSM._updateDisplay();
                }
            });

            //Get transit mode file
            strTransitRouteComp = curScenarioComp + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/transitdetailbyroute/" + strTransitRouteComp,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strTransitRouteComp);
                    dataTransitRouteComp = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataTransitRouteComp = [];
                    tttSM._updateDisplay();
                }
            });

            //Get transit mode file
            strTransitModeComp = curScenarioComp + '.json';
            //Raw Model Data
            dojo.xhrGet({
                url: "widgets/tttScenarioManager/data/transitdetailbymode/" + strTransitModeComp,
                handleAs: "json",
                load: function(obj) {
                    /* here, obj will already be a JS object deserialized from the JSON response */
                    console.log(strTransitModeComp);
                    dataTransitModeComp = obj;
                    tttSM._updateDisplay();
                },
                error: function(err) {
                    dataTransitModeComp = [];
                    tttSM._updateDisplay();
                }
            });
        },

        numberWithCommas: function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        }

    });
});