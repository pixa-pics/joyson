import JOYSON from "./index"
if(typeof window == "undefined"){
    self.JOYSON = JOYSON;
}else {
    window.JOYSON = JOYSON;
}