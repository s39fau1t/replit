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
	
	bool operator==(const List &that) const {
		return List::equals(*this, that);
	}
	
	static bool equals(const List &r, const List &l) {
		if(r.values.size() != l.values.size()) {
			return false;
		}
		
		for(int i = 0; i < l.values.size(); i ++) {
			if(l.values[i].index() != r.values[i].index()) {
				return false;
			}
			
			if(l.values[i].index() == 1) {
				if(!equals(std::get<List>(l.values[i]), std::get<List>(r.values[i]))) {
					return false;
				}
			}else {
				if(std::get<int>(l.values[i]) != std::get<int>(r.values[i])) {
					return false;
				}
			}
		}
		
		return true;
	}
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
	
	List dividerPacket1 = {{List{{2}}}};
	List dividerPacket2 = {{List{{6}}}};
	
	//Divider packets
	packets.push_back(dividerPacket1);
	packets.push_back(dividerPacket2);
	
	std::sort(packets.begin(), packets.end(), [](const List &list1, const List &list2) {
		return compareLists(list1, list2);
	});
	
	int index1 = std::distance(packets.begin(), std::find(packets.begin(), packets.end(), dividerPacket1)) + 1;
	int index2 = std::distance(packets.begin(), std::find(packets.begin(), packets.end(), dividerPacket2)) + 1;
	
	std::cout << index1 * index2 << "\n";
	
	return 0;
}