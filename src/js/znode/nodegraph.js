function NodeGraph(){
  var win = $(window);
  var canvas = $("#canvas_main");
  var canvas_render = document.getElementById("canvas_render");
  var ctx = canvas_render.getContext('2d');
  var overlay = $("#overlay");
  var currentNode;
  var currentConnection = {};
  var connections = {};
  var connectionId = 0;
  var newNode;
  var nodes = {};
  var nodeId = 0;
  var mouseX = 0, mouseY = 0;
  var loops = [];
  var pathEnd = {};
  var zindex = 1;
  var hitConnect;
  var key = {};
  var shaky = new Shaky();
  var SHIFT = 16;
  var topHeight = $("#controls").height();
  var CANVAS_LEFT_OFFSET = 30;
  var FACTOR = 2.6;
  var current_tool = "eraser";

  var paper_raphael = new Raphael("canvas_main", 0, topHeight, "100", "100");

  this.set_current_tool = function(tool) {
    current_tool = tool;
  };

  function resizePaper() {
      paper_raphael.setSize(win.width() / 2, win.height() - topHeight);
      canvas_render.width = win.width() / 2;
      canvas_render.height = win.height();
      paper.setup(canvas_render);
      shaky.initialize();
  }

  win.resize(resizePaper);
  resizePaper();

  canvas.append("<ul id='menu'><li>Left<\/li><li>Right<\/li><li>Top<\/li><li>Bottom<\/li><\/ul>");
  var menu = $("#menu");
  menu.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 5000, "border" : "1px solid gray", "padding" : 0});
  menu.hide();

  canvas.append("<div id='hit' />");
  hitConnect = $("#hit");
  hitConnect.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 4000, "border" : "none",
                  "width" : 10, "height": 10, "cursor":"pointer", "font-size": "1px"});

  $("#menu li").hover(function(){
    $(this).css("background-color", "#cccccc");
  },
  function(){
    $(this).css("background-color", "white");
  }).click(function(){
    menu.hide();
    var dir = $(this).text();
    connectNode(dir);
  });

  function connectNode(dir){
    var node, x, y;
    dir = dir.toLowerCase();

    if (dir == "left"){
      x = pathEnd.x + 5;
      y = pathEnd.y + topHeight - currentNode.height() / 2;

    }else if (dir == "right"){
      x = pathEnd.x - currentNode.width() - 5;
      y = pathEnd.y + topHeight - currentNode.height() / 2;
    }else if (dir == "top"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y + topHeight + 5;
    }else if (dir == "bottom"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y + topHeight - 5 - currentNode.height();
    }


    node = new Node(x, y, currentNode.width(), currentNode.height());
    saveConnection(node, dir);
    currentNode = node;
  }

  function createConnection(a, conA, b, conB){
      var link = paper_raphael.path("M 0 0 L 1 1");
      link.attr({"stroke-width":2});
      link.parent = a[conA];

      a.addConnection(link);
      currentConnection = link;
      currentNode = a;
      saveConnection(b, conB);
  }

  function saveConnection(node, dir){
    if (!currentConnection) return;
    if (!currentConnection.parent) return;

    currentConnection.startNode = currentNode;
    currentConnection.endNode = node;
    currentConnection.startConnection = currentConnection.parent;
    currentConnection.endConnection = node[dir.toLowerCase()];

    currentConnection.id = connectionId;
    connections[connectionId] = currentConnection;
    connectionId++;

    currentNode.updateConnections();
    node.addConnection(currentConnection);

    $(currentConnection.node).mouseenter(function(){
      this.raphael.attr("stroke","#FF0000");
    }).mouseleave(function(){
      this.raphael.attr("stroke","#000000");
    }).click(function(){
      if (confirm("Are you sure you want to delete this connection?")){
        this.raphael.arrow.clear();
        this.raphael.remove();
        delete connections[this.raphael.id];
      }
    });
  }

  canvas.mousedown(function(e){
    if (menu.css("display") == "block"){
      if (e.target.tagName != "LI"){
        menu.hide();
        currentConnection.remove();
      }
    }
  });

  $(document).keydown(function(e){
    key[e.keyCode] = true;
  }).keyup(function(e){
    key[e.keyCode] = false;
  });

  $(document).mousemove(function(e){
    mouseX = e.pageX;
    mouseY = e.pageY - topHeight;
  }).mouseup(function(e){
    overlay.hide();
    var creatingNewNode = newNode;

    hitConnect.css({"left":mouseX - 5, "top":mouseY + topHeight - 5});
    for (var i in nodes){
      if (nodes[i]){
        var n = nodes[i];
        if (n != currentNode){
          var nLoc = n.content.position();
          if (hitTest(toGlobal(nLoc, n.left), hitConnect)){
            saveConnection(n, "left");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.top), hitConnect)){
            saveConnection(n, "top");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.right), hitConnect)){
            saveConnection(n, "right");
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.bottom), hitConnect)){
            saveConnection(n, "bottom");
            newNode = false;
            break;
          }
        }
      }
    }
    hitConnect.css("left", "-100px");

    if (newNode){
      if (key[SHIFT]){
        menu.css({"left":mouseX - 10, "top":mouseY});
        menu.show();
      }else{
        var dir;
        var currDir = currentConnection.parent.attr("class");
        if (currDir == "left"){
          dir = "right";
        }else if (currDir == "right"){
          dir = "left";
        }else if (currDir == "top"){
          dir = "bottom";
        }else if (currDir == "bottom"){
          dir = "top";
        }

        if (pathEnd.x == undefined || pathEnd.y == undefined){
          currentConnection.remove();
        }else{
          connectNode(dir);
        }
      }
    }
    newNode = false;

    for (var i in loops){
      clearInterval(loops[i]);
    }
    try{
      if (loops.length > 0) document.selection.empty();
    }catch(e){}
    loops = [];

    if (creatingNewNode) currentNode.txt[0].focus();
  });

  function toGlobal(np, c){
    var l = c.position();
    return {position : function(){ return {left: l.left + np.left, top : l.top + np.top}; },
            width : function(){ return c.width(); },
            height : function(){ return c.height(); }};
  }

  function showOverlay(){
    overlay.show();
    overlay.css({"width" : win.width(), "height" : win.height()}); //, "opacity": 0.1});
  }

  function startDrag(element, bounds, dragCallback){
    showOverlay();
    var startX = mouseX - element.position().left;
    var startY = mouseY - element.position().top;
    if (!dragCallback) dragCallback = function(){};
      var id = setInterval(function(){
      var x = mouseX - startX;
      var y = mouseY - startY;
      if (bounds){
        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right) x = bounds.right;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom) y = bounds.bottom;
      }
      element.css("left", x).css("top",y);
      dragCallback();
    },topHeight);
    loops.push(id);
  }


  function Node(xp, yp, w, h, noDelete, forceId){

    if (forceId){
       nodeId = forceId;
    }
    this.id = nodeId;
    nodes[nodeId] = this;
    nodeId++;

    var curr = this;
    this.connections = {};
    var connectionIndex = 0;

    this.addConnection = function(c){
      curr.connections[connectionIndex++] = c;
      return c;
    };

    canvas.append("<div class='node'/>");
    var n = $(".node").last();
    n.css({"position" : "absolute",
           "left" : xp, "top" : yp,
           "width" : w, "height" : h,
           "border" : "1px solid gray",
           "background-color" : "white"});
    n.css("z-index", zindex++);

    this.content = n;

    this.width = function(){
      return n.width();
    };

    this.height = function(){
      return n.height();
    };

    this.x = function(){
      return n.position().left;
    };

    this.y = function(){
      return n.position().top;
    };

    this.clear = function() {
      if (this.box != null) {
        this.box.clear();
      }
    };

    this.render = function() {
      this.clear();
      this.box = new shaky.box2D(this.x() - canvas.position().left, this.y() - topHeight, this.width(), this.height());
    };

    var nodeWidth = n.width();
    var nodeHeight = n.height();

    n.append("<div class='bar'/>");
    var bar = $(".node .bar").last();
    bar.css({"height" : "10px",
             "background-color" : "gray",
             "padding" : "0", "margin": "0",
             "font-size" : "9px", "cursor" : "pointer"});


    if (!noDelete){
      n.append("<div class='ex'>X<\/div>");
      var ex = $(".node .ex").last();
      ex.css({"position":"absolute","padding-right" : 2, "padding-top" : 1, "padding-left" : 2,
              "color" : "white", "font-family" : "sans-serif",
              "top" : 0, "left": 0, "cursor": "pointer",
              "font-size" : "7px", "background-color" : "gray", "z-index" : 100});
      ex.hover(function(){
        ex.css("color","black");
      }, function(){
        ex.css("color","white");
      }).click(function(){

        if (confirm("Are you sure you want to delete this node?")){
          curr.remove();
        }
      });
    }

    n.append("<textarea class='txt' spellcheck='false' />");
    var txt = $(".node .txt").last();
    txt.css("position","absolute");

    txt.css({"width" : nodeWidth - 5,
             "height" : nodeHeight - bar.height() - 5,
             "resize" : "none", "overflow" : "hidden",
             "font-size" : "12px" , "font-family" : "sans-serif",
             "border" : "none","z-index":4});

    this.txt = txt;

    n.append("<div class='resizer' />");
    var resizer = $(".node .resizer").last();

    resizer.css({"position" : "absolute" , "z-index" : 10,
                 "width" : "10px", "height" : "10px",
                 "left" : nodeWidth - 11, "top" : nodeHeight - 11,
                 "background-color" : "white", "font-size" : "1px",
                 "border" : "1px solid gray",
                 "cursor" : "pointer"});

    n.append("<div class='left'>");
    n.append("<div class='top'>");
    n.append("<div class='right'>");
    n.append("<div class='bottom'>");

    var left = $(".node .left").last();
    left.css("left","-11px");

    var top = $(".node .top").last();
    top.css("top","-11px");

    var right = $(".node .right").last();
    var bottom = $(".node .bottom").last();

    setupConnection(left);
    setupConnection(right);
    setupConnection(top);
    setupConnection(bottom);

    positionLeft();
    positionRight();
    positionTop();
    positionBottom();

    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;

    function positionLeft(){
      left.css("top", n.height() / 2 - 5);
    }
    function positionRight(){
      right.css("left",n.width() + 1).css("top", n.height() / 2 - 5);
    }
    function positionTop(){
      top.css("left", n.width() / 2 - 5);
    }
    function positionBottom(){
      bottom.css("top",n.height() + 1).css("left", n.width() / 2 - 5);
    }

    function setupConnection(div){
      div.css({"position" : "absolute", "width" : "10px", "padding":0,
               "height" : "10px", "background-color" : "#aaaaaa",
               "font-size" : "1px", "cursor" : "pointer"});
    }

    this.connectionPos = function(conn){
      var loc = conn.position();
      var nLoc = n.position();
      var point = {};
      point.x = nLoc.left + loc.left + 5;
      point.y = nLoc.top - topHeight + loc.top + 5;
      return point;
    };

    function getPositionForConnection(node, connection) {
      var currDir = connection.attr("class");
      var x, y;
      if (currDir == "left"){
        x = node.x();
        y = node.y() + node.height() / 2;
      } else if (currDir == "right"){
        x = node.x() + node.width();
        y = node.y() + node.height() / 2;
      } else if (currDir == "top"){
        x = node.x() + node.width() / 2;
        y = node.y();
      } else if (currDir == "bottom"){
        x = node.x() + node.width() / 2;
        y = node.y() + node.height();
      }

      var point = {};
      point.x = x - FACTOR * CANVAS_LEFT_OFFSET;
      point.y = y - topHeight;
      return point;
    }

    function updateConnections() {
      curr.render();
       for (var i in curr.connections){
         var c = curr.connections[i];
         if (!c.removed) {
           var arr = c.arrow;
           arr.clear();
           var nodeA = c.startNode.connectionPos(c.startConnection);
           var nodeB = c.endNode.connectionPos(c.endConnection);
           var nodeAx = nodeA.x - FACTOR * CANVAS_LEFT_OFFSET;
           var nodeBx = nodeB.x - FACTOR * CANVAS_LEFT_OFFSET;

           c.attr("path","M " + nodeAx + " " + nodeA.y + " L " + nodeBx + " " + nodeB.y);

           var p1 = getPositionForConnection(c.startNode, c.startConnection);
           var p2 = getPositionForConnection(c.endNode, c.endConnection);

           c.arrow = new shaky.lineWithArrow(p1.x, p1.y, p2.x, p2.y);
         }
       }
    }
    this.updateConnections = updateConnections;


   function addLink(e){
      currentNode = curr;
      e.preventDefault();
      showOverlay();
      var link = paper_raphael.path("M 0 0 L 1 1");
      link.attr({"stroke-width":2});
      currentConnection = link;
      currentConnection.parent = $(this);


      curr.addConnection(link);
      var loc = $(this).position();
      var nLoc = n.position();
      // var x = loc.left + nLoc.left + 5;
      var x = nLoc.left - 0.95 * CANVAS_LEFT_OFFSET;
      var y = loc.top + nLoc.top - topHeight + 5;
      newNode = true;

      var prevline = null;
      var id = setInterval(function(){
        endPtX = mouseX - FACTOR * CANVAS_LEFT_OFFSET;

        // Update the rendering
        if (prevline == null) {
          prevline = shaky.lineWithArrow(x, y, endPtX, mouseY);
          link.arrow = prevline;
        }

        prevline.moveTo(endPtX, mouseY);
        link.attr("path","M " + x + " " + y + " L " + endPtX + " " + mouseY);

        pathEnd.x = mouseX;
        pathEnd.y = mouseY;
      }, 30);
      loops.push(id);
   }
   left.mousedown(addLink);
   right.mousedown(addLink);
   top.mousedown(addLink);
   bottom.mousedown(addLink);

   this.remove = function() {
     for (var i in curr.connections){
       var c = curr.connections[i];
       c.remove();
       delete connections[c.id];
       delete curr.connections[i];
     }
     n.remove();
     delete nodes[this.id];
   };

    resizer.mousedown(function(e){
      currentNode = curr;
      e.preventDefault();
      startDrag(resizer, {left : 20, top : 20, right : 500, bottom : 500},
      function(){
        var loc = resizer.position();
        var x = loc.left;
        var y = loc.top;
        currentNode.clear();
        n.css({"width" : x + resizer.width() + 1,
               "height" : y + resizer.height() + 1});

        txt.css({"width" : n.width() - 5, "height" : n.height() - bar.height() - 5});
        currentNode.clear();
        positionLeft();
        positionRight();
        positionTop();
        positionBottom();
        updateConnections();
        currentNode.render();
      });
    });

    bar.mousedown(function(e){
      currentNode = curr;
      currentNode.clear();
      n.css("z-index", zindex++);
      e.preventDefault();
      startDrag(n, {left : 10, top: 40, right : win.width() - n.width() - 10, bottom : win.height() - n.height() - 10},
      updateConnections);
    });

    n.mouseenter(function(){
      n.css("z-index", zindex++);
    });

  }

  function hitTest(a, b){
    var aPos = a.position();
    var bPos = b.position();

    var aLeft = aPos.left;
    var aRight = aPos.left + a.width();
    var aTop = aPos.top;
    var aBottom = aPos.top + a.height();

    var bLeft = bPos.left;
    var bRight = bPos.left + b.width();
    var bTop = bPos.top;
    var bBottom = bPos.top + b.height();

    // http://tekpool.wordpress.com/2006/10/11/rectangle-intersection-determine-if-two-given-rectangles-intersect-each-other-or-not/
    return !( bLeft > aRight
      || bRight < aLeft
      || bTop > aBottom
      || bBottom < aTop
      );
  }


 function clear(){
    nodeId = 0;
    connectionsId = 0;
    for (var i in nodes){
      nodes[i].remove();
    }
  }

  this.clearAll = function(){
    clear();
    defaultNode();
    currentConnection = null;
    currenNode = null;
  };

  this.addNode = function(x, y, w, h, noDelete){
    var n = new Node(x, y, w, h, noDelete);
    n.render();
  };

  var defaultWidth = 100;
  var defaultHeight = 50;

  this.addNodeAtMouse = function(){
    var current_node_width = defaultWidth;
    var current_node_height = defaultHeight;
    if (currentNode != null) {
      current_node_width = currentNode.width();
      current_node_height = currentNode.height();
    }
    var w = current_node_width;
    var h = current_node_height;
    var temp = new Node(mouseX, mouseY + 30, w, h);
    temp.render();
    currentNode = temp;
    currentConnection = null;
  };

  function defaultNode(){

    var temp = new Node(win.width() / 2 - defaultWidth / 2,
                        win.height() / 2 - defaultHeight / 2,
                        defaultWidth, defaultHeight, true);
    temp.txt[0].focus();
    currentNode = temp;
  }

  // defaultNode();

  this.clear_and_render = function() {
    shaky.clear_canvas(canvas_render.width, canvas_render.height);
  };

  this.fromJSON = function(data){
    clear();
    for (var i in data.nodes){
      var n = data.nodes[i];
      var ex = (i == "0") ? true : false;
      var temp = new Node(n.x, n.y, n.width, n.height, ex, n.id);
      var addreturns = n.txt.replace(/\\n/g,'\n');
      temp.txt.val(addreturns);
    }
    for (i in data.connections){
      var c = data.connections[i];
      createConnection(nodes[c.nodeA], c.conA, nodes[c.nodeB], c.conB);
    }
  };

  this.toJSON = function(){
    var json = '{"nodes" : [';
    for (var i in nodes){
      var n = nodes[i];
      json += '{"id" : ' + n.id + ', ';
      json += '"x" : ' + n.x() + ', ';
      json += '"y" : ' + n.y() + ', ';
      json += '"width" : ' + n.width() + ', ';
      json += '"height" : ' + n.height() + ', ';
      json += '"txt" : "' + addSlashes(n.txt.val()) + '"},';
    }
    json = json.substr(0, json.length - 1);
    json += '], "connections" : [';

    var hasConnections = false;
    for (i in connections){
      var c = connections[i];
      if (!c.removed){
      json += '{"nodeA" : ' + c.startNode.id + ', ';
      json += '"nodeB" : ' + c.endNode.id + ', ';
      json += '"conA" : "' + c.startConnection.attr("class") + '", ';
      json += '"conB" : "' + c.endConnection.attr("class") + '"},';
      hasConnections = true;
      }
    }
    if (hasConnections){
      json = json.substr(0, json.length - 1);
    }
    json += ']}';
    return json;
  }

  function addSlashes(str) {
    str = str.replace(/\\/g,'\\\\');
    str = str.replace(/\'/g,'\\\'');
    str = str.replace(/\"/g,'\\"');
    str = str.replace(/\0/g,'\\0');
    str = str.replace(/\n/g,'\\\\n');
    return str;
  }

  ///////////////////////////////////// Canvas Render Methods ////////////////////////////////////////
  //canvas_render.mousedown(function() {
  //  alert("helo");
  //});

  canvas_render.addEventListener("mousedown", canvasrender_onMouseDown, false);
  canvas_render.addEventListener("mousedrag", canvasrender_onMouseDrag, false);
  canvas_render.addEventListener("mouseup", canvasrender_onMouseUp, false);
  canvas_render.addEventListener("mousemove", canvasrender_onMouseDrag, false);
  canvas_render.addEventListener("onfocusout", canvasrender_onFocusOut, false);
  var left_button_down = false;
  var free_hand_line = null;
  var straight_line = null;
  var circle = null;
  var rect = null;
  var ellipse = null;
  var txt = null

  this.draw_menu_changed = function() {
    var eraser = shaky.current_eraser;
    if (current_tool != "eraser") {
      eraser.hide();
    }
    else {
      eraser.unhide();
    }

    shaky.refresh_canvas();
  };

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function canvasrender_onMouseDown(event) {
    if (event.which === 1)
      left_button_down = true;

    pos = getMousePos(canvas_render, event);
    if (current_tool == "eraser") {
      var eraser = new shaky.eraser(pos.x, pos.y);
      shaky.update_eraser(eraser);
    }
    else if (current_tool == "free_hand_line") {
      free_hand_line = new shaky.freeHandLine(pos.x, pos.y);
    }
    else if (current_tool == "straight_line") {
      straight_line = new shaky.straightLine(pos.x, pos.y);
    }
    else if (current_tool == "circle") {
      circle = new shaky.circle(pos.x, pos.y);
    }
    else if (current_tool == "ellipse") {
      ellipse = new shaky.ellipse(pos.x, pos.y);
    }
    else if (current_tool == "rect") {
      rect = new shaky.roundedRect(pos.x, pos.y);
    }
    else if (current_tool == "text") {
      var userInput = prompt('Enter Text:');
      if (userInput != null) {
        txt = new shaky.text2D(pos.x, pos.y, userInput);
      }
    }
  }

  function canvasrender_onMouseDrag(event) {
    pos = getMousePos(canvas_render, event);

    var dragging = false;
    var eraser = null;
    if (left_button_down == true) {
      dragging = true;
    }

    if (dragging) {
      if (current_tool == "eraser") {
        eraser = new shaky.eraser(pos.x, pos.y);
        shaky.update_eraser(eraser);
      }
      else if (current_tool == "free_hand_line") {
        free_hand_line.add_point(pos.x, pos.y);
      }
      else if (current_tool == "straight_line") {
        straight_line.lineTo(pos.x, pos.y);
      }
      else if (current_tool == "circle") {
        circle.setRadius(pos.x, pos.y);
      }
      else if (current_tool == "ellipse") {
        ellipse.setRadius(pos.x, pos.y);
      }
      else if (current_tool == "rect") {
        rect.rectTo(pos.x, pos.y);
      }
    }
    else {
      if (current_tool == "eraser") {
        eraser = shaky.current_eraser;
        eraser.moveTo(pos.x, pos.y);
      }
    }
  }

  function canvasrender_onMouseUp(event) {
    if (event.which === 1)
      left_button_down = false;

    if (current_tool == "free_hand_line") {
      free_hand_line.finalize();
    }
  }

  function canvasrender_onFocusOut(event) {
    // Hide the eraser
    var eraser = shaky.current_eraser;
    eraser.hide();
  }
}
