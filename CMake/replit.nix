{ pkgs }: {
	deps = [
 		pkgs.clang_12
		pkgs.cmake
		pkgs.cmakeWithGui
		pkgs.gdb
	];
}