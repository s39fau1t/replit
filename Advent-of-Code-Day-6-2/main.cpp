#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <algorithm>

int main() {
	std::ifstream file("input.txt");

	std::string contents((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

	std::vector<char> characters;

	int pos = -1;

	for(int i = 0; i < contents.size(); i ++) {
		char c = contents[i];

		std::vector<char>::iterator it = std::find(characters.begin(), characters.end(), c);
		
		if(it != characters.end()) {
			characters.erase(characters.begin(), it + 1);
		}

		characters.push_back(c);

		if(characters.size() == 14) {
			pos = i + 1;
			
			break;
		}
	}

	std::cout << pos << "\n";
	
	return 0;
}