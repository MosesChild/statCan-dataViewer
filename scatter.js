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


var Module=(function (){
var parsed;
var filterGroups=document.getElementsByClassName('filterGroup');
var wrapper=document.getElementById("wrapper");
var filteredTable;


  function testNumberValues(arrayOrItem){
    const testCase= Array.isArray(arrayOrItem) ? arrayOrItem[0] : arrayOrItem;
    if (!/[^0-9]/.test(testCase)){  // if any not number values
      return true;
    }
  }
  function getDiscreteValues(object, key){
    var list = _.uniq(_.map(object, key));
    return list;
  }

  function updateInterface(){
    const interface=document.getElementsByClassName('interface')[0];
    filterAllData();
    let newValues=Module.makeValuesTable("Value", true)
    interface.removeChild(document.querySelector('[data-key="Value"]'))
    interface.appendChild(newValues);  
  };

  function selectable(e){
    e.target.classList.toggle("selected");
    updateInterface();
  };

  function selectAll(e){
    const filterGroup=e.target.closest(".filterGroup");
    const key=filterGroup.dataset.key ;
    const selected=filterGroup.getElementsByClassName("selected").length;
    const allItems=filterGroup.getElementsByTagName("li");
    console.log( selected, allItems)
    for (item of allItems){
      if (selected<allItems.length){
        item.classList.add("selected");
      } else {
        item.classList.remove("selected")
      }
    }
    updateInterface();
  };

  function summarizeValues(list){
    const itemCount = list.length + " entries";
    const max=d3.max(list, d => +d);
    const number = !isNaN(max) ? `, ${ max } max, ${ d3.min(list, d => +d) } min` : ""; 
    const summary=createElement("strong", {textContent: itemCount + number });
    return summary;
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
  Module.makePieChart(key);
//  Module.makeDonutChart(key);
            // Module.makeBarChart(key);
  
  // start with a bar graph...population...
  // x axis would be various keys,
  // y axis would be population size...
  // default could be...
  // x axis=button press...
  // y axis = use largest list with dataset.value==="number"
 //console.log(this);
},

makeFilterGroup(key, filteredSource="false"){
  const graphButton=createElement("button",{textContent: key, value: key});
  const list=filteredSource ? getDiscreteValues(filteredTable,key) : getDiscreteValues(parsed,key);
  const valueList=this.makeSelectableList(list);
  const summary =  summarizeValues(list);
  const select_all=createElement("button", {textContent: "(Un)Select All"});
  const filterGroup= dropWrap(graphButton, select_all, valueList, summary);

  graphButton.addEventListener("mouseup", this.selectData, false);
  select_all.addEventListener("mouseup", selectAll, false);

  filterGroup.className="filterGroup";
  filterGroup.dataset.key=key;

  
  return filterGroup;
},
makeValuesTable(){
  const titleButton=createElement("button",{textContent: "Value", value: "Value"});
  const valuesTable=createElement("ul",{className: "dataWindow"});
  const forSummary=[];
  const list= filteredTable.forEach( o =>{
    let entry=createElement("li", {textContent: o.Value})
    let values= Object.values(o);
    forSummary.push(o.Value);
    entry.dataset.info=values;
    valuesTable.appendChild(entry);
  })
  const summary= summarizeValues(forSummary);
  const filterGroup= dropWrap(valuesTable, summary);
  filterGroup.className="filterGroup";
  filterGroup.dataset.key="Value";

  console.log (valuesTable);
  return filterGroup;
},

makeInterface(keys){
  const filterGroups=[];
  keys.forEach(key=>{
    if (key=="Value"){
      filterGroups.push(this.makeValuesTable());
    } else {
      let filterGroup=this.makeFilterGroup(key); 
      filterGroups.push(filterGroup);
    }
  });
  //
  let currentTable=spaceWrap(filterGroups);
  currentTable.className="interface";
  document.body.appendChild(currentTable);
},

parse(file){
  console.log("parse" ,file);  
  parsed = filteredTable = (file.indexOf("\t") < 0 ? d3.csvParse : d3.tsvParse)(file);
  
  //parsed = file.includes("{") ? JSON.parse(file) : this.fixCSV(file);
  console.log("parsed", parsed);
  const keys=Object.keys(parsed[0])
  this.makeInterface(keys);

},
handleFiles(files) {
  var data;
  for (file of files){
    var reader = new FileReader();
    reader.onload = (e)=>{
      console.log(e.target);
      this.parse(e.target.result);}
  }
  reader.readAsText(file);
},
makePieChart(buttonCategory){
  const svgWidth =960, svgHeight = 500;
  const data=_.filter(filteredTable, o=>!Number.isNaN(o.Value))

  const margin= {top: 20, right: 20, bottom: 100, left: 70 };
  var svg = d3.select("svg").remove()

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

svg = d3.select("#wrapper")
          .append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);

  //code from https://bl.ocks.org/mbostock/3887235
  var radius = Math.min(width, height) / 2;

//  var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00","red","green","blue","orange","yellow","purple","violet","pink"]);
  var colorArray=data.map( (d,i)=> hsl( i/data.length, 1, i%2==0 ? 0.3 : 0.5 ) );
  console.log(colorArray)
  var color = d3.scaleOrdinal(colorArray);
  var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  var pie = d3.pie()
      .sort(null)
      .value(function(d) { return d.Value; });

  var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var label = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);
/*
  d3.csv("data.csv", function(d) {
    d.population = +d.population;
    return d;
  }, function(error, data) {
    if (error) throw error;
*/
    var arc = g.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d,i) { return color(i); });

    arc.append("text")
        .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function(d) { return d[buttonCategory]; });

},
makeDonutChart(buttonCategory){  //     http://bl.ocks.org/dbuezas/9572040
  var svg = d3.select("body")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labels");
svg.append("g")
	.attr("class", "lines");

var width = 960,
    height = 450,
	radius = Math.min(width, height) / 2;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.4);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var key = function(d){ return d.data.label; };

var color = d3.scale.category20()
	.domain(data.map(function(d) { return d[buttonCategory]; }))
	//.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

function randomData (){
	var labels = color.domain();
	return labels.map(function(label){
		return { label: label, value: Math.random() }
	}).filter(function() {
		return Math.random() > .5;
	}).sort(function(a,b) {
		return d3.ascending(a.label, b.label);
	});
}

change(randomData());

d3.select(".randomize")
	.on("click", function(){
		change(randomData());
	});

function mergeWithFirstEqualZero(first, second){
	var secondSet = d3.set(); second.forEach(function(d) { secondSet.add(d.label); });

	var onlyFirst = first
		.filter(function(d){ return !secondSet.has(d.label) })
		.map(function(d) { return {label: d.label, value: 0}; });
	return d3.merge([ second, onlyFirst ])
		.sort(function(a,b) {
			return d3.ascending(a.label, b.label);
		});
}

function change(data) {
	var duration = +document.getElementById("duration").value;
	var data0 = svg.select(".slices").selectAll("path.slice")
		.data().map(function(d) { return d.data });
	if (data0.length == 0) data0 = data;
	var was = mergeWithFirstEqualZero(data, data0);
	var is = mergeWithFirstEqualZero(data0, data);

	/* ------- SLICE ARCS -------*/

	var slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(was), key);

	slice.enter()
		.insert("path")
		.attr("class", "slice")
		.style("fill", function(d) { return color(d.data.label); })
		.each(function(d) {
			this._current = d;
		});

	slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(is), key);

	slice		
		.transition().duration(duration)
		.attrTween("d", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				_this._current = interpolate(t);
				return arc(_this._current);
			};
		});

	slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

	slice
		.exit().transition().delay(duration).duration(0)
		.remove();

	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(pie(was), key);

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.style("opacity", 0)
		.text(function(d) {
			return d.data.label;
		})
		.each(function(d) {
			this._current = d;
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text = svg.select(".labels").selectAll("text")
		.data(pie(is), key);

	text.transition().duration(duration)
		.style("opacity", function(d) {
			return d.data.value == 0 ? 0 : 1;
		})
		.attrTween("transform", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				var d2 = interpolate(t);
				_this._current = d2;
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			var interpolate = d3.interpolate(this._current, d);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});
	
	text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

	text
		.exit().transition().delay(duration)
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(was), key);
	
	polyline.enter()
		.append("polyline")
		.style("opacity", 0)
		.each(function(d) {
			this._current = d;
		});

	polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(is), key);
	
	polyline.transition().duration(duration)
		.style("opacity", function(d) {
			return d.data.value == 0 ? 0 : .5;
		})
		.attrTween("points", function(d){
			this._current = this._current;
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				var d2 = interpolate(t);
				_this._current = d2;
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			};			
		});
	
	polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);
	
	polyline
		.exit().transition().delay(duration)
    .remove();
  }
},

makeBarChart(buttonCategory){
  const svgWidth =960, svgHeight = 500;
  const data=_.filter(filteredTable, o=>!Number.isNaN(o.Value))
  const dataset=data.map(item=>item.Value);
  const margin= {top: 20, right: 20, bottom: 100, left: 70 };
  var svg = d3.select("svg").remove()

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

svg = d3.select("#wrapper")
          .append("svg")
          .attr("width", svgWidth)
          .attr("height", svgHeight);
  
  console.log("data",data,"dataset", dataset, d3.extent(dataset));

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

      var g=svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d[buttonCategory]; }));
  y.domain([0, d3.max(dataset)]);

  g.append("g")
      .attr("class", "axis xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))


  g.selectAll(".xaxis text")  // select all the text elements for the xaxis
      .attr("transform", function(d) {
         return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
     });
  g.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (width/2) +","+(height+(margin.bottom/3))+")")  // centre below axis
      .text("Date");

  /*
  g.append("g")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Population");
*/
  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d[buttonCategory]); })
        .attr("y", function(d) { return y(d.Value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.TABLE); });

  },

}
})();
