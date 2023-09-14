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
//console.log(count_dimensions_json);
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
    document.getElementById('count_dimensions_code').innerHTML = htmlSpecialChars(count_dimensions_query);
  } else {
    console.log(`Error: ${xhr_count_dimensions_query.status}`);
  }
};
//console.log(count_dimensions_query);


if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}


function activateTab(tabname, navtab, from) {
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
    if (from == 'count_dimensions_settings') {
      prepareCountDimensions(from);
    } else {
      prepareCountDimensions();
    }
  }
}


function toggleChecked(id) {
  //console.log(id);
  if (id == 'sortby-label') {
    document.getElementById('sortby-label').setAttribute('checked', true);
    document.getElementById('sortby-count').removeAttribute('checked');
  } else if (id == 'sortby-count') {
    document.getElementById('sortby-count').setAttribute('checked', true);
    document.getElementById('sortby-label').removeAttribute('checked');
  } else {
    if (document.getElementById(id).hasAttribute('checked')) {
      //console.log('uncheck ', id);
      document.getElementById(id).removeAttribute('checked');
    } else {
      //console.log('check ', id);
      document.getElementById(id).setAttribute('checked', true);
    }
  }
}

function htmlSpecialChars(text) {
    return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseDimensions(dimstring) {
  let dimobj = {
    'h': 0,
    'w': 0,
    'orientation': '',
    'uniformed': ''
  };

  //remove all data in parenthesis
  let repl = / *\([^)]*\)/g;
  dimstring = dimstring.replace(repl, '');

  //match all dimensions in string
  let regex = /[0-9]+[,.]?[0-9]? ?[xX] ?[0-9]+[,.]?[0-9]? ?[cm]?m?/g;
  let matched_dimensions = dimstring.match(regex);

  //no actual dimensions find:
  if (matched_dimensions == null) {
    // generalized format information (in 4o, in 8o etc)
    let nodim_orientation = 'unknown';
    if (dimstring.match(/^in/) != null ) {
      let uniformed = 'in-';
      if (dimstring.match(/[0-9]+/) != null) {
        uniformed += dimstring.match(/[0-9]+/)[0];
      } else if (dimstring.match(/fol/) != null) {
        uniformed += 'fol';
      }
      if (dimstring.match(/obl/) != null) {
        uniformed += 'obl.';
        nodim_orientation = 'landscape';
      }
      dimobj.h = undefined;
      dimobj.w = undefined;
      dimobj.orientation = nodim_orientation;
      dimobj.uniformed = uniformed;
    // no recognized dimension indication
    } else {
      dimobj.h = undefined;
      dimobj.w = undefined;
      dimobj.orientation = nodim_orientation;
      dimobj.uniformed = dimstring.toLowerCase();
    }
  // found dimensions in expected format: h x w [unit], eg. 15,5 x 21 cm
  } else {
    // take only first of the dimensions
    let dim = matched_dimensions[0];
    dim = dim.replace(/^s+/, '').replace(/\s+$/);
    let h = dim.replace(/ *[xX].*$/, '');
    let w = dim.replace(/.*[xX] */, '').replace(/[^0-9]*$/, '');
    h = h.replace(',', '.');
    w = w.replace(',', '.');
    if (h > 100 || w > 100) {
      h = h/10;
      w = w/10;
    }
    let orientation = '';
    if (h > w) {
      orientation = 'portrait';
    } else if (w > h) {
      orientation = 'landscape';
    } else {
      orientation = 'unknown';
    }
    uniformed = h + "x" + w;
    dimobj.h = h;
    dimobj.w = w;
    dimobj.orientation = orientation;
    dimobj.uniformed = uniformed;
  }
  //console.log(dimstring, dimobj);
  return dimobj;
}



function prepareCountDimensions(from) {
  //console.log('drawing chars', count_dimensions_json);
  var xValues = [];
  var yValues = [];
  var barColors = [];
  var dimensions = {};
  //dimensions - data cleanup
  for (var i = 0; i < count_dimensions_json['results']['bindings'].length; i++) {
    let bar = count_dimensions_json['results']['bindings'][i];
    xval = bar['d']['value'];

    let dimobj = parseDimensions(xval);

    yval = parseInt(bar['count']['value']);

    if (dimobj.h != undefined && dimobj.w != undefined) {
      let round_h = Math.round(dimobj.h);
      let round_w = Math.round(dimobj.w);
      let label = round_h + "x" + round_w;
      if (dimensions[label] == undefined) {
        dimensions[label] = {'count': yval, 'orientation': dimobj.orientation};
      } else {
        dimensions[label]['count'] += yval;
      }
    } else if (dimobj.h == undefined || dimobj.w == undefined) {
      //console.log(dimobj);
      if (dimensions[dimobj.uniformed] == undefined) {
        dimensions[dimobj.uniformed] = {'count': yval, 'orientation': dimobj.orientation};
      } else {
        dimensions[dimobj.uniformed]['count'] += yval;
      }
    }

  }

  //console.log(dimensions);

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
  //console.log(orientation_counter);
  var orientation_xVals = [];
  var orientation_yVals = [];
  var orientation_colors = [];
  for (var oc in orientation_counter) {
    orientation_xVals.push(oc);
    orientation_yVals.push(orientation_counter[oc]);
    orientation_colors.push(colorcodes[oc]);
  }


  let sortby;
  //console.log(document.getElementById('sortby-label').attributes);
  if (document.getElementById('sortby-label').hasAttribute('checked')) {
    sortby = 'label';
  } else if (document.getElementById('sortby-count').hasAttribute('checked')) {
    sortby = 'count';
  } else {
    sortby = 'label';
  }

  //console.log(sortby);

  if (sortby == 'label') {
    list.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
  } else if (sortby == 'count') {
    list.sort((a, b) => b.count - a.count);
  } else {
    console.error('co jest z sortowaniem?');
  }

  let min_count = document.getElementById('min-count').value;
  //console.log("min_count: ", min_count);

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

  //console.log(orientation_xVals, orientation_yVals, orientation_colors);

  drawChart("count_dimensions_chart", "bar", xValues, yValues, barColors, "16th-century manuscripts and prints sizes", "chart-div");
  if (from != 'count_dimensions_settings') {
    drawChart("count_orientations_chart", "pie", orientation_xVals, orientation_yVals, orientation_colors, "Orientation counter", "piechart-div");
  }

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
