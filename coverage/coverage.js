steal('./coverage.css','jquery/view/ejs', 'jquery/controller', function(){
	var pct = function(num){
		return Math.round(num*1000)/10+"%";
	}
	$.Controller('Coverage',{
		init: function(){
			this.element.html('//funcunit/coverage/coverage.ejs', {});
			this.renderReport(this.options.stats)
		},
		renderReport: function(data){
			var tr = [], 
				stats;
			$('.stats .line .stat').text(pct(data.total.lineCoverage))
			$('.stats .block .stat').text(pct(data.total.blockCoverage))
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
			$('#report').append(tr.join(""))
		},
		'.file click': function(el, ev){
			ev.preventDefault();
			var data = this.options.stats;
			$("#closeButton").show().text('back to grid');
			$('#report').hide();
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
		},
		'#closeButton click': function(el, ev){
			ev.preventDefault();
			$("#closeButton").hide();
			$('#file').hide();
			$('#report').show();
			$('.stats').show();
			$('.title').text("Code Coverage");
		}
		
	})
})
