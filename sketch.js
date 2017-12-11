const GRID_SIZE = 50;
const NUMAGENTS = 1;

let agents = [];
let tiles = [];
let graph;
let path = [];

let canvas;
let slider, buttonStop, buttonClear

function setup() {
	canvas = createCanvas(600,500);
	canvas.position(2, 50);
	canvas.mousePressed(createAgentAtClick);
	frameRate(60);

	setupControls();
	//let graph = new Graph();

	colorMode(HSB);
	background(0);
	noStroke();

	//init array of Tiles with GRID_SIZE
	let index = 0;
	for(let i=0; i<width; i+=GRID_SIZE){
		for(let j=0; j<height; j+=GRID_SIZE){
			tiles.push(new Tile(i, j, index));
			index++;
			//graph.addVertex(index);
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
// 		if(tiles[i+1]){
// 			if(t.x == tiles[i+1].x){ 
// 				t.neighbors.push(tiles[i+1]); //right neighbor
// 			}
// 		}
// 		if(tiles[i-1]){
// 			if(t.x == tiles[i-1].x){
// 				t.neighbors.push(tiles[i-1]);
// 			}
// 		}
// 		if(tiles[]){
			
// 		}

// 	for(let i=0; i<graph.vertices.length; i++){
// 		if((i+1)%(width/GRID_SIZE) !=0){ 
// 			graph.addEdge(i, i+1); //add edges horizontally
// 		}
// 		if(i-2900 < 0){
// 			graph.addEdge(i, i+50); //add edges vertically
// 		}
// 	}
// 	console.log(graph.pathFromTo(5, 500));

	path = search(tiles, 1, 3);
	console.log(path);

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

function search(grid, start, dest){
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
			return previous;
		}

		for(let i=0; i<grid[current].neighbors.length; i++){
			let next = grid[current].neighbors[i].i;
			//let new_cost = cost_so_far[current] + grid[next].decay;

			if(previous[next] == undefined){
				q.push(next, 0);
				previous[next] = current;
			}
			// if(cost_so_far[next] == undefined || new_cost < cost_so_far[next]){
			// 	cost_so_far[next] = new_cost;
			// 	let priority = new_cost
			// 	q.push(next, priority);
			// 	previous[next] = current;
			// }
		}
	}
	return previous;
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
	stroke(255);
	for(let key in path){
		let a = tiles[key]
		if(tiles[path[key]] != null){
			let b = tiles[path[key]]
			line(a.x, a.y, b.x, b.y);
		}
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