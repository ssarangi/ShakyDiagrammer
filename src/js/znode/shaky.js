function Line(x0, y0, x1, y1, stroke_width) {
  this.clear = function() {
    if (this.path != null)
      this.path.remove();
  };

  var dx = x1 - x0;
  var dy = y1 - y0;

  var length = Math.sqrt(dx * dx + dy * dy);

  var k = Math.sqrt(length) / 1.5;

  var k1 = Math.random();
  var k2 = Math.random();
  var l3 = Math.random() * k;
  var l4 = Math.random() * k;

  var x3 = x0 + dx * k1 + dy / length * l3;
  var y3 = y0 + dy * k1 - dx / length * l3;

  var x4 = x0 + dx * k2 - dy / length * l4;
  var y4 = y0 + dy * k2 + dx / length * l4;

  var path = new paper.Path();

  path.moveTo(new paper.Point(x0, y0));
  path.strokeColor = 'black';
  path.strokeWidth = stroke_width;
  path.cubicCurveTo(new paper.Point(x3, y3), new paper.Point(x4, y4), new paper.Point(x1, y1));
  path.simplify();
  paper.view.update();
  this.path = path;
  return this;
}

function lineWithArrow(x1, y1, x2, y2) {
  this.clear = function() {
    this.group.remove();
  };

  var arrowArr = [
    [ 2, 0 ],
    [ -10, -6 ],
    [ -10, 6]
  ];

  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.line_width = 2;

  function drawFilledPolygon(shape) {
    var path = new paper.Path();
    path.moveTo(shape[0][0],shape[0][1]);

    for(p in shape)
      if (p > 0) path.lineTo(shape[p][0],shape[p][1]);

    path.lineTo(shape[0][0],shape[0][1]);
    path.fillColor = 'black';
    return path;
  }

  function translateShape(shape,x,y) {
    var rv = [];
    for(p in shape)
      rv.push([ shape[p][0] + x, shape[p][1] + y ]);
    return rv;
  }

  function rotateShape(shape,ang)
  {
    var rv = [];
    for(p in shape)
      rv.push(rotatePoint(ang,shape[p][0],shape[p][1]));
    return rv;
  }

  function rotatePoint(ang,x,y) {
    return [
      (x * Math.cos(ang)) - (y * Math.sin(ang)),
      (x * Math.sin(ang)) + (y * Math.cos(ang))
    ];
  }

  this.clear = function() {
    if (this.group != null) {
      this.group.remove();
    }
  };

  this.moveTo = function(x2, y2) {

    if (this.group != null)
      this.group.remove();

    paper.view.update();
    // Draw 2 circles
    this.circle_start_pt = new paper.Path.Circle(new paper.Point(this.x1, this.y1), 3);
    this.circle_end_pt = new paper.Path.Circle(new paper.Point(x2, y2), 3);
    this.circle_start_pt.fillColor = 'yellow';
    this.circle_end_pt.fillColor = 'yellow';

    this.line = new Line(this.x1, this.y1, x2, y2, this.line_width);

    if (this.arrow_path != null)
      this.arrow_path.remove();

    var x1 = this.x1;
    var y1 = this.y1;
    var ang = Math.atan2(y2-y1,x2-x1);
    this.arrow_path = drawFilledPolygon(translateShape(rotateShape(arrowArr,ang),x2,y2));
    this.group = new paper.Group([this.line.path, this.circle_start_pt, this.circle_end_pt, this.arrow_path]);
    this.x2 = x2;
    this.y2 = y2;
    paper.view.update();
  };

  this.moveTo(x2, y2);
  //this.l1 = this.Line(x1, y1, x2, y2, this.line_width);
  //this.arrow_path = drawFilledPolygon(translateShape(rotateShape(arrowArr,ang),x2,y2));
  //this.group = new paper.Group([this.l1, this.arrow_path]);
  //paper.view.update();

  return this;
}

function box2D(top_x, top_y, width, height) {
  var bottom_x = top_x + width;
  var bottom_y = top_y + height;

  this.l1 = new Line(top_x, top_y, bottom_x, top_y, 4);
  this.l2 = new Line(bottom_x, top_y, bottom_x, bottom_y, 4);
  this.l3 = new Line(bottom_x, bottom_y, top_x, bottom_y, 4);
  this.l4 = new Line(top_x, bottom_y, top_x, top_y, 4);

  this.clear = function() {
    this.l1.clear();
    this.l2.clear();
    this.l3.clear();
    this.l4.clear();
    this.group.remove();
  };

  this.group = new paper.Group([this.l1.path, this.l2.path, this.l3.path, this.l4.path]);
  return this;
}

function Circle(x, y) {
  this.center_x = x;
  this.center_y = y;

  this.clear = function() {
    if (this.path != null)
      this.path.remove();
  };

  this.setRadius = function(x, y) {
    this.clear();
    this.radius = Math.sqrt(Math.pow(this.center_x - x, 2) + Math.pow(this.center_y - y, 2));
    this.path = paper.Path.Circle(this.center_x, this.center_y, this.radius);
    this.path.strokeWidth = 3;
    this.path.strokeColor = 'black';
    paper.view.update();
  };

  return this;
}

function Ellipse(x, y) {
  this.center_x = x;
  this.center_y = y;

  this.clear = function() {
    if (this.path != null)
      this.path.remove();
  };

  this.setRadius = function(x, y) {
    this.clear();
    this.radius = Math.sqrt(Math.pow(this.center_x - x, 2) + Math.pow(this.center_y - y, 2));
    this.path = paper.Shape.Ellipse({
      point: [this.center_x, this.center_y],
      size: [this.radius, this.radius / 2],
      strokeWidth: 3,
      strokeColor: 'black'
    });
    paper.view.update();
  };

  return this;
}

function RoundedRect(x1, y1) {
  this.x1 = x1;
  this.y1 = y1;

  this.clear = function() {
    if (this.path != null)
      this.path.remove();
  };

  this.rectTo = function(x2, y2) {
    this.clear();
    this.x2 = x2;
    this.y2 = y2;
    var rect = new paper.Rectangle(new paper.Point(this.x1, this.y1), new paper.Point(this.x2, this.y2));
    var cornerSize = new paper.Size(20, 20);
    this.path = new paper.Path.RoundRectangle(rect, cornerSize);
    this.path.strokeColor = 'black';
    this.path.strokeWidth = 4;
    paper.view.update();
  };

  return this;
}

function Eraser(x, y) {
  this.x = x;
  this.y = y;
  this.background_color = new paper.Color(200 / 255, 200 / 255, 200 / 255, 1.0);
  this.render_color = 'white';

  this.clear = function() {
    this.group.remove();
  };

  this.hide = function() {
    this.group.visible = false;
  };

  this.unhide = function() {
    this.group.visible = true;
  };

  this.erase = function(what_to_do) {
    if (this.path == null)
      this.path = new paper.Path.Rectangle(new paper.Point(x - 20, y - 20), new paper.Point(x + 20, y + 20));

    if (what_to_do == "erase") {
      this.path.fillColor = this.background_color;
      this.path.strokeColor = null;
    }
    else if (what_to_do == "render") {
      this.path.fillColor = this.render_color;
      this.path.strokeColor = 'black';
    }

    if (this.group == null)
      this.group = new paper.Group([this.path]);

    paper.view.update();
  };

  this.moveTo = function(x, y) {
    if (this.path != null)
      this.path.position = new paper.Point(x, y);
  };

  this.erase("render");
  return this;
}

function FreeHandLine(x, y) {
  this.path = new paper.Path();
  this.path.strokeColor = 'black';
  this.path.strokeWidth = 2;
  this.path.setFullySelected();

  this.clear = function() {
    this.path.remove();
  };

  this.add_point = function(x, y) {
    this.path.add(x, y);
  };

  this.finalize = function() {
    this.path.simplify();
  };

  return this;
}

function StraightLine(x, y) {
  this.path = new paper.Path();
  this.start = new paper.Point(x, y);
  this.path.moveTo(this.start);
  this.path.strokeColor = 'black';
  this.path.strokeWidth = 2;
  this.path.setFullySelected();

  this.clear = function() {
    this.path.remove();
  };

  this.lineTo = function(x, y) {
    this.path.removeSegment(1);
    this.path.lineTo(new paper.Point(x, y));
  };

  this.finalize = function() {
    // Do nothing
  };

  return this;
}

function Text2D(x, y, txt) {
  this.text = new paper.PointText(x, y);
  this.text.content = txt;
  this.text.style = {
    fontFamily: "Gloria Hallelujah",
    fontSize: 30
  };

  paper.view.update();
  return this;
}

function Shaky() {
  this.clear_canvas = function(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  this.box2D = box2D;
  this.lineWithArrow = lineWithArrow;
  this.eraser = Eraser;
  this.freeHandLine = FreeHandLine;
  this.straightLine = StraightLine;
  this.circle = Circle;
  this.roundedRect = RoundedRect;
  this.ellipse = Ellipse;
  this.text2D = Text2D;

  this.current_eraser = null;

  this.initialize = function() {
    this.current_eraser = new Eraser(0, 0);
  };

  this.refresh_canvas = function() {
    paper.view.update();
  };

  this.update_eraser = function(eraser) {
    if (this.current_eraser != null)
      this.current_eraser.erase("erase");

    this.current_eraser = eraser;
    this.current_eraser.erase("render");
  };
}
