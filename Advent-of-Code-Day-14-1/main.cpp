#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <string_view>
#include <utility>
#include <limits>

struct Object {
	int x;
	int y;
	
	bool tryMove(int xDir, int yDir, const std::vector<Object> &objects) {
		if(std::find(objects.begin(), objects.end(), Object{x + xDir, y + yDir}) == objects.end()) {
			x += xDir;
			y += yDir;
			
			return true;
		}
		
		return false;
	}
	
	bool operator==(const Object &that) const {
		return x == that.x && y == that.y;
	}
};

std::vector<std::string> split(std::string_view str, std::string_view delim) {
	std::vector<std::string> vec;
	
	for(int pos = str.find(delim); pos != std::string_view::npos; pos = str.find(delim)) {
		vec.push_back(std::string(str.substr(0, pos)));

		str.remove_prefix(pos + delim.size());
	}

	vec.push_back(std::string(str));

	return vec;
}

void parseLine(std::string_view line, std::vector<Object> &objects, int &lowestY) {
	std::vector<std::string> splitLine = split(line, " -> ");
	
	std::vector<std::pair<int, int>> fromTo;
	
	for(std::string &str : splitLine) {
		std::vector<std::string> fromToStr = split(str, ",");
		
		fromTo.emplace_back(std::stoi(fromToStr[0]), std::stoi(fromToStr[1]));
	}
	
	for(int i = 0; i < fromTo.size() - 1; i ++) {
		std::pair<int, int> &pair1 = fromTo[i];
		std::pair<int, int> &pair2 = fromTo[i + 1];
		
		int lowerY = std::max(pair1.second, pair2.second);
		
		if(lowerY > lowestY) {
			lowestY = lowerY;
		}
		
		if(pair1.first == pair2.first) {
			int dir = pair1.second < pair2.second ? 1 : -1;
			
			for(int y = pair1.second; y != pair2.second + dir; y += dir) {
				Object obj = {pair1.first, y};
				
				if(std::find(objects.begin(), objects.end(), obj) == objects.end()) {
					objects.push_back(obj);
				}
			}
		}else {
			int dir = pair1.first < pair2.first ? 1 : -1;
			
			for(int x = pair1.first; x != pair2.first + dir; x += dir) {
				Object obj = {x, pair1.second};
				
				if(std::find(objects.begin(), objects.end(), obj) == objects.end()) {
					objects.push_back(obj);
				}
			}
		}
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line;
	
	std::vector<Object> objects;
	
	//Lowest y is actually the highest :)
	int lowestY = -1;

	while(std::getline(file, line)) {
		parseLine(line, objects, lowestY);
	}
	
	bool abyssFound = false;
	
	int num = 0;
	
	while(!abyssFound) {
		objects.push_back({500, 0});
		
		while(true) {
			Object &sand = objects.back();
			
			//Sand comes to rest :)
			if(!sand.tryMove(0, 1, objects) && !sand.tryMove(-1, 1, objects) && !sand.tryMove(1, 1, objects)) {
				num ++;
				
				break;
			//We're in the abyss!
			}else if(sand.y == lowestY) {
				abyssFound = true;
				
				break;
			}
		}
	}
	
	std::cout << num << "\n";
	
	return 0;
}