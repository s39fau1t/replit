#include <iostream>
#include <string>
#include <fstream>
#include <vector>

int searchX(const std::string &row, int pos, int dir) {
	int distance = 0;
	
	for(int i = pos + dir; i >= 0 && i < row.size(); i += dir) {
		distance ++;
		
		if(row[i] - '0' >= row[pos] - '0') {
			break;
		}
	}

	return distance;
}

int searchY(const std::vector<std::string> &lines, int x, int y, int dir) {
	int distance = 0;
	
	for(int i = y + dir; i >= 0 && i < lines.size(); i += dir) {
		distance ++;
		
		if(lines[i][x] - '0' >= lines[y][x] - '0') {
			break;
		}
	}

	return distance;
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	std::vector<std::string> lines;

	while(std::getline(file, line)) {
		lines.push_back(line);
	}

	int bestScore = 0;

	for(int i = 0; i < lines.size(); i ++) {
		std::string &row = lines[i];

		for(int j = 0; j < row.size(); j ++) {
			int score = searchX(row, j, -1) * searchX(row, j, 1) * searchY(lines, j, i, -1) * searchY(lines, j, i, 1);
			
			if(score > bestScore) {
				bestScore = score;
			}
		}
	}

	std::cout << bestScore << "\n";
	
	return 0;
}