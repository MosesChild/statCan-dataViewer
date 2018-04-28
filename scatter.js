var fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem");

    var fileData;

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
}, false);

const createElement = (element, attributesObj) => {
  var newElement = document.createElement(element);
  Object.assign(newElement, attributesObj);
  return newElement;
};

function makeElements(array, elementType="button"){
  var elements=array.map(field=>{
    let element = document.createElement(elementType);
    element.textContent=field;
    element.dataset.value=field;
    return element;
  })
  return elements;
}

function spaceWrap(elementArray){
  const wrap=document.createElement("div");
  wrap.style.display= "flex";
  wrap.style.flexFlow="row wrap";
  wrap.style.justifyContent="space-around";
  wrap.style.width=window.innerWidth + "px";
 // console.log(elementArray)
  for (element of elementArray){
    wrap.appendChild(element)
  };
  return wrap;
}

function dropWrap(args){
  const wrapper=document.createElement("div");
  for (argument of arguments){
    if (Array.isArray(argument)){
      argument.forEach(element=>wrapper.appendChild(element))
    } else {
      wrapper.appendChild(argument)
    }
  }
  return wrapper;
}


var Module=(function (){
var parsed;
var filterGroups=document.getElementsByClassName('filterGroup');
var wrapper=document.getElementById("wrapper");
var filteredTable;
var axisSelectors=document.getElementsByClassName('axisSelector');

  function getDiscreteValues(object, key){
    var list = _.uniq(_.map(object, key));
    return list;
  }

  function updateDataViewer(){
    const interface=document.getElementsByClassName('interface')[0];
    filterAllData();
    let newValues=Module.makeDataViewer("Value", true)
    interface.removeChild(document.querySelector('[data-key="Value"]'))
    interface.appendChild(newValues);  
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
        var multipleKeyValues=[]
        for (filter of filters){
          multipleKeyValues.push(_.filter(currentTable, o =>o[key]==filter.textContent));
        }
      currentTable=_.flatten(multipleKeyValues);
      }
    }
    return filteredTable=currentTable;
  };

return {
  showFile(){
    console.log(parsed);
  },
  showFiltered(){
    console.log(filteredTable);
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

selectData(e){
 // const objectArray=filteredTable;
  const key=e.target.value;
},

replaceElement(currentElement, newElement){
  const parent=currentElement.parentNode;
  const nthChild=[...parent.children].indexOf(currentElement);
  currentElement.remove();
  parent.insertBefore(newElement, parent.children[nthChild]);
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
  this.replaceElement( currentGroup, newGroup);
  console.log("success?", newType, parsed[0])
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
  const options=["none", "x-axis", "y-axis", "time"];
  const current = key=="Value" ? "y-axis" : "not" ;  // make the values data default selected as y axis...
  options.forEach((option, index) =>{
    axisSelector.appendChild(createElement("option", {label: option, value: option, selected: option==current}))
  })
  axisSelector.addEventListener("change", this.selectAxis , false);
  return axisSelector;
},
makeDataTypeSelector(key){
  const dataTypeSelector=createElement("select");
  const current=typeof key;
  const options=["string", "number", "date"];
  options.forEach((option, index) =>{
    dataTypeSelector.appendChild(createElement("option", {label: option, value: option, selected: current==option}))
  })
  dataTypeSelector.addEventListener("change", e => this.convertDataType(key, options[e.target.selectedIndex]) , false);
  return dataTypeSelector;
},
makeFilterGroup(key, filteredSource="false"){
  const graphButton = createElement("button",{textContent: key, value: key});
  const axisSelector= this.makeAxisSelector(key);
  const dataTypeSelector = this.makeDataTypeSelector(key);
  const list = filteredSource ? getDiscreteValues(filteredTable,key) : getDiscreteValues(parsed,key);
  const valueList = this.makeSelectableList(list);
  const summary =  summarizeValues(list);
  const select_all = createElement("button", {textContent: "(Un)Select All"});
  const filterGroup = dropWrap(graphButton, select_all, valueList, summary, axisSelector, dataTypeSelector);

  graphButton.addEventListener("mouseup", this.selectData, false);
  select_all.addEventListener("mouseup", selectAll, false);

  filterGroup.className="filterGroup";
  filterGroup.dataset.key=key;


  return filterGroup;


},
makeDataViewer(){
  const titleButton=createElement("button",{textContent: "Value", value: "Value"});
  const valuesTable=createElement("ul",{className: "dataWindow dataViewer"});
  const forSummary=[];
  const list= filteredTable.forEach( o =>{
      forSummary.push(o.Value)
      let entry=createElement("li");
      let values= Object.values(o)
      let info=values.map(value=>
        createElement("span", {textContent: value, className: "tableValues" })
      )
      info.forEach( value => entry.appendChild(value));
      valuesTable.appendChild(entry);
  })
  const summary= summarizeValues(forSummary);
  const dataViewer= dropWrap(valuesTable, summary);
  dataViewer.className="dataViewer";
  dataViewer.dataset.key="Value";

 // console.log (valuesTable);
  return dataViewer;
},

makeInterface(keys){
  const filterGroups=[];
  const valuesTable=this.makeDataViewer();
  keys.forEach(key=>{
    if (key!="Value"){
      filterGroups.push(this.makeFilterGroup(key));
    }
  });
  
  let groups=spaceWrap(filterGroups);
  let interface=dropWrap(groups, valuesTable)
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
