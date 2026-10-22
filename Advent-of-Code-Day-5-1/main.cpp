#include <iostream>
#include <string>
#include <fstream>
#include <map>
#include <vector>
#include <regex>
#include <cctype>

int main() {
	std::ifstream file("input.txt");

	std::string line;

	std::regex namesRegex(R"(^[\d ]*$)");
	std::regex moveRegex(R"(move (\d+) from (\d) to (\d))");
	
	std::vector<std::string> stacksStrings;

	bool passedNames = false;

	std::map<char, std::vector<char>> stacks;

	while(std::getline(file, line)) {
		//We're in the line specifying the names of the stacks
		if(std::regex_match(line, namesRegex)) {
			//Loop through the line
			for(int i = 0; i < line.size(); i ++) {
				char c = line[i];

				//If we're on a name
				if(std::isdigit(c)) {
					//Add that name to stacks
					stacks.emplace(c, std::vector<char>());

					//Add the crates to the stack (backwards because we want 0 to be the bottom, not the top)
					for(int j = stacksStrings.size() - 1; j >= 0; j --) {
						char crate = stacksStrings[j][i];

						if(std::isalpha(crate)) {
							stacks[c].push_back(crate);
						}
					}
				}
			}

			passedNames = true;
		//We're in the lines specifying the movement of the crates
		}else if(passedNames) {
			std::smatch match;

			if(std::regex_match(line, match, moveRegex)) {
				int numMove = std::stoi(match[1]);
				char from = match.str(2)[0];
				char to = match.str(3)[0];

				for(int i = 0; i < numMove; i ++) {
					stacks[to].push_back(stacks[from].back());
					
					stacks[from].pop_back();
				}
			}
		//We're in the lines specifying the starting positions of the crates
		}else {
			stacksStrings.push_back(line);
		}
	}

	for(auto &entry : stacks) {
		std::cout << entry.second.back();
	}

	std::cout << "\n";
	
  return 0;
}