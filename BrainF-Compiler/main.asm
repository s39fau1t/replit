section .bss
memoryPtr resq 1

section .text
global _start
_start:
	mov [memoryPtr], rsp
	sub qword [memoryPtr], 8
	sub rsp, 240000
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; [
	jmp checkLoop0
	loop0:
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; <
	add qword [memoryPtr], 8
	; <
	add qword [memoryPtr], 8
	; <
	add qword [memoryPtr], 8
	; <
	add qword [memoryPtr], 8
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; ]
	checkLoop0:
	mov rax, [memoryPtr]
	cmp qword [rax], 0
	jne loop0
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; <
	add qword [memoryPtr], 8
	; <
	add qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; >
	sub qword [memoryPtr], 8
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; -
	mov rax, [memoryPtr]
	dec qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; >
	sub qword [memoryPtr], 8
	; +
	mov rax, [memoryPtr]
	inc qword [rax]
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
	; >
	sub qword [memoryPtr], 8
	; .
	mov rax, 1
	mov rdi, 1
	mov rsi, [memoryPtr]
	mov rdx, 1
	syscall
last:
	mov rax, 60
	mov rdi, 0
	syscall