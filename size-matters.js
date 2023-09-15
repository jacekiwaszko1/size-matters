//get index of dimensions count:
let count_dimensions_json;
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://raw.githubusercontent.com/jacekiwaszko1/size-matters/main/data/count-dimensions-within-dates.json");
xhr.send();
xhr.responseType = "json";
xhr.onload = () => {
  if (xhr.readyState == 4 && xhr.status == 200) {
    const data = xhr.response;
    //console.log(data);
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
    //console.log("data: ", data);
    count_dimensions_query = data;
    document.getElementById('count_dimensions_code').innerHTML = htmlSpecialChars(count_dimensions_query);
  } else {
    console.log(`Error: ${xhr_count_dimensions_query.status}`);
  }
};
//console.log(count_dimensions_query);

//get index of sources with dimiensions
let sources_dimensions_query;
const xhr_sources_dimensions_query = new XMLHttpRequest();
xhr_sources_dimensions_query.open("GET", "https://raw.githubusercontent.com/jacekiwaszko1/size-matters/main/data/sources-with-dimensions.json");
xhr_sources_dimensions_query.send();
xhr_sources_dimensions_query.responseType = "json";
xhr_sources_dimensions_query.onload = () => {
  if (xhr_sources_dimensions_query.readyState == 4 && xhr_sources_dimensions_query.status == 200) {
    const data = xhr_sources_dimensions_query.response;
    //console.log("data: ", data);
    sources_dimensions_query = data;
    document.getElementById('sources-dimensions-index').innerHTML = JSON.stringify(sources_dimensions_query);
  } else {
    console.log(`Error: ${xhr_sources_dimensions_query.status}`);
  }
};

//get query returning the index of sources with dimiensions:
let source_dimensions_query;
const xhr_source_dimensions_query = new XMLHttpRequest();
xhr_source_dimensions_query.open("GET", "https://raw.githubusercontent.com/jacekiwaszko1/size-matters/main/sparql-queries/sources-with-dimensions.sparql");
xhr_source_dimensions_query.send();
xhr_source_dimensions_query.responseType = "text";
xhr_source_dimensions_query.onload = () => {
  if (xhr_source_dimensions_query.readyState == 4 && xhr_source_dimensions_query.status == 200) {
    const data = xhr_source_dimensions_query.response;
    //console.log("data: ", data);
    source_dimensions_query = data;
    document.getElementById('source_dimensions_code').innerHTML = htmlSpecialChars(source_dimensions_query);
  } else {
    console.log(`Error: ${xhr_source_dimensions_query.status}`);
  }
};
//console.log(count_dimensions_query);


if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

let search_index;

function activateTab(tabname, navtab, from) {
  console.log(tabname);
  var tabs = document.getElementsByClassName('content-tab');
  console.log(tabs);
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
  } else if (tabname == 'search') {
    search_index = prepareSearchIndex();
  }
}


function toggleChecked(id) {
  if (id == 'sortby-label') {
    document.getElementById('sortby-label').setAttribute('checked', true);
    document.getElementById('sortby-count').removeAttribute('checked');
  } else if (id == 'sortby-count') {
    document.getElementById('sortby-count').setAttribute('checked', true);
    document.getElementById('sortby-label').removeAttribute('checked');
  } else if (id == 'search-sort-by-size') {
    document.getElementById('search-sort-by-size').setAttribute('checked', true);
    document.getElementById('search-sort-by-date').removeAttribute('checked');
    document.getElementById('search-sort-by-orientation').removeAttribute('checked');
  } else if (id == 'search-sort-by-date') {
    document.getElementById('search-sort-by-date').setAttribute('checked', true);
    document.getElementById('search-sort-by-size').removeAttribute('checked');
    document.getElementById('search-sort-by-orientation').removeAttribute('checked');
  } else if (id == 'search-sort-by-orientation') {
    document.getElementById('search-sort-by-orientation').setAttribute('checked', true);
    document.getElementById('search-sort-by-size').removeAttribute('checked');
    document.getElementById('search-sort-by-date').removeAttribute('checked');

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

function resetSearch() {
  document.getElementById('search-form').reset();
  let checkboxes = document.getElementsByClassName('checkbox-search-dimensions-orientation');
  for (var cb of checkboxes) {
    if (cb.checked == false) {
      toggleChecked(cb.id);
    }
  }
  searchIndex();
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
    h = parseFloat(h.replace(',', '.'));
    w = parseFloat(w.replace(',', '.'));
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

let colorcodes = {
  'portrait': 'forestgreen',
  'landscape': 'gold',
  'unknown': 'grey'
};

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


function prepareSearchIndex() {
  let index = [];
  for (var item of sources_dimensions_query['results']['bindings']) {
    let dim = parseDimensions(item.d.value);
    dim['id'] = item.s.value;
    dim['date'] = item.date.value;
    index.push(dim);
  }
  return index;
}

function searchIndex() {
  //console.log(search_index);
  let search_parameters = {};
  search_parameters['h'] = parseFloat(document.getElementById('height-input').value);
  search_parameters['w'] = parseFloat(document.getElementById('width-input').value);
  search_parameters['accuracy'] = parseFloat(document.getElementById('accuracy-input').value);
  if (isNaN(search_parameters['accuracy'])) {
    search_parameters['accuracy'] = parseFloat(0);
  }
  search_parameters['orientation'] = [];
  let orientation_checkboxes = document.getElementsByClassName('checkbox-search-dimensions-orientation');
  for (var oc of orientation_checkboxes) {
    if (oc.hasAttribute('checked')) {
      search_parameters['orientation'].push(oc.getAttribute('value'));
    }
  }
  search_parameters['uniformed'] = document.getElementById('search-uniformed').value;
  let radio_sortby = document.getElementsByName('search-sort-by');
  for (var radio of radio_sortby) {
    if (radio.hasAttribute('checked')) {
      search_parameters['sortby'] = radio.value;
    }
  }

  let results = [];

  for (var item of search_index) {
    let addtolist = true;
    if (search_parameters['uniformed'] != '') {
      if (item.uniformed == search_parameters['uniformed']) {
        addtolist = true;
      } else {
        addtolist = false;
        continue;
      }
    }
    if (search_parameters['orientation'].includes(item.orientation)) {
      addtolist = true;
    } else {
      addtolist = false;
      continue;
    }
    if (!isNaN(search_parameters['h'])) {
      //console.log(item.h, search_parameters['h'] - search_parameters['accuracy']);
      if (item.h == undefined) {
        addtolist == false;
        continue;
      } else if (item.h >= search_parameters['h'] - search_parameters['accuracy'] &&
                 item.h <= search_parameters['h'] + search_parameters['accuracy']) {
        addtolist = true;
      } else {
        addtolist = false;
        continue;
      }
    }
    if (!isNaN(search_parameters['w'])) {
      if (item.w >= search_parameters['w'] - search_parameters['accuracy'] &&
          item.w <= search_parameters['w'] + search_parameters['accuracy']) {
        addtolist = true;
      } else {
        addtolist = false;
        continue;
      }
    }

    if (addtolist == true) {
      results.push(item);
    }

  }
  console.log(search_parameters);
  console.log(results);



  if (search_parameters['sortby'] == 'size') {
    results.sort((a,b) => (a.uniformed > b.uniformed) ? 1 : ((b.uniformed > a.uniformed) ? -1 : 0));
  } else if (search_parameters['sortby'] == 'orientation') {
    results.sort((a,b) => (a.orientation > b.orientation) ? 1 : ((b.orientation > a.orientation) ? -1 : 0));
  } else if (search_parameters['sortby'] == 'date') {
    results.sort((a,b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0));
  } else {
    console.error('co jest z sortowaniem?');
  }

  if (isNaN(search_parameters['h']) &&
      isNaN(search_parameters['w']) &&
      search_parameters['accuracy'] == 0 &&
      search_parameters['orientation'].length == 3 &&
      search_parameters['uniformed'] == ''
     ) {
    console.log('clear search');
    document.getElementById('result-list').innerHTML = "";
    document.getElementById('search-result-count').innerHTML = "";
  } else {
    document.getElementById('search-result-count').innerHTML = "Number of search results: " + results.length;
    document.getElementById('result-list').innerHTML = "";

    //const xhr = new XMLHttpRequest();
    //xhr.open("GET", r.id);
    //xhr.send();
    //xhr.responseType = "json";
    //xhr.setRequestHeader('Accept', 'application/json+ld');
    //xhr.onload = () => {
    //  if (xhr.readyState == 4 && xhr.status == 200) {
    //    const data = xhr.response;
    //    console.log(data);
    //    document.getElementById('count_dimensions').innerHTML = JSON.stringify(count_dimensions_json);
    //  } else {
    //    console.log(`Error: ${xhr.status}`);
    //  }
    //};
    let result_counter = 1;
    let evenodd = ['even', 'odd'];
    let table = document.createElement('table');
    table.setAttribute('id', 'list-of-results');
    let head = document.createElement('tr');
    head.setAttribute('class', 'header');
    let columns = ['No.', 'Dimensions', 'Orientation', 'RISM ID', 'Date'];
    for (var c of columns) {
      let th = document.createElement('th');
      th.innerHTML = c;
      head.appendChild(th);
    }
    table.appendChild(head);

    for (var r of results) {
      let tr = document.createElement('tr');
      tr.setAttribute('class', evenodd[result_counter%2]);
      let no = document.createElement('td');
      no.setAttribute('onclick', "window.open(\'" + r.id + "\', \"_blank\")");
      no.innerHTML = result_counter;
      tr.appendChild(no);
      let dim = document.createElement('td');
      dim.setAttribute('onclick', "window.open(\'" + r.id + "\', \"_blank\")");
      dim.innerHTML = r.uniformed;
      tr.appendChild(dim);
      let orient = document.createElement('td');
      orient.setAttribute('class', colorcodes[r.orientation]);
      orient.setAttribute('onclick', "window.open(\'" + r.id + "\', \"_blank\")");
      orient.innerHTML = r.orientation;
      tr.appendChild(orient);
      let rism = document.createElement('td');
      rism.setAttribute('onclick', "window.open(\'" + r.id + "\', \"_blank\")");
      rism.innerHTML = r.id.replace(/.*\//, '');
      tr.appendChild(rism);
      let date = document.createElement('td');
      date.setAttribute('onclick', "window.open(\'" + r.id + "\', \"_blank\")");
      date.innerHTML = r.date;
      tr.appendChild(date);
      table.appendChild(tr);
      result_counter += 1;
    }
    document.getElementById('result-list').appendChild(table);
  }

}
