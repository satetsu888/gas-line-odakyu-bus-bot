function sheet2json(sheet) {
  var sheet_values = sheet.getRange(1,1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var keys = sheet_values[0];
  var rows = sheet_values.slice(1);

  var json = [];
  for each(var row in rows) {
    var data = {};
    for(var index in keys) {
      data[keys[index]] = row[index];
    }
    json.push(data);
  }
  return json;
}