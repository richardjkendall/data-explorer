//import moment from 'moment';

const GetTypeOf = (val) => {
  switch(typeof val) {
    case "boolean":
      return "bool";
    case "number":
      return "number";
    case "string":
      if(!isNaN(val)) {
        return "number";
      } else {
        return "string";
        // check if it is a date
        /*if(moment(val).isValid()) {
          return "date";
        } else {
          return "string";
        }*/
      }
    default:
      return "unknown";
  }
}

const GetOverallType = (field) => {
  const types = ["bool", "number", "string", "date"];
  const typeCounts = types.reduce((p,c) => {
    return [...p, field.fieldTypes[c]]
  }, []);
  const typesGtrThanZero = typeCounts.reduce((p,c,i) => {
    if(c > 0) {
      return [...p, i];
    } else {
      return p;
    }
  }, []);
  if(typesGtrThanZero.length > 1) {
    return "string";
  } else {
    return types[typesGtrThanZero[0]];
  }
}

export const GetStats = (data) => {
  // get list of attribute names
  const attributeNames = Object.keys(data[0]);
  // create stats array
  let stats = {};
  attributeNames.forEach(a => {
    stats[a] = {
      uniqueValues: {},
      fieldTypes: {
        bool: 0,
        number: 0,
        string: 0,
        date: 0,
        unknown: 0
      },
      indexType: "categorical",
      fieldType: "string",
      fieldName: a
    }
  })
  data.forEach((d, i) => {
    Object.keys(d).forEach(k => {
      const val = d[k] === null ? "(blank)" : String(d[k]);
      d["__sys_id"] = i;
      if(!Object.keys(stats[k].uniqueValues).includes(val)) {
        stats[k].uniqueValues[val] = [i];
      } else {
        stats[k].uniqueValues[val].push(i);
      }
      // check type for val and put that information in the stats data structure
      const fieldType = GetTypeOf(d[k]);
      stats[k].fieldTypes[fieldType]++;
    });
  });
  // need to go through the stats and see what the field type is:
  Object.keys(stats).forEach(s => {
    stats[s]["fieldType"] = GetOverallType(stats[s]);
  });
  return stats;
}

export const GetSiteUrl = () => {
  let path = window.location.pathname;
  if(path.endsWith("/")) {
    return path;
  } else {
    return path + "/";
  }
}

export const IsProd = () => {
  let path = window.location.pathname;
  if(path.startsWith("/SimplificationReporting/app-explorer-dev")) {
    return false;
  } else {
    return true;
  }
}

const intersect = (a, b) => {
  var setA = new Set(a);
  var setB = new Set(b);
  var intersection = new Set([...setA].filter(x => setB.has(x)));
  return Array.from(intersection);
} 

const difference = (a, b) => {
  var setA = new Set(a);
  var setB = new Set(b);
  var diff = new Set([...setA].filter(x => !setB.has(x)));
  return Array.from(diff);
} 

export const FilterDataSetWithIndex = (data, stats, filters, aggMode = "row-count", aggField = "") => {
  // get size of data
  const totalRows = Object.keys(data).length;
  // place to store the filter stats
  const filterStats = [];
  // get only complete filters for this work
  const completeFilters = filters.filter(f => f.field !== "" && f.options.length > 0);
  // need to reduce filters to a list of IDs, this list should be of those IDs which meet all the criteria
  const ids = completeFilters.map(c => {
    // get lists of IDs for filter options
    const field = c.field;
    const selected = c.options;
    const fieldStats = stats[field];
    let union = selected.reduce((p, s) => {
      return p.concat(fieldStats.uniqueValues[s])
    }, []);
    filterStats.push({
      selectedIdMap: selected.reduce((p, s) => {
        p[s] = fieldStats.uniqueValues[s]
        return p;
      }, {}),
      totalMatching: union.length,
      withinContext: union.length,
      withinContextP: union.length / totalRows,
      eliminated: totalRows - union.length,
      eliminatedP: (totalRows - union.length) / totalRows,
      forId: c.id
    });
    return union;
  });
  // need to intersect the lists
  let filterIds = [];
  if(ids.length > 1) {
    filterIds = ids[0];
    for(let i = 1; i < ids.length;i++) {
      const missing = difference(filterIds, ids[i]);
      const present = intersect(filterIds, ids[i]);         // did this to avoid the no-loop-func es lint error from accessing filterIds in the loop below
      filterIds = /*intersect(filterIds, ids[i]);*/ present;
      // make selected IDs reflect the IDs from the context
      Object.keys(filterStats[i].selectedIdMap).forEach(k => {
        filterStats[i].selectedIdMap[k] = intersect(filterStats[i].selectedIdMap[k], present);
      })
      // create from/to map
      filterStats[i].fromToMap = Object.keys(filterStats[i-1].selectedIdMap).reduce((p, from) => {
        p[from] = Object.keys(filterStats[i].selectedIdMap).reduce((p, to) => {
          // if aggMode is row-count then we take length of intersected array
          if(aggMode === "row-count") {
            p[to] = intersect(filterStats[i-1].selectedIdMap[from], filterStats[i].selectedIdMap[to]).length;
          }
          // if agg mode is sum of a numeric field, then we should get the associated rows and then do a reduce
          if(aggMode === "sum") {
            p[to] = intersect(filterStats[i-1].selectedIdMap[from], filterStats[i].selectedIdMap[to])
                    .map(id => data[id])
                    .reduce((p, c) => p + Number(c[aggField]), 0);
          }
          if(aggMode === "mean") {
            const fData = intersect(filterStats[i-1].selectedIdMap[from], filterStats[i].selectedIdMap[to])
                          .map(id => data[id]);

            if(fData.length > 0) {
              p[to] = fData.reduce((p, c) => p + Number(c[aggField]), 0) / fData.length;
            } else {
              p[to] = 0;
            }
          }
          
          return p;
        }, {});
        // we need to add the to blackhole at the end...
        p[from]["blackhole"] = intersect(filterStats[i-1].selectedIdMap[from], missing).length;
        return p;
      }, {})
      // need to add the 'blackhole' to the from and to map, this is for the items which did not make it through the filter
      filterStats[i].withinContext = filterIds.length;
      filterStats[i].withinContextP = filterIds.length / filterStats[i-1].withinContext;
      filterStats[i].eliminated = filterStats[i-1].withinContext - filterIds.length;
      filterStats[i].eliminatedP = (filterStats[i-1].withinContext - filterIds.length) / filterStats[i-1].withinContext;
    }
  } else {
    if(ids.length > 0) {
      filterIds = ids[0];
    }
  }
  const finalSet =  filterIds.reduce((p, c) => {
    return [...p, data[c]]
  }, []);
  return [finalSet, filterStats];
}

const fixCsvValue = (val) => {
  if(val === null) {
    return val;
  }
  if(typeof val === "number") {
    return val;
  }
  if(val.includes(",")) {
    return "\"" + val + "\"";
  }
  if(val === "NaN") {
    return null;
  }
  return val;
}

export const saveToCsv = (data) => {
  const headers = Object.entries(data[0]).map(item => item[0]);
  console.log("csv headers", headers);
  const csvContent = "data:text/csv;charset=utf-8,"
    + headers.join(",") + "\n"
    + data.map(r => Object.entries(r).map(v => fixCsvValue(v[1])).join(",")).join("\n");
  var link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "download.csv");
  document.body.appendChild(link);
  link.click();
}

export const RoundNumberForDisplay = (num, places) => {
  return Math.round((num + Number.EPSILON) * (10 * places)) / (10 * places);
}

export const saveAs = (blob, fileName) =>{
  var elem = window.document.createElement('a');
  elem.href = blob
  elem.download = fileName;
  elem.style = 'display:none;';
  (document.body || document.documentElement).appendChild(elem);
  if (typeof elem.click === 'function') {
    elem.click();
  } else {
    elem.target = '_blank';
    elem.dispatchEvent(new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    }));
  }
  URL.revokeObjectURL(elem.href);
  elem.remove()
}