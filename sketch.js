const GRID_SIZE = 10;
const GRID_WIDTH = 60;
const GRID_HEIGHT = 50;
const NUMAGENTS = 1;

let show_path = true;

//index i*WIDTH+j
//k%WIDTH to get i

let agents = [];
let tiles = [];
let waypoints = [];
let treads = {};
let canvas;
let slider, buttonStop, buttonClear, buttonAdd

function setup() {
	canvas = createCanvas((GRID_WIDTH*GRID_SIZE),(GRID_HEIGHT*GRID_SIZE));
	canvas.mousePressed(onClickCanvas);
	frameRate(30);

	setupControls();

	colorMode(HSB);
	background(0);
	noStroke();

	//init array of Tiles with GRID_SIZE
	for(let i=0; i<(GRID_HEIGHT*GRID_SIZE); i+=GRID_SIZE){
		for(let j=0; j<(GRID_WIDTH*GRID_SIZE); j+=GRID_SIZE){
			tiles.push(new Tile(j, i));
		}
	}

	for(let i=0; i<tiles.length; i++){
		let [x,y] = indexToTile(i);
		treads[i] = 100+(noise(x*0.2,y*0.2)*50);
	}

	waypoints.push(Math.floor(Math.random()*tiles.length));

	initAgents(NUMAGENTS);

}


function setupControls(){
	let row = 30;
	canvas.position(2, 55);

	buttonStop = createButton("Stop");
	buttonStop.position(2, row);
	buttonStop.mousePressed(removeAgents);

	buttonAdd = createButton("Add");
	buttonAdd.position(52, row);
	buttonAdd.mousePressed(function() { initAgents(1);})

	buttonClear = createButton("Clear");
	buttonClear.position(100, row);
	buttonClear.mousePressed(clearTiles);

	slider = createSlider(5, 50, 20);
	slider.position(150,row);
	slider.style('width', '150px');

	let text = createDiv("Click to add a wall tile, click again (double-click) to add a waypoint.</br>"+
							"'Stop' will remove all pathfinding agents, 'Add' will add one agent, 'Clear' will reset the terrain.</br>"+
							"Use the slider to adjust simulation speed.");
	text.position(2, height+60);
}

//spawns n agents on a random spot along the perimeter
function initAgents(num){
	for(let i=0; i<num; i++){
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

function onClickCanvas(){
	let k = tileToIndex( (mouseY/GRID_SIZE)|0, (mouseX/GRID_SIZE)|0);
	console.log("click",mouseX,mouseY, "on tile ", k);
	
	if(treads[k] == 300){
		waypoints.push(k);
		console.log("added waypoint at "+k);
	}else{
		treads[k] = 300;
	}
}

function removeAgents(){
	agents.length = 0;
}

function clearTiles(){
	for(k in treads){
		let [x,y] = indexToTile(k);
		treads[k] = 100+(noise(x*0.2,y*0.2)*50);
	}
	waypoints.length = 0;
}

function tileToIndex(i,j){
	return (i*GRID_WIDTH+j)
}

function indexToTile(k){
	return [(k/GRID_WIDTH)|0, k%GRID_WIDTH]
}

function tileToPos(k){
	let [i,j] = indexToTile(k);
	return [i*GRID_SIZE, j*GRID_SIZE];
}

function getNeighbors(k){
	let [i,j] = indexToTile(k);
	let neighbors = [];
	if(i>0){
		neighbors.push(tileToIndex(i-1, j));
	}
	if(i<GRID_HEIGHT-1){
		neighbors.push(tileToIndex(i+1, j));
	}
	if(j>0){
		neighbors.push(tileToIndex(i, j-1));
	}
	if(j<GRID_WIDTH-1){
		neighbors.push(tileToIndex(i, j+1));
	}
	return neighbors;
}

function getTraversalCost(k){
	if (k in treads){
		return treads[k];
	}
	return 110;
}

function search(start, dest){
	console.log("finsing path from", start, dest);
	let q = new PriorityQueue();
	q.push(start, 0);

	let previous = {};
	let cost_so_far = {};
	previous[start] = null;
	cost_so_far[start] = 0;

	while(q.size() > 0){
		let current = q.pop();

		if(current == dest){
			let path = []
			while(current != null){
				path.push(current);
				current = previous[current];
			}
			return path;
		}

		let neighbors = getNeighbors(current);
		let current_cost = cost_so_far[current]
		for(let i=0; i<neighbors.length; i++){
			let next = neighbors[i];
			let new_cost = current_cost + getTraversalCost(next);

			if(cost_so_far[next] == undefined || new_cost < cost_so_far[next]){
				cost_so_far[next] = new_cost;
				let priority = -new_cost
				q.push(next, priority);
				previous[next] = current;
			}
		}
	}
	console.log("NO PATH FOUND!")
}

function draw() {

	//set waypoint treads for color
	for(let i=0; i<waypoints.length; i++){
		treads[waypoints[i]] = 0;
	}

	//set tile colors based on treads, and draw
	for (let i=0; i<tiles.length; i++){
		if(i in treads){
			tiles[i].green = treads[i];
		}
		tiles[i].display();
	}


	//draw agents and their paths
	if(agents.length > 0){
		for(let i = 0; i<agents.length; i++){
			let a = agents[i];
			a.update();
			a.move();
			//a.display();
			if(show_path) a.showPath();

			//spawn new agent after going off screen;
			if(a.x > width || a.x < 0 || a.y > height || a.y < 0){
				let r = random();
				console.log(r);
				if(r<0.25){
					agents[i] = new Agent(0, random(0, height-1)); //left
				}else if(r<0.5){
					agents[i] = new Agent(random(0,width-1), 0); //top
				}else if(r<0.75){
					agents[i] = new Agent(width-1, random(0, height-1)); //right
				}else if(r<1){
					agents[i] = new Agent(random(0,width-1), height-1); //bottom
				}

			}
		}
	}
}

function drawPath(path){
	stroke(255);
	strokeWeight(2);
	for(let i=0; i<path.length-1; i++){
		let [ai, aj] = indexToTile(path[i]);
		let [bi, bj] = indexToTile(path[i+1]);
		//console.log(b);

		line((aj*GRID_SIZE)+GRID_SIZE/2, 
			(ai*GRID_SIZE)+GRID_SIZE/2, 
			(bj*GRID_SIZE)+GRID_SIZE/2, 
			(bi*GRID_SIZE)+GRID_SIZE/2);
	}
	noStroke();
}

function markPathTread(path){
	for(let i=0; i<path.length-1; i++){
		if(path[i] in treads){
			if(treads[path[i]]>1){
				treads[path[i]] -=1;
			}
		}else{
			treads[path[i]] = 109;
		}
	}
}

function getRandomDest(){
	let l, h;
	if(random()>0.5){
		l = random(width-1);
		if(random()>0.5){
			h = height-1
		}else{
			h = 0 ;
		}
	}else{
		h = random(height-1);
		if(random()>0.5){
			l = width-1;
		}else{
			l = 0;
		}
	}
	return [l|0,h|0];
}
//---OBJECTS---

//Agent class
function Agent(ix, iy){
	this.x = ix;
	this.y = iy;
	this.destPos = getRandomDest();
	this.yDest = this.destPos[1];
	this.xDest = this.destPos[0];
	this.path = [];

	if(waypoints.length>0){
		this.start = tileToIndex((this.y/GRID_SIZE)|0,(this.x/GRID_SIZE)|0);
		this.dest = waypoints[Math.floor(Math.random()*waypoints.length)];
		this.path = search(this.start, this.dest);
		markPathTread(this.path);
	}


	this.xSpeed = (this.xDest - this.x);
	this.ySpeed = (this.yDest - this.y);

	this.update = function(){
		let factor = slider.value()/Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
		this.xSpeed *= factor;
		this.ySpeed *= factor;
	};

	this.display = function() {
		fill(0, 75, 50);
		ellipseMode(CENTER);
    	ellipse(this.x, this.y, GRID_SIZE, GRID_SIZE);
  	};
		
	this.move = function(){
		this.x += this.xSpeed// + random(-1,1);
		this.y += this.ySpeed// + random(-1,1);
	};

	this.showPath = function(){
		drawPath(this.path);
	};
};

//Tile class
function Tile(ix, jy){
	this.x = ix;
	this.y = jy;
	this.green = 110;


	this.display = function(){
		fill(this.green, 75, 80);
		rect(this.x,this.y,GRID_SIZE, GRID_SIZE);
	};
};

function PriorityQueue() {
  this.data = []
}

PriorityQueue.prototype.push = function(element, priority) {
  priority = +priority
  for (var i = 0; i < this.data.length && this.data[i][1] > priority; i++);
  this.data.splice(i, 0, [element, priority])
}

PriorityQueue.prototype.pop = function() {
  return this.data.shift()[0]
}

PriorityQueue.prototype.size = function() {
  return this.data.length
}