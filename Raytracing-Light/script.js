//https://www.gabrielgambetta.com/computer-graphics-from-scratch/03-light.html

const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d");

function putPixel(x, y, color) {
	const newX = canvas.width / 2 + x;
	const newY = canvas.height / 2 - y;

	ctx.save();

	ctx.fillStyle = `rgb(${color.x}, ${color.y}, ${color.z})`;

	ctx.fillRect(newX, newY, 1, 1);

	ctx.restore();
}

class Vector {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	length() {
		return Math.hypot(this.x, this.y, this.z);
	}

	static add(vector1, vector2) {
		if(!(vector1 instanceof Vector)) {
			vector1 = new Vector(vector1, vector1, vector1);
		}

		if(!(vector2 instanceof Vector)) {
			vector2 = new Vector(vector2, vector2, vector2);
		}
		
		return new Vector(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
	}

	static subtract(vector1, vector2) {
		if(!(vector1 instanceof Vector)) {
			vector1 = new Vector(vector1, vector1, vector1);
		}

		if(!(vector2 instanceof Vector)) {
			vector2 = new Vector(vector2, vector2, vector2);
		}
		
		return new Vector(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z);
	}

	static multiply(vector1, vector2) {
		if(!(vector1 instanceof Vector)) {
			vector1 = new Vector(vector1, vector1, vector1);
		}

		if(!(vector2 instanceof Vector)) {
			vector2 = new Vector(vector2, vector2, vector2);
		}
		
		return new Vector(vector1.x * vector2.x, vector1.y * vector2.y, vector1.z * vector2.z);
	}

	static divide(vector1, vector2) {
		if(!(vector1 instanceof Vector)) {
			vector1 = new Vector(vector1, vector1, vector1);
		}

		if(!(vector2 instanceof Vector)) {
			vector2 = new Vector(vector2, vector2, vector2);
		}
		
		return new Vector(vector1.x / vector2.x, vector1.y / vector2.y, vector1.z / vector2.z);
	}

	static dot(vector1, vector2) {
		return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
	}
}

class Sphere {
	constructor(center, radius, color, specular) {
		this.center = center;
		
		this.radius = radius;

		this.color = color;

		this.specular = specular;
	}
}

class AmbientLight {
	constructor(intensity) {
		this.intensity = intensity;
	}
}

class PointLight {
	constructor(intensity, position) {
		this.intensity = intensity;

		this.position = position;
	}
}

class DirectionalLight {
	constructor(intensity, direction) {
		this.intensity = intensity;

		this.direction = direction;
	}
}

const scene = {
	background: new Vector(255, 255, 255),
	viewport: {
		width: 1,
		height: 1
	},
	projectionPlaneDistance: 1,
	spheres: [
		new Sphere(new Vector(0, -1, 3), 1, new Vector(255, 0, 0), 500),
		new Sphere(new Vector(2, 0, 4), 1, new Vector(0, 0, 255), 500),
		new Sphere(new Vector(-2, 0, 4), 1, new Vector(0, 255, 0), 10),
		new Sphere(new Vector(0, -5001, 0), 5000, new Vector(255, 255, 0), 1000)
	],
	lights: [
		new AmbientLight(0.2),
		new PointLight(0.6, new Vector(2, 1, 0)),
		new DirectionalLight(0.2, new Vector(1, 4, 4))
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

	//Compute intersection
	const point = Vector.add(origin, Vector.multiply(closestT, direction));

	//Compute sphere notmal at intersection
	let normal = Vector.subtract(point, closestSphere.center);

	normal = Vector.divide(normal, normal.length());

	return Vector.multiply(closestSphere.color, computeLighting(point, normal, Vector.multiply(-1, direction), closestSphere.specular));
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

function computeLighting(point, normal, view, specular) {
	let intensity = 0;

	for(let light of scene.lights) {
		if(light instanceof AmbientLight) {
			intensity += light.intensity;
		}else {
			let dir;
			
			if(light instanceof PointLight) {
				dir = Vector.subtract(light.position, point);
			}else {
				dir = light.direction;
			}

			//Diffuse
			const normalDotDir = Vector.dot(normal, dir);

			if(normalDotDir > 0) {
				intensity += light.intensity * normalDotDir / (normal.length() * dir.length());
			}

			//Specular
			if(specular !== -1) {
				const reflection = Vector.subtract(Vector.multiply(Vector.multiply(2, normal), Vector.dot(normal, dir)), dir);

				const reflectionDotView = Vector.dot(reflection, view);

				if(reflectionDotView > 0) {
					intensity += light.intensity * Math.pow(reflectionDotView / (reflection.length() * view.length()), specular);
				}
			}
		}
	}

	return intensity;
}

const origin = new Vector(0, 0, 0);

for(let x = -canvas.width / 2; x <= canvas.width / 2; x ++) {
	for(let y = -canvas.height / 2; y <= canvas.height / 2; y ++) {
		const direction = canvasToViewport(x, y);

		const color = traceRay(origin, direction, 1, Infinity);

		putPixel(x, y, color);
	}
}