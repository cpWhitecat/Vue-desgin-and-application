"use strict";
exports.__esModule = true;
var full_1 = require("./full");
function computed(getter) {
    var _value;
    var _dirty = true;
    var effectFn = (0, full_1.effect)(getter, {
        lazy: true,
        scheduler: function () {
            if (!_dirty) {
                _dirty = true;
                (0, full_1.trigger)(obj, '_value');
            }
        }
    });
    var obj = {
        get value() {
            if (_dirty) {
                _value = effectFn();
                _dirty = false;
            }
            (0, full_1.track)(obj, "_value");
            return _value;
        }
    };
    return obj;
}
