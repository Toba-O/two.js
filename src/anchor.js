(function() {

  // Localized variables
  var commands = Two.Commands, x, y, o, controls, clone;

  /**
   * An object that holds 3 `Two.Vector`s, the anchor point and its
   * corresponding handles: `left` and `right`.
   */
  var Anchor = Two.Anchor = function(x, y, ux, uy, vx, vy, command) {

    Two.Vector.call(this, x, y);

    this._broadcast = _.bind(function() {
      this.trigger(Two.Events.change);
    }, this);

    this._command = command || commands.move;
    this._relative = true;

    if (!command) {
      return this;
    }

    Anchor.AppendCurveProperties(this);

    if (_.isNumber(ux)) {
      this.controls.left.x = ux;
    }
    if (_.isNumber(uy)) {
      this.controls.left.y = uy;
    }
    if (_.isNumber(vx)) {
      this.controls.right.x = vx;
    }
    if (_.isNumber(vy)) {
      this.controls.right.y = vy;
    }

  };

  _.extend(Anchor, {

    AppendCurveProperties: function(anchor) {

      x = anchor._x || anchor.x;
      y = anchor._y || anchor.y;

      anchor.controls = {
        left: new Two.Vector(0, 0),
        right: new Two.Vector(0, 0)
      };

    }

  });

  var AnchorProto = {

    listen: function() {

      if (!_.isObject(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }

      _.each(this.controls, function(v) {
        v.bind(Two.Events.change, this._broadcast);
      }, this);

      return this;

    },

    ignore: function() {

      _.each(this.controls, function(v) {
        v.unbind(Two.Events.change, this._broadcast);
      }, this);

      return this;

    },

    clone: function() {

      controls = this.controls;

      clone = new Two.Anchor(
        this.x,
        this.y,
        controls && controls.left.x,
        controls && controls.left.y,
        controls && controls.right.x,
        controls && controls.right.y,
        this.command
      );
      clone.relative = this._relative;
      return clone;

    },

    toObject: function() {
      o = {
        x: this.x,
        y: this.y
      };
      if (this.command) {
        o.command = this.command;
      }
      if (this.controls) {
        o.controls = {
          left: this.controls.left.toObject(),
          right: this.controls.right.toObject()
        };
      }
      return o;
    }

  };

  Object.defineProperty(Anchor.prototype, 'command', {

    get: function() {
      return this._command;
    },

    set: function(c) {
      this._command = c;
      if (this._command === commands.curve && !_.isObject(this.controls)) {
        Anchor.AppendCurveProperties(this);
      }
      return this.trigger(Two.Events.change);
    }

  });

  Object.defineProperty(Anchor.prototype, 'relative', {

    get: function() {
      return this._relative;
    },

    set: function(b) {
      if (this._relative == b) {
        return this;
      }
      this._relative = !!b;
      return this.trigger(Two.Events.change);
    }

  });

  _.extend(Anchor.prototype, Two.Vector.prototype, AnchorProto);

  // Make it possible to bind and still have the Anchor specific
  // inheritance from Two.Vector
  Two.Anchor.prototype.bind = Two.Anchor.prototype.on = function() {
    Two.Vector.prototype.bind.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

  Two.Anchor.prototype.unbind = Two.Anchor.prototype.off = function() {
    Two.Vector.prototype.unbind.apply(this, arguments);
    _.extend(this, AnchorProto);
  };

})();