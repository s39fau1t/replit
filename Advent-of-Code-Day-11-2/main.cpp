#include <iostream>
#include <string>
#include <fstream>
#include <regex>
#include <vector>
#include <string_view>
#include <charconv>
#include <algorithm>

//https://www.reddit.com/r/adventofcode/comments/zizi43/comment/iztt8mx/

struct Monkey {
	std::vector<long> items;

	char operation;
	int operationNum;

	int test;

	int trueThrow;
	int falseThrow;

	int itemsInspected = 0;

	void update(std::vector<Monkey> &monkeys, int cycleLength) {
		for(int i = 0; i < items.size(); i ++) {
			long &item = items[i];
			
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
			
			item %= cycleLength;
			
			itemsInspected ++;

			if(item % test == 0) {
				monkeys[trueThrow].items.push_back(item);
			}else {
				monkeys[falseThrow].items.push_back(item);
			}
		}

		items.clear();
	}
};

std::vector<long> parseList(std::string_view list) {
	std::vector<long> vec;
	
	for(int pos = list.find(", "); pos != std::string_view::npos; pos = list.find(", ")) {
		long num;
		
		std::from_chars(list.data(), list.data() + pos, num);
		
		vec.push_back(num);

		list.remove_prefix(pos + 2);
	}
	
	long num;
	
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
	
	int cycleLength = 1;

	while(std::regex_search(contents, match, monkeyRegex)) {
		int test = std::stoi(match.str(4));
		
		cycleLength *= test;
		
		monkeys.push_back({parseList(match.str(1).data()), match.str(2)[0], match.str(3) == "old" ? -1 : std::stoi(match.str(3)), test, std::stoi(match.str(5)), std::stoi(match.str(6))});
		
		contents = match.suffix();
	}

	for(int i = 0; i < 10000; i ++) {
		for(Monkey &monkey : monkeys) {
			monkey.update(monkeys, cycleLength);
		}
	}

	long most[2] = {0, 0};

	for(Monkey &monkey : monkeys) {
		long num = monkey.itemsInspected;
		
		for(long &mostNum : most) {
			if(num > mostNum) {
				std::swap(mostNum, num);
			}
		}
	}

	std::cout << most[0] * most[1] << "\n";
	
	return 0;
}