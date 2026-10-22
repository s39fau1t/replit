#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <algorithm>
#include <limits>

struct Node {
	char height;

	std::vector<Node*> nodes;
	
	int cost = std::numeric_limits<int>::max();
	
	Node* previous = nullptr;

	void addNode(const Node &node) {
		if(height + 1 >= node.height) {
			nodes.push_back(&const_cast<Node&>(node));
		}
	}
};

int shortestPathLength(Node* start, Node* end) {
	std::vector<Node*> reachable = {start};
	std::vector<Node*> explored;
	
	while(!reachable.empty()) {
		Node* node = nullptr;
		
		int index = 0;
		
		for(int i = 0; i < reachable.size(); i ++) {
			Node* otherNode = reachable[i];
			
			if(node == nullptr || otherNode->cost < node->cost) {
				node = otherNode;
				
				index = i;
			}
		}
		
		if(node == end) {
			std::vector<Node*> path;
			
			while(end != nullptr) {
				path.push_back(end);
				end = end->previous;
			}
			
			return path.size() - 1;
		}
		
		reachable.erase(reachable.begin() + index);
		explored.push_back(node);
		
		for(Node* adjacent : node->nodes) {
			if(std::find(explored.begin(), explored.end(), adjacent) == explored.end()) {
				if(std::find(reachable.begin(), reachable.end(), adjacent) == reachable.end()) {
					reachable.push_back(adjacent);
				}
				
				if(node->cost + 1 < adjacent->cost) {
					adjacent->previous = node;
					adjacent->cost = node->cost + 1;
				}
			}
		}
	}
	
	return -1;
}

int main() {
  std::ifstream file("input.txt");

	std::string curLine;

	std::vector<std::string> lines;

	while(std::getline(file, curLine)) {
		lines.push_back(curLine);
	}

	std::vector<std::vector<Node>> nodes;

	nodes.resize(lines.size());
	
	for(std::vector<Node> &line : nodes) {
		line.resize(lines[0].size());
	}
	
	Node* start = nullptr;
	Node* end = nullptr;
	
	for(int row = 0; row < lines.size(); row ++) {
		std::vector<Node> &line = nodes[row];
		
		for(int col = 0; col < line.size(); col ++) {
			line[col] = {lines[row][col]};
			
			if(line[col].height == 'S') {
				line[col].height = 'a';
				
				start = &line[col];
				
				line[col].cost = 0;
			}else if(line[col].height == 'E') {
				line[col].height = 'z';
				
				end = &line[col];
			}
		}
	}
	
	for(int row = 0; row < nodes.size(); row ++) {
		std::vector<Node> &line = nodes[row];
		
		for(int col = 0; col < line.size(); col ++) {
			Node &node = line[col];
			
			if(col > 0) {
				node.addNode(line[col - 1]);
			}
			if(col < line.size() - 1) {
				node.addNode(line[col + 1]);
			}
			if(row > 0) {
				node.addNode(nodes[row - 1][col]);
			}
			if(row < lines.size() - 1) {
				node.addNode(nodes[row + 1][col]);
			}
		}
	}
	
	std::cout << shortestPathLength(start, end) << "\n";
	
	return 0;
}