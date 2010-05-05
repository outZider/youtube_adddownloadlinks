// ==UserScript==
// @name          YouTube_AddDownloadLinks
// @namespace     
// @description   ダウンロード用リンク（MP4,FLV,3GP）を表示します
// @include       http://*youtube.com/watch*
// @version       0.2.2
// @author        outZider
// ==/UserScript==
(function() {

var formats = [
  {fmt: 37, dsc: "MP4(HD1080p H.264/AAC)", available: false},
  {fmt: 22, dsc: "MP4(HD720p H.264/AAC)", available: false},
  {fmt: 18, dsc: "MP4(iPod H.264/AAC)", available: true},
  {fmt: 35, dsc: "FLV(高 H.264/AAC)", available: false},
  {fmt: 34, dsc: "FLV(低 H.264/AAC)", available: false},
  {fmt:  6, dsc: "FLV(高-old H.263/MP3)", available: false},
  {fmt:  5, dsc: "FLV(低-old H.263/MP3)", available: true},
  {fmt: 17, dsc: "3GP(高 MPEG4/AAC)", available: true},
  {fmt: 13, dsc: "3GP(低 H.263/AMR)", available: true}
];
var t = "", video_id = "";
var flashvars = document.evaluate("id('movie_player')", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
var args = flashvars.snapshotItem(0).getAttribute("flashvars").split("&");
for (var i = 0; i < args.length; i++) {
  if (args[i].match(/^t=/)) {
    t = args[i].split("=")[1];
  }
  else if (args[i].match(/^video_id=/)) {
    video_id = args[i].split("=")[1];
  }
  else if (args[i].match(/^fmt_url_map=/)) {
    var fl = decodeURIComponent(args[i].split("=")[1]).split(",");
    for (var j = 0; j < fl.length; j++) {
      var v = parseInt(fl[j].split("|")[0]);
      for (var k = 0; k < formats.length; k++) {
        if (formats[k].fmt == v) {
          formats[k].available = true;
        }
      }
    }
  }
}
var al = document.createElement("div");
al.style.margin = "4px 0px 0px 0px";
al.style.padding = "3px";
al.style.MozBorderRadius = "6px";
al.style.backgroundColor = "#ddd";
al.id = "div-ytadl";
var ht = "";
for (var i = 0; i < formats.length; i++) {
  if (formats[i].available) {
    ht += "<a class='ytadllink' ";
    ht += "href='" + "http://" + location.host + "/get_video?video_id=" + video_id + "&t=" + t + "&fmt=" + formats[i].fmt + "' ";
    var filename = document.getElementById("watch-headline-title").textContent.replace(/^\s+/, "").replace(/\s+$/, "").replace(/[\\\/\"]/g, "_").replace(/\s/g, "+").replace(/%/g, "%25").replace(/&/g, "%26").replace(/#/g, "%23").replace(/\'/g, "%27").replace(/,/g, "%2c").replace(/=/g, "%3d").replace(/\?/g, "%3f");
    ht += "title='" + filename + "'>" + formats[i].dsc + "</a>";
  }
  else {
    ht += "<font color='#bbb'>" + formats[i].dsc + "</font>";
  }
  ht += "&nbsp;&nbsp;";
}
al.innerHTML = ht;
document.getElementById("watch-headline").appendChild(al);
var links = document.getElementsByClassName("ytadllink");
for (var i = 0; i < links.length; i++) {
  links[i].addEventListener("click", function(e) {
    if (e.button == 0) {
      document.getElementById("div-ytadl").setAttribute("title", e.currentTarget.getAttribute("title"));
      var xhr = GM_xmlhttpRequest({
        method: "GET",
        url: e.currentTarget.getAttribute("href"),
        onreadystatechange: function(response) {
          if (response.readyState == 2 || response.readyState == 3) {
            xhr.abort();
          }
          else if (response.readyState == 4) {
            document.location.href = response.finalUrl + "&title=" + document.getElementById("div-ytadl").getAttribute("title");
          }
        },
        onerror: function(response) {
          alert("YTADL: error");
        }
      });
    }
    e.preventDefault();
  }, false);
}

})();