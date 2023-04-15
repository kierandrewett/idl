import { resolve } from "path";
import { lex } from "./lexer";
import { readFileSync } from "fs";
import { inspect } from "util";
import { parse } from "./parser";
import { compile } from "./compiler";
import * as glob from "glob";

export const main = async (inputDir: string, outputDir: string) => {
	glob.sync(resolve(process.cwd(), inputDir, "**/*.{webidl,idl}")).forEach((idlPath) => {
		const idl = readFileSync(idlPath, "utf-8");

		const lexed = lex(idl);
		const parsed = parse(lexed);

		if (parsed == undefined) {
			if (lexed.errors && lexed.errors.length) {
				for (const error of lexed.errors) {
					console.error(error);
				}

				throw new Error("Lexing errors occurred. Could not parse input.");
			} else {
				throw new Error("Unknown error occurred. Could not lex and parse input.");
			}
		}

		compile(
			idlPath,
			parsed,
			resolve(process.cwd(), inputDir),
			resolve(process.cwd(), outputDir)
		);
	});
};
