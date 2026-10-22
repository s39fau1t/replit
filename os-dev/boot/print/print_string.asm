print_string:
	pusha

	mov ah, 0x0e ;Teletype BIOS routine

	print_string_loop:
		cmp byte [bx], 0 ;Check if bx is zero. If it is, jump out of the loop, otherwise, print the character
		je print_string_end

		mov al, [bx] ;Move the character into al
		int 0x10

		inc bx
		jmp print_string_loop

	print_string_end:
		popa
		ret