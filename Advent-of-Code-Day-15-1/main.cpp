#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <cmath>
#include <vector>
#include <algorithm>

constexpr int row = 2000000;

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

int main() {
	std::ifstream file("input.txt");
	
	std::string line;
	
	std::regex sensorRegex(R"(Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+))");
	
	std::vector<Sensor> sensors;
	
	std::vector<std::pair<int, int>> coveredXs;
	
	while(std::getline(file, line)) {
		std::smatch match;
		
		std::regex_match(line, match, sensorRegex);
		
		int x = std::stoi(match.str(1));
		int y = std::stoi(match.str(2));
		
		int beaconX = std::stoi(match.str(3));
		int beaconY = std::stoi(match.str(4));
		
		std::pair<int, int> xPair = std::make_pair(beaconX, beaconX);
		
		if(beaconY == row && std::find(coveredXs.begin(), coveredXs.end(), xPair) == coveredXs.end()) {
			coveredXs.push_back(xPair);
		}
		
		sensors.push_back({x, y, dist(x, y, beaconX, beaconY)});
	}
	
	int covered = 0;
	
	for(Sensor &sensor : sensors) {
		int range = (sensor.nearestBeacon * 2 + 1) - (2 * std::abs(sensor.y - row));
		
		if(range > 0) {
			int x1 = sensor.x - range / 2;
			int x2 = sensor.x + range / 2;
			
			covered += range - overlapping(x1, x2, coveredXs.begin(), coveredXs.end());
			
			coveredXs.push_back(std::make_pair(x1, x2));
		}
	}
	
	std::cout << covered << "\n";
	
	return 0;
}