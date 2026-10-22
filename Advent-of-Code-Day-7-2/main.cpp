#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <map>
#include <vector>

struct Directory {
	int size = 0;
	std::vector<int> files;
	std::map<std::string, Directory*> directories;

	Directory(Directory* parent) {
		if(parent != nullptr) {
			directories.emplace("..", parent);
		}
	}
};

int sumDirectories(Directory* directory) {
	//First, sum up all the files
	for(int size : directory->files) {
		directory->size += size;
	}

	//Then, sum up all the subdirectories
	for(auto &entry : directory->directories) {
		if(entry.first != "..") {
			directory->size += sumDirectories(entry.second);
		}
	}

	//For recursion so that parent directories can add subdirectories to their size
	return directory->size;
}

void smallestUsableDir(Directory* directory, int &curSize, int neededSpace) {
	if(directory->size >= neededSpace && directory->size < curSize) {
		curSize = directory->size;
	}
	
	for(auto &entry : directory->directories) {
		if(entry.first != "..") {
			smallestUsableDir(entry.second, curSize, neededSpace);
		}
	}

	//Free the memory :) (I need to start using smart pointers)
	delete directory;
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
	sumDirectories(baseDirectory);

	int neededSpace = 30000000 - (70000000 - baseDirectory->size);

	int curSize = baseDirectory->size;

	smallestUsableDir(baseDirectory, curSize, neededSpace);

	std::cout << curSize << "\n";
	
	return 0;
}