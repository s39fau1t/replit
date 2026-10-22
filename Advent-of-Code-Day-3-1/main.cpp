#include <iostream>
#include <string>
#include <map>
#include <fstream>

int getPriority(char c) {
	//Lowercase
	if(c > 90) {
		return c - 96;
	//Uppercase
	}else {
		return c - 38;
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	int sum = 0;

	while(std::getline(file, line)) {
		std::string firstHalf = line.substr(0, line.size() / 2);
		std::string secondHalf = line.substr(line.size() / 2);

		std::map<char, int> firstFoundChars;
		std::map<char, int> secondFoundChars;

		for(int i = 0; i < firstHalf.size(); i ++) {
			char c1 = firstHalf[i];
			char c2 = secondHalf[i];

			firstFoundChars[c1] = true;
			secondFoundChars[c2] = true;

			if(secondFoundChars[c1]) {
				sum += getPriority(c1);

				break;
			}

			if(firstFoundChars[c2]) {
				sum += getPriority(c2);

				break;
			}
		}
	}

	std::cout << sum << "\n";
}