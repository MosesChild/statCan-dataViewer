
var fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem");


fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
}, false);


var Module=(function (){
const axes=["none", "x-axis", "y-axis", "time"];
const datatypes=["string", "number", "date"];
var valuesTable="raw";
var parsed;
var columns;
var filterGroups=document.getElementsByClassName('filterGroup');
var filteredTable;
var nullValues;
var axisSelectors=document.getElementsByClassName('axisSelector');
var nestSelectors=document.getElementsByClassName('nestSelector');
  const createElement = (element, attributesObj) => {
    var newElement = document.createElement(element);
    Object.assign(newElement, attributesObj);
    return newElement;
  };

  function wrap(args){ // will append any number of html elements and arrays of elements to a new div.
    const wrapper=document.createElement("div");
    for (argument of arguments){
      if (Array.isArray(argument)){
        argument.forEach(element=>wrapper.appendChild(element))
      } else {
        wrapper.appendChild(argument);
      }
    }
    return wrapper;
  }

  function getDiscreteValues(object, key){
    var list = _.uniq(_.map(object, key));
    return list;
  }
  function replaceElement(currentElement, newElement){
    const parent=currentElement.parentNode;
    const nthChild=[...parent.children].indexOf(currentElement);
    currentElement.remove();
    parent.insertBefore(newElement, parent.children[nthChild]);
  };

  function updateDataViewer(filterAll=true){
    const interface=document.getElementsByClassName('interface')[0];
    if (filterAll){
      filterAllData();
    }
    let newValuesTable=Module.makeDataViewer();
    var oldValuesTable = document.querySelector('[data-key="Value"]');
    replaceElement(oldValuesTable, newValuesTable); 
    
  };

  function selectable(e){
    e.target.classList.toggle("selected");
    updateDataViewer();
  };

  function selectAll(e){
    const filterGroup=e.target.closest(".filterGroup");
    const key=filterGroup.dataset.key ;
    const selected=filterGroup.getElementsByClassName("selected").length;
    const allItems=filterGroup.getElementsByTagName("li");
 //   console.log( selected, allItems)
    for (item of allItems){
      if (selected<allItems.length){
        item.classList.add("selected");
      } else {
        item.classList.remove("selected")
      }
    }
    updateDataViewer();
  };

  function summarizeValues(list){
    var summary = list.length + " entries";
    const numberCheck=parseInt(list[0]);
    if (!isNaN(numberCheck)){
      summary += `, ${d3.max(list, d => +d) } max, ${ d3.min(list, d => +d) } min`  
    }
    return createElement("strong", {textContent: summary});
  }

  function filterAllData(){
    var currentTable=parsed;
    for (let group of filterGroups){
      var key=group.dataset.key;
      var filters=group.getElementsByClassName("selected");
      if (filters.length!==0){
        var multipleKeyValues=[];
        for (filter of filters){
          multipleKeyValues.push(_.filter(currentTable, o =>o[key]==filter.textContent));
        }
      currentTable=_.flatten(multipleKeyValues);
      // and remove missing values...
      }
    }
    filteredTable=currentTable.filter(o=> o.Value != "");
    nullValues=currentTable.map(o=> o.Value == "");
  };

return {
  showFile(){
    console.log(parsed);
  },
  getFiltered(){
    return(filteredTable);
  },

  makeSelectableList(list){
    const valueList=createElement("ul",{className: "dataWindow"} );
    list.forEach(element=>{
        let item=document.createElement('li');
        item.textContent=element; 
        item.onclick = selectable;
        valueList.appendChild(item);
      });
    return valueList;
  },
  getAxislabels(){
    var chartData={};
    for (axis of axisSelectors){
      if (axis.selectedIndex!==0){
        chartData[axes[axis.selectedIndex]] = axis.closest(".filterGroup").dataset.key;
      }
    }
    return chartData;
  },

graph(e){
  const key=e.target.value;
  const thisAxisSelector=e.target.parentNode.getElementsByClassName("axisSelector")[0];
  // set x-axis as 'default' label (removing it from other selector if necessary)...
  const current=document.querySelector(".axisSelector")
  console.log(current.selectedIndex, thisAxisSelector)
  if (current) current.selectedIndex=0;
  thisAxisSelector.selectedIndex=1;
  makePieChart(key);
 // makeDonutChart(chartData);
},

convertDataType(key, newType){
  const currentGroup = document.querySelector(`[data-key=${key}]`);
  var callback;
  if (newType==="number"  &&  !/[^0-9]/.test(parsed[0][key])){
    callback = d => d[key]=parseInt(d[key])
  } else 
  if (newType==="date" && new Date(parsed[0][key])){
    callback = d =>{
      d[key]=new Date(d[key]);
      console.log()
    }

  } else {
    alert( "Data is not valid for request!");
    return;
  }
  parsed.forEach(item=> Object.assign(item, callback(item)) );
  let newGroup=this.makeFilterGroup(key);
  replaceElement( currentGroup, newGroup);
  console.log("success?", newType, parsed[0])
},
selectNestOrder(e){
  selectedIndex=e.target.selectedIndex;
  for (selector of nestSelectors){
    selector.selectedIndex = selector.selectedIndex==selectedIndex ? 0 : selector.selectedIndex;
  }
  e.target.selectedIndex=selectedIndex;
},

makeNestSelector(key){
  const label=createElement("label", {textContent: "nest order"});
  const selector=createElement("select", {className: "nestSelector" });
  selector.appendChild(createElement("option", {label: "none", value: "none", selected: true}));
  for (i=1; i<columns.length; i++){
    selector.appendChild(createElement("option", {label: i, value: i}));
  }
  selector.addEventListener("change", this.selectNestOrder, false);
  label.appendChild(selector);
  return label;
},
selectAxis(e){
  const selectedIndex=e.target.selectedIndex
  for (selector of axisSelectors) {
    selector.selectedIndex = selector.selectedIndex==selectedIndex ? 0 : selector.selectedIndex;
  };
    e.target.selectedIndex=selectedIndex;
},
makeAxisSelector(key){
  const axisSelector=createElement("select", {className: "axisSelector" });
  const current = key=="Value" ? "y-axis" : "not" ;  // make the values data default selected as y axis...
  axes.forEach((option, index) =>{
    axisSelector.appendChild(createElement("option", {label: option, value: option, selected: option==current}))
  })
  axisSelector.addEventListener("change", this.selectAxis , false);
  return axisSelector;
},
makeDataTypeSelector(key){
  const dataTypeSelector=createElement("select");
  const current=typeof key;
  datatypes.forEach((option, index) =>{
    dataTypeSelector.appendChild(createElement("option", {label: option, value: option, selected: option==current}))
  })
  dataTypeSelector.addEventListener("change", e => this.convertDataType(key, datatypes[e.target.selectedIndex]) , false);
  return dataTypeSelector;
},
makeFilterGroup(key, filteredSource="false"){
  const graphButton = createElement("button", {className: "pure-button pure-button-primary", textContent: key, value: key});
  const list = filteredSource ? getDiscreteValues(filteredTable,key) : getDiscreteValues(parsed,key);
  const valueList = this.makeSelectableList(list);
  const summary =  summarizeValues(list);
  const select_all = createElement("button", {className: "pure-button button-success", textContent: "(Un)Select All"});
  const axisSelector= this.makeAxisSelector(key);
  const nestOrder=this.makeNestSelector(key);
  const dataTypeSelector = this.makeDataTypeSelector(key);
  const filterGroup = wrap(graphButton, select_all, valueList, summary, nestOrder, axisSelector, dataTypeSelector);

  graphButton.addEventListener("mouseup", this.graph, false);
  select_all.addEventListener("mouseup", selectAll, false);
  filterGroup.className="filterGroup";
  filterGroup.dataset.key=key;
  return filterGroup;
},
createNestTable(){
  var rawFiltered=filteredTable;
  var nest={}
  for (selector of nestSelectors){
    let key=selector.closest(".filterGroup").dataset.key;
    nest[selector.selectedIndex]=key;
  };
  delete nest[0];
  
  for (nestLayer of Object.values(nest)){
    rawFiltered = d3.nest()
      .key(function(d){return d[nestLayer]})
      .map(rawFiltered);
  }
  console.log("nest order", rawFiltered);
  filteredTable=rawFiltered;
  updateDataViewer(false);
},

showRaw(){
  return createElement("div",{textContent: JSON.stringify(filteredTable), className: "dataWindow"});
},

showColumns(){
  const valuesTable=createElement("ul",{className: "dataWindow dataViewer"});
  filteredTable.forEach( o =>{
    let entry=createElement("li");
    Object.values(o).map(value=> entry.appendChild(createElement("span", {textContent: value, className: "tableValues" }) ) )
    valuesTable.appendChild(entry);
  })
  return valuesTable;
},
makeDataViewer(){
  const titleButton=createElement("button",{textContent: "Value", className: "pure-button pure-button-primary", value: "Value"});
  const showPieGraph=createElement("button",{textContent: "PieGraph", className: "pure-button pure-button-success", value: "Value"});
  const showColumns=createElement("button",{textContent: "Columns", className: "pure-button pure-button-primary", value: "Value"});
  const valuesTable=createElement("ul",{className: "dataWindow dataViewer"});
  var view= this.showColumns();
  const summary= summarizeValues(filteredTable);
  //summary.parentNode.appendChild(createElement("span"{textContent: nullValues.length+""})
  const dataViewer= wrap(titleButton, showPieGraph, showColumns, view, summary);
  dataViewer.className="dataViewer";
  dataViewer.dataset.key="Value";


  return dataViewer;
},

makeInterface(keys){
  const filterGroups=[];
  const valuesTable=this.makeDataViewer();
  columns=keys;
  keys.forEach(key=>{
    if (key!="Value"){
      filterGroups.push(this.makeFilterGroup(key));
    }
  });
  let groups=wrap(filterGroups);
  groups.className="filterGroups";
  let interface=wrap(groups, valuesTable)
  interface.className="interface";
  document.body.appendChild(interface);
},
removeVectorsAndCoordinateFromDataFile(file){
  file=file.map(entry=>{
    delete entry.Vector;
    delete entry.Coordinate;
  })
  
  return file;
},
parse(file){
  parsed = filteredTable = (file.indexOf("\t") < 0 ? d3.csvParse : d3.tsvParse)(file);
  const keys=Object.keys(parsed[0]);
  // remove vector and coordinate information if present (redundant!)
 // parsed = this.removeVectorsAndCoordinateFromDataFile(parsed);
  this.makeInterface(keys);
},
handleFiles(files) {
  var data;
  for (file of files){
    var reader = new FileReader();
    reader.onload = (e)=>{
    //  console.log(e.target);
      this.parse(e.target.result);}
  }
  reader.readAsText(file);
}

}
})();
