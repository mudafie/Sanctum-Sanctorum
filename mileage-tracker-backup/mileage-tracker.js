function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu("Mileage", [
    {name: "Log Trip", functionName: "openTripLogger"},
    {name: "Manage Locations", functionName: "openConfigManager"}
  ]);
}

function getConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("_Config");
  const lastRow = sheet.getLastRow();
  const locationRange = sheet.getRange(2, 1, lastRow - 1, 1);
  const locationValues = locationRange.getValues();
  const locations = locationValues.map(value => value[0]);

  const travelRange = sheet.getRange(2, 3, lastRow - 1, 3);
  const travelValues = travelRange.getValues();
  const matrix = {};
  const distPairs = [];
  travelValues.forEach(stop => {
    matrix[`${stop[0]}|${stop[1]}`] = stop[2];
    distPairs.push({from: stop[0], to: stop[1], miles: stop[2]})
  });

  return { locations, matrix, distPairs };
}

function buildLegs(stops) {
  const legs = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push({ from: stops[i], to: stops[i+1] });
  }
  return legs;
}

function calculateLegs(legs, matrix) {
  const legsDist = legs.map(leg => {
    const key = `${leg.from}|${leg.to}`;
    return { ...leg, miles: matrix[key] };
  });
  return legsDist;
}

function buildRows(date, legsDist) {
  const rows = legsDist.map((leg, index) => {
    return ['', index === 0 ? date : '', leg.from, leg.to, leg.miles, 'Tx'];
  });
  return rows;
}

function writeRows(monthName, rows) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(monthName);
  const a2 = sheet.getRange('A2')
  const a2v = a2.getValue();
  const lastRow = sheet.getLastRow();
  const rowsRange = sheet.getRange(lastRow + 1, 1, rows.length, 6);
  (a2v === '') ? a2.setValue(monthName) : null;
  rowsRange.setValues(rows);
}

function openTripLogger() {
  const output = HtmlService.createHtmlOutputFromFile('TripLogger').setWidth(400).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(output, 'Log Trip');
}

function openConfigManager() {
  const output = HtmlService.createHtmlOutputFromFile('ConfigManager').setWidth(600).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(output, 'Manage Locations');
}

function submitTrip(date, stops) {
  const [year, month, day] = date.split('-');
  const dateObj = new Date(year, month - 1, day);
  const monthName = dateObj.toLocaleString('default', { month: 'long' });
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
  const matrix = getConfig().matrix;
  const legs = buildLegs(stops);
  const legsDist = calculateLegs(legs, matrix);
  const rows = buildRows(formattedDate, legsDist);
  writeRows(monthName, rows);
}

function calculateDistances(pendLoc, locations) {
  const pairs = []
  locations.forEach(location => {
    const outbound = Maps.newDirectionFinder()
      .setOrigin(pendLoc)
      .setDestination(location)
      .getDirections();
    const inbound = Maps.newDirectionFinder()
      .setOrigin(location)
      .setDestination(pendLoc)
      .getDirections();

    const outMeters = outbound.routes[0].legs[0].distance.value;
    const inMeters = inbound.routes[0].legs[0].distance.value;
    const outMiles = outMeters / 1609.34;
    const inMiles = inMeters / 1609.34;
    const outPair = {from: pendLoc, to: location, miles: Math.round(outMiles * 10) / 10};
    const inPair = {from: location, to: pendLoc, miles: Math.round(inMiles * 10) / 10}
    pairs.push(outPair);
    pairs.push(inPair);
  });
  return pairs;
}

function savePending(pendLoc, save) {

}

function removeLocation() {

}

function removeDistance() {

}