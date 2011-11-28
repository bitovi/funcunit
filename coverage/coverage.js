steal('funcunit/browser/resources/jquery.js', function(){
	var data;
	var pct = function(num){
		return Math.round(num*1000)/10+"%";
	}
	$.ajax({
		url: 'coverage.json',
		dataType: 'json',
		success: function(d){
			data = d;
			var tr = [], 
				stats;
			$('.stats .line .stat').text(pct(d.total.lineCoverage))
			$('.stats .block .stat').text(pct(d.total.blockCoverage))
			for(var file in data.files){
				tr.push("<tr>");
				stats = data.files[file];
				var linePercentage = pct(stats.lineCoverage),
					blockPercentage = pct(stats.blockCoverage);
				tr.push("<td>", "<a class='file' href='#'>", file, "</a>", "</td>");
				tr.push("<td>", stats.lines, "</td>");
				tr.push("<td>", "<img height='15' width='130' src='http://chart.apis.google.com/chart?chf=bg,s,676767&chxs=0,000000,0,0,_,676767|1,000000,0,0,_,676767&chxt=x,y&chbh=23,0,0&chs=130x15&cht=bhs&chco=585858,919191&chp=0,0.033&chma=2&chd=t:", parseInt(linePercentage, 10), "|100' />", linePercentage ,"</td>");
				tr.push("<td>", stats.blocks, "</td>");
				tr.push("<td>", "<img height='15' width='130' src='http://chart.apis.google.com/chart?chf=bg,s,676767&chxs=0,000000,0,0,_,676767|1,000000,0,0,_,676767&chxt=x,y&chbh=23,0,0&chs=130x15&cht=bhs&chco=585858,919191&chp=0,0.033&chma=2&chd=t:", parseInt(blockPercentage, 10), "|100' />", blockPercentage ,"</td>");
				tr.push("</tr>");
			}
			$('#coverage').append(tr.join(""))
		}
	})
	$('#coverage').delegate('.file', 'click', function(ev){
		$("#closeButton").show().text('back to grid');
		$('#coverage').hide();
		$('.stats').hide();
		
		var fileName = $(ev.target).text(),
			src = data.files[fileName].src,
			linesUsed = data.files[fileName].linesUsed,
			fileArr = src.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").split("\n"),
			tr = [],
			lines;
		$('.title').text(fileName);
		for(var i=0; i<fileArr.length; i++){
			var hits = typeof linesUsed[i] == "number"? linesUsed[i] : 0,
				hitText = typeof linesUsed[i] == "number"? linesUsed[i] : "",
				isHit = (hits > 0);
			tr.push("<tr>");
			tr.push("<td>", hitText, "</td>");
			tr.push("<td"+(isHit? " class='hit'":"")+">", "<pre>", fileArr[i], "</pre>", "</td>", "</tr>");
		}
		$('#file').show().css("display", "block").html(tr.join(""))
	});
	$("#closeButton").bind("click", function(){
		$("#closeButton").hide();
		$('#file').hide();
		$('#coverage').show();
		$('.stats').show();
		$('.title').text("Code Coverage");
	})
})
