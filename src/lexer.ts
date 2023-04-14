import { Lexer, createToken } from "chevrotain";

const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ });

const KeywordOrIdentifier = createToken({
	name: "KeywordOrIdentifier",
	pattern: Lexer.NA
});

const WhiteSpace = createToken({
	name: "WhiteSpace",
	pattern: /\s+/,
	group: Lexer.SKIPPED
});

const Comment = createToken({
	name: "Comment",
	pattern: /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/,
	group: "comments"
});

const LCurlyBracket = createToken({ name: "LCurlyBracket", pattern: /\{/ });
const RCurlyBracket = createToken({ name: "RCurlyBracket", pattern: /\}/ });
const LRoundBracket = createToken({ name: "LRoundBracket", pattern: /\(/ });
const RRoundBracket = createToken({ name: "RRoundBracket", pattern: /\)/ });
const Semicolon = createToken({ name: "Semicolon", pattern: /\;/ });
const Comma = createToken({ name: "Comma", pattern: /\,/ });

const Interface = createToken({
	name: "Interface",
	pattern: /interface/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Attribute = createToken({
	name: "Attribute",
	pattern: /attribute/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const ReadOnly = createToken({
	name: "ReadOnly",
	pattern: /readonly/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Decorator = createToken({
	name: "Decorator",
	pattern: /\[([^]*?)\]/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Type = createToken({
	name: "Type",
	pattern: /(\w(\??))+/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Bool = createToken({ name: "Bool", pattern: /bool/, categories: [Type] });

const allTokens = [
	WhiteSpace,
	Comment,
	// Chars/types
	LCurlyBracket,
	RCurlyBracket,
	LRoundBracket,
	RRoundBracket,
	Semicolon,
	Comma,
	Bool,
	// Tokens
	Interface,
	Attribute,
	ReadOnly,
	Decorator,
	// The Identifier must appear after the keywords because all keywords are valid identifiers.
	Identifier,
	Type,
	KeywordOrIdentifier
];

export const vocabulary = allTokens.reduce((o, key) => Object.assign(o, { [key.name]: key }), {});

export {
	WhiteSpace,
	Comment,
	LCurlyBracket,
	RCurlyBracket,
	LRoundBracket,
	RRoundBracket,
	Semicolon,
	Comma,
	Bool,
	Interface,
	Attribute,
	ReadOnly,
	Decorator,
	Type,
	Identifier,
	KeywordOrIdentifier
};

const lexer = new Lexer(allTokens);

export const lex = (input: string) => {
	const result = lexer.tokenize(input);

	if (result.errors.length > 0) {
		result.errors.map(console.error);
	}

	return result;
};
