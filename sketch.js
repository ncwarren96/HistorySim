const GRID_SIZE = 10;
const NUMAGENTS = 1;

let agents = [];
let tiles = [];

let canvas;
let slider, buttonStop, buttonClear

function setup() {
	canvas = createCanvas(600,500);
	canvas.position(2, 50);
	canvas.mousePressed(createAgentAtClick);
	frameRate(60);

	setupControls();

	colorMode(HSB);
	background(0);

	noStroke();

	for(let i=0; i<width; i+=GRID_SIZE){
		for(let j=0; j<height; j+=GRID_SIZE){
			tiles.push(new Tile(i,j));
		}
	}

	
	for(let i=0; i<NUMAGENTS; i++){
		let r = random(0,4);
		if(r<1){
			agents.push(new Agent(0, random(0, height))); //left
		}else if(r<2){
			agents.push(new Agent(random(0,width), 0)); //top
		}else if(r<3){
			agents.push(new Agent(width, random(0,height))); //right
		}else{
			agents.push(new Agent(random(0,height), height)); //bottom
		}
	}
}

function setupControls(){
	buttonStop = createButton("Stop");
	buttonStop.position(2, 30);
	buttonStop.mousePressed(removeAgents);

	buttonClear = createButton("Clear");
	buttonClear.position(50, 30);
	buttonClear.mousePressed(clearTiles);

	slider = createSlider(1, 20, 2);
	slider.position(150,30);
	slider.style('width', '150px');
}

function createAgentAtClick(){
	console.log("click",mouseX,mouseY);
	agents.push(new Agent(mouseX, mouseY));
}

function removeAgents(){
	agents.length = 0;
}

function clearTiles(){
	for (let i=0; i<tiles.length; i++){
		tiles[i].decay = 110;
	}
}

function draw() {
	//frameRate(slider.value());
	for (let i=0; i<tiles.length; i++){
		if(agents.length > 0){
			for(let j = 0; j<agents.length; j++){
				a = agents[j];

				if(a.x < tiles[i].x+GRID_SIZE+2 && 
				a.x+GRID_SIZE+2 > tiles[i].x &&
				a.y < tiles[i].y+GRID_SIZE+2 &&
				a.y+GRID_SIZE+2 > tiles[i].y){

					tiles[i].decay -=1;
				}
			}
		}
		tiles[i].display();
	}

	if(agents.length > 0){
		for(let i = 0; i<agents.length; i++){
			let a = agents[i];
			a.move();
			a.display();

			//spawn new agent after going off screen;
			if(a.x > width || a.x < 0 || a.y > height || a.y < 0){
				let r = random(0,4);
				if(r<1){
					agents[i] = new Agent(0, random(0, height)); //left
				}else if(r<2){
					agents[i] = new Agent(random(0,width), 0); //top
				}else if(r<3){
					agents[i] = new Agent(width, random(0,height)); //right
				}else{
					agents[i] = new Agent(random(0,height), height); //bottom
				}

			}
		}
	}
}


//---OBJECTS---

//Agent class
function Agent(ix, iy){
	this.x = ix;
	this.y = iy;
	this.xDest = random(0, width)
	this.yDest = random(0, height);
	this.xSpeed = (this.xDest - this.x);
	this.ySpeed = (this.yDest - this.y);
	let factor = slider.value()/Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
	this.xSpeed *= factor;
	this.ySpeed *= factor;

	this.display = function() {
		fill(0, 75, 50);
		ellipseMode(CENTER);
    	ellipse(this.x, this.y, GRID_SIZE, GRID_SIZE);
  	};
		
	this.move = function(){
		this.x += this.xSpeed// + random(-1,1);
		this.y += this.ySpeed// + random(-1,1);
	};
};

//Tile class
function Tile(ix, jy){
	this.x = ix;
	this.y = jy;
	this.decay = 110;
	this.touched = false;


	this.display = function(){
		fill(this.decay, 75, 80);
		rect(this.x,this.y,GRID_SIZE, GRID_SIZE);
	};
};