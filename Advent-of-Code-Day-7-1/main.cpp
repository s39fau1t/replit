#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <map>
#include <vector>

struct Directory {
	std::vector<int> files;
	std::map<std::string, Directory*> directories;

	Directory(Directory* parent) {
		if(parent != nullptr) {
			directories.emplace("..", parent);
		}
	}
};

int sumDirectories(Directory* directory, int &sum) {
	//The sum of the current directory
	int curSum = 0;

	//First, sum up all the files
	for(int size : directory->files) {
		curSum += size;
	}

	//Then, sum up all the subdirectories
	for(auto &entry : directory->directories) {
		if(entry.first != "..") {
			curSum += sumDirectories(entry.second, sum);
		}
	}

	//If the size is at most 100000, add it to the total sum
	if(curSum <= 100000) {
		sum += curSum;
	}

	//Free the memory :) (I need to start using smart pointers)
	delete directory;

	//For recursion so that parent directories can add subdirectories to their size
	return curSum;
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	//Ignore ls; it doesn't matter at all
	std::regex cdRegex(R"(\$ cd ?(.*))");
	std::regex directoryRegex(R"(dir (\w*))");
	std::regex fileRegex(R"((\d+) .*)");

	Directory* directory = new Directory(nullptr);
	Directory* baseDirectory = new Directory(directory);
	
	directory->directories.emplace("/", baseDirectory);

	//Construct the file structure
	while(std::getline(file, line)) {
		std::smatch match;
		
		if(std::regex_match(line, match, cdRegex)) {
			directory = directory->directories[match.str(1)];
		}else if(std::regex_match(line, match, directoryRegex)) {
			directory->directories.emplace(match.str(1), new Directory(directory));
		}else if(std::regex_match(line, match, fileRegex)) {
			directory->files.push_back(std::stoi(match.str(1)));
		}
	}

	//Sum up all the values
	int sum = 0;

	sumDirectories(baseDirectory, sum);

	std::cout << sum << "\n";
	
	return 0;
}