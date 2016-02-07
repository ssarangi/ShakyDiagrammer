$(function(){

  var graph = new NodeGraph();

  // consider moving to NodeGraph
  $("#canvas_main").mouseup(function(e){
     if (openWin.css("display") == "none"){
       var children = $(e.target).children();
       if (children.length > 0){
         var type = children[0].tagName;
         if (type == "desc" || type == "SPAN"){
           graph.addNodeAtMouse();
         }
       }
     }
  });

  var current_menu = "#eraser";

  // ui code
  var openWin = $("#openWin");
  openWin.hide();

  $(".btn").mouseenter(function(){
    $(this).animate({"backgroundColor" : "white"}, 200);
  }).mouseleave(function() {
    if ($(this).hasClass("active"))
      $(this).animate({"backgroundColor": "yellow"});
    else
      $(this).animate({"backgroundColor" : "#efefef"});
  });

  $("#clear").click(function(){
    graph.clearAll();
  });
  $("#help").click(function(){
    window.open("http://www.zreference.com/znode", "_blank");
  });

  $("#save").click(saveFile);

  function saveFile(){
    var name = filename.val();
    if (name == "" || name == nameMessage){
      alert("Please Name Your File");
      filename[0].focus();
      return;
    }
    $.post("json/save.php", {data:graph.toJSON(), name:name}, function(data){
      alert("Your file was saved.");
    });
  }

  $("#canvas_main").mousedown(function(){
    openWin.fadeOut();
  });

  $("#open").click(function(){
    var fileList =  $("#files");
    fileList.html("<div>loading...<\/div>");
    openWin.fadeIn();
    fileList.load("json/files.php?"+Math.random()*1000000);
  });

  var nameMessage = "Enter your file name";
  var filename = $("#filename").val(nameMessage);

  filename.focus(function(){
    if ($(this).val() == nameMessage){
      $(this).val("");
    }
  }).blur(function(){
    if ($(this).val() == ""){
      $(this).val(nameMessage);
    }
  });

  $("#nameForm").submit(function(e){
    e.preventDefault();
    saveFile();
  });

  $("#render").click(function() {
    graph.clear_and_render();
  });

  function make_menu_active(menu_item) {
    $(current_menu).removeClass("active");
    $(current_menu).css({"background-color": '#efefef'});
    $(menu_item).addClass("active");
    $(menu_item).css({"background-color": 'yellow'});
    current_menu = menu_item;
  }

  $("#eraser").click(function() {
    make_menu_active("#eraser");
    graph.set_current_tool("eraser");
    graph.draw_menu_changed();
  });

  $("#shaky_line").click(function() {
    make_menu_active("#shaky_line");
    graph.set_current_tool("shaky_line");
    graph.draw_menu_changed();
  });

  $("#straight_line").click(function() {
    make_menu_active("#straight_line");
    graph.set_current_tool("straight_line");
    graph.draw_menu_changed();
  });

  $("#free_hand_line").click(function() {
    make_menu_active("#free_hand_line");
    graph.set_current_tool("free_hand_line");
    graph.draw_menu_changed();
  });

  $("#arrow").click(function() {
    make_menu_active("#arrow");
    graph.set_current_tool("arrow");
    graph.draw_menu_changed();
  });

  $("#circle").click(function() {
    make_menu_active("#circle");
    graph.set_current_tool("circle");
    graph.draw_menu_changed();
  });

  $("#ellipse").click(function() {
    make_menu_active("#ellipse");
    graph.set_current_tool("ellipse");
    graph.draw_menu_changed();
  });

  $("#shaky_rect").click(function() {
    make_menu_active("#shaky_rect");
    graph.set_current_tool("shaky_rect");
    graph.draw_menu_changed();
  });

  $("#rect").click(function() {
    make_menu_active("#rect");
    graph.set_current_tool("rect");
    graph.draw_menu_changed();
  });

  $("#text").click(function() {
    make_menu_active("#text");
    graph.set_current_tool("text");
    graph.draw_menu_changed();
  });

  $("#select").click(function() {
    make_menu_active("#select");
    graph.set_current_tool("select_mode");
    graph.draw_menu_changed();
  });

  $(".file").live('click', function() {
    var name = $(this).text();
    $.getJSON("files/" + name + ".json", {n:Math.random()}, function(data){
       graph.fromJSON(data);

       filename.val(name);
    });
  }).live('mouseover', function(){
    $(this).css({"background-color": "#ededed"});
  }).live("mouseout", function(){
    $(this).css({"background-color": "white"});
  });

});