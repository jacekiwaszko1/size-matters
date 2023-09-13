//get index of dimensions count:
let count_dimensions_json;
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://raw.githubusercontent.com/jacekiwaszko1/size-matters/main/data/count-dimensions-within-dates.json");
xhr.send();
xhr.responseType = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = xhr.response;
    console.log(data);
    count_dimensions_json = data;
    document.getElementById('count_dimensions').innerHTML = JSON.stringify(count_dimensions_json);
  } else {
    console.log(`Error: ${xhr.status}`);
  }
};
console.log(count_dimensions_json);
//console.log(count_dimensions_json['results']['bindings'][0]['d']['value'], count_dimensions_json['results']['bindings'][0]['count']['value']);

//get query for counting the dimiensions:
let count_dimensions_query;
const xhr_count_dimensions_query = new XMLHttpRequest();
xhr_count_dimensions_query.open("GET", "https://raw.githubusercontent.com/jacekiwaszko1/size-matters/main/sparql-queries/count-dimensions-within-dates.sparql");
xhr_count_dimensions_query.send();
xhr_count_dimensions_query.responseType = "text";
xhr_count_dimensions_query.onload = () => {
  if (xhr_count_dimensions_query.readyState == 4 && xhr_count_dimensions_query.status == 200) {
    const data = xhr_count_dimensions_query.response;
    console.log("data: ", data);
    count_dimensions_query = data;
    //document.getElementById('count_dimensions_code').innerHTML = count_dimensions_query;
  } else {
    console.log(`Error: ${xhr_count_dimensions_query.status}`);
  }
};
console.log(count_dimensions_query);


if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}


function activateTab(tabname, navtab) {
  console.log(tabname);
  var tabs = document.getElementsByClassName('content-tab');
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].classList.contains('hidden')) {

    } else {
      tabs[i].classList.add('hidden');
    }
  }
  var tab = document.getElementById(tabname);
  tab.classList.remove('hidden');

  if (tabname == 'charts') {
    prepareCountDimensions();
  }
}


function toggleChecked(id) {
  console.log(id);
  if (id == 'sortby-label') {
    document.getElementById('sortby-label').setAttribute('checked', true);
    document.getElementById('sortby-count').removeAttribute('checked');
  } else if (id == 'sortby-count') {
    document.getElementById('sortby-count').setAttribute('checked', true);
    document.getElementById('sortby-label').removeAttribute('checked');
  } else {
    if (document.getElementById(id).hasAttribute('checked')) {
      console.log('uncheck ', id);
      document.getElementById(id).removeAttribute('checked');
    } else {
      console.log('check ', id);
      document.getElementById(id).setAttribute('checked', true);
    }
  }
}

function prepareCountDimensions() {
  //console.log('drawing chars', count_dimensions_json);
  var xValues = [];
  var yValues = [];
  var barColors = [];
  var dimensions = {};
  //dimensions - data cleanup
  for (var i = 0; i < count_dimensions_json['results']['bindings'].length; i++) {
    let bar = count_dimensions_json['results']['bindings'][i];
    xval = bar['d']['value'];
    yval = parseInt(bar['count']['value']);
    repl = / *\([^)]*\)/g;
    xval = xval.replace(repl, '');
    regex = /[0-9]+[,.]?[0-9]? ?[xX] ?[0-9]+[,.]?[0-9]? ?[cm]?m?/g;
    xpos = xval.match(regex);
    if (xpos == null) {
      if (xval.match(/^in/) != null ) {
        dim = 'in-';
        if (xval.match(/[0-9]+/) != null) {
          dim += xval.match(/[0-9]+/)[0];
        } else if (xval.match(/fol/) != null) {
          dim += 'fol';
        }
        if (xval.match(/obl/) != null) {
          dim += 'obl.';
        }
        //console.log(dim);
        if (dimensions[dim] == undefined) {
          obj = {'count': yval, 'orientation': 'unknown'};
          //dimensions[dim]['count'] = yval;
          //dimensions[dim]['orientation'] = 'unknown';
          dimensions[dim] = obj;
        } else {
          dimensions[dim]['count'] += yval;
        }
      } else {
        //console.warn(xval);
        if (dimensions[xval] == undefined) {
          obj = {'count': yval, 'orientation': 'unknown'};
          dimensions[xval] = obj;
          //dimensions[xval]['count'] = yval;
          //dimensions[xval]['orientation'] = 'unknown';
        } else {
          dimensions[xval]['count'] += yval;
        }
      }
    } else {

      dim = xpos[0];
      dim = dim.replace(/^s+/, '').replace(/\s+$/);
      h = dim.replace(/ *[xX].*$/, '');
      w = dim.replace(/.*[xX] */, '').replace(/[^0-9]*$/, '');
      h = h.replace(',', '.');
      w = w.replace(',', '.');
      if (h > 100 || w > 100) {
        h = h/10;
        w = w/10;
      }
      h = Math.round(h);
      w = Math.round(w);
      //console.log(h, w);
      let orientation = '';
      if (h > w) {
        orientation = 'portrait';
      } else if (w > h) {
        orientation = 'landscape';
      } else {
        orientation = 'unknown';
      }

      unidim = h + "x" + w;

      if (dimensions[unidim] == undefined) {
        obj = {'count': yval, 'orientation': orientation};
        //dimensions[unidim]['count'] = yval;
        //dimensions[unidim]['orientation'] = orientation;
        dimensions[unidim] = obj;
      } else {
        dimensions[unidim]['count'] += yval;
      }
    }


    //if (yval > 2) {
    //  xValues.push(xval);
    //  yValues.push(yval);

    //}

  }
  colorcodes = {
    'portrait': 'forestgreen',
    'landscape': 'gold',
    'unknown': 'grey'
  };
  orientation_counter = {
    'portrait': 0,
    'landscape': 0,
    'unknown': 0
  };
  list = [];
  for (var d in dimensions) {
    listobj = {
      'label': d,
      'count': dimensions[d]['count'],
      'orientation': dimensions[d]['orientation'],
      'color': colorcodes[dimensions[d]['orientation']]
    }
    orientation_counter[listobj['orientation']] += listobj['count'];
    list.push(listobj);
  }
  console.log(orientation_counter);
  var orientation_xVals = [];
  var orientation_yVals = [];
  var orientation_colors = [];
  for (var oc in orientation_counter) {
    orientation_xVals.push(oc);
    orientation_yVals.push(orientation_counter[oc]);
    orientation_colors.push(colorcodes[oc]);
  }


  let sortby;
  console.log(document.getElementById('sortby-label').attributes);
  if (document.getElementById('sortby-label').hasAttribute('checked')) {
    sortby = 'label';
  } else if (document.getElementById('sortby-count').hasAttribute('checked')) {
    sortby = 'count';
  } else {
    sortby = 'label';
  }

  console.log(sortby);

  if (sortby == 'label') {
    list.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
  } else if (sortby == 'count') {
    list.sort((a, b) => b.count - a.count);
  } else {
    console.error('co jest z sortowaniem?');
  }

  let min_count = document.getElementById('min-count').value;
  console.log("min_count: ", min_count);

  orientation_checkboxes = document.getElementsByClassName('checkbox-count-dimensions-orientation');
  orientations = [];

  for (var oc of orientation_checkboxes) {
    if (oc.hasAttribute('checked')) {
      orientations.push(oc.getAttribute('value'));
    }
  }
  let counter = 0;
  //list2=list.sort();
  for (var l of list) {
    if (l.count >= min_count && orientations.includes(l.orientation)) { //&& l.orientation != 'unknown'
      xValues.push(l.label);
      yValues.push(l.count);
      barColors.push(l.color);
      counter += 1;
    }
  }

  //console.log(dimensions);
  //xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
  //yValues = [55, 49, 44, 24, 15];
  //barColors = "blue";
  document.getElementById('count-dimensions-counter').innerHTML = counter;

  console.log(orientation_xVals, orientation_yVals, orientation_colors);

  drawChart("count_dimensions_chart", "bar", xValues, yValues, barColors, "16th-century manuscripts and prints sizes", "chart-div");
  drawChart("count_orientations_chart", "pie", orientation_xVals, orientation_yVals, orientation_colors, "Orientation counter", "piechart-div");



}

function drawChart(name, type, xValues, yValues, barColors, title, chart_div_id) {
  document.getElementById(chart_div_id).innerHTML = "";
  document.getElementById(chart_div_id).innerHTML = "<canvas style='width: 5700px;' id=\"" + name + "\"></canvas>";

  chart = new Chart(name, {
    type: type,
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      legend: {display: false},
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: false,
        text: title
      }
    }
  });

}
