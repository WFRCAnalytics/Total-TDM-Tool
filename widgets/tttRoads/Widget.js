//javascript for controlling Transit Ridership App
//written by Bill Hereth February 2022

var dRoadOptions = [
  {value:"Lanes" ,label:"Lanes"},
  {value:"Vol"   ,label:"Daily Volume (2-Way)"},
  {value:"AMSpd" ,label:"AM Period Speeds"},
  {value:"AMVC"  ,label:"AM Period V/C Ratio"},
  {value:"PMSpd" ,label:"PM Period Speeds"},
  {value:"PMVC"  ,label:"PM Period V/C Ratio"},
  {value:"VolTrk",label:"Daily Trucks"}
];

var dRoadPCOptions = [
  {value: "Abs" , label:"Absolute Change"},
  {value: "PC"  , label:"Percent Change"}
];

var curRoadOption       = "Vol";
var curRoadPCOption     = "Abs";

var minScaleForLabels = 87804;
var labelClassOn;
var labelClassOff;
var sCWhite = "#FFFFFF";
var dHaloSize = 2.0;

var bindata;
var dataFNConv;

var tttR;

var iPixelSelectionTolerance = 5;

var renderer_Vol_PC_Change;

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
  'esri/layers/GraphicsLayer',
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
  'esri/renderers/ClassBreaksRenderer',
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
function(declare, BaseWidget, LayerInfos, registry, dom, domStyle, dijit, Chart, Claro, Julie, SimpleTheme, Scatter, Markers, Columns, Legend, Tooltip, TableContainer, ScrollPane, ContentPane, PanelManager, TextBox, ToggleButton, LayerInfos, Query, QueryTask, GraphicsLayer, FeatureLayer, FeatureTable, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, TextSymbol, Font, LabelClass, InfoTemplate, Color, Map, ClassBreaksRenderer, UniqueValueRenderer, Extent, Memory, StoreSeries, Dialog, Button, RadioButton, MutliSelect, CheckedMultiSelect, Select, ComboBox, CheckBox, Observable) {
  //To create a widget, you need to derive from BaseWidget.
  
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-demo',

    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
      dom.byId("_7_panel").style.left = '55px'; // NEED TO FIND BETTER PLACE WHERE WIDGET IS CREATED RATHER THAN HERE
    },

    startup: function() {
      console.log('startup');

      tttR = this;
      
      this.inherited(arguments);
      //this.map.setInfoWindowOnClick(false); // turn off info window (popup) when clicking a feature

      //Daily Volume Renderers
      var aBrk_Vol_Absolute = new Array(
        {minValue:      0, maxValue:     5999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[0]), 0.50), label:   "Less than 6,000"},
        {minValue:   6000, maxValue:    17999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[1]), 1.10), label:   "6,000 to 18,000"},
        {minValue:  18000, maxValue:    35999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[2]), 1.70), label:  "18,000 to 36,000"},
        {minValue:  36000, maxValue:    71999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[3]), 2.30), label:  "36,000 to 72,000"},
        {minValue:  72000, maxValue:   119999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[4]), 3.90), label: "72,000 to 120,000"},
        {minValue: 120000, maxValue:   159999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[5]), 3.50), label:"120,000 to 160,000"},
        {minValue: 160000, maxValue:   199999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[6]), 4.10), label:"160,000 to 200,000"},
        {minValue: 200000, maxValue:   239999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[7]), 4.70), label:"200,000 to 240,000"},
        {minValue: 240000, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[8]), 5.30), label: "More than 240,000"}
      );
      renderer_Vol_Absolute = new ClassBreaksRenderer(null, 'Vol');
      for (var j=0;j<aBrk_Vol_Absolute.length;j++) {
        renderer_Vol_Absolute.addBreak(aBrk_Vol_Absolute[j]);
      }
      var aBrk_Vol_Change = new Array(
        {minValue: -9999999, maxValue:   -25001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000), label: "Less than -25,000"},
        {minValue:   -25000, maxValue:   -10001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 2.5000), label: "-25,000 to -10,000"},
        {minValue:   -10000, maxValue:    -5001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 1.2500), label: "-10,000 to -5,000"},
        {minValue:    -5000, maxValue:    -1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 0.6250), label: "-5,000 to -1,000"},
        {minValue:    -1000, maxValue:      999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.3125), label: "-1,000 to +1,000"},
        {minValue:     1000, maxValue:     4999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 0.6250), label: "+1,000 to +5,000"},
        {minValue:     5000, maxValue:     9999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 1.2500), label: "+5,000 to +10,000"},
        {minValue:    10000, maxValue:    49999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 2.5000), label: "+10,000 to +50,000"},
        {minValue:    50000, maxValue:    79999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 4.5000), label: "+50,000 to +75,000"},
        {minValue:    80000, maxValue:   119999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"), 5.0000), label: "+80,000 to +120,000"},
        {minValue:   120000, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"), 9.0000), label: "More than +120,000"}
      );
      renderer_Vol_Change = new ClassBreaksRenderer(null, 'Vol');
      for (var j=0;j<aBrk_Vol_Change.length;j++) {
        renderer_Vol_Change.addBreak(aBrk_Vol_Change[j]);
      }

      //Lanes Renderers
      var aBrk_Lanes_Absolute = new Array(
        {minValue:  1, maxValue:  3, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[0]), 0.50), label:"3 Lanes or Less" },
        {minValue:  4, maxValue:  5, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[1]), 1.25), label:"4 to 5 Lanes"    },
        {minValue:  6, maxValue:  7, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[2]), 2.00), label:"6 to 7 Lanes"    },
        {minValue:  8, maxValue:  9, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[3]), 2.75), label:"8 to 9 Lanes"    },
        {minValue: 10, maxValue: 11, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[4]), 3.50), label:"10 to 11 Lanes"  },
        {minValue: 12, maxValue: 13, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[5]), 4.25), label:"12 to 13 Lanes"  },
        {minValue: 14, maxValue: 15, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[6]), 5.00), label:"14 to 15 Lanes"  },
        {minValue: 16, maxValue: 17, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[7]), 5.75), label:"16 to 17 Lanes"  },
        {minValue: 18, maxValue: 99, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(laneColorData[8]), 6.50), label:"18 or More Lanes"}
      );
      renderer_Lanes_Absolute = new ClassBreaksRenderer(null, 'Lanes');
      for (var j=0;j<aBrk_Lanes_Absolute.length;j++) {
        renderer_Lanes_Absolute.addBreak(aBrk_Lanes_Absolute[j]);
      }
      var aBrk_Lanes_Change = new Array(
        {minValue: -99, maxValue: -4, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000), label: "-4 or More Lanes"},
        {minValue:  -3, maxValue: -3, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 3.7500), label: "-3 Lanes"        },
        {minValue:  -2, maxValue: -2, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 2.5000), label: "-2 Lanes"        },
        {minValue:  -1, maxValue: -1, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 1.2500), label: "-1 Lane"         },
        {minValue:   0, maxValue:  0, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.6250), label: "No Change"       },
        {minValue:   1, maxValue:  1, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 1.2500), label: "+1 Lane"         },
        {minValue:   2, maxValue:  2, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 2.5000), label: "+2 Lanes"        },
        {minValue:   3, maxValue:  3, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 3.7500), label: "+3 Lanes"        },
        {minValue:   4, maxValue: 99, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[8]), 5.0000), label: "+4 or More Lanes"}
      );
      renderer_Lanes_Change = new ClassBreaksRenderer(null, 'Lanes');
      for (var j=0;j<aBrk_Lanes_Change.length;j++) {
        renderer_Lanes_Change.addBreak(aBrk_Lanes_Change[j]);
      }

      //PM Speed Renderers
      var aBrk_Spd_Absolute = new Array(
        {minValue:  0, maxValue:       10, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[0]), 0.50), label:"Less than 10"},
        {minValue: 10, maxValue:       20, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[1]), 1.10), label:"10 to 20"    },
        {minValue: 20, maxValue:       30, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[2]), 1.70), label:"20 to 30"    },
        {minValue: 30, maxValue:       40, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[3]), 2.30), label:"30 to 40"    },
        {minValue: 40, maxValue:       50, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[4]), 3.90), label:"40 to 50"    },
        {minValue: 50, maxValue:       60, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[5]), 3.50), label:"50 to 60"    },
        {minValue: 60, maxValue:       70, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[6]), 4.10), label:"60 to 70"    },
        {minValue: 70, maxValue:       80, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[7]), 4.70), label:"70 to 80"    },
        {minValue: 80, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[8]), 5.30), label:"More than 80"}
      );
      renderer_AMSpd_Absolute = new ClassBreaksRenderer(null, 'AMSpd');
      for (var j=0;j<aBrk_Spd_Absolute.length;j++) {
        renderer_AMSpd_Absolute.addBreak(aBrk_Spd_Absolute[j]);
      }
      renderer_PMSpd_Absolute = new ClassBreaksRenderer(null, 'PMSpd');
      for (var j=0;j<aBrk_Spd_Absolute.length;j++) {
        renderer_PMSpd_Absolute.addBreak(aBrk_Spd_Absolute[j]);
      }
      var aBrk_Spd_Change = new Array(
        {minValue: -999, maxValue:      -30, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000), label: "Less than -30" },
        {minValue:  -30, maxValue:      -20, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 2.5000), label: "-30 to -20"    },
        {minValue:  -20, maxValue:      -10, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 1.2500), label: "-20 to -10"    },
        {minValue:  -10, maxValue:       -5, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 0.6250), label: "-10 to -5"     },
        {minValue:   -5, maxValue:        5, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.3125), label: "-5 to +5"       },
        {minValue:    5, maxValue:       10, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 0.6250), label: "+5 to +10"       },
        {minValue:   10, maxValue:       20, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 1.2500), label: "+10 to +20"      },
        {minValue:   20, maxValue:       30, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 2.5000), label: "+20 to +30"      },
        {minValue:   30, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[8]), 5.0000), label: "More than +30"  }
      );
      renderer_AMSpd_Change = new ClassBreaksRenderer(null, 'AMSpd');
      for (var j=0;j<aBrk_Spd_Change.length;j++) {
        renderer_AMSpd_Change.addBreak(aBrk_Spd_Change[j]);
      }
      renderer_PMSpd_Change = new ClassBreaksRenderer(null, 'PMSpd');
      for (var j=0;j<aBrk_Spd_Change.length;j++) {
        renderer_PMSpd_Change.addBreak(aBrk_Spd_Change[j]);
      }

      //PM V/C Renderers
      var aBrk_VC_Absolute = new Array(
        {minValue: 0.00, maxValue:     0.49, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[0]), 0.50), label: "Less than 0.50"},
        {minValue: 0.50, maxValue:     0.74, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[1]), 1.10), label: "0.50 to 0.74"  },
        {minValue: 0.75, maxValue:     0.84, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[2]), 1.70), label: "0.75 to 0.85"  },
        {minValue: 0.85, maxValue:     0.94, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[3]), 2.30), label: "0.85 to 0.95"  },
        {minValue: 0.95, maxValue:     0.99, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[4]), 3.90), label: "0.95 to 1.00"  },
        {minValue: 1.00, maxValue:     1.24, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[5]), 3.50), label: "1.00 to 1.25"  },
        {minValue: 1.25, maxValue:     1.49, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[6]), 4.10), label: "1.25 to 1.50"  },
        {minValue: 1.50, maxValue:     1.99, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[7]), 4.70), label: "1.50 to 2.00"  },
        {minValue: 2.00, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(vcColorData[8]), 5.30), label: "More than 2.00"}
      );
      renderer_AMVC_Absolute = new ClassBreaksRenderer(null, 'AMVC');
      for (var j=0;j<aBrk_VC_Absolute.length;j++) {
        renderer_AMVC_Absolute.addBreak(aBrk_VC_Absolute[j]);
      }
      renderer_PMVC_Absolute = new ClassBreaksRenderer(null, 'PMVC');
      for (var j=0;j<aBrk_VC_Absolute.length;j++) {
        renderer_PMVC_Absolute.addBreak(aBrk_VC_Absolute[j]);
      }
      var aBrk_VC_Change = new Array(
        {minValue: -999999, maxValue:    -0.51, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000), label: "Less than -0.50"},
        {minValue:   -0.50, maxValue:    -0.26, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 2.5000), label: "-0.50 to -0.25" },
        {minValue:   -0.25, maxValue:    -0.11, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 1.2500), label: "-0.25 to -0.10" },
        {minValue:   -0.10, maxValue:    -0.06, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 0.6250), label: "-0.10 to -0.05" },
        {minValue:   -0.05, maxValue:     0.05, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.3125), label: "-0.05 to +0.05"  },
        {minValue:    0.05, maxValue:     0.09, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 0.6250), label: "+0.05 to +0.10"   },
        {minValue:    0.10, maxValue:     0.24, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 1.2500), label: "+0.10 to +0.25"   },
        {minValue:    0.25, maxValue:     0.49, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 2.5000), label: "+0.25 to +0.50"   },
        {minValue:    0.50, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[8]), 5.0000), label: "More than +0.50" }
      );
      renderer_AMVC_Change = new ClassBreaksRenderer(null, 'AMVC');
      for (var j=0;j<aBrk_VC_Change.length;j++) {
        renderer_AMVC_Change.addBreak(aBrk_VC_Change[j]);
      }
      renderer_PMVC_Change = new ClassBreaksRenderer(null, 'PMVC');
      for (var j=0;j<aBrk_VC_Change.length;j++) {
        renderer_PMVC_Change.addBreak(aBrk_VC_Change[j]);
      }

      //Truck Volume Renderers
      var aBrk_VolTrk_Absolute = new Array(
        {minValue:     0, maxValue:      599, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[0]), 0.50), label: "Less than 600"   },
        {minValue:   600, maxValue:     1799, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[1]), 1.10), label: "600 to 1,800"    },
        {minValue:  1800, maxValue:     3599, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[2]), 1.70), label: "1,800 to 3,600"  },
        {minValue:  3600, maxValue:     7199, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[3]), 2.30), label: "3,600 to 7,200"  },
        {minValue:  7200, maxValue:    11999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[4]), 3.90), label: "7,200 to 12,000" },
        {minValue: 12000, maxValue:    15999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[5]), 3.50), label: "12,000 to 16,000"},
        {minValue: 16000, maxValue:    19999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[6]), 4.10), label: "16,000 to 20,000"},
        {minValue: 20000, maxValue:    23999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[7]), 4.70), label: "20,000 to 24,000"},
        {minValue: 24000, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(bertColorData[8]), 5.30), label: "More than 24,000"}
      );
      renderer_VolTrk_Absolute = new ClassBreaksRenderer(null, 'VolTrk');
      for (var j=0;j<aBrk_VolTrk_Absolute.length;j++) {
        renderer_VolTrk_Absolute.addBreak(aBrk_VolTrk_Absolute[j]);
      }
      var aBrk_TrkVol_Change = new Array(
        {minValue: -999999, maxValue:    -2501, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000), label: "Less than -2,500"},
        {minValue:   -2500, maxValue:    -1001, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 2.5000), label: "-2,500 to -1,000"},
        {minValue:   -1000, maxValue:     -501, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 1.2500), label: "-1,000 than -500"},
        {minValue:    -500, maxValue:     -101, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 0.6250), label: "-500 to -100"    },
        {minValue:    -100, maxValue:       99, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.3125), label: "-100 to +100"     },
        {minValue:     100, maxValue:      499, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 0.6250), label: "+100 to +500"      },
        {minValue:     500, maxValue:      999, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 1.2500), label: "+500 to +1,000"    },
        {minValue:    1000, maxValue:     2499, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 2.5000), label: "+1,000 to +2,500"  },
        {minValue:    2500, maxValue: Infinity, symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[8]), 5.0000), label: "More than +2,500" }
      );
      renderer_VolTrk_Change = new ClassBreaksRenderer(null, 'VolTrk');
      for (var j=0;j<aBrk_TrkVol_Change.length;j++) {
        renderer_VolTrk_Change.addBreak(aBrk_TrkVol_Change[j]);
      }
      

      dojo.xhrGet({
        url: "widgets/tttScenarioManager/data/segsummaries/_config_segsummary_fieldname_conversion.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('_config_segsummary_fieldname_conversion.json');
            dataFNConv = obj;
        },
        error: function(err) {
                /* this will execute if the response couldn't be converted to a JS object,
                        or if the request was unsuccessful altogether. */
        }
      });

      // create radio button option between absolute and percentage change
      var divRoadPCOptions = dom.byId("divRoadPCOptions");

      for (d in dRoadPCOptions) {

        if (dRoadPCOptions[d].value == curRoadPCOption) {
          b2Checked = true;
        } else {
          b2Checked = false;
        }
        
        var rbRoadPCOption = new RadioButton({ name:"RoadPCOption", label:dRoadPCOptions[d].label, id:"rb_" + dRoadPCOptions[d].value, value: dRoadPCOptions[d].value, checked: b2Checked});
        rbRoadPCOption.startup();
        rbRoadPCOption.placeAt(divRoadPCOptions);
        
        dojo.create('label', {
          innerHTML: dRoadPCOptions[d].label,
          for: rbRoadPCOption.id
        }, divRoadPCOptions);
        
        dojo.place("<br/>", divRoadPCOptions);

        //Radio Buttons Change Event
        dom.byId("rb_" + dRoadPCOptions[d].value).onchange = function(isChecked) {
          if(isChecked) {
            curRoadPCOption = this.value;
            console.log('Radio button select: ' + curRoadPCOption);
            tttR.updateRoadDisplay();
          }
        }
      }

      // create radio button option between which attributes to show
      var divRoadOptions = dom.byId("divRoadOptions");
      
      for (d in dRoadOptions) {

        if (dRoadOptions[d].value == curRoadOption) {
          bChecked = true;
        } else {
          bChecked = false;
        }
        
        var rbRoadOption = new RadioButton({ name:"RoadOption", label:dRoadOptions[d].label, id:"rb_" + dRoadOptions[d].value, value: dRoadOptions[d].value, checked: bChecked});
        rbRoadOption.startup();
        rbRoadOption.placeAt(divRoadOptions);
        
        dojo.create('label', {
          innerHTML: dRoadOptions[d].label,
          for: rbRoadOption.id
        }, divRoadOptions);
        
        dojo.place("<br/>", divRoadOptions);

        //Radio Buttons Change Event
        dom.byId("rb_" + dRoadOptions[d].value).onchange = function(isChecked) {
          if(isChecked) {
            curRoadOption = this.value;
            console.log('Radio button select: ' + curRoadOption);
            tttR.updateRoadDisplay();
          }
        }
      }

      tttR.updateRoadDisplay();
    },

    updateRoadDisplay: function() {
      console.log('updateRoadDisplay');

      if (curScenarioComp=='none') {
        if (curRoadOption=='Vol') {
          _renderer_road = renderer_Vol_Absolute;
        } else if (curRoadOption=='AMSpd') {
          _renderer_road = renderer_AMSpd_Absolute;
        } else if (curRoadOption=='AMVC') {
          _renderer_road = renderer_AMVC_Absolute;
        } else if (curRoadOption=='Lanes') {
          _renderer_road = renderer_Lanes_Absolute;
        }else if (curRoadOption=='PMSpd') {
          _renderer_road = renderer_PMSpd_Absolute;
        } else if (curRoadOption=='PMVC') {
          _renderer_road = renderer_PMVC_Absolute;
        } else if (curRoadOption=='VolTrk') {
          _renderer_road = renderer_VolTrk_Absolute;
        }
      } else {
          if (curRoadPCOption=='Abs') {
            if (curRoadOption=='Vol') {
              _renderer_road = renderer_Vol_Change;
            } else if (curRoadOption=='AMSpd') {
              _renderer_road = renderer_AMSpd_Change;
            } else if (curRoadOption=='AMVC') {
              _renderer_road = renderer_AMVC_Change;
            } else if (curRoadOption=='Lanes') {
              _renderer_road = renderer_Lanes_Change;
            }else if (curRoadOption=='PMSpd') {
              _renderer_road = renderer_PMSpd_Change;
            } else if (curRoadOption=='PMVC') {
              _renderer_road = renderer_PMVC_Change;
            } else if (curRoadOption=='VolTrk') {
              _renderer_road = renderer_VolTrk_Change;
            }
          } else {
            if (curRoadOption=='Vol') {
              _renderer_road = tttR.getPercentChangeRenderer('Vol');
            } else if (curRoadOption=='AMSpd') {
              _renderer_road = tttR.getPercentChangeRenderer('AMSpd');
            } else if (curRoadOption=='AMVC') {
              _renderer_road = tttR.getPercentChangeRenderer('AMVC');
            } else if (curRoadOption=='Lanes') {
              _renderer_road = tttR.getPercentChangeRenderer('Lanes');
            }else if (curRoadOption=='PMSpd') {
              _renderer_road = tttR.getPercentChangeRenderer('PMSpd');
            } else if (curRoadOption=='PMVC') {
              _renderer_road = tttR.getPercentChangeRenderer('PMVC');
            } else if (curRoadOption=='VolTrk') {
              _renderer_road = tttR.getPercentChangeRenderer('VolTrk');
            }
          }
      }

      // divider seg
      strMiddleSeg1 = '2102_003.0';
      strMiddleSeg2 = 'MAG_6018';

      // clear all graphics
      tttR.map.graphics.clear();

      // run multiple times to avoid 2000 limit on returned features
      tttR._queryFeatures("SEGID <= '" + strMiddleSeg1 + "'");
      tttR._queryFeatures("SEGID  > '" + strMiddleSeg1 + "' AND SEGID <= '" + strMiddleSeg2 + "'");
      tttR._queryFeatures("SEGID  > '" + strMiddleSeg2 + "'");
    },

    _queryFeatures: function(_filterstring){ 

      var query, updateFeature;
      query = new Query();
      query.outFields = ["*"];
      query.returnGeometry = false;
      //query.where = "1=1";
      query.where = _filterstring

      
      lyrSegments.queryFeatures(query,function(featureSet) {
        //Update values
        var resultCount = featureSet.features.length;
        for (var i = 0; i < resultCount; i++) {
          updateFeature = featureSet.features[i];
          _segid = updateFeature.attributes['SEGID']
          //A: SEGID
          //I: DY_VOL_2WY

          _mainValue_Vol       = 0;
          _mainValue_Lanes     = 0;
          _mainValue_Lanes1    = 0;
          _mainValue_Lanes2    = 0;
          _mainValue_AMSpd     = 0;
          _mainValue_AMSpd1    = 0;
          _mainValue_AMSpd2    = 0;
          _mainValue_AMVC      = 0;
          _mainValue_AMVC1     = 0;
          _mainValue_AMVC2     = 0;
          _mainValue_PMSpd     = 0;
          _mainValue_PMSpd1    = 0;
          _mainValue_PMSpd2    = 0;
          _mainValue_PMVC      = 0;
          _mainValue_PMVC1     = 0;
          _mainValue_PMVC2     = 0;
          _mainValue_VolTrk    = 0;
          _compValue_Vol       = 0;
          _compValue_Lanes     = 0;
          _compValue_Lanes1    = 0;
          _compValue_Lanes2    = 0;
          _compValue_AMSpd     = 0;
          _compValue_AMSpd1    = 0;
          _compValue_AMSpd2    = 0;
          _compValue_AMVC      = 0;
          _compValue_AMVC1     = 0;
          _compValue_AMVC2     = 0;
          _compValue_PMSpd     = 0;
          _compValue_PMSpd1    = 0;
          _compValue_PMSpd2    = 0;
          _compValue_PMVC      = 0;
          _compValue_PMVC1     = 0;
          _compValue_PMVC2     = 0;
          _compValue_VolTrk    = 0;
          _dispValue_Vol       = 0;
          _dispValue_Lanes     = 0;
          _compValue_Lanes1    = 0;
          _compValue_Lanes2    = 0;
          _dispValue_AMSpd     = 0;
          _dispValue_AMSpd1    = 0;
          _dispValue_AMSpd2    = 0;
          _dispValue_AMVC      = 0;
          _dispValue_AMVC1     = 0;
          _dispValue_AMVC2     = 0;
          _dispValue_PMSpd     = 0;
          _dispValue_PMSpd1    = 0;
          _dispValue_PMSpd2    = 0;
          _dispValue_PMVC      = 0;
          _dispValue_PMVC1     = 0;
          _dispValue_PMVC2     = 0;
          _dispValue_VolTrk    = 0;

          try {
            _mainValue_Vol      = dataRoadMain[_segid][dataFNConv['DY_VOL'  ]];
            _mainValue_Lanes    = dataRoadMain[_segid][dataFNConv['LANES'   ]];
            _mainValue_Lanes1   = dataRoadMain[_segid][dataFNConv['D1_LANES']];
            _mainValue_Lanes2   = dataRoadMain[_segid][dataFNConv['D2_LANES']];

            if (dataRoadMain[_segid][dataFNConv['D1_LANES']]>0) {

              _mainValue_AMSpd1 = dataRoadMain[_segid][dataFNConv['D1_AM_SPD']];
              _mainValue_AMVC1  = dataRoadMain[_segid][dataFNConv['D1_AM_VOL']] / (3 * dataRoadMain[_segid][dataFNConv['D1_LANES']] * dataRoadMain[_segid][dataFNConv['D1_CAP1HL']]);

              _mainValue_PMSpd1 = dataRoadMain[_segid][dataFNConv['D1_PM_SPD']];
              _mainValue_PMVC1  = dataRoadMain[_segid][dataFNConv['D1_PM_VOL']] / (3 * dataRoadMain[_segid][dataFNConv['D1_LANES']] * dataRoadMain[_segid][dataFNConv['D1_CAP1HL']]);

              if (dataRoadMain[_segid][dataFNConv['D2_LANES']]>0) {

                _mainValue_AMSpd2 = dataRoadMain[_segid][dataFNConv['D2_AM_SPD']];
                _mainValue_AMVC2  = dataRoadMain[_segid][dataFNConv['D2_AM_VOL']] / (3 * dataRoadMain[_segid][dataFNConv['D2_LANES']] * dataRoadMain[_segid][dataFNConv['D2_CAP1HL']]);

                _mainValue_PMSpd2 = dataRoadMain[_segid][dataFNConv['D2_PM_SPD']];
                _mainValue_PMVC2  = dataRoadMain[_segid][dataFNConv['D2_PM_VOL']] / (3 * dataRoadMain[_segid][dataFNConv['D2_LANES']] * dataRoadMain[_segid][dataFNConv['D2_CAP1HL']]);
  
                _mainValue_AMSpd  = Math.min(_mainValue_AMSpd1, _mainValue_AMSpd2)
                _mainValue_AMVC   = Math.max(_mainValue_AMVC1 , _mainValue_AMVC2 )
                
                _mainValue_PMSpd  = Math.min(_mainValue_PMSpd1, _mainValue_PMSpd2)
                _mainValue_PMVC   = Math.max(_mainValue_PMVC1 , _mainValue_PMVC2 )
  
              } else {
                _mainValue_PMSpd  = _mainValue_PMSpd1;
                _mainValue_PMVC   = _mainValue_PMVC1;
              }
            } else {
              _mainValue_PMSpd  = null;
              _mainValue_PMVC   = null;
            }

            _mainValue_VolTrk = dataRoadMain[_segid][dataFNConv['DY_LT']] + dataRoadMain[_segid][dataFNConv['DY_MD']] + dataRoadMain[_segid][dataFNConv['DY_HV']];

            if (curScenarioComp!='none') {
              try {
                _compValue_Vol      = dataRoadComp[_segid][dataFNConv['DY_VOL']];
                _compValue_Lanes    = dataRoadComp[_segid][dataFNConv['LANES' ]];

                _mainValue_Lanes1   = dataRoadComp[_segid][dataFNConv['D1_LANES']];
                _mainValue_Lanes2   = dataRoadComp[_segid][dataFNConv['D2_LANES']];
                _ft = dataRoadComp[_segid][dataFNConv['FT']];
    
                if (dataRoadComp[_segid][dataFNConv['D1_LANES']]>0) {

                  _compValue_AMSpd1 = dataRoadComp[_segid][dataFNConv['D1_AM_SPD']];
                  _compValue_AMVC1  = dataRoadComp[_segid][dataFNConv['D1_AM_VOL']] / (3 * dataRoadComp[_segid][dataFNConv['D1_LANES']] * dataRoadComp[_segid][dataFNConv['D1_CAP1HL']]);
    
                  _compValue_PMSpd1 = dataRoadComp[_segid][dataFNConv['D1_PM_SPD']];
                  _compValue_PMVC1  = dataRoadComp[_segid][dataFNConv['D1_PM_VOL']] / (3 * dataRoadComp[_segid][dataFNConv['D1_LANES']] * dataRoadComp[_segid][dataFNConv['D1_CAP1HL']]);
    
                  if (dataRoadComp[_segid][dataFNConv['D2_LANES']]>0) {

                    _compValue_AMSpd2 = dataRoadComp[_segid][dataFNConv['D2_AM_SPD']];
                    _compValue_AMVC2  = dataRoadComp[_segid][dataFNConv['D2_AM_VOL']] / (3 * dataRoadComp[_segid][dataFNConv['D2_LANES']] * dataRoadComp[_segid][dataFNConv['D2_CAP1HL']]);

                    _compValue_PMSpd2 = dataRoadComp[_segid][dataFNConv['D2_PM_SPD']];
                    _compValue_PMVC2  = dataRoadComp[_segid][dataFNConv['D2_PM_VOL']] / (3 * dataRoadComp[_segid][dataFNConv['D2_LANES']] * dataRoadComp[_segid][dataFNConv['D2_CAP1HL']]);
      
                    _compValue_AMSpd  = Math.min(_compValue_AMSpd1, _compValue_AMSpd2)
                    _compValue_AMVC   = Math.max(_compValue_AMVC1 , _compValue_AMVC2 )

                    _compValue_PMSpd  = Math.min(_compValue_PMSpd1, _compValue_PMSpd2)
                    _compValue_PMVC   = Math.max(_compValue_PMVC1 , _compValue_PMVC2 )
      
                  } else {
                    _compValue_PMSpd  = _compValue_PMSpd1;
                    _compValue_PMVC   = _compValue_PMVC1;
                  }
                } else {
                  _compValue_PMSpd  = 0;
                  _compValue_PMVC   = 0;
                }

                _compValue_VolTrk = dataRoadComp[_segid][dataFNConv['DY_LT']] + dataRoadComp[_segid][dataFNConv['DY_MD']] + dataRoadComp[_segid][dataFNConv['DY_HV']];

                
                if (curRoadPCOption=='Abs') {
                  _dispValue_Vol       = _mainValue_Vol    - _compValue_Vol   ;
                  _dispValue_Lanes     = _mainValue_Lanes  - _compValue_Lanes ;
                  _dispValue_Lanes1    = _mainValue_Lanes1 - _compValue_Lanes1;
                  _dispValue_Lanes2    = _mainValue_Lanes2 - _compValue_Lanes2;
                  _dispValue_AMSpd     = _mainValue_AMSpd  - _compValue_AMSpd ;
                  _dispValue_AMSpd1    = _mainValue_AMSpd1 - _compValue_AMSpd1;
                  _dispValue_AMSpd2    = _mainValue_AMSpd2 - _compValue_AMSpd2;
                  _dispValue_AMVC      = _mainValue_AMVC   - _compValue_AMVC  ;
                  _dispValue_AMVC1     = _mainValue_AMVC1  - _compValue_AMVC1 ;
                  _dispValue_AMVC2     = _mainValue_AMVC2  - _compValue_AMVC2 ;
                  _dispValue_PMSpd     = _mainValue_PMSpd  - _compValue_PMSpd ;
                  _dispValue_PMSpd1    = _mainValue_PMSpd1 - _compValue_PMSpd1;
                  _dispValue_PMSpd2    = _mainValue_PMSpd2 - _compValue_PMSpd2;
                  _dispValue_PMVC      = _mainValue_PMVC   - _compValue_PMVC  ;
                  _dispValue_PMVC1     = _mainValue_PMVC1  - _compValue_PMVC1 ;
                  _dispValue_PMVC2     = _mainValue_PMVC2  - _compValue_PMVC2 ;
                  _dispValue_VolTrk    = _mainValue_VolTrk - _compValue_VolTrk;
                } else{
                  if (_compValue_Vol   >0) _dispValue_Vol       = ((_mainValue_Vol    - _compValue_Vol   ) / _compValue_Vol   ) * 100;
                  if (_compValue_Lanes >0) _dispValue_Lanes     = ((_mainValue_Lanes  - _compValue_Lanes ) / _compValue_Lanes ) * 100;
                  if (_compValue_Lanes1>0) _dispValue_Lanes1    = ((_mainValue_Lanes1 - _compValue_Lanes1) / _compValue_Lanes1) * 100;
                  if (_compValue_Lanes2>0) _dispValue_Lanes2    = ((_mainValue_Lanes2 - _compValue_Lanes2) / _compValue_Lanes2) * 100;
                  if (_compValue_AMSpd >0) _dispValue_AMSpd     = ((_mainValue_AMSpd  - _compValue_AMSpd ) / _compValue_AMSpd ) * 100;
                  if (_compValue_AMSpd1>0) _dispValue_AMSpd1    = ((_mainValue_AMSpd1 - _compValue_AMSpd1) / _compValue_AMSpd1) * 100;
                  if (_compValue_AMSpd2>0) _dispValue_AMSpd2    = ((_mainValue_AMSpd2 - _compValue_AMSpd2) / _compValue_AMSpd2) * 100;
                  if (_compValue_AMVC  >0) _dispValue_AMVC      = ((_mainValue_AMVC   - _compValue_AMVC  ) / _compValue_AMVC  ) * 100;
                  if (_compValue_AMVC1 >0) _dispValue_AMVC1     = ((_mainValue_AMVC1  - _compValue_AMVC1 ) / _compValue_AMVC1 ) * 100;
                  if (_compValue_AMVC2 >0) _dispValue_AMVC2     = ((_mainValue_AMVC2  - _compValue_AMVC2 ) / _compValue_AMVC2 ) * 100;
                  if (_compValue_PMSpd >0) _dispValue_PMSpd     = ((_mainValue_PMSpd  - _compValue_PMSpd ) / _compValue_PMSpd ) * 100;
                  if (_compValue_PMSpd1>0) _dispValue_PMSpd1    = ((_mainValue_PMSpd1 - _compValue_PMSpd1) / _compValue_PMSpd1) * 100;
                  if (_compValue_PMSpd2>0) _dispValue_PMSpd2    = ((_mainValue_PMSpd2 - _compValue_PMSpd2) / _compValue_PMSpd2) * 100;
                  if (_compValue_PMVC  >0) _dispValue_PMVC      = ((_mainValue_PMVC   - _compValue_PMVC  ) / _compValue_PMVC  ) * 100;
                  if (_compValue_PMVC1 >0) _dispValue_PMVC1     = ((_mainValue_PMVC1  - _compValue_PMVC1 ) / _compValue_PMVC1 ) * 100;
                  if (_compValue_PMVC2 >0) _dispValue_PMVC2     = ((_mainValue_PMVC2  - _compValue_PMVC2 ) / _compValue_PMVC2 ) * 100;
                  if (_compValue_VolTrk>0) _dispValue_VolTrk    = ((_mainValue_VolTrk - _compValue_VolTrk) / _compValue_VolTrk) * 100;
                }

              } catch(err) {
                _dispValue_Vol       = _mainValue_Vol   ;
                _dispValue_Lanes     = _mainValue_Lanes ;
                _dispValue_Lanes1    = _mainValue_Lanes1;
                _dispValue_Lanes2    = _mainValue_Lanes2;
                _dispValue_AMSpd     = _mainValue_AMSpd ;
                _dispValue_AMSpd1    = _mainValue_AMSpd1;
                _dispValue_AMSpd2    = _mainValue_AMSpd2;
                _dispValue_AMVC      = _mainValue_AMVC  ;
                _dispValue_AMVC1     = _mainValue_AMVC1 ;
                _dispValue_AMVC2     = _mainValue_AMVC2 ;
                _dispValue_PMSpd     = _mainValue_PMSpd ;
                _dispValue_PMSpd1    = _mainValue_PMSpd1;
                _dispValue_PMSpd2    = _mainValue_PMSpd2;
                _dispValue_PMVC      = _mainValue_PMVC  ;
                _dispValue_PMVC1     = _mainValue_PMVC1 ;
                _dispValue_PMVC2     = _mainValue_PMVC2 ;
                _dispValue_VolTrk    = _mainValue_VolTrk;
              }
            } else {
              _dispValue_Vol       = _mainValue_Vol   ;
              _dispValue_Lanes     = _mainValue_Lanes ;
              _dispValue_Lanes1    = _mainValue_Lanes1;
              _dispValue_Lanes2    = _mainValue_Lanes2;
              _dispValue_AMSpd     = _mainValue_AMSpd ;
              _dispValue_AMSpd1    = _mainValue_AMSpd1;
              _dispValue_AMSpd2    = _mainValue_AMSpd2;
              _dispValue_AMVC      = _mainValue_AMVC  ;
              _dispValue_AMVC1     = _mainValue_AMVC1 ;
              _dispValue_AMVC2     = _mainValue_AMVC2 ;
              _dispValue_PMSpd     = _mainValue_PMSpd ;
              _dispValue_PMSpd1    = _mainValue_PMSpd1;
              _dispValue_PMSpd2    = _mainValue_PMSpd2;
              _dispValue_PMVC      = _mainValue_PMVC  ;
              _dispValue_PMVC1     = _mainValue_PMVC1 ;
              _dispValue_PMVC2     = _mainValue_PMVC2 ;
              _dispValue_VolTrk    = _mainValue_VolTrk;
            }
            
            updateFeature.attributes['Vol'   ] = _dispValue_Vol   ;
            updateFeature.attributes['Lanes' ] = _dispValue_Lanes ;
            updateFeature.attributes['Lanes1'] = _dispValue_Lanes1;
            updateFeature.attributes['Lanes2'] = _dispValue_Lanes2;
            updateFeature.attributes['AMSpd' ] = _dispValue_AMSpd ;
            updateFeature.attributes['AMSpd1'] = _dispValue_AMSpd1;
            updateFeature.attributes['AMSpd2'] = _dispValue_AMSpd2;
            updateFeature.attributes['AMVC'  ] = _dispValue_AMVC  ;
            updateFeature.attributes['AMVC1' ] = _dispValue_AMVC1 ;
            updateFeature.attributes['AMVC2' ] = _dispValue_AMVC2 ;
            updateFeature.attributes['PMSpd' ] = _dispValue_PMSpd ;
            updateFeature.attributes['PMSpd1'] = _dispValue_PMSpd1;
            updateFeature.attributes['PMSpd2'] = _dispValue_PMSpd2;
            updateFeature.attributes['PMVC'  ] = _dispValue_PMVC  ;
            updateFeature.attributes['PMVC1' ] = _dispValue_PMVC1 ;
            updateFeature.attributes['PMVC2' ] = _dispValue_PMVC2 ;
            updateFeature.attributes['VolTrk'] = _dispValue_VolTrk;
            updateFeature.attributes['FT']     = _ft              ;
            
            tttR.map.graphics.add(updateFeature);

          }
          catch(err) {
            updateFeature.attributes['Vol'   ] = null;
            updateFeature.attributes['Lanes' ] = null;
            updateFeature.attributes['Lanes1'] = null;
            updateFeature.attributes['Lanes2'] = null;
            updateFeature.attributes['AMSpd' ] = null;
            updateFeature.attributes['AMSpd1'] = null;
            updateFeature.attributes['AMSpd2'] = null;
            updateFeature.attributes['AMVC'  ] = null;
            updateFeature.attributes['AMVC1' ] = null;
            updateFeature.attributes['AMVC2' ] = null;
            updateFeature.attributes['PMSpd' ] = null;
            updateFeature.attributes['PMSpd1'] = null;
            updateFeature.attributes['PMSpd2'] = null;
            updateFeature.attributes['PMVC'  ] = null;
            updateFeature.attributes['PMVC1' ] = null;
            updateFeature.attributes['PMVC2' ] = null;
            updateFeature.attributes['VolTrk'] = null;
          }
        }

        lyrSegments.setRenderer(_renderer_road);

        tttR.map.graphics.setRenderer(_renderer_road);
        tttR.map.graphics.refresh();

      });

      //lyrSegments.show();

    },

    getPercentChangeRenderer: function(featureName) {
      renderer_PC_Change = new UniqueValueRenderer({
        type: "unique-value",  // autocasts as new UniqueValueRenderer()
        valueExpression: "var p = $feature." + featureName + ";" +
                         "var ft = $feature.FT;" +
                         "if      (p< -200 && ft>= 20)              { return 'class_f1' ; }" +
                         "else if ((p< -40 && p>= -200) && ft>= 20) { return 'class_f2' ; }" +
                         "else if ((p< -20 && p>= -40)  && ft>= 20) { return 'class_f3' ; }" +
                         "else if ((p< -5  && p>= -20)  && ft>= 20) { return 'class_f4' ; }" +
                         "else if ((p< 5   && p>= -5)   && ft>= 20) { return 'class_f5' ; }" +
                         "else if ((p< 20  && p>= 5)    && ft>= 20) { return 'class_f6' ; }" +
                         "else if ((p< 40  && p>= 20)   && ft>= 20) { return 'class_f7' ; }" +
                         "else if ((p< 100 && p>= 40)   && ft>= 20) { return 'class_f8' ; }" +
                         "else if ((p< 200 && p>= 100)  && ft>= 20) { return 'class_f9' ; }" +
                         "else if ((p< 400 && p>= 200)  && ft>= 20) { return 'class_f10'; }" +
                         "else if (p> 400  && ft>= 20)              { return 'class_f11'; }" +
                         "else if (p< -200 && ft < 20)             { return 'class_r1' ; }" +
                         "else if ((p< -40 && p>= -200) && ft< 20) { return 'class_r2' ; }" +
                         "else if ((p< -20 && p>= -40)  && ft< 20) { return 'class_r3' ; }" +
                         "else if ((p< -5  && p>= -20)  && ft< 20) { return 'class_r4' ; }" +
                         "else if ((p< 5   && p>= -5)   && ft< 20) { return 'class_r5' ; }" +
                         "else if ((p< 20  && p>= 5)    && ft< 20) { return 'class_r6' ; }" +
                         "else if ((p< 40  && p>= 20)   && ft< 20) { return 'class_r7' ; }" +
                         "else if ((p< 100 && p>= 40)   && ft< 20) { return 'class_r8' ; }" +
                         "else if ((p< 200 && p>= 100)  && ft< 20) { return 'class_r9' ; }" +
                         "else if ((p< 400 && p>= 200)  && ft< 20) { return 'class_r10'; }" +
                         "else if (p> 400  && ft< 20)              { return 'class_r11'; }",
        uniqueValueInfos: [{value:"class_f1",  label:"Freeway Less than -200%" , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 10.0000)},
                           {value:"class_f2",  label:"Freeway -200% to -40%"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 7.5000)},
                           {value:"class_f3",  label:"Freeway -40% to -20%"    , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 6.2500)},
                           {value:"class_f4",  label:"Freeway -20% to -5%"     , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 5.6250)},
                           {value:"class_f5",  label:"Freeway -5% to +5%"      , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 5.3125)},
                           {value:"class_f6",  label:"Freeway +5% to +20%"     , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 5.6250)},
                           {value:"class_f7",  label:"Freeway +20% to +40%"    , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 6.2500)},
                           {value:"class_f8",  label:"Freeway +40% to +100%"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 7.5000)},
                           {value:"class_f9",  label:"Freeway +100% to +200%"  , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 9.5000)},
                           {value:"class_f10", label:"Freeway +200% to +400%"  , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"),      10.0000)},
                           {value:"class_f11", label:"Freeway More than +400%" , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"),      14.0000)},
                           {value:"class_r1",  label:"Arterial Less than -200%", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[0]), 5.0000)},
                           {value:"class_r2",  label:"Arterial -200% to -40%"  , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[1]), 2.5000)},
                           {value:"class_r3",  label:"Arterial -40% to -20%"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[2]), 1.2500)},
                           {value:"class_r4",  label:"Arterial -20% to -5%"    , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[3]), 0.6250)},
                           {value:"class_r5",  label:"Arterial -5% to +5%"     , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[4]), 0.3125)},
                           {value:"class_r6",  label:"Arterial +5% to +20%"    , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[5]), 0.6250)},
                           {value:"class_r7",  label:"Arterial +20% to +40%"   , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[6]), 1.2500)},
                           {value:"class_r8",  label:"Arterial +40% to +100%"  , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 2.5000)},
                           {value:"class_r9",  label:"Arterial +100% to +200%" , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(aCR_Change9[7]), 4.5000)},
                           {value:"class_r10", label:"Arterial +200% to +400%" , symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"),      5.0000)},
                           {value:"class_r11", label:"Arterial More than +400%", symbol: new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex("#000000"),      9.0000)}]
      });
      return renderer_PC_Change;
    },

    numberWithCommas: function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        lyrLinks[this.getCurDispLayerLoc()].setLabelingInfo([ labelClassOn  ] );
      } else {
        lyrLinks[this.getCurDispLayerLoc()].setLabelingInfo([ labelClassOff ]);
      }
      
    },
    
    getMethods: function (obj) 
    {
      var res = [];
      for(var m in obj) {
        if(typeof obj[m] == "function") {
          res.push(m)
        }
      }
      return res;
    },

    onOpen: function(){
      console.log('onOpen');
      tttR.updateRoadDisplay();
      lastOpenedWidget = 'road';
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
      if(data.message=='road'){
        tttR.updateRoadDisplay();
      }
    },
  });
});