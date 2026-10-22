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

int main() {
	std::ifstream file("input.txt");

	std::string line;

	Knot head = {0, 0};
	Knot tail = {0, 0};

	std::vector<Knot> positions = {tail};
	
	while(std::getline(file, line)) {
		char dir = line[0];
		int times = std::stoi(line.substr(2));

		for(int i = 0; i < times; i ++) {
			switch(dir) {
				case 'L':
					head.x --;
					break;
				case 'R':
					head.x ++;
					break;
				case 'U':
					head.y ++;
					break;
				case 'D':
					head.y --;
					break;
			}

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

				if(std::find(positions.begin(), positions.end(), tail) == positions.end()) {
					positions.push_back(tail);
				}
			}
		}
	}

	std::cout << positions.size() << "\n";

  return 0;
}