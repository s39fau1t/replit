#include <iostream>
#include <fstream>
#include <string>
#include <stdexcept>
#include <vector>
#include <algorithm>
#include <iterator>
#include <string_view>
#include <cstdlib>

std::string readFile(const std::string &path) {	
	std::ifstream file(path);

	if(file) {
		return std::string((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
	}

	throw std::invalid_argument(path + " could not be found");
}

std::vector<std::string>::const_iterator getArg(const std::vector<std::string> &args, std::string_view arg) {
	std::vector<std::string>::const_iterator it = std::find(args.begin(), args.end(), arg);

	if(it != args.end()) {
		std::advance(it, 1);

		if(it == args.end()) {
			throw std::invalid_argument("Argument has no value");
		}		
	}

	return it;
}

int main(int argc, const char* argv[]) {
	//Arguments
	std::vector<std::string> args(argv, argv + argc);

	//Options
	int cells = 30000;
	std::string outFilename = "main.asm";

	std::vector<std::string>::const_iterator it;

	try {
		it = getArg(args, "-c");
	}catch(const std::invalid_argument &error) {
		std::cerr << "Must specify a number of cells if using -c option\n";

		return -1;
	}

	if(it != args.end()) {
		cells = std::stoi(*it);

		args.erase(std::prev(it), std::next(it));
	}

	try {
		it = getArg(args, "-o");
	}catch(const std::invalid_argument &error) {
		std::cerr << "Must specify an output file name if using -o option\n";

		return -1;
	}

	if(it != args.end()) {
		outFilename = *it;

		args.erase(std::prev(it), std::next(it));
	}

	int extPos = outFilename.rfind(".");

	if(extPos == std::string::npos) {
		std::cerr << "outFilename must have extension\n";

		return -1;
	}

	if(outFilename.substr(extPos, outFilename.size()) == ".o") {
		std::cerr << "outFilename cannot have .o extension\n";

		return -1;
	}

	std::string objFilename = outFilename.substr(0, extPos + 1) + "o";
	std::string exeFilename = outFilename.substr(0, extPos);
	
	if(args.size() != 2) {
		std::cerr << "Usage: ./bfCompile [-c cells -o outFilename] filename\n";
		
		return -1;
	}

	std::string code;
	
	try {
		code = readFile(args[1]);
	}catch(const std::invalid_argument &error) {
		std::cerr << error.what() << "\n";

		return -1;
	}

	std::string assembly =
R"(section .bss
memoryPtr resq 1

section .text
global _start
_start:
	mov [memoryPtr], rsp
	sub qword [memoryPtr], 8
	sub rsp, )" + std::to_string(cells * 8);

	int loopCount = 0;
	std::vector<int> loops;

	for(char c : code) {
		switch(c) {
			case '>': {
				//Increment the memory pointer
				assembly += R"(
	; >
	sub qword [memoryPtr], 8)";
				
				break;
			}
			case '<': {
				//Decrement memory pointer
				assembly += R"(
	; <
	add qword [memoryPtr], 8)";
				break;
			}
			case '+': {
				//Add 1 to current memory position
				assembly += R"(
	; +
	mov rax, [memoryPtr]
	inc qword [rax])";
				break;
			}
			case '-': {
				//Subtract 1 from current memory position
				assembly += R"(
	; -
	mov rax, [memoryPtr]
	dec qword [rax])";
				break;
			}
			case '.': {
				//Output char
				assembly += R"(
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall)";
				break;
			}
			case ',': {
				//Input char
				assembly += R"(
	; ,
	mov rax, 0
	mov rdi, 0
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
				)";
				break;
			}
			case '[': {
				//Start loop
				assembly += R"(
	; [
	jmp checkLoop)" + std::to_string(loopCount) + R"(
	loop)" + std::to_string(loopCount) + ":";

				loops.push_back(loopCount);
				loopCount ++;
				break;
			}
			case ']': {
				//End loop
				assembly += R"(
	; ]
	checkLoop)" + std::to_string(loops.back()) + R"(:
	mov rax, [memoryPtr]
	cmp qword [rax], 0
	jne loop)" + std::to_string(loops.back());

				loops.pop_back();
				break;
			}
		}
	}

	assembly +=
R"(
last:
	mov rax, 60
	mov rdi, 0
	syscall)";

	std::ofstream asmFile(outFilename);

	asmFile << assembly << std::flush;

	std::system(("nasm -f elf64 " + outFilename).c_str());
	std::system(("ld " + objFilename + " -o " + exeFilename).c_str());
	std::system(("./" + exeFilename).c_str());
	
	return 0;
}