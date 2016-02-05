function Shaky() {
  this.clear_canvas = function(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
  };

  this.Line = function(ctx, x0, y0, x1, y1) {
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

    //ctx.beginPath();
    //ctx.moveTo(x0, y0);
    //ctx.bezierCurveTo(x3, y3, x4, y4, x1, y1);
    //
    //// line color
    //ctx.lineWidth = 4;
    //ctx.strokeStyle = 'black';
    //ctx.stroke();
    var path = new paper.Path();
    this.path = path;

    this.clear_line = function() {
      this.path.remove();
    };

    path.moveTo(new paper.Point(x0, y0));
    path.strokeColor = 'black';
    path.strokeWidth = 4;
    path.cubicCurveTo(new paper.Point(x3, y3), new paper.Point(x4, y4), new paper.Point(x1, y1));
    path.simplify();
    paper.view.update();
    return this.path;
  };

  this.text2D = function(ctx, txt, x, y) {
    ctx.font = "15pt 'Gloria Hallelujah'";
    ctx.fillText(txt, x, y);
  };

  this.box2D = function(ctx, top_x, top_y, width, height) {
    var bottom_x = top_x + width;
    var bottom_y = top_y + height;

    this.l1 = this.Line(ctx, top_x, top_y, bottom_x, top_y);
    this.l2 = this.Line(ctx, bottom_x, top_y, bottom_x, bottom_y);
    this.l3 = this.Line(ctx, bottom_x, bottom_y, top_x, bottom_y);
    this.l4 = this.Line(ctx, top_x, bottom_y, top_x, top_y);

    this.clear = function() {
      this.l1.remove();
      this.l2.remove();
      this.l3.remove();
      this.l4.remove();
      this.group.remove();
    };

    this.group = new paper.Group([this.l1, this.l2, this.l3, this.l4]);
    return this;
  };

  this.arrowHead = function(ctx, x0, y0, x1, y1) {
    // Draw an arrow head for a line from (x0, y0) and (x1, y1)
  };
}
