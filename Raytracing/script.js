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
	constructor(center, radius, color, specular, reflective) {
		this.center = center;
		
		this.radius = radius;

		this.color = color;

		this.specular = specular;

		this.reflective = reflective;
	}
}

class Plane {
	constructor(position, normal, color, specular, reflective) {
		this.position = position;

		this.normal = Vector.divide(normal, normal.length());

		this.color = color;

		this.specular = specular;

		this.reflective = reflective;
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
	background: new Vector(135, 206, 235),
	viewport: {
		width: 2,
		height: 2
	},
	projectionPlaneDistance: 1,
	shapes: [
		new Sphere(new Vector(-1.1, -0.5, 3), 0.5, new Vector(255, 0, 0), 500, 0),
		new Sphere(new Vector(0, -0.5, 2), 0.5, new Vector(255, 165, 0), 500, 0),
		new Sphere(new Vector(1.1, -0.5, 3), 0.5, new Vector(0, 0, 255), 500, 0),
		new Sphere(new Vector(0, 0.5, 3), 0.8, new Vector(255, 255, 255), 1000, 0.9),
		new Plane(new Vector(0, 0, 5), new Vector(1, 0, -1), new Vector(255, 255, 255), 1000, 0.9),
		new Plane(new Vector(0, -1, 0), new Vector(0, 1, 0), new Vector(0, 150, 0), -1, 0)
	],
	lights: [
		new AmbientLight(0.2),
		new DirectionalLight(0.8, new Vector(0.3, 1, 0))
	]
};

function canvasToViewport(x, y) {
	return new Vector(x * scene.viewport.width / canvas.width, y * scene.viewport.height / canvas.height, scene.projectionPlaneDistance);
}

function traceRay(origin, direction, tMin, tMax, recursionDepth) {
	const [closestShape, closestT] = closestIntersection(origin, direction, tMin, tMax);
	
	if(!closestShape) {
		return scene.background;
	}

	//Compute intersection
	const point = Vector.add(origin, Vector.multiply(closestT, direction));

	//Compute sphere notmal at intersection
	let normal;
	
	if(closestShape instanceof Sphere) {
		normal = Vector.subtract(point, closestShape.center);
	}else if(closestShape instanceof Plane) {
		normal = closestShape.normal;
	}

	normal = Vector.divide(normal, normal.length());

	const localColor = Vector.multiply(closestShape.color, computeLighting(point, normal, Vector.multiply(-1, direction), closestShape.specular));

	const reflective = closestShape.reflective;

	//If we hit the recursion limit or the object is not reflective, we're done
	if(recursionDepth <= 0 || reflective <= 0) {
		return localColor;
	}

	//Compute the reflected color
	const ray = reflectRay(Vector.multiply(-1, direction), normal);

	const reflectedColor = traceRay(point, ray, 0.001, Infinity, recursionDepth - 1);

	return Vector.add(Vector.multiply(localColor, (1 - reflective)), Vector.multiply(reflectedColor, reflective));
}

function closestIntersection(origin, direction, tMin, tMax) {
	let closestT = Infinity;

	let closestShape;

	for(let shape of scene.shapes) {
		let t1, t2;
		
		if(shape instanceof Sphere) {
			[t1, t2] = intersectRaySphere(origin, direction, shape);
		}else if(shape instanceof Plane) {
			t1 = intersectRayPlane(origin, direction, shape);
		}

		if(t1 > tMin && t1 < tMax && t1 < closestT) {
			closestT = t1;
			
			closestShape = shape;
		}

		if(t2 > tMin && t2 < tMax && t2 < closestT) {
			closestT = t2;
			
			closestShape = shape;
		}
	}

	return [closestShape, closestT];
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

//https://math.stackexchange.com/a/2121529
function intersectRayPlane(origin, direction, plane) {
	const denom = Vector.dot(plane.normal, direction);

	if(denom === 0) {
		return [Infinity];
	}

	return Vector.dot(Vector.subtract(plane.position, origin), plane.normal) / Vector.dot(direction, plane.normal);
}

function computeLighting(point, normal, view, specular) {
	let intensity = 0;

	for(let light of scene.lights) {
		if(light instanceof AmbientLight) {
			intensity += light.intensity;
		}else {
			let direction;

			let tMax;
			
			if(light instanceof PointLight) {
				direction = Vector.subtract(light.position, point);

				tMax = 1;
			}else {
				direction = light.direction;

				tMax = Infinity;
			}

			[shadowShape, shadowT] = closestIntersection(point, direction, 0.001, tMax);

			if(shadowShape) {
				continue;
			}

			//Diffuse
			const normalDotDir = Vector.dot(normal, direction);

			if(normalDotDir > 0) {
				intensity += light.intensity * normalDotDir / (normal.length() * direction.length());
			}

			//Specular
			if(specular !== -1) {
				const reflection = reflectRay(direction, normal);

				const reflectionDotView = Vector.dot(reflection, view);

				if(reflectionDotView > 0) {
					intensity += light.intensity * Math.pow(reflectionDotView / (reflection.length() * view.length()), specular);
				}
			}
		}
	}

	return intensity;
}

function reflectRay(ray, normal) {
	return Vector.subtract(Vector.multiply(Vector.multiply(2, normal), Vector.dot(normal, ray)), ray);
}

const origin = new Vector(0, 0, 0);

function draw() {
	for(let x = -canvas.width / 2; x <= canvas.width / 2; x ++) {
		for(let y = -canvas.height / 2; y <= canvas.height / 2; y ++) {
			const direction = canvasToViewport(x, y);
	
			const color = traceRay(origin, direction, 1, Infinity, 6);
	
			putPixel(x, y, color);
		}
	}
}

draw();