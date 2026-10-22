#include <iostream>
#include <string>
#include <fstream>
#include <vector>

bool searchX(const std::string &row, int pos, int dir) {
	for(int i = pos + dir; i >= 0 && i < row.size(); i += dir) {
		if(row[i] - '0' >= row[pos] - '0') {
			return true;
		}
	}

	return false;
}

bool searchY(const std::vector<std::string> &lines, int x, int y, int dir) {
	for(int i = y + dir; i >= 0 && i < lines.size(); i += dir) {
		if(lines[i][x] - '0' >= lines[y][x] - '0') {
			return true;
		}
	}

	return false;
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	std::vector<std::string> lines;

	while(std::getline(file, line)) {
		lines.push_back(line);
	}

	int visible = 0;

	for(int i = 0; i < lines.size(); i ++) {
		std::string &row = lines[i];

		for(int j = 0; j < row.size(); j ++) {
			if(!searchX(row, j, -1) || !searchX(row, j, 1) || !searchY(lines, j, i, -1) || !searchY(lines, j, i, 1)) {
				visible ++;
			}
		}
	}

	std::cout << visible << "\n";
	
	return 0;
}