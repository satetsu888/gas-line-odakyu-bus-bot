var busLineDataSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("bus_lines");
var busLines = sheet2json(busLineDataSheet);

var credential = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("credential");
var ACCESS_TOKEN = credential.getRange("B1").getValue();

var line_url = 'https://api.line.me/v2/bot/message/reply';

var quickReplyItems = [];
for each(var busLine in busLines) {
  quickReplyItems.push({
    "type": "action",
    "imageUrl": "https://satetsu888.github.io/gas-line-odakyu-bus-bot/static/img/bus-xxl.png",
    "action": {
      "type": "message",
      "label": busLine["name"],
      "text": busLine["name"]
    }
  });
}

var baseMessage = {
  "type": "text",
  "text": "路線を選んでね",
  "quickReply": {
    "items": quickReplyItems
  }
};

function doPost(e) {
  var postedEvent = JSON.parse(e.postData.contents).events[0];
  var replyToken = postedEvent.replyToken;
  var userId = postedEvent.source.userId;
  var userMessage = postedEvent.message.text;
  
  var messages = [baseMessage];
  for each(var busLine in busLines){
    if (userMessage === busLine["name"]){
      var busData = fetchBusData(busLine["url"]);
      if (busData) {
        var message = busData['arrive_at'] + " " + busData['to'] + "行きは、" + busData['message'];
      } else {
        var message = "本日の運行は終了しました";
      }
      messages = [{
        'type': 'text',
        'text': message
      }];
    }
  }
  
  UrlFetchApp.fetch(line_url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages,
    }),
    });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function fetchBusData(url) {
  var response = UrlFetchApp.fetch(url);
  
  var end_re = /本日の運行は終了/;
  var re = /[\s\S]*?<tr>[\s\S]*?<\/tr>[\s\S]*?<tr>[\s\S]*?<td class="alignC">(\d{2}:\d{2})<\/td>[\s\S]*?<td class="alignC">(\d{2}:\d{2})<\/td>[\s\S]*?<td class="alignL">(.*?)<\/td>[\s\S]*?<td class="alignL">(.*?)<\/td>[\s\S]*?<td class="alignL">(.*?)<\/td>/i;
  var content = response.getContentText("sjis");
  var end_match = end_re.exec(content);
  if (end_match) {
    return;
  }
  var match = re.exec(content);
  if (match) {
    return {
      "to": match[3],
      "arrive_at": match[2],
      "message": match[5],
    };
  }
}
