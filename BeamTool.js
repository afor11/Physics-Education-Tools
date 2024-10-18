//Ford, Avi
//July 29th, 2024
//MV Beam tool

// This program is a graphing simulator of water tank Data aquisition via a medical LINAC, and is intended to be used for educational purposes

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.canvas.width = screen.availWidth;
ctx.canvas.height = screen.availHeight;

ctx.textAlign = "center";
ctx.textBaseline = "middle";

const linac = document.getElementById("LINAC");
const tank = document.getElementById("Tank");
const chamber = document.getElementById("Chamber");
const chamberBase = document.getElementById("chamberBase");
const acceleratorSize = Math.min(canvas.width * 0.52,canvas.height); //size of the linac
const centimeter = acceleratorSize * 0.00348;
let menu = "MV Beam Tool"; //menu, in case more screens are needed
let elementsDrawn = false; //true if all elements have been draw tho the screen
let SSD = 100; //Surface to Source Depth
let chamberHeight = 0; //Height of chamber, 0 is isocenter
let waterHeight = 0; //height of water, 0 is isocenter
let mode = "PDD"; //mode, PDD or TMR
let lastMouseDown = false; //true if the mouse was down on the last frame
let mouse = {x: 0, y: 0, down: false};
let energy = 10; //energy of the beam
let fieldSize = 10; //field size, it is symmetrical, so it can be stored as 1 number
let initalClickY = -10; //when dragging water or chamber, this is the inital click position
let initalHeight = 0; //when dragging water or chamber, this is the inital value of the variable being modified
let task = {currentTask: "drag water", showButton: true}; //an object to describe the state of the "task", or the little button next to the tank
let depth = 0;
let scrollPos = {x: 0, y: 0};

class Data{
    constructor(){
        this.depths = [0.5,1,1.5,2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30];
        this.fieldSizes = [5,10,20,40];
    // Data are from Univ of Washington B linac commissioning data circa 2019
    // The PDD data were acquired at SSD of 90 cm
        this.PDD_6MV_data = [[0.811,0.97,1,0.989,0.941,0.892,0.844,0.799,0.753,0.71,0.669,0.631,0.559,0.495,0.439,0.39,0.347,0.308,0.274,0.244,0.218,0.195],
            [0.863,0.981,1,0.988,0.946,0.901,0.86,0.818,0.779,0.738,0.699,0.663,0.596,0.533,0.477,0.427,0.382,0.343,0.306,0.275,0.246,0.223],
            [0.913,0.993,1,0.985,0.948,0.907,0.869,0.832,0.797,0.76,0.725,0.692,0.629,0.57,0.516,0.467,0.422,0.382,0.344,0.311,0.281,0.256],
            [0.934,0.996,1,0.986,0.951,0.915,0.881,0.846,0.813,0.778,0.745,0.715,0.656,0.6,0.548,0.5,0.455,0.415,0.377,0.343,0.312,0.286]];
        this.PDD_10MV_data = [[0.689,0.896,0.974,1,0.983,0.942,0.896,0.854,0.812,0.77,0.732,0.695,0.626,0.563,0.507,0.457,0.413,0.372,0.336,0.304,0.274,0.25],
            [0.763,0.924,0.984,1,0.977,0.936,0.897,0.859,0.822,0.784,0.747,0.714,0.649,0.589,0.535,0.485,0.44,0.399,0.362,0.329,0.299,0.273],
            [0.85,0.966,0.999,1,0.971,0.933,0.897,0.862,0.828,0.793,0.76,0.728,0.669,0.612,0.561,0.513,0.469,0.429,0.393,0.358,0.328,0.302],
            [0.884,0.975,1,0.998,0.969,0.936,0.902,0.87,0.838,0.805,0.774,0.745,0.687,0.633,0.584,0.538,0.494,0.455,0.418,0.385,0.353,0.325]];
        this.PDD_18MV_data = [[0.549,0.774,0.893,0.961,1,0.983,0.949,0.91,0.869,0.831,0.793,0.759,0.692,0.631,0.576,0.525,0.48,0.438,0.4,0.367,0.336,0.31],
            [0.655,0.837,0.931,0.981,1,0.978,0.945,0.909,0.872,0.836,0.802,0.769,0.706,0.647,0.593,0.544,0.5,0.458,0.42,0.386,0.354,0.327],
            [0.775,0.913,0.975,1,0.996,0.968,0.934,0.901,0.868,0.834,0.802,0.772,0.714,0.658,0.608,0.562,0.518,0.478,0.441,0.407,0.375,0.35],
            [0.817,0.929,0.978,1,0.996,0.969,0.938,0.906,0.875,0.844,0.813,0.785,0.728,0.676,0.627,0.582,0.538,0.499,0.462,0.428,0.396,0.371]];
        this.TMR_6MV_data = [[0.794,0.959,1,1,0.972,0.94,0.908,0.876,0.843,0.809,0.777,0.745,0.686,0.628,0.577,0.531,0.488,0.447,0.411,0.379,0.349,0.322],
            [0.844,0.97,1,0.999,0.977,0.951,0.925,0.899,0.872,0.842,0.814,0.786,0.732,0.678,0.628,0.581,0.537,0.496,0.457,0.422,0.39,0.368],
            [0.893,0.982,1,0.996,0.979,0.957,0.935,0.913,0.892,0.867,0.844,0.82,0.772,0.724,0.678,0.634,0.591,0.551,0.512,0.477,0.443,0.416],
            [0.914,0.986,1,0.997,0.983,0.965,0.948,0.93,0.912,0.89,0.869,0.849,0.808,0.766,0.724,0.683,0.643,0.606,0.567,0.532,0.499,0.47]];
        this.TMR_10MV_data = [[0.665044607,0.873479319,0.9594485,0.99594485,1,0.97729116,0.949716139,0.922141119,0.895377129,0.864557989,0.836982968,0.811030008,0.756690998,0.705596107,0.659367397,0.614760746,0.573398216,0.535279805,0.500405515,0.466342255,0.435523114,0.412814274],
            [0.738874895,0.904282116,0.973131822,1,0.999160369,0.978169605,0.956339211,0.934508816,0.912678421,0.886649874,0.863140218,0.839630563,0.79177162,0.743912678,0.699412259,0.6565911,0.614609572,0.575986566,0.539042821,0.506297229,0.473551637,0.449202351],
            [0.822622108,0.946015424,0.988003428,1,0.992287918,0.974293059,0.955441302,0.937446444,0.919451585,0.897172237,0.877463582,0.856898029,0.81748072,0.774635818,0.734361611,0.694944302,0.65638389,0.619537275,0.584404456,0.550128535,0.518423308,0.491002571],
            [0.856766257,0.956063269,0.991212654,1,0.992970123,0.978910369,0.963093146,0.948154657,0.932337434,0.913005272,0.896309315,0.878734622,0.842706503,0.805799649,0.769771529,0.733743409,0.698594025,0.665202109,0.630931459,0.598418278,0.566783831,0.538664323]];
        this.TMR_18MV_data = [[0.519130435,0.73826087,0.860869565,0.935652174,0.995652174,1,0.985217391,0.964347826,0.940869565,0.917391304,0.892173913,0.869565217,0.823478261,0.77826087,0.735652174,0.695652174,0.657391304,0.622608696,0.588695652,0.556521739,0.526956522,0.5],
            [0.619131975,0.800708592,0.899911426,0.959255979,1,0.99911426,0.985828167,0.967227635,0.948627104,0.926483614,0.906111603,0.885739593,0.844109832,0.80336581,0.764393268,0.725420726,0.688219663,0.65279008,0.619131975,0.58724535,0.556244464,0.533215235],
            [0.736842105,0.876895629,0.94647636,0.983050847,1,0.991971454,0.978590544,0.962533452,0.9455843,0.927743087,0.909901873,0.89206066,0.856378234,0.820695807,0.78412132,0.749330955,0.715432649,0.682426405,0.649420161,0.618198037,0.588760036,0.563782337],
            [0.776566757,0.892824705,0.950045413,0.981834696,1,0.993642144,0.981834696,0.968210718,0.954586739,0.939146231,0.922797457,0.908265213,0.875567666,0.843778383,0.811989101,0.780199818,0.748410536,0.717529519,0.685740236,0.656675749,0.628519528,0.604904632]];
        //call the data arrays like this: table[fieldIndex][depthIndex]
    }
    fetchData(mode,energy,fieldSize,depth,SSD){
        let depthIndex = this.sortInsert(this.depths,depth);
        let fieldSizeIndex = this.sortInsert(this.fieldSizes,fieldSize);
        if (mode == "PDD"){
        // PDD data were acquired at SSD of 90. To find the PDD at another SSD we use the Mayneord F factor
        // dmax depth are 1.5, 2 and 3 cm for 6, 10 and 18 respectively
            if (energy == 6){
                return Math.pow(((SSD + 1.5) / (SSD + depth)),2) * Math.pow(((90 + depth) / 91.5),2) * this.lerpData(this.PDD_6MV_data,fieldSizeIndex,depthIndex);
            }else{
                if (energy == 10){
                    return Math.pow(((SSD + 2) / (SSD + depth)),2) * Math.pow(((90 + depth) / 92),2) * this.lerpData(this.PDD_10MV_data,fieldSizeIndex,depthIndex);
                }else{
                    return Math.pow(((SSD + 3) / (SSD + depth)),2) * Math.pow(((90 + depth) / 93),2) * this.lerpData(this.PDD_18MV_data,fieldSizeIndex,depthIndex);
                }
            }
        }else{
            if (energy == 6){
                return this.lerpData(this.TMR_6MV_data,fieldSizeIndex,depthIndex);
            }else{
                if (energy == 10){
                    return this.lerpData(this.TMR_10MV_data,fieldSizeIndex,depthIndex);
                }else{
                    return this.lerpData(this.TMR_18MV_data,fieldSizeIndex,depthIndex);
                }
            }
        }
    }
    lerpData(array,i1,i2){
        let depthTable = array[i1.index - 1];
        if (i2.index >= depthTable.length){
            i2.index = depthTable.length - 1;
        }
        if (i2.index <= 0){
            i2.index = 1;
        }
        let value = (i2.value - this.depths[i2.index - 1]) / (this.depths[i2.index] - this.depths[i2.index - 1]);
        value = (depthTable[i2.index - 1] * (1 - value)) + (depthTable[i2.index] * value);
        return value;
    }
    sortInsert(arr,elm){
        let newArray = [elm].concat(arr);
        newArray = this.bubbleSort(newArray,1);
        let index = newArray.reduce(
            function (accumulator,currentValue,index){
                if(currentValue == elm){
                    return index;
                }
                return accumulator;
            },
            -1,
        );
        return {array: newArray,index: index,value: elm};
    }
    bubbleSort(array,maxIterations){
        let currentValue = 0;
        for (let i = 0; (i < array.length - 1) && ((i == null) || (i < maxIterations)); i++){
            for (let j = 0; j < array.length - i - 1; j++){
                if (array[j] > array[j + 1]){
                    currentValue = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = currentValue;
                }
            }
        }
        return array;
    }
}
class Button{
    constructor(x,y,width,height,roundness,color,boarderWidth,dropdowns,label){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.roundness = roundness;
        this.color = color;
        this.boarderWidth = boarderWidth;
        this.dropDowns = dropdowns;
        this.dropDownShowing = false;
        this.label = label;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.x,this.y,this.width,this.height, this.roundness);
        ctx.fill();
        if (this.boarderWidth > 0){
            ctx.lineWidth = this.boarderWidth;
            ctx.stroke();
        }
        if (this.label[0] != null){
            if (this.label.length >= 2){
                ctx.font = this.label[1];
            }else{
                ctx.font = text(50,"Arial");
            }
            if (this.label.length >= 3){
                ctx.fillStyle = this.label[2];
            }else{
                ctx.fillStyle = "black";
            }
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.label[0],this.x + this.width * 0.5,this.y + this.height * 0.5);
        }
    }
    clicked(){
        return hitboxRect(this.x,this.y,this.x + this.width,this.y + this.height);
    }
    drawDropDown(){
        for (let i = 0; i < this.dropDowns.length; i++){
            this.dropDowns[i][0].draw();
        }
        this.draw();
        this.dropDownShowing = true;
    }
    dropDownClicked(){
        if (this.dropDownShowing){
            for (let i = 0; i < this.dropDowns.length; i++){
                if (this.dropDowns[i][0].clicked()){
                    return i;
                }
            }
        }
        return -1;
    }
    eraseDropDown(){
        for (let i = 0; i < this.dropDowns.length; i++){
            this.dropDowns[i][0].eraseButton();
        }
        this.eraseButton();
        this.draw();
        this.dropDownShowing = false;
    }
    eraseButton(){
        ctx.clearRect(this.x - this.boarderWidth,this.y - this.boarderWidth,this.width + 2 * this.boarderWidth,this.height + 2 * this.boarderWidth);
    }
}
class GraphTrail{
    // This class plots a graph based on the selected energy, field size, SSD, and mode settings
    constructor(currentPos,data,energy,fieldSize,SSD,depth,mode){
        this.color = ["red","orange","yellow","green","blue","purple","cyan","magenta"][graphs.length];
        this.minExplored = currentPos;
        this.maxExplored = currentPos;
        this.data = data;
        this.energy = energy;
        this.fieldSize = fieldSize;
        this.SSD = SSD;
        this.depth = depth;
        this.mode = mode;
    }
    draw(){
        if (graphs.length > 4){
            ctx.lineWidth = cm(1);
        }else{
            ctx.lineWidth = cm(2);
        }
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(getPos(this.energy,this.fieldSize,this.SSD,this.minExplored,this.mode).x,getPos(this.energy,this.fieldSize,this.SSD,this.minExplored,this.mode).y);
        for (let i = this.minExplored; i < this.maxExplored; i++){
            if (this.mode == "TMR"){
                ctx.lineTo(getPos(this.energy,this.fieldSize,this.SSD,i,this.mode).x,getPos(this.energy,this.fieldSize,100 - i,i,this.mode).y);
            }else{
                ctx.lineTo(getPos(this.energy,this.fieldSize,this.SSD,i,this.mode).x,getPos(this.energy,this.fieldSize,this.SSD,i,this.mode).y);
            }
        }
        ctx.stroke();
    }
}

const initColor = modeColor(mode);
let energyDropdownMenu = [[new Button(acceleratorSize + cm(60),cm(90),cm(40),cm(30),[0],initColor,5,null,["6 MV"]),6],
    [new Button(acceleratorSize + cm(60),cm(120),cm(40),cm(30),[0],initColor,5,null,["10 MV"]),10],
    [new Button(acceleratorSize + cm(60),cm(150),cm(40),cm(30),[0,0,cm(10),cm(10)],initColor,5,null,["18 MV"]),18]];
let fieldsizeDropdownMenu = [[new Button(acceleratorSize + cm(120),cm(90),cm(60),cm(30),[0],initColor,5,null,["5x5 CM"]),5],
    [new Button(acceleratorSize + cm(180),cm(90),cm(60),cm(30),[0],initColor,5,null,["10x10 CM"]),10],
    [new Button(acceleratorSize + cm(120),cm(120),cm(60),cm(30),[0,0,0,cm(10)],initColor,5,null,["20x20 CM"]),20],
    [new Button(acceleratorSize + cm(180),cm(120),cm(60),cm(30),[0,0,cm(10),0],initColor,5,null,["40x40 CM"]),40]];

let energyDropdown = new Button(acceleratorSize + cm(10),cm(60),cm(90),cm(30),[cm(10)],initColor,5,energyDropdownMenu,["Energy: 10 MV"]);
let fieldsizeDropdown = new Button(acceleratorSize + cm(120),cm(60),cm(120),cm(30),[cm(10)],initColor,5,fieldsizeDropdownMenu,["Field size: 10x10 CM"]);
let modeToggle = new Button(acceleratorSize + cm(10),cm(15),cm(75),cm(30),[cm(20)],initColor,5,null,[null]);
let resetGraphButton = new Button(acceleratorSize + cm(170),cm(15),cm(75),cm(30),[cm(10)],initColor,5,null,["Reset Graphs"]);
let completeTask = new Button(cm(75),cm(165),cm(80),cm(30),[cm(8)],initColor,5,null,["Lock water height",text(40,"Arial")]);
let aboutDropdown = [[new Button(cm(5),cm(20),cm(80),cm(15),[0],"#d3d3d0",0,null,["Created by: Avi Ford",text(30,"Arial")])],
    [new Button(cm(5),cm(35),cm(80),cm(15),[0],"#d3d3d0",0,null,["July 29th, 2024",text(30,"Arial")])]];
let about = new Button(cm(5),cm(5),cm(80),cm(15),[0],"#d3d3d0",5,aboutDropdown,["About",text(30,"Arial")]);
let data = new Data();
let graphs = [];

addEventListener("scroll",function (e){
	scrollPos = {
		x: window.scrollX,
		y: window.scrollY
	}
});
addEventListener("mousemove",function (e){
	updateMousePos(e);
});
addEventListener("mousedown",function (e){
	updateMousePos(e);
	mouse.down = true;
});
addEventListener("mouseup",function (e){
	updateMousePos(e);
	mouse.down = false;
});
function updateMousePos(e){
	mouse.x = e.clientX + scrollPos.x;
	mouse.y = e.clientY + scrollPos.y;
}

setInterval(tick, 50); // runs tick function every 50 ms

function tick() {
    if (elementsDrawn){
        if (energyDropdown.dropDownShowing){
            if (energyDropdown.dropDownClicked() != -1){
                let newEnergy = energyDropdown.dropDowns[energyDropdown.dropDownClicked()][1]
                if (energy != newEnergy){
                    graphs.push(new GraphTrail(depth,data,newEnergy,fieldSize,SSD,depth,mode));
                }
                energy = newEnergy;
                energyDropdown.label = ["Energy: " + energy + " MV"];
                energyDropdown.roundness = [cm(10)];
                energyDropdown.eraseDropDown();
            }
        }
        if (energyDropdown.clicked()){
            // toggles dropdown showing if the dropdown button has been clicked
            if (energyDropdown.dropDownShowing){
                energyDropdown.roundness = [cm(10)];
                energyDropdown.eraseDropDown();
            }else{
                energyDropdown.roundness = [cm(10),cm(10),0,cm(10)];
                energyDropdown.drawDropDown();
            }
        }
        if (fieldsizeDropdown.dropDownShowing){
            if (fieldsizeDropdown.dropDownClicked() != -1){
                let newFieldSize = fieldsizeDropdown.dropDowns[fieldsizeDropdown.dropDownClicked()][1];
                if (fieldSize != newFieldSize){
                    graphs.push(new GraphTrail(depth,data,energy,newFieldSize,SSD,depth,mode));
                }
                fieldSize = newFieldSize;
                fieldsizeDropdown.label = ["Field size: " + fieldSize + "x" + fieldSize + " CM"];
                fieldsizeDropdown.roundness = [cm(10)];
                fieldsizeDropdown.eraseDropDown();
            }
        }
        if (fieldsizeDropdown.clicked()){
            if (fieldsizeDropdown.dropDownShowing){
                fieldsizeDropdown.roundness = [cm(10)];
                fieldsizeDropdown.eraseDropDown();
            }else{
                fieldsizeDropdown.roundness = [cm(10),cm(10),0,0];
                fieldsizeDropdown.drawDropDown();
            }
        }
        if (about.clicked()){
            if (about.dropDownShowing){
                about.eraseDropDown();
            }else{
                about.drawDropDown();
            }
        }
        if (resetGraphButton.clicked()){
            graphs = [];
            if (mode == "TMR"){
                graphs.push(new GraphTrail(depth,data,energy,fieldSize,SSD,depth,mode));
            }
        }
        if (modeToggle.clicked()){
            if (mode == "PDD"){
                mode = "TMR";
                chamberHeight = 0;
                task = {currentTask: "drag water", showButton: false};
                updateVariables();
                graphs.push(new GraphTrail(depth,data,energy,fieldSize,SSD,depth,mode));
            }else{
                task = {currentTask: "drag water", showButton: true};
                mode = "PDD";
            }
            for (let i = 0; i < energyDropdown.dropDowns.length; i++){
                energyDropdown.dropDowns[i][0].color = modeColor(mode);
            }
            for (let i = 0; i < fieldsizeDropdown.dropDowns.length; i++){
                fieldsizeDropdown.dropDowns[i][0].color = modeColor(mode);
            }
            elementsDrawn = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (energyDropdown.dropDownShowing){
                energyDropdown.drawDropDown();
            }
            if (fieldsizeDropdown.dropDownShowing){
                fieldsizeDropdown.drawDropDown();
            }
            if (about.dropDownShowing){
                about.drawDropDown();
            }
        }
        if (completeTask.clicked()){
            // completeTask is the button in PDD mode that lets you set water height before effecting chamber depth
            if (mode == "PDD"){
                if (task.currentTask == "drag water"){
                    if ((graphs.length == 0) || (graphs[graphs.length - 1].SSD != SSD)){
                        graphs.push(new GraphTrail(depth,data,energy,fieldSize,SSD,depth,mode));
                        task = {currentTask: "drag chamber", showButton: true};
                        completeTask.label = ["New PDD graph",text(40,"Arial")];
                    }
                }else{
                    task = {currentTask: "drag water", showButton: true};
                    completeTask.label = ["Lock water height",text(40,"Arial")];
                }
            }
            drawScene(false);
        }
        if (mouse.down != lastMouseDown){
            initalClickY = mouse.y;
            if (mode == "PDD"){
                if (task.currentTask == "drag water"){
                    initalHeight = waterHeight;
                }else{
                    initalHeight = chamberHeight;
                }
            }else{
                initalHeight = waterHeight;
            }
        }
        if (mouse.down){
            drawScene(true); // argument is wether or not the Linac is being erased
            if (mode == "PDD"){
                if (task.currentTask == "drag water"){
                    waterHeight = initalHeight + cm(mouse.y - initalClickY) / 4; // divide by 4 to reduce sensitivity
                }else{
                    chamberHeight = initalHeight + cm(mouse.y - initalClickY) / 4;
                }
            }else{
                waterHeight = initalHeight + cm(mouse.y - initalClickY) / 4;
            }
            drawScene(false);
        }
    }else{
        // draws the entire scene
        completeTask.color = modeColor(mode);
        drawScene(false);
        ctx.font = text(60,"Arial");
        ctx.fillStyle = "black";
        ctx.fillText("Mode: " + mode,acceleratorSize + cm(125),cm(30));
        energyDropdown.color = modeColor(mode);
        fieldsizeDropdown.color = modeColor(mode);
        modeToggle.color = modeColor(mode);
        resetGraphButton.color = modeColor(mode);
        energyDropdown.draw();
        fieldsizeDropdown.draw();
        modeToggle.draw();
        resetGraphButton.draw();
        about.draw();
        ctx.lineWidth = cm(2);
        ctx.fillStyle = "black";
        ctx.beginPath();
        if (mode == "PDD"){
            ctx.arc(acceleratorSize + cm(25), cm(30), cm(12), 0, 2 * Math.PI);
        }else{
            ctx.arc(acceleratorSize + cm(70), cm(30), cm(12), 0, 2 * Math.PI);
        }
        ctx.fill(); // mode toggle circle
        drawGraph();
        elementsDrawn = !elementsDrawn;
        tick();
    }
    lastMouseDown = mouse.down;
}
function hitboxRect(x1,y1,x2,y2){
    return ((mouse.x > x1) && (mouse.x < x2) && (mouse.y > y1) && (mouse.y < y2) && mouse.down && (!lastMouseDown));
}
function modeColor(mode){
    if (mode == "PDD"){
        return "#ffc28c"; //orange
    }else{
        return "#8cc0ff"; //blue
    }
}
function cm(pixels){
    return centimeter * pixels;
}
function text(pixels,style){
    return cm(0.217 * pixels) + "px " + style;
}
function boundVariables(){
    if (waterHeight > cm(51)){waterHeight = cm(51);}
    if (waterHeight < -cm(51)){waterHeight = -cm(51);}
    if (mode == "TMR"){chamberHeight = 0;}
    if (depth > cm(69)){chamberHeight = waterHeight + cm(69);}
    if (chamberHeight < waterHeight){
        if (mode == "PDD"){
            chamberHeight = waterHeight;
        }else{
            waterHeight = chamberHeight;
        }
    }
    if (chamberHeight > cm(55)){chamberHeight = cm(55);}
    if (chamberHeight < -cm(69)){chamberHeight = -cm(69);}
}
function updateVariables(){
    boundVariables();
    SSD = 100 + (waterHeight / 8);
    depth = chamberHeight - waterHeight;
    boundVariables();
    if (graphs.length > 8){
        graphs.pop();
    }
}
function drawScene(erase){
    updateVariables();
    if (erase){
        ctx.clearRect(0,0,acceleratorSize,acceleratorSize);
    }else{
        drawGraph(); //when the LINAC needs to updated, the graph does too
        if (energyDropdown.dropDownShowing){
            energyDropdown.drawDropDown();
        }else{
            energyDropdown.draw();
        }
        if (fieldsizeDropdown.dropDownShowing){
            fieldsizeDropdown.drawDropDown();
        }else{
            fieldsizeDropdown.draw();
        }
        ctx.drawImage(linac, cm(2),cm(2),acceleratorSize,acceleratorSize);
        ctx.fillStyle = "#8cc0ff";
        ctx.beginPath();
        ctx.rect(cm(172),cm(195) + waterHeight,cm(102),cm(62) - waterHeight);
        ctx.fill();
        ctx.fillStyle = "#d3d3d0";
        ctx.beginPath();
        ctx.rect(cm(208),cm(258),cm(30),cm(20));
        ctx.fill();
        ctx.drawImage(tank, cm(2),cm(2),acceleratorSize,acceleratorSize);
        ctx.drawImage(chamberBase, cm(2),cm(2),acceleratorSize,acceleratorSize);
        ctx.drawImage(chamber, cm(2),cm(2) + chamberHeight,acceleratorSize,acceleratorSize);
        ctx.fillStyle = "black";
        ctx.font = text(28,"Arial");
        ctx.fillText("SSD: " + Math.round(SSD) + " CM",cm(193),cm(193) + waterHeight);
        if (about.dropDownShowing){
            about.drawDropDown();
        }else{
            about.draw();
        }
        if (task.currentTask != "none"){
            ctx.font = text(30,"Arial");
            ctx.fillStyle = "black";
            if (mode == "PDD"){
                if (task.currentTask == "drag water"){
                    ctx.fillText("Click and drag water",cm(112),cm(140));
                    ctx.fillText("before moving chamber",cm(112),cm(150));
                }else{
                    ctx.fillText("Click and drag water",cm(112),cm(140));
                    ctx.fillText("to change height",cm(112),cm(150));
                }
            }else{
                ctx.fillText("Click and drag water",cm(112),cm(150));
                ctx.fillText("to change height",cm(112),cm(160));
            }
            if (task.showButton){
                completeTask.draw();
            }
        }
    }
}
function getPos(energy,fieldSize,SSD,depth,mode){
    // position of graph point based on current data settings
    return {x: acceleratorSize + cm(10 + (240 - 50 * (Math.floor((graphs.length - 1) / 4) + 1)) * (depth / cm(69))),
        y: cm(122 + 145 * (1 - data.fetchData(mode,energy,fieldSize,(30 * depth/cm(69)),SSD)))};
}
function drawGraph(){
    updateVariables();
    ctx.clearRect(acceleratorSize, cm(110),cm(260),cm(175));
    ctx.font = text(40,"Arial");
    ctx.fillStyle = "black";
    ctx.fillText("Dose",acceleratorSize + cm(10), cm(110));
    ctx.fillText("Depth",acceleratorSize + cm((240 - 50 * (Math.floor((graphs.length - 1) / 4) + 1)) / 2), cm(275));
    if (graphs.length > 0){
        if (depth > graphs[graphs.length - 1].maxExplored){
            if (mode == "PDD"){
                if (task.currentTask != "drag water"){
                    graphs[graphs.length - 1].maxExplored = depth;
                }
            }else{
                graphs[graphs.length - 1].maxExplored = depth;
            }
        }
        if (depth < graphs[graphs.length - 1].minExplored){
            if (mode == "PDD"){
                if (task.currentTask != "drag water"){
                    graphs[graphs.length - 1].minExplored = depth;
                }
            }else{
                graphs[graphs.length - 1].minExplored = depth;
            }
        }
        ctx.textAlign = "left";
        for (let i = 0; i < graphs.length; i++){
            graphs[i].draw();
            // graph legend
            let boxX = acceleratorSize + cm(255 - 50 * (Math.floor(i / 4) + 1));
            let boxY = cm(120 + 145 * ((i / 4) - Math.floor(i / 4)));
            ctx.lineWidth = cm(2);
            ctx.beginPath();
            ctx.rect(boxX,boxY,cm(45),cm(30));
            ctx.stroke();
            ctx.font = text(25,"Arial");
            ctx.fillText(graphs[i].energy + "MV",boxX + cm(3),boxY + cm(7));
            ctx.fillText(graphs[i].fieldSize + "x" + graphs[i].fieldSize + " CM Field",boxX + cm(3),boxY + cm(12));
            if (graphs[i].mode == "PDD"){
                ctx.fillText("SSD: " + Math.round(graphs[i].SSD) + " CM",boxX + cm(3),boxY + cm(18));
                ctx.fillStyle = "#b35300";
                ctx.fillText("Mode: PDD",boxX + cm(3),boxY + cm(24));
                ctx.fillStyle = "black";
            }else{
                ctx.fillStyle = "blue";
                ctx.fillText("Mode: TMR",boxX + cm(3),boxY + cm(18));
                ctx.fillStyle = "black";
            }
        }
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
    }
    ctx.lineWidth = cm(2);
    ctx.beginPath();
    ctx.moveTo(acceleratorSize + cm(10), cm(120));
    ctx.lineTo(acceleratorSize + cm(10), cm(265));
    ctx.lineTo(acceleratorSize + cm(250 - 50 * (Math.floor((graphs.length - 1) / 4) + 1)), cm(265));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(getPos(energy,fieldSize,SSD,depth,mode).x, getPos(energy,fieldSize,SSD,depth,mode).y, cm(5), 0, 2 * Math.PI);
    ctx.fill();
}