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
        var message = busData['departure_at'] + " " + busData['to'] + "行きは" + busData['message'] + "。目的地到着は" + busData['arrive_at'] + "の予定です。";
      } else {
        var message = "本日の運行は終了したかエラーが発生しました";
      }
      messages = [{
        "type": "text",
        "text": message,
        "quickReply": {
          "items": quickReplyItems
        }
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
  try {
    var response = UrlFetchApp.fetch(url);
    
    var all_content = response.getContentText("utf-8");
    var end_re = /60分以内に接近しているバスはありません。/;
    var end_match = end_re.exec(all_content);
    if (end_match) {
      return;
    }

    var cut_re = /<div class="route_box clearfix" style="background-color: gold;">([\s\S]*?)<!-- ---------------- pictogram start -->/;
    var content = cut_re.exec(all_content)[1];
    var re = /発車予測[\D]*(\d{2}:\d{2})[\s\S]*?<td[\s]*?class="route_name">[\s\S]*?<font[\s]*?style="color:[\s]*?black;">([\s\S]+?)<\/font>[\s\S]*?<\/td>[\s\S]*?到着予測[\D]*(\d{2}:\d{2})[\s\S]*?<td colspan="4"[\s]*?style="color:#000000;">([\s\S]*)<\/td>/i
    var match = re.exec(content);
    if (match) {
      message = match[4].replace(/&nbsp;|<font[\s\S]*?>|<\/font>|\s/g, '')
      return {
        "to": match[2],
        "departure_at": match[1],
        "arrive_at": match[3],
        "message": message,
      };
    }
  } catch(e) {
    return;
  }
}
