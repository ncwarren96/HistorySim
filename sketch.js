const GRID_SIZE = 10;
const GRID_WIDTH = 60;
const GRID_HEIGHT = 50;
const NUMAGENTS = 3;

//index i*WIDTH+j
//k%WIDTH to get i

let agents = [];
let tiles = [];
let path = [];
let treads = {};
let canvas;
let slider, buttonStop, buttonClear, buttonNew

function setup() {
	canvas = createCanvas((GRID_WIDTH*GRID_SIZE),(GRID_HEIGHT*GRID_SIZE));
	canvas.position(2, 50);
	canvas.mousePressed(createAgentAtClick);
	frameRate(30);

	setupControls();

	colorMode(HSB);
	background(0);
	noStroke();

	//init array of Tiles with GRID_SIZE
	let index = 0;
	for(let i=0; i<(GRID_HEIGHT*GRID_SIZE); i+=GRID_SIZE){
		for(let j=0; j<(GRID_WIDTH*GRID_SIZE); j+=GRID_SIZE){
			tiles.push(new Tile(j, i, index));
			index++;
		}
	}
	console.log(tiles);
	//init list of NUMAGENTS agents 
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

function setupControls(){
	buttonStop = createButton("Stop");
	buttonStop.position(2, 30);
	buttonStop.mousePressed(removeAgents);

	buttonClear = createButton("Clear");
	buttonClear.position(50, 30);
	buttonClear.mousePressed(clearTiles);

	buttonNew = createButton("New");
	buttonNew.position(100, 30);
	buttonNew.mousePressed(function() { initAgents(NUMAGENTS);})

	slider = createSlider(1, 20, 2);
	slider.position(150,30);
	slider.style('width', '150px');
}

function createAgentAtClick(){
	
	//agents.push(new Agent(mouseX, mouseY));

	let k = tileToIndex( (mouseY/GRID_SIZE)|0, (mouseX/GRID_SIZE)|0);
	console.log("click",mouseX,mouseY, "on tile ", k);

	treads[k] = 300;
}

function removeAgents(){
	agents.length = 0;
}

function clearTiles(){
	for(k in treads){
		treads[k] = 110;
	}
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
	//console.log(treads);
	//frameRate(slider.value());
	for (let i=0; i<tiles.length; i++){
		if(i in treads){
			tiles[i].green = treads[i];
		}
		
// 		if(agents.length > 0){
// 			for(let j = 0; j<agents.length; j++){
// 				a = agents[j];

// 				if(a.x < tiles[i].x+GRID_SIZE+2 && 
// 				a.x+GRID_SIZE+2 > tiles[i].x &&
// 				a.y < tiles[i].y+GRID_SIZE+2 &&
// 				a.y+GRID_SIZE+2 > tiles[i].y){
					
// 					if(i in treads){
// 						treads[i] -=1;
// 					}else{
// 						treads[i] = 110;
// 					}
// 				}
//			}
//		}
		tiles[i].display();
	}

	if(agents.length > 0){
		for(let i = 0; i<agents.length; i++){
			let a = agents[i];
			a.move();
			//a.display();
			a.showPath();

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
	//let path = search(0, 100);
	//console.log(path);
	//drawPath(path);

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
			if(treads[path[i]]>0){
				treads[path[i]] -=1;
			}
		}else{
			treads[path[i]] = 109;
		}
	}
}

function getDest(){
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
	this.destPos = getDest();
	this.yDest = this.destPos[1];
	this.xDest = this.destPos[0];
	
	this.dest;
	this.start = tileToIndex((this.y/GRID_SIZE)|0,(this.x/GRID_SIZE)|0);
	if(random()>0.5){
		this.dest = tileToIndex((this.yDest/GRID_SIZE)|0,(this.xDest/GRID_SIZE)|0);
	}else{
		this.dest = 743;
	}
	

	this.path = search(this.start, this.dest);
	markPathTread(this.path);

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

	this.showPath = function(){
		drawPath(this.path);
	}
};

//Tile class
function Tile(ix, jy, ii){
	this.x = ix;
	this.y = jy;
	this.i = ii;
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