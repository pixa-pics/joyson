var JOYSON = require("./index.js").default;

if(typeof window === "undefined"){
    self.JOYSON = JOYSON;
}else {
    window.JOYSON = JOYSON;
}