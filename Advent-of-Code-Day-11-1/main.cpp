#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <vector>
#include <string_view>
#include <charconv>
#include <algorithm>

struct Monkey {
	std::vector<int> items;

	char operation;
	int operationNum;

	int test;

	int trueThrow;
	int falseThrow;

	int itemsInspected = 0;

	void update(std::vector<Monkey> &monkeys) {
		for(int i = 0; i < items.size(); i ++) {
			int &item = items[i];
			
			if(operation == '+') {
				if(operationNum == -1) {
					item += item;
				}else {
					item += operationNum;
				}
			}else if(operation == '*') {
				if(operationNum == -1) {
					item *= item;
				}else {
					item *= operationNum;
				}
			}
			
			itemsInspected ++;

			item /= 3;

			if(item % test == 0) {
				monkeys[trueThrow].items.push_back(item);
			}else {
				monkeys[falseThrow].items.push_back(item);
			}
		}

		items.clear();
	}
};

std::vector<int> parseList(std::string_view list) {
	std::vector<int> vec;
	
	for(int pos = list.find(", "); pos != std::string_view::npos; pos = list.find(", ")) {
		int num;
		
		std::from_chars(list.data(), list.data() + pos, num);
		
		vec.push_back(num);

		list.remove_prefix(pos + 2);
	}
	
	int num;
	
	std::from_chars(list.data(), list.data() + list.size(), num);
	
	vec.push_back(num);

	return vec;
}

int main() {
	std::ifstream file("input.txt");

	std::string contents((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

	std::regex monkeyRegex(R"(Monkey \d:\n  Starting items: ((?:\d+)(?:, \d+)*)\n  Operation: new = old (.+) (.+)\n  Test: divisible by (\d+)\n    If true: throw to monkey (\d+)\n    If false: throw to monkey (\d+))");

	std::smatch match;

	std::vector<Monkey> monkeys;

	while(std::regex_search(contents, match, monkeyRegex)) {
		monkeys.push_back({parseList(match.str(1).data()), match.str(2)[0], match.str(3) == "old" ? -1 : std::stoi(match.str(3)), std::stoi(match.str(4)), std::stoi(match.str(5)), std::stoi(match.str(6))});
		
		contents = match.suffix();
	}

	for(int i = 0; i < 20; i ++) {
		for(Monkey &monkey : monkeys) {
			monkey.update(monkeys);
		}
	}

	int most[2] = {0, 0};

	for(Monkey &monkey : monkeys) {
		int num = monkey.itemsInspected;
		
		for(int &mostNum : most) {
			if(num > mostNum) {
				std::swap(mostNum, num);
			}
		}
	}

	std::cout << most[0] * most[1] << "\n";
	
	return 0;
}