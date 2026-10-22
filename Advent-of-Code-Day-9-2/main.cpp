#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <algorithm>
#include <cmath>

struct Knot {
	int x;
	int y;

	bool operator==(const Knot &that) {
		return x == that.x && y == that.y;
	}

	static bool touching(const Knot &head, const Knot &tail) {
		return std::abs(head.x - tail.x) <= 1 && std::abs(head.y - tail.y) <= 1;
	}
};

class Rope {
	Knot knots[10];

	void updatePair(const Knot &head, Knot &tail) {
		//Move tail
		if(!Knot::touching(head, tail)) {
			//Directly up or down
			if(head.x - tail.x == 0 || head.y - tail.y == 0) {
				if(head.x + 1 < tail.x) {
					tail.x --;
				}
				if(head.x - 1 > tail.x) {
					tail.x ++;
				}
				if(head.y + 1 < tail.y) {
					tail.y --;
				}
				if(head.y - 1 > tail.y) {
					tail.y ++;
				}
			//Move diagonally to keep up
			}else {
				if(head.x < tail.x) {
					tail.x --;
				}
				if(head.x > tail.x) {
					tail.x ++;
				}
				if(head.y < tail.y) {
					tail.y --;
				}
				if(head.y > tail.y) {
					tail.y ++;
				}
			}
		}
	}

public:
	Knot &head = knots[0];

	std::vector<Knot> positions = {{0, 0}};

	Rope() {
		for(int i = 0; i < 10; i ++) {
			knots[i] = {0, 0};
		}
	}

	void update() {
		for(int i = 1; i < 10; i ++) {
			updatePair(knots[i- 1], knots[i]);
		}

		if(std::find(positions.begin(), positions.end(), knots[9]) == positions.end()) {
			positions.push_back(knots[9]);
		}
	}
};

int main() {
	std::ifstream file("input.txt");

	std::string line;

	Rope rope;
	
	while(std::getline(file, line)) {
		char dir = line[0];
		int times = std::stoi(line.substr(2));

		for(int i = 0; i < times; i ++) {
			switch(dir) {
				case 'L':
					rope.head.x --;
					break;
				case 'R':
					rope.head.x ++;
					break;
				case 'U':
					rope.head.y ++;
					break;
				case 'D':
					rope.head.y --;
					break;
			}

			rope.update();
		}
	}

	std::cout << rope.positions.size() << "\n";

  return 0;
}