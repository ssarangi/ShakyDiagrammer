function getPts(x0, y0, x1, y1) {
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

  var p1 = new paper.Point(x0, y0);

  var p2 = new paper.Point(x3, y3);

  var p3 = new paper.Point(x4, y4);

  var p4 = new paper.Point(x1, y1);
  return [p1, p2, p3, p4];
}

function Line(x0, y0, x1, y1, stroke_width) {
  this.clear = function() {
    if (this.path != null)
      this.path.remove();
      paper.view.update();
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
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

function Arrow(x1, y1, x2, y2) {
  var arrowArr = [
    [ 2, 0 ],
    [ -10, -6 ],
    [ -10, 6]
  ];

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

  var ang = Math.atan2(y2-y1,x2-x1);
  this.path = drawFilledPolygon(translateShape(rotateShape(arrowArr,ang),x2,y2));
  return this.path;
}

function lineWithArrow(x1, y1, x2, y2) {
  this.clear = function() {
    this.group.remove();
    paper.view.update();
  };

  this.translateBy = function(delta) {
    this.group.position.x += delta.x;
    this.group.position.y += delta.y;
  };

  this.selected = function() {
    if (this.group.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.group.selected = false;
  };

  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.line_width = 2;

  this.clear = function() {
    if (this.group != null) {
      this.group.remove();
      paper.view.update();
    }
  };

  this.moveTo = function(x2, y2) {

    if (this.group != null)
      this.group.remove();

    paper.view.update();
    // Draw 2 circles
    this.circle_start_pt = new paper.Path.Circle(new paper.Point(this.x1, this.y1), 3);
    // this.circle_end_pt = new paper.Path.Circle(new paper.Point(x2, y2), 3);
    this.circle_start_pt.fillColor = 'black';
    // this.circle_end_pt.fillColor = 'black';

    this.line = new Line(this.x1, this.y1, x2, y2, this.line_width);

    if (this.arrow_path != null)
      this.arrow_path.remove();

    var x1 = this.x1;
    var y1 = this.y1;
    var ang = Math.atan2(y2-y1,x2-x1);
    // this.arrow_path = drawFilledPolygon(translateShape(rotateShape(arrowArr,ang),x2,y2));
    this.arrow_path = new Arrow(x1, y1, x2, y2);
    this.group = new paper.Group([this.line.path, this.circle_start_pt, this.arrow_path]);
    this.x2 = x2;
    this.y2 = y2;
    this.group.obj_parent = this;

    this.group.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    };

    paper.view.update();
  };

  this.moveTo(x2, y2);
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

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.translateBy = function(delta) {
    this.group.position.x += delta.x;
    this.group.position.y += delta.y;
  };

  this.group = new paper.Group([this.l1.path, this.l2.path, this.l3.path, this.l4.path]);
  this.group.obj_parent = this;

  this.group.onMouseDown = function(event) {
    if (this.obj_parent.ctx.selection_mode == false)
      return false;
    this.selected = !this.selected;
  };

  return this;
}

function Circle(x, y) {
  this.center_x = x;
  this.center_y = y;
  this.selected = false;

  this.clear = function() {
    if (this.path != null) {
      this.path.remove();
      paper.view.update();
    }
  };

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
  };

  this.setRadius = function(x, y) {
    this.clear();
    this.radius = Math.sqrt(Math.pow(this.center_x - x, 2) + Math.pow(this.center_y - y, 2));
    this.path = paper.Path.Circle(this.center_x, this.center_y, this.radius);
    this.path.strokeWidth = 4;
    this.path.strokeColor = 'black';
    this.path.obj_parent = this;
    paper.view.update();

    this.path.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    }
  };

  return this;
}

function Ellipse(x, y) {
  this.center_x = x;
  this.center_y = y;

  this.clear = function() {
    if (this.path != null) {
      this.path.remove();
      paper.view.update();
    }
  };

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
  };

  this.setRadius = function(x, y) {
    this.clear();
    this.radius = Math.sqrt(Math.pow(this.center_x - x, 2) + Math.pow(this.center_y - y, 2));
    this.path = paper.Shape.Ellipse({
      point: [this.center_x, this.center_y],
      size: [this.radius, this.radius / 2],
      strokeWidth: 4,
      strokeColor: 'black'
    });
    this.path.obj_parent = this;

    this.path.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    };

    paper.view.update();
  };

  return this;
}

function ShakyRect(x1, y1) {
  this.x1 = x1;
  this.y1 = y1;

  this.clear = function() {
    if (this.group != null) {
      this.group.remove();
      paper.view.update();
    }
  };

  this.selected = function() {
    if (this.group.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.group.selected = false;
  };

  this.translateBy = function(delta) {
    this.group.position.x += delta.x;
    this.group.position.y += delta.y;
  };

  this.rectTo = function(x2, y2) {
    this.clear();
    this.x2 = x2;
    this.y2 = y2;

    var top_x = this.x1;
    var top_y = this.y1;
    var bottom_x = this.x2;
    var bottom_y = this.y2;

    this.l1 = new Line(top_x, top_y, bottom_x, top_y, 4);
    this.l2 = new Line(bottom_x, top_y, bottom_x, bottom_y, 4);
    this.l3 = new Line(bottom_x, bottom_y, top_x, bottom_y, 4);
    this.l4 = new Line(top_x, bottom_y, top_x, top_y, 4);

    this.group = new paper.Group([this.l1.path, this.l2.path, this.l3.path, this.l4.path]);
    this.group.obj_parent = this;

    this.group.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    };

    paper.view.update();
  };

  return this;
}

function RoundedRect(x1, y1) {
  this.x1 = x1;
  this.y1 = y1;

  this.clear = function() {
    if (this.path != null) {
      this.path.remove();
      paper.view.update();
    }
  };

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
  };

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
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

    this.path.obj_parent = this;

    this.path.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    };

    paper.view.update();
  };

  return this;
}

function FreeHandLine(x, y, draw_arrow) {
  this.path = new paper.Path();
  this.path.strokeColor = 'black';
  this.path.strokeWidth = 3;
  this.path.setFullySelected();
  this.last_pt = new paper.Point(x, y);
  this.last_but_one_pt = null;
  this.draw_arrow = draw_arrow;

  this.group = new paper.Group([this.path]);
  this.group.obj_parent = this;

  this.group.onMouseDown = function(event) {
    if (this.obj_parent.ctx.selection_mode == false)
      return false;
    this.selected = !this.selected;
  };

  this.selected = function() {
    if (this.group.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.group.selected = false;
  };

  this.translateBy = function(delta) {
    this.group.position.x += delta.x;
    this.group.position.y += delta.y;
  };

  this.clear = function() {
    this.group.remove();
    paper.view.update();
  };

  this.add_point = function(x, y) {
    this.path.add(x, y);
    this.last_but_one_pt = this.last_pt;
    this.last_pt = new paper.Point(x, y);
  };

  this.finalize = function() {
    this.path.simplify();

    if (this.draw_arrow == true) {
      this.arr_path = Arrow(this.last_but_one_pt.x, this.last_but_one_pt.y, this.last_pt.x, this.last_pt.y);
      this.group.addChild(this.arr_path);
    }
  };

  return this;
}

function ShakyLine(x, y) {
  this.x1 = x;
  this.y1 = y;
  this.path = null;

  this.clear = function() {
    if (this.path != null) {
      this.path.remove();
      paper.view.update();
    }
  };

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
  };

  this.lineTo = function(x2, y2) {
    this.clear();
    this.line = new Line(this.x1, this.y1, x2, y2, 4);
    this.path = this.line.path;

    this.path.obj_parent = this;

    this.path.onMouseDown = function(event) {
      if (this.obj_parent.ctx.selection_mode == false)
        return false;
      this.selected = !this.selected;
    };

    paper.view.update();
  };

  this.finalize = function() {
    // Do nothing
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

  this.path.obj_parent = this;

  this.selected = function() {
    if (this.path.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.path.selected = false;
  };

  this.path.onMouseDown = function(event) {
    if (this.obj_parent.ctx.selection_mode == false)
      return false;
    this.selected = !this.selected;
  };

  this.translateBy = function(delta) {
    this.path.position.x += delta.x;
    this.path.position.y += delta.y;
  };

  this.clear = function() {
    this.path.remove();
    paper.view.update();
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
    fontSize: 20
  };

  this.selected = function() {
    if (this.text.selected)
      return true;

    return false;
  };

  this.deselect = function() {
    this.text.selected = false;
  };

  this.translateBy = function(delta) {
    this.text.position.x += delta.x;
    this.text.position.y += delta.y;
  };

  this.text.obj_parent = this;

  this.text.onMouseDown = function(event) {
    if (this.obj_parent.ctx.selection_mode == false)
      return false;
    this.selected = !this.selected;
  };

  this.clear = function() {
    this.text.remove();
    paper.view.update();
  };

  this.add_char = function(c) {
    this.text.content += c;
    paper.view.update();
  };

  this.remove_char = function() {
    this.text_context  = this.text_context.slice(0, -1);
  };

  paper.view.update();
  return this;
}

function Eraser(x, y) {
  this.x = x;
  this.y = y;
  this.background_color = new paper.Color(1.0, 1.0, 1.0, 1.0);
  this.render_color = 'white';

  this.clear = function() {
    this.group.remove();
    paper.view.update();
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

function Shaky(canvas) {
  this.clear_canvas = function(width, height) {
    var rect = new paper.Path.Rectangle({
      point: [0, 0],
      size: [width, height],
      strokeColor: 'white',
      selected: true
    });

    rect.sendToBack();
    rect.fillColor = '#ffffff';
  };

  this.canvas = canvas;
  this.diagrams = [];
  this.selection_mode = false;
  var self = this;
  this.drag = {};

  this.circle = function(x, y) {
    var c = new Circle(x, y);
    c.ctx = self;
    self.diagrams.push(c);
    return c;
  };

  this.box2D = function(x, y, width, height) {
    var b2d = new box2D(x, y, width, height);
    b2d.ctx = self;
    self.diagrams.push(b2d);
    return b2d;
  };

  this.lineWithArrow = function(x1, y1, x2, y2) {
    var la = new lineWithArrow(x1, y1, x2, y2);
    la.ctx = self;
    self.diagrams.push(la);
    return la;
  };

  this.eraser = function(x, y) {
    var e = new Eraser(x, y);
    e.ctx = self;
    self.diagrams.push(e);
    return e;
  };

  this.freeHandLine = function(x, y, draw_arrow) {
    var fh = new FreeHandLine(x, y, draw_arrow);
    fh.ctx = self;
    self.diagrams.push(fh);
    return fh;
  };

  this.straightLine = function(x, y) {
    var sl = new StraightLine(x, y);
    sl.ctx = self;
    self.diagrams.push(sl);
    return sl;
  };

  this.shakyLine = function(x, y) {
    var sl = new ShakyLine(x, y);
    sl.ctx = self;
    self.diagrams.push(sl);
    return sl;
  };

  this.roundedRect = function(x, y) {
    var rr = new RoundedRect(x, y);
    rr.ctx = self;
    self.diagrams.push(rr);
    return rr;
  };

  this.ellipse = function(x, y) {
    var el = new Ellipse(x, y);
    el.ctx = self;
    self.diagrams.push(el);
    return el;
  };

  this.text2D = function(x, y, txt) {
    var t2d = new Text2D(x, y, txt);
    t2d.ctx = self;
    self.diagrams.push(t2d);
    return t2d;
  };

  this.shakyRect = function(x, y) {
    var sr = new ShakyRect(x, y);
    sr.ctx = self;
    self.diagrams.push(sr);
    return sr;
  };

  this.current_eraser = null;

  this.initialize = function(width, height) {
    this.clear_all();
    this.clear_canvas(width, height);
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

  this.remove_eraser = function() {
    if (this.current_eraser != null)
      this.current_eraser.clear();
  };

  this.create_new_eraser = function() {
    this.current_eraser = new Eraser(0, 0);
  };

  //this.remove_selected_old = function() {
  //  var to_be_removed = [];
  //  for (counter in self.diagrams) {
  //    var diagram = self.diagrams[counter];
  //    if (diagram.selected) {
  //      diagram.clear();
  //      to_be_removed.push(diagram);
  //    }
  //  }
  //
  //  for (counter in to_be_removed) {
  //    var diagram = to_be_removed[counter];
  //    var index = self.diagrams.indexOf(diagram);
  //    if (index > -1)
  //      self.diagrams.splice(index, 1);
  //  }
  //
  //  self.selection_mode = false;
  //};

  this.remove_selected = function() {
    var children = paper.project.activeLayer.children;

    var to_be_deleted = []
    // Iterate through the items contained within the array:
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.isSelected())
        to_be_deleted.push(child);
    }

    for (i = 0; i < to_be_deleted.length; i++) {
      child = to_be_deleted[i];
      child.remove();
    }

    paper.view.update();
  };

  this.clear_all = function() {
    this.diagrams = [];
    paper.project.activeLayer.removeChildren();
    paper.view.update();
  };

  this.drag = function(x, y) {
    var deltaX = x - self.drag.x;
    var deltaY = y - self.drag.y;

    var delta = new paper.Point(deltaX, deltaY);

    for (counter in self.diagrams) {
      var diagram = self.diagrams[counter];
      if (diagram.selected()) {
        diagram.translateBy(delta);
      }
    }

    self.drag.x = x;
    self.drag.y = y;
  };

  this.deselect_all = function() {
    for (counter in self.diagrams) {
      var diagram = self.diagrams[counter];
      if (diagram.selected()) {
        diagram.deselect();
      }
    }

    paper.view.update();
  };
}
