steal('jquery/view/ejs', 'jquery/controller', function(){
	var pct = function(num){
		return Math.round(num*1000)/10;
	}
	
	$.Controller('Coverage',{
		
		init: function()
		{
			this.renderReport(this.options.stats);
		},
		
		renderReport: function(data)
		{
			var tr = [], 
				stats = null,
				totalLine = pct(data.total.lineCoverage),
				totalBlock = pct(data.total.blockCoverage);
			
			var run = Math.round(data.total.lineCoverage*data.total.lines); 
			this.find('.report-wrapper .total-stat .covered').html(run + "/" + data.total.lines)
				
			this.find('.report-wrapper .total-line-coverage .stat').html(totalLine + "%");
			this.find('.report-wrapper .total-block-coverage .stat').html(totalBlock + "%");
			this.find('.report-wrapper .total-line-coverage .chart').html('<img height="150" width="150" src="http://chart.apis.google.com/chart?chs=150x150&cht=pc&chco=0E51A2,BBCCED&chd=t:0|' + totalLine +',' + (100 - totalLine) + '&chma=|2,3" />');
			this.find('.report-wrapper .total-block-coverage .chart').html('<img height="150" width="150" src="http://chart.apis.google.com/chart?chs=150x150&cht=pc&chco=0E51A2,BBCCED&chd=t:0|' + totalBlock + ',' + (100 - totalBlock) + '&chma=|2,3" />');
			
			for(var file in data.files){
				tr.push("<tr>");
				stats = data.files[file];
				
				var linePercentage = pct(stats.lineCoverage),
					blockPercentage = pct(stats.blockCoverage);
					
				tr.push("<td>", "<a class='file' href='#'>", file, "</a>", "</td>");
				tr.push("<td>", stats.lines, "</td>");
				tr.push("<td>", "<img height='15' width='130' src='http://chart.apis.google.com/chart?chf=bg,s,dedede&chxs=0,000000,0,0,_,dedede|1,000000,0,0,_,dedede&chxt=x,y&chbh=23,0,0&chs=130x15&cht=bhs&chco=0E51A2,dedede&chp=0,0.033&chma=2&chd=t:", parseInt(linePercentage, 10), "|100' />", linePercentage ,"%</td>");
				tr.push("<td>", stats.blocks, "</td>");
				tr.push("<td>", "<img height='15' width='130' src='http://chart.apis.google.com/chart?chf=bg,s,dedede&chxs=0,000000,0,0,_,dedede|1,000000,0,0,_,dedede&chxt=x,y&chbh=23,0,0&chs=130x15&cht=bhs&chco=0E51A2,dedede&chp=0,0.033&chma=2&chd=t:", parseInt(blockPercentage, 10), "|100' />", blockPercentage ,"%</td>");
				tr.push("</tr>");
			}
			
			$('#report').append(tr.join(""))
		},
		
		'.file click': function(el, ev)
		{
			ev.preventDefault();
			
			var data = this.options.stats;
			
			var fileName = $(ev.target).text(),
				src = data.files[fileName].src,
				totalLine = pct(data.files[fileName].lineCoverage),
				totalBlock = pct(data.files[fileName].blockCoverage),
				linesUsed = data.files[fileName].linesUsed,
				fileArr = src.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").split("\n"),
				tr = [],
				lines;
				
			this.find("#file-tab").text(fileName)
			var run = Math.round(data.files[fileName].lineCoverage*data.files[fileName].lines); 
			this.find('.files-wrapper .total-stat .covered').html(run + "/" + data.files[fileName].lines)
				
			this.find('.files-wrapper .total-line-coverage .stat').html(totalLine + "%");
			this.find('.files-wrapper .total-block-coverage .stat').html(totalBlock + "%");
			this.find('.files-wrapper .total-line-coverage .chart').html('<img height="150" width="150" src="http://chart.apis.google.com/chart?chs=150x150&cht=pc&chco=0E51A2,BBCCED&chd=t:0|' + totalLine +',' + (100 - totalLine) + '&chma=|2,3" />');
			this.find('.files-wrapper .total-block-coverage .chart').html('<img height="150" width="150" src="http://chart.apis.google.com/chart?chs=150x150&cht=pc&chco=0E51A2,BBCCED&chd=t:0|' + totalBlock + ',' + (100 - totalBlock) + '&chma=|2,3" />');
			
			for(var i=0; i<fileArr.length; i++){
				var hits = typeof linesUsed[i] == "number"? linesUsed[i] : 0,
					hitText = typeof linesUsed[i] == "number"? linesUsed[i] : "",
					isHit = (hits > 0),
					isBlank = (hitText === ''),
					css = (isHit ? 'hit' : (isBlank ? 'blank' : 'miss'));
					
				tr.push("<tr>");
				tr.push("<td class='line'>", hitText, "</td>");
				tr.push("<td class='", css,"'>", "<pre>", fileArr[i], "</pre>", "</td>", "</tr>");
			}
			
			this.find('.report-wrapper').hide();
			this.find('.files-wrapper').show();
			this.find('#file').html(tr.join(""));
			
			this.find('.file-options').show();
			this.find('#report-tab').removeClass('btn-pressed')
			this.find('#file-tab').show().addClass('btn-pressed')
		},
		
		"#showHighlighting change":function(el,ev)
		{
			this.find('.files-wrapper').toggleClass('highlighted');
		}
		
	})
})
