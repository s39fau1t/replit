//https://www.gabrielgambetta.com/computer-graphics-from-scratch/02-basic-raytracing.html

const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

function putPixel(x, y, color) {
	const newX = canvas.width / 2 + x;
	const newY = canvas.height / 2 - y;

	ctx.save();

	ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

	ctx.fillRect(newX, newY, 1, 1);

	ctx.restore();
}

class Sphere {
	constructor(center, radius, color) {
		this.center = center;
		
		this.radius = radius;

		this.color = color;
	}
}

class Vector {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	static add(vector1, vectorc2) {
		return new Vector(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
	}

	static subtract(vector1, vector2) {
		return new Vector(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z);
	}

	static multiply(vector1, vector2) {
		return new Vector(vector1.x * vector2.x, vector1.y * vector2.y, vector1.z * vector2.z);
	}

	static divide(vector1, vector2) {
		return new Vector(vector1.x / vector2.x, vector1.y / vector2.y, vector1.z / vector2.z);
	}

	static dot(vector1, vector2) {
		return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
	}
}

const scene = {
	background: [255, 255, 255],
	viewport: {
		width: 1,
		height: 1
	},
	projectionPlaneDistance: 1,
	spheres: [
		new Sphere(new Vector(0, -1, 3), 1, [255, 0, 0]),
		new Sphere(new Vector(2, 0, 4), 1, [0, 0, 255]),
		new Sphere(new Vector(-2, 0, 4), 1, [0, 255, 0])
	]
};

function canvasToViewport(x, y) {
	return new Vector(x * scene.viewport.width / canvas.width, y * scene.viewport.height / canvas.height, scene.projectionPlaneDistance);
}

function traceRay(origin, direction, tMin, tMax) {
	let closestT = Infinity;

	let closestSphere;

	for(let sphere of scene.spheres) {
		const [t1, t2] = intersectRaySphere(origin, direction, sphere);

		if(t1 > tMin && t1 < tMax && t1 < closestT) {
			closestT = t1;
			
			closestSphere = sphere;
		}

		if(t2 > tMin && t2 < tMax && t2 < closestT) {
			closestT = t2;
			
			closestSphere = sphere;
		}
	}

	if(!closestSphere) {
		return scene.background;
	}

	return closestSphere.color;
}

function intersectRaySphere(origin, direction, sphere) {
	const r = sphere.radius;

	const CO = Vector.subtract(origin, sphere.center);

	const a = Vector.dot(direction, direction);
	const b = 2 * Vector.dot(CO, direction);
	const c = Vector.dot(CO, CO) - r * r;

	const discriminant = b * b - 4 * a * c;

	if(discriminant < 0) {
		return [Infinity, Infinity];
	}

	const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
	const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

	return [t1, t2];
}

const origin = new Vector(0, 0, 0);

for(let x = -canvas.width / 2; x <= canvas.width / 2; x ++) {
	for(let y = -canvas.height / 2; y <= canvas.height / 2; y ++) {
		const direction = canvasToViewport(x, y);

		const color = traceRay(origin, direction, 1, Infinity);

		putPixel(x, y, color);
	}
}