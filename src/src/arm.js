import * as THREE from './three.js';

export class Arm{
	
	constructor(){
		this.controlPos = [];
		this.controlsCount = 3;
		this.targetPos; 
		this.sectionLength = 16;
		this.rootPos = new THREE.Vector2(0,0); 
		for(var i = 0; i < this.controlsCount; i++){
			this.controlPos.push(new THREE.Vector2(0, i));
		}
	}

	setTarget(pos){
		this.targetPos = pos;
	}

	update(){
		if(!this.targetPos)
			return;
		this.controlPos[2] = this.targetPos;
		this.controlPos[1] = restrict(this.controlPos[1], this.controlPos[2], this.sectionLength);
		

		this.controlPos[0] = this.rootPos;
		this.controlPos[1] = restrict(this.controlPos[1], this.controlPos[0], this.sectionLength);
		this.controlPos[2] = restrict(this.controlPos[2], this.controlPos[1], this.sectionLength);
		
	}
}

function restrict(v1, v2, d){
		let t = v1.sub(v2).normalize();
		return new THREE.Vector2(v2.x + d * t.x, v2.y + d * t.y);
}

