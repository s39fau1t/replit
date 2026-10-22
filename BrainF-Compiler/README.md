# BrainF Compiler
Haven't you always wished you could do away with those annoying interpreters and compile your _beautiful_ BrainF code directly into an executable?
<br>
<br>
No? Too bad. I made it anyway.
<br>
<br>
The BrainF compiler compiles your code into gloriously ~~inefficient~~ slightly unoptimized _(heh heh)_ x86-64 assembly and then assembles it using `nasm` (Intel syntax gang). You can find the generated assembly code in 	`main.asm` or whatever filename you specified with the `-o` option.
## Usage
`./bfCompile [-c cells -o outFilename] filename`
### Arguments
<ul>
	<li>
		<code>-c</code>: Optional argument specifying the amount of cells to allocate (default is 30000)
	</li>
	<li>
		<code>-o</code> Optional argument specifying the name of the file to store the generated assembly code. No extension and <code>.o</code> extension are not allowed (default is <code>main.asm</code>)
	</li>
	<li>
		<code>filename</code>: The name of the file to compile, duh
	</li>
</ul>

## How do I use my own program?
Just fork the repl and edit `main.bf`, or use a different file and change the command line argument in `.replit`

## Notes
<ul>
	<li>
		Uses 64-bit cells
	</li>
	<li>
		Does <strong>not</strong> support wrapping (e.g. subtracting from a cell with 0 wraps around to 255, and vice versa), and programs that utilize this feature <strong><em>will not work</em></strong>.
	</li>
	<li>
		Does <strong>not</strong> support negative cells (e.g. cells to the left of the starting cell), and programs that utilize this feature <strong><em>will not work</em></strong>.
	</li>
	<li>
		Does <strong>not</strong> check for unbalanced loops and other things that are your fault (like the things stated above), so they'll probably give a weird error of some kind or the program will just freeze when you try to run it
	</li>
</ul>