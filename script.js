$(document).ready(function(){
  console.log('ready');

    $("#get_quote").on('click', function(){
      $('#quote_line').html("Requesting quote...");
      $('#quote_author').html("- dev");
      var shooter = new api_shooter();
      shooter.get_random_quote();
      
    });
  
  $("#tweet_it").on('click', function(){
    var gen_url = "https://twitter.com/intent/tweet?text="+$("#quote_line").html();
    window.open(gen_url);
  });
   
});

var API_URL = "https://en.wikiquote.org/w/api.php";


var api_shooter = function()
{
	var api_back = {};
	var me = this;
	this.api_url = "https://en.wikiquote.org/w/api.php";
	
  this.title;
  this.page_id;
  this.section_index;
  this.quotes;
  
  this.update_page_with_results = function()
  {
      $('#quote_line').html(this.quotes);
      $('#quote_author').html("- "+this.title);
  };
  
	this.queryRandomTitle = function(titles, success, error)
	{
    
    
  this.title = undefined;
  this.page_id = undefined;
  this.section_index = undefined;
  this.quotes = undefined;  
		$.ajax({
			url:this.api_url,
			dataType: "jsonp",
			data: {
				format: "json",
				action: "query",
				redirects: "",
				list: "random",
				rnnamespace: "0"
			},
			
			success: function(result, status) {
				var title = result.query.random[0].title;
				if(title !== undefined) {
				  success(title);
				} else {
				  error("No results");
				}
			},
			
			error: function(xhr, result, status) {
				error("Error processing your query");
			}
		
		
		
		
		});
	};
	
	this.get_random_quote = function()
	{
		var titles;
		
		var errorFunction = function(msg)
		{
			console.log("ERROR "+msg);
		}
		
		var get_data = function(data)
		{
			console.log("data get!");
			console.log(data);
      me.title = data;
      me.process_title(data);
		}
		
		this.queryRandomTitle(titles, get_data, errorFunction);
	};
  
  
	this.process_title = function(title)
	{
		var pageId;
		
		var errorFunction = function(msg)
		{
			console.log("ERROR "+msg);
		}
		
		var get_data = function(data)
		{
			console.log("title processed!");
			console.log(data);
      me.page_id = data;
			me.process_sections_fromId(data);
		}
		
		this.queryTitles(title, get_data, errorFunction);
	};
  
  
	this.queryTitles = function(titles, success, error) {
    
		$.ajax({
		  url: API_URL,
		  dataType: "jsonp",
		  data: {
			format: "json",
			action: "query",
			redirects: "",
			titles: titles
		  },

		  success: function(result, status) {
			var pages = result.query.pages;
			var pageId = -1;
			for(var p in pages) {
			  var page = pages[p];
			  // api can return invalid recrods, these are marked as "missing"
			  if(!("missing" in page)) {
				pageId = page.pageid;
				break;
			  }
			}
			if(pageId > 0) {
			  success(pageId);
			} else {
			  error("No results");
			}
		  },

		  error: function(xhr, result, status){
			error("Error processing your query");
		  }
		});
    };
	
  
  
  
  
  
  
  this.process_sections_fromId = function(pageId)
	{
		
		
		var errorFunction = function(msg)
		{
			console.log("ERROR "+msg);
		}
		
		var get_data = function(data)
		{
			console.log("sections from id processed!");
			console.log(data);
		  me.section_index = data;
      me.process_quotes_from_sections_and_id(me.page_id, me.section_index);
		}
		
		this.getSectionsForPage(pageId, get_data, errorFunction);
	};
  
  
    
	
	this.getSectionsForPage = function(pageId, success, error) {
		$.ajax({
		  url: API_URL,
		  dataType: "jsonp",
		  data: {
			format: "json",
			action: "parse",
			prop: "sections",
			pageid: pageId
		  },

		  success: function(result, status){
			var sectionArray = [];
			var sections = result.parse.sections;
			for(var s in sections) {
			  var splitNum = sections[s].number.split('.');
			  if(splitNum.length > 1 && splitNum[0] === "1") {
				sectionArray.push(sections[s].index);
			  }
			}
			// Use section 1 if there are no "1.x" sections
			if(sectionArray.length === 0) {
			  sectionArray.push("1");
			}
			success({ titles: result.parse.title, sections: sectionArray });
		  },
		  error: function(xhr, result, status){
			error("Error getting sections");
		  }
		});
	  };
  
  
  
  
  
  this.process_quotes_from_sections_and_id = function(pageId, section_index)
	{
		
		
		var errorFunction = function(msg)
		{
			console.log("ERROR "+msg);
		}
		
		var get_data = function(data)
		{
			console.log("sections from id processed!");
			console.log(data);
      me.quotes = data.quotes[0];
      
      me.update_page_with_results();
			
		}
		
		this.getQuotesForSection(pageId,section_index, get_data, errorFunction);
	};
  
  
  
  
  
	
	
	this.getQuotesForSection = function(pageId, sectionIndex, success, error) {
		$.ajax({
		  url: API_URL,
		  dataType: "jsonp",
		  data: {
			format: "json",
			action: "parse",
			noimages: "",
			pageid: pageId,
			section: sectionIndex
		  },

		  success: function(result, status){
			var quotes = result.parse.text["*"];
			var quoteArray = []

			// Find top level <li> only
			var $lis = $(quotes).find('li:not(li li)');
			$lis.each(function() {
			  // Remove all children that aren't <b>
			  $(this).children().remove(':not(b)');
			  var $bolds = $(this).find('b');

			  // If the section has bold text, use it.  Otherwise pull the plain text.
			  if($bolds.length > 0) {
				quoteArray.push($bolds.html());
			  } else {
				quoteArray.push($(this).html());
			  }
			});
			success({ titles: result.parse.title, quotes: quoteArray });
		  },
		  error: function(xhr, result, status){
			error("Error getting quotes");
		  }
		});
	};
	
	
	

	
	
	
	
	
	
}