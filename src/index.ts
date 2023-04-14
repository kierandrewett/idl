import { resolve } from "path";
import { lex } from "./lexer";
import { readFileSync } from "fs";
import { inspect } from "util";
import { parse } from "./parser";

const main = async () => {
	const idl = readFileSync(resolve(process.cwd(), "data", "input.webidl"), "utf-8");

	const lexed = lex(idl);
	const parsed = parse(lexed);

	// console.log(inspect(lexed, { depth: Infinity, colors: true }));
	console.log(inspect(parsed, { depth: Infinity, colors: true }));
};

main();
