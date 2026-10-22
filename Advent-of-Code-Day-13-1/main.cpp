#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <variant>
#include <cctype>
#include <string_view>
#include <algorithm>

struct List {
	std::vector<std::variant<int, List>> values;
};

int findMatchingBracket(std::string_view packet, int index) {
	int depth = 0;

	for(int i = index; i < packet.size(); i ++) {
		char c = packet[i];

		if(c == '[') {
			depth ++;
		}else if(c == ']') {
			depth --;

			if(depth == 0) {
				return i;
			}
		}
	}

	return -1;
}

List parsePacket(std::string_view packet) {
	List list;

	std::string curNum;

	for(int i = 0; i < packet.size(); i ++) {
		char c = packet[i];

		if(c == '[') {
			int matchingBracket = findMatchingBracket(packet, i);
			
			list.values.push_back(parsePacket(packet.substr(i + 1, matchingBracket - (i + 1))));

			i = matchingBracket + 1;
		}else if(std::isdigit(c)) {
			curNum += c;
		}else if(c == ',') {
			list.values.push_back(std::stoi(curNum));

			curNum.clear();
		}
	}

	if(!curNum.empty()) {
		list.values.push_back(std::stoi(curNum));

		curNum.clear();
	}

	return list;
}

bool compareLists(const List &list1, const List &list2, bool* returnValue = nullptr) {
	for(int i = 0; i < std::min(list1.values.size(), list2.values.size()); i ++) {
		const std::variant<int, List> &value1 = list1.values[i];
		const std::variant<int, List> &value2 = list2.values[i];
		
		if(value1.index() == 0) {
			//Int to int
			if(value2.index() == 0) {
				int num1 = std::get<int>(value1);
				int num2 = std::get<int>(value2);
				
				if(num1 < num2) {
					return true;
				}else if(num1 > num2) {
					return false;
				}
			//Int to list
			}else if(value2.index() == 1) {
				bool value = true;
				
				bool rightOrder = compareLists({{std::get<int>(value1)}}, std::get<List>(value2), &value);
				
				if(value) {
					return rightOrder;
				}
			}
		}else {
			//List to int
			if(value2.index() == 0) {
				bool value = true;
				
				bool rightOrder = compareLists(std::get<List>(value1), {{std::get<int>(value2)}}, &value);
				
				if(value) {
					return rightOrder;
				}
			//List to list
			}else if(value2.index() == 1) {
				bool value = true;
				
				bool rightOrder = compareLists(std::get<List>(value1), std::get<List>(value2), &value);
				
				if(value) {
					return rightOrder;
				}
			}
		}
	}
	
	if(list1.values.size() < list2.values.size()) {
		return true;
	}else if(list1.values.size() > list2.values.size()) {
		return false;
	}else {
		if(returnValue != nullptr) {
			*returnValue = false;
		}
		
		return false;
	}
}

int main() {
	std::ifstream file("input.txt");

	std::string line;

	std::vector<List> packets;

	while(std::getline(file, line)) {
		if(!line.empty()) {
			packets.push_back(parsePacket(std::string_view(line.c_str() + 1, line.size() - 2)));
		}
	}
	
	int sum = 0;
	
	int index = 1;
	
	for(int i = 0; i < packets.size(); i += 2) {
		List packet1 = packets[i];
		List packet2 = packets[i + 1];
		
		if(compareLists(packet1, packet2)) {
			sum += index;
		}
		
		index ++;
	}
	
	std::cout << sum << "\n";
	
	return 0;
}