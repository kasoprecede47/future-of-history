//It loaded page is a google search link
if(window.location.href.match(/www.google.[a-z\.]+\/search/g) || window.location.href.match(/www.google.[a-z\.]+\/.+#q=/g)){
  var uri = (window.location.search.substr(1)+window.location.hash)
  var dec = decodeURI(uri)
  var query = dec.split(/[\#\&]/g)
  var params = {}
  query.forEach(function(q){
    var qs = q.split("=")
    params[qs[0]] = qs[1].replace(/\+/g, " ")
  })
  var searchQuery = params.q
  
  chrome.runtime.sendMessage(
    {
      for: "background", 
      action: "store", 
      store: "search", 
      query: searchQuery, 
      ts: new Date().getTime()
    },
    function(response) {
      if(!response){
        console.log(chrome.runtime.lastError);
        return;
      }
      var key = response.key
      console.log("Created search query record #"+key)
      // select all links on page to add to db on click
      
      var links = [];

      $("a").each(function(index,item){
        links.push({title: $(item).text(),link: $(item).attr('data-href'),url: item.href});
      });


      var requestData = {"action": "ListenOnContextMenuAction",links: links,key: key};
        //send request to background script
      chrome.extension.sendRequest(requestData);
      

      $("a").on('click', function(){
        // on link click send message to add link to db
        var linkTitle = $(this).text()
        var link = $(this).attr('data-href')

        sendClickAction({title: linkTitle,link: link},key);
        
      })
    }
  )
}


function sendClickAction(linkObj,key){
  console.log(linkObj);

  chrome.runtime.sendMessage(
          {for: "background", action: "store", store: "search-link", key: key, title: linkObj.title, link: linkObj.link},
          function(response) {
            console.log("Opened link ("+linkObj.link+") added to search query record")
          }
  ) 
}

