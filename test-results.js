var url = new URL(window.location.href);
var githash = url.searchParams.get("hash");

var base_url = "https://flycast-tests.s3.us-east-2.amazonaws.com/" + githash + "/";

var total_tests = 0;
var success_tests = 0;
var failed_tests = 0;

function parse_results(data, system) {
  var el_table = $('<table></table>');
  $.each( data, function( i, item ) {
    var imgurl = item.status == "OK" ? base_url + encodeURIComponent(item.screenshot) : "fail.jpg";
    el_table.append('<tr class="row' + item.status + '" onclick="expand_img(\'screenshot' 
	+ total_tests + '\');"><td>'
	+ item.name + '</td><td>' + item.duration + '</td><td class="screenshot">'
	+ '<img id="screenshot' + total_tests + '" src="' + imgurl 
	+ '" width="160" height="120"></td><td>'
	+ '<a href="' + base_url + item.log + '">Log</a></td></tr>');
    total_tests++;
    if (item.status == "OK")
      success_tests++;
    else
      failed_tests++;
  });
  $("#builds").append("<h2>" + system + "</h2>");
  $("#builds").append(el_table);
}
function failed_results(jqxhr, testStatus, error) {
    $("#builds").append("<h2>No Test Found</h2>");
}

$.getJSON( base_url + "result-us.json")
  .done(function( data ) {
    $("#builds").empty();
    parse_results(data, "Dreamcast - US");

    $.getJSON( base_url + "result-eu.json")
      .done(function( data ) {
        parse_results(data, "Dreamcast - EU");

        $.getJSON( base_url + "result-jp.json")
          .done(function( data ) {
            parse_results(data, "Dreamcast - JP");

            $.getJSON( base_url + "result-naomi.json")
              .done(function( data ) {
                parse_results(data, "Naomi");

	            $.getJSON( base_url + "result-naomi2.json")
	              .done(function( data ) {
	                parse_results(data, "Naomi 2");
	
	                $.getJSON( base_url + "result-awave.json")
	                  .done(function( data ) {
	                    parse_results(data, "Atomiswave");
	                    $("#summary").append("git hash " + githash + ": " + total_tests + " tests, " + success_tests
	                      + " successes, " + failed_tests + " failures.");
	                  })
	                  .fail(failed_results);
	              })
	              .fail(failed_results);
	          })
	          .fail(failed_results);
          })
          .fail(failed_results);
      })
      .fail(failed_results);
  })
  .fail(failed_results);

function expand_img(img)
{
 var imgel = $("#" + img);
 if (imgel.width() != 640)
 {
   imgel.width(640);
   imgel.height(480);
 }
 else
 {
   imgel.width(160);
   imgel.height(120);
 }
}

