const GRID_SIZE = 100;
const GRID_WIDTH = 6;
const GRID_HEIGHT = 5;
const NUMAGENTS = 0;

//index i*WIDTH+j
//k%WIDTH to get i

let agents = [];
let tiles = [];
let path = [];
let treads = {};
let canvas;
let slider, buttonStop, buttonClear

function setup() {
	canvas = createCanvas(GRID_WIDTH*GRID_SIZE,GRID_HEIGHT*GRID_SIZE);
	canvas.position(2, 50);
	canvas.mousePressed(createAgentAtClick);
	frameRate(60);

	setupControls();

	colorMode(HSB);
	background(0);
	noStroke();

	//init array of Tiles with GRID_SIZE
	let index = 0;
	for(let i=0; i<width; i+=GRID_SIZE){
		for(let j=0; j<height; j+=GRID_SIZE){
			tiles.push(new Tile(i, j, index));
			index++;
		}
	}

	//init neighbor list for each Tile
	for(let i=0; i<tiles.length; i++){
		let t = tiles[i];

		for(let j=0; j<tiles.length; j++){
			let u = tiles[j];
			if(t.neighbors.indexOf(u) < 0){
				if(u.x == t.x+GRID_SIZE && u.y == t.y){
					t.neighbors.push(u);
				}
				if(u.x == t.x-GRID_SIZE && u.y == t.y){
					t.neighbors.push(u);
				}
				if(u.x == t.x && u.y == t.y+GRID_SIZE){
					t.neighbors.push(u);
				}
				if(u.x == t.x && u.y == t.y-GRID_SIZE){
					t.neighbors.push(u);
				}
			}
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
	//agents.push(new Agent(mouseX, mouseY));

	let k = tileToIndex((mouseX/GRID_SIZE)|0, (mouseY/GRID_SIZE)|0)

	if(k in treads){
		treads[k] += 1;
	}else{
		treads[k] = 1;
	}
	console.log(treads[k]);
}

function removeAgents(){
	agents.length = 0;
}

function clearTiles(){
	for (let i=0; i<tiles.length; i++){
		tiles[i].decay = 0;
	}
}

function tileToIndex(i,j){
	return (i*GRID_WIDTH+j)
}

function indexToTile(k){
	return [(k/GRID_WIDTH)|0, k%GRID_WIDTH]
}

function getNeighbors(k){
	let [i,j] = indexToTile(k);
	let neighbors = [];
	if(i>0){
		neighbors.push(tileToIndex(i-1, j));
	}
	if(i<GRID_WIDTH-1){
		neighbors.push(tileToIndex(i+1, j));
	}
	if(j>0){
		neighbors.push(tileToIndex(i, j-1));
	}
	if(j<GRID_HEIGHT-1){
		neighbors.push(tileToIndex(i, j+1));
	}
	return neighbors;
}

function getTraversalCost(k){
	if (k in treads){
		return 1+treads[k];
	}
	return 1;
}

function search(start, dest){
	let q = new PriorityQueue();
	q.push(start, 0);

	let previous = {};
	let cost_so_far = {};
	previous[start] = null;
	cost_so_far[start] = 0;

	while(q.size() > 0){
		let current = q.pop();
		console.log("at tile", current);

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
				console.log(next, cost_so_far[next]);
				let priority = -new_cost
				q.push(next, priority);
				previous[next] = current;
			}
		}
	}
}

function draw() {
	//frameRate(slider.value());
	stroke(0);
	strokeWeight(1);
	for (let i=0; i<tiles.length; i++){
		if(i in treads){
			tiles[i].decay = treads[i];
		}
		
		if(agents.length > 0){
			for(let j = 0; j<agents.length; j++){
				a = agents[j];

				if(a.x < tiles[i].x+GRID_SIZE+2 && 
				a.x+GRID_SIZE+2 > tiles[i].x &&
				a.y < tiles[i].y+GRID_SIZE+2 &&
				a.y+GRID_SIZE+2 > tiles[i].y){

					tiles[i].decay +=1;
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
	let path = search(0, 20);
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
function Tile(ix, jy, ii){
	this.x = ix;
	this.y = jy;
	this.i = ii;
	this.decay = 0;
	this.neighbors = [];

	this.display = function(){
		fill(110-this.decay, 75, 80);
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