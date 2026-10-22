#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <cmath>
#include <vector>
#include <algorithm>
#include <array>

constexpr int area = 4000000;

struct Sensor {
	int x;
	int y;
	
	int nearestBeacon;
};

int dist(int x1, int y1, int x2, int y2) {
	return std::abs(x1 - x2) + std::abs(y1 - y2);
}

int overlapping(int x1, int x2, std::vector<std::pair<int, int>>::iterator begin, std::vector<std::pair<int, int>>::iterator end) {
	int overlap = 0;
	
	std::pair<int, int> &fromTo = *begin;
	
	int curOverlap = std::min(x2, fromTo.second) - std::max(x1, fromTo.first) + 1;
	
	if(curOverlap > 0) {
		overlap += curOverlap;
	}
	
	//If we're not on the last one and it's not completely overlapping
	if(begin != end - 1 && !(fromTo.first <= x1 && fromTo.second >= x2)) {
		//No overlap; just test on next one
		if(curOverlap <= 0) {
			overlap += overlapping(x1, x2, begin + 1, end);
		//Inside
		}else if(fromTo.first > x1 && fromTo.second < x2) {
			overlap += overlapping(x1, fromTo.first - 1, begin + 1, end);
			overlap += overlapping(fromTo.second + 1, x2, begin + 1, end);
		//Left
		}else if(fromTo.first <= x1 && fromTo.second < x2) {
			overlap += overlapping(fromTo.second + 1, x2, begin + 1, end);
		//Right
		}else if(fromTo.first > x1 && fromTo.second >= x2) {
			overlap += overlapping(x1, fromTo.first - 1, begin + 1, end);
		}
	}
	
	return overlap;
}

int notOverlappingPos(int x1, int x2, std::vector<std::pair<int, int>>::iterator begin, std::vector<std::pair<int, int>>::iterator end) {
	for(; begin != end; begin ++) {
		std::pair<int, int> &fromTo = *begin;
		
		//Completely overlapping; return -1 to signify failure
		if(fromTo.first <= x1 && fromTo.second >= x2) {
			return -1;
		//Inside
		}else if(fromTo.first > x1 && fromTo.second < x2) {
			int leftSide = notOverlappingPos(x1, fromTo.first - 1, begin + 1, end);

			if(leftSide > -1) {
				return leftSide;
			}

			x1 = fromTo.second + 1;
		//Left
		}else if(fromTo.first <= x1 && fromTo.second < x2 && fromTo.second >= x1) {
			x1 = fromTo.second + 1;
		//Right
		}else if(fromTo.first > x1 && fromTo.first <= x2 && fromTo.second >= x2) {
			x2 = fromTo.first - 1;
		}
	}
	
	return x1;
}

int main() {
	std::ifstream file("input.txt");
	
	std::string line;
	
	std::regex sensorRegex(R"(Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+))");
	
	std::vector<Sensor> sensors;
	
	while(std::getline(file, line)) {
		std::smatch match;
		
		std::regex_match(line, match, sensorRegex);
		
		int x = std::stoi(match.str(1));
		int y = std::stoi(match.str(2));
		
		int beaconX = std::stoi(match.str(3));
		int beaconY = std::stoi(match.str(4));
		
		sensors.push_back({x, y, dist(x, y, beaconX, beaconY)});
	}
	
	std::array<std::vector<std::pair<int, int>>, area + 1>* coveredTiles = new std::array<std::vector<std::pair<int, int>>, area + 1>;
	std::array<int, area + 1>* grid = new std::array<int, area + 1>;
	
	std::fill(grid->begin(), grid->end(), 0);
	
	for(Sensor &sensor : sensors) {
		int start = sensor.y - sensor.nearestBeacon;
		
		if(start > area) {
			continue;
		}
		
		int sameRowAmount = (sensor.nearestBeacon * 2 + 1);
		
		for(int row = std::max(start, 0); row <= std::min(sensor.y + sensor.nearestBeacon, area); row ++) {
			int range = sameRowAmount - (2 * std::abs(sensor.y - row));
			
			int x1 = std::max(sensor.x - range / 2, 0);
			int x2 = std::min(sensor.x + range / 2, area);
			
			int actualRange = std::abs(x1 - x2) + 1;
			
			(*grid)[row] += actualRange - ((*coveredTiles)[row].size() > 0 ? overlapping(x1, x2, (*coveredTiles)[row].begin(), (*coveredTiles)[row].end()) : 0);
			
			(*coveredTiles)[row].push_back(std::make_pair(x1, x2));
		}
	}
	
	for(int y = 0; y < grid->size(); y ++) {
		if((*grid)[y] < area + 1) {
			//Tuning frequency = x * 4000000 + y
			//Integer overflow :(
			std::cout << static_cast<long>(notOverlappingPos(0, area, (*coveredTiles)[y].begin(), (*coveredTiles)[y].end())) * 4000000l + static_cast<long>(y) << "\n";
			
			break;
		}
	}
	
	return 0;
}