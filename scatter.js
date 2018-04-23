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
  console.log(elementArray)
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

function makeDiscreteValueList(object, key){
  var list = _.uniq(_.map(object, key));
  list=list.filter(value=>typeof value!=="undefined");
  return list;
}

function summarizeNumberValues(list){
  var numList=list.map(number=> parseInt(number))
  numList=numList.filter(number=> !isNaN(number));
  const min=Math.min(...numList);
  const max=Math.max(...numList);
  return [max+" maximum", min+" minimum", list.length + " values total"]
}

function selectable(e){
  e.target.classList.toggle("selected"); 
}

function testNumberValues(list){
  const test=parseInt(list[1]);
  if (!isNaN(test && list.length>10 )){
    return true;
  }
}

function makeSelectableList(list){
  const valueList=document.createElement("ul");
  // if >10 number values, only display maximum, minimum and total # of values. ...
  if (testNumberValues(list)){
    if (list.length>30)
    list = summarizeNumberValues(list);
  }
  list.forEach(element=>{
      let item=document.createElement('li');
      item.textContent=element; 
      item.onclick = selectable;
      valueList.appendChild(item);
    });
  return valueList;
}

function fixCSV(file){
  var keys, values; 
  [keys, ...values] = file.split("\n");
  keys=keys.split(',');
  const items = values.map(entry=>{
    if (entry!=""){
      var item={};
      entry=entry.split(',');
      entry.map((value,index)=>item[keys[index]]=value);
      return item
    }
  });
  console.log(items);
  return items;
}

function getFilters(object){
  const allLists=document.querySelectorAll("ul");
  const filterList=[];
  for (list of allLists){
    const filters=list.getElementsByClassName('selected');
    if (filters.length!==0){
      const key=list.closest('.filterGroup').data.key;
      for (item of selected){
        filterList.push({key: key, select: item.textContent})
      }
    } 
  }
}


// should instead assume unfiltered and only handle lists with filters!
// should make discreteValue Lists have association with their key!
// 


function returnFilteredObject(){
  const filters=getFilters()
  console.log(selected);
  for (line of selected){
    console.log(line.textContent);
  }
}

function filterByFilterGroup(object, filterGroup){
  const filtered=[]
  const key=filterGroup.dataset.key;
  const selectedLines=filterGroup.querySelectorAll('.selected');
  selectedLines.forEach(value=>{
    filtered.push(_.filter(object, [key, value.textContent] ))
  });
  console.log("filterByFilterGroup", key, selectedLines, filtered)
  return filtered;
}

function filterAllData(objectArray){
  const filterGroups=document.querySelectorAll('.filterGroup');
  const selected={};
  filterGroups.forEach(group=>{
    var key=group.dataset.key;
    var filters=group.getElementsByClassName("selected");
    if (filters.length!==0){
      for (value of filters){
        selected[key]=value.textContent;
      }
    }
  })
  console.log("selected",selected)
  let newArray=_.filter(objectArray, selected);
  console.log("new Array",newArray)
};



function makeObjectByKey(e){
  const objectArray=this;
  const key=e.target.value;
  const primaryKey=e.target.closest(".filterGroup");
  // first filter all data...
      filteredData=filterAllData(objectArray);
  // return all objectArray results organized under matching key (e.g. all objectArray entries by year)
  console.log("makeObjectByKey",e, primaryKey, filteredData)

  // filter primary (key) so only wanted objects are made...

  filteredPrimaryKeyObject= filterByFilterGroup(filteredData, primaryKey);
  //  make objects by selected key;
  filteredPrimaryKeyObject.forEach(discreteValue=>{
    const object={key : discreteValue};
  //  newArray.push(object);
  })
  //console.log("newArray", newArray)
 // return newArray;
}

/*
function makeObjectByKey(objectArray, e){
  const key=e.target.dataset.value;
  // return all objectArray results organized under matching key (e.g. all objectArray entries by year)
  const newArray=[];
  
  const discreteValues = _.uniq(_.map(objectArray, key));
  //  make objects by selected key (discreteValues)
  discreteValues.forEach(discreteValue=>{
    const object={key: discreteValue};
    // then add all objectArray objects that own that discreteValue
    const properties=_.filter(objectArray, [key , discreteValue]);
    console.log(properties);
    Object.assign(object, properties)
    //as a properties of that discreteValue object.
    newArray.push(object);
  })
  console.log("newArray", newArray)
  return newArray;
}
*/

const parse=(file)=>{
  console.log("parse" ,file)
  const parsed= file.includes("{") ? JSON.parse(file) : fixCSV(file);
  console.log("parsed", parsed);

  const keys=Object.keys(parsed[0])
  const valueLists=[];
 
  keys.forEach(key=>{
    const button=createElement("button",{textContent: key, value: key});
    const list= makeDiscreteValueList(parsed, key);
    const valueList=makeSelectableList(list);
    const filterGroup= dropWrap(button, valueList);
    filterGroup.className="filterGroup";
    filterGroup.dataset.key=key
    //valueList.dataset.key=key;
    makeObjectByKey=makeObjectByKey.bind(parsed);
    button.addEventListener("mouseup", makeObjectByKey, false);
    valueLists.push(filterGroup);
  })
  document.body.appendChild(spaceWrap(valueLists));


}

  function handleFiles(files) {
    var data;
    for (file of files){
      var reader = new FileReader();
      reader.onload = (e)=>{
        console.log(e.target);
        parse(e.target.result);}
    }
    reader.readAsText(file);
  }
