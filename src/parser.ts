import { CstParser, EmbeddedActionsParser, ILexingResult } from "chevrotain";
import {
	Attribute,
	Bool,
	Comma,
	Comment,
	Decorator,
	Identifier,
	Interface,
	LCurlyBracket,
	LRoundBracket,
	RCurlyBracket,
	RRoundBracket,
	ReadOnly,
	Semicolon,
	Type,
	vocabulary
} from "./lexer";

class Parser extends CstParser {
	constructor() {
		super(vocabulary, { nodeLocationTracking: "full" });

		this.RULE("idl", () => {
			this.MANY(() => {
				this.SUBRULE((this as any).interface);
			});
		});

		this.RULE("interface", () => {
			this.OPTION1(() => {
				this.CONSUME1(Decorator);
			});
			this.CONSUME(Interface);
			this.CONSUME(Identifier);
			this.OPTION2(() => {
				this.CONSUME(LCurlyBracket);
				this.SUBRULE((this as any).interface_contents);
				this.CONSUME(RCurlyBracket);
			});
			this.CONSUME(Semicolon);
		});

		this.RULE("interface_contents", () => {
			this.MANY(() => {
				this.SUBRULE((this as any).interface_member);
			});
		});

		this.RULE("declaration", () => {
			this.OR([
				{
					ALT: () => {
						this.CONSUME1(Identifier);
					}
				},
				{
					ALT: () => {
						this.CONSUME(Type);
						this.CONSUME2(Identifier);
					}
				}
			]);
		});

		this.RULE("interface_member", () => {
			this.OPTION3(() => {
				this.CONSUME(Comment);
			});

			this.OPTION4(() => {
				this.CONSUME2(Decorator);
			});

			this.OPTION5(() => {
				this.CONSUME(ReadOnly);
			});

			this.OPTION6(() => {
				this.CONSUME3(Attribute);
			});

			this.SUBRULE1((this as any).declaration);

			this.OPTION8(() => {
				this.CONSUME(LRoundBracket);
				this.MANY(() => {
					this.SUBRULE2((this as any).declaration);
					this.OPTION9(() => {
						this.CONSUME(Comma);
					});
				});
				this.CONSUME(RRoundBracket);
			});

			this.CONSUME(Semicolon);
		});

		this.performSelfAnalysis();
	}
}

export const parse = (lexed: ILexingResult) => {
	const parser = new Parser();

	parser.input = lexed.tokens;

	const cst = (parser as any).idl();

	return cst;
};
