$('#searchBox').keydown((event)=>{
    clearTimeout(timer);
    var textBox = $(event.target);
    var value = textBox.val();
    var searchType = textBox.data().search;

    timer = setTimeout(() => {
        value = textBox.val().trim();
        if(value && value.length == 0){
            $('.resultsContainer').html("");
        }else{
    var searchType = textBox.data().search;
            search(value,searchType);
        }
    }, 1000);
});


function search(searchTerm, searchType){
    var  url = searchType == "users" ? "/api/users" : "/api/posts";
    $.get(url,{search: searchTerm},(results)=>{
        

        if(searchType == "users"){
            outputUsers(results, $(".resultsContainer"));
        }else{
            outputPosts(results, $(".resultsContainer"));
        }
    });
}