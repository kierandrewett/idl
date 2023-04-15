import { CstParser, EmbeddedActionsParser, ILexingResult } from "chevrotain";
import {
	ArgumentDirection,
	Colon,
	Comma,
	Comment,
	Declarator,
	Decorator,
	Equals,
	Identifier,
	IntTypeSignedness,
	Interface,
	KeywordOrIdentifier,
	LCurlyBracket,
	LRoundBracket,
	RCurlyBracket,
	RRoundBracket,
	ReadOnly,
	Semicolon,
	TypeWithIdentifier,
	vocabulary
} from "./lexer";

class Parser extends CstParser {
	constructor() {
		super(vocabulary, { nodeLocationTracking: "full", recoveryEnabled: true });

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
			this.CONSUME(Identifier, { LABEL: "InterfaceName" });
			this.OPTION2(() => {
				this.CONSUME(Colon);
				this.MANY(() => {
					this.SUBRULE((this as any).interface_implements, {
						LABEL: "InterfaceImplements"
					});
				});
			});
			this.OPTION5(() => {
				this.CONSUME(LCurlyBracket);
				this.SUBRULE((this as any).interface_contents);
				this.CONSUME(RCurlyBracket);
			});
			this.CONSUME(Semicolon);
		});

		this.RULE("interface_implements", () => {
			this.CONSUME1(Identifier, { LABEL: "InterfaceName" });

			this.OPTION4(() => {
				this.CONSUME(Comma);
			});
		});

		this.RULE("interface_contents", () => {
			this.MANY(() => {
				this.SUBRULE((this as any).interface_member);
			});
		});

		this.RULE("declaration", () => {
			this.OPTION1(() => {
				this.CONSUME2(Decorator);
			});

			this.OPTION2(() => {
				this.CONSUME(ReadOnly);
			});

			this.OPTION3(() => {
				this.OR1([
					{
						ALT: () => {
							this.CONSUME(ArgumentDirection);
						}
					},
					{
						ALT: () => {
							this.CONSUME(Declarator);
						}
					}
				]);
			});

			this.OPTION4(() => {
				this.CONSUME(IntTypeSignedness);
			});

			this.OR2([
				{
					ALT: () => {
						this.CONSUME(TypeWithIdentifier);
					}
				},
				{
					ALT: () => {
						this.CONSUME(Identifier);
					}
				}
			]);

			this.OPTION5(() => {
				this.CONSUME(Comma);
			});
		});

		this.RULE("interface_member", () => {
			this.OPTION3(() => {
				this.CONSUME(Comment);
			});

			this.SUBRULE1((this as any).declaration, { LABEL: "MemberDeclaration" });

			this.OR([
				{
					ALT: () => {
						this.CONSUME(Equals);
						this.CONSUME(Identifier);
					}
				},
				{
					// Function declaration
					ALT: () => {
						this.OPTION7(() => {
							this.CONSUME(LRoundBracket);
						});

						this.OPTION8(() => {
							this.MANY(() => {
								this.SUBRULE2((this as any).declaration);
							});
						});

						this.option(10, () => {
							this.CONSUME(RRoundBracket);
						});
					}
				}
			]);

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
