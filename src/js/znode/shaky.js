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
    this.line = new Line(this.x1, this.y1, x2, y2, this.line_width);

    if (this.arrow_path != null)
      this.arrow_path.remove();

    var x1 = this.x1;
    var y1 = this.y1;
    var ang = Math.atan2(y2-y1,x2-x1);
    this.arrow_path = drawFilledPolygon(translateShape(rotateShape(arrowArr,ang),x2,y2));
    this.group = new paper.Group([this.line.path, this.arrow_path]);
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

function Shaky() {
  this.clear_canvas = function(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  this.box2D = box2D;
  this.lineWithArrow = lineWithArrow;

  this.text2D = function(txt, x, y) {
    ctx.font = "15pt 'Gloria Hallelujah'";
    ctx.fillText(txt, x, y);
  };

}
