import { Lexer, createToken } from "chevrotain";

const Identifier = createToken({
	name: "Identifier",
	pattern: /[a-zA-Z0-9]\w*/
});

const KeywordOrIdentifier = createToken({
	name: "KeywordOrIdentifier",
	pattern: Lexer.NA
});

const WhiteSpace = createToken({
	name: "WhiteSpace",
	pattern: /\s+/,
	group: Lexer.SKIPPED
});

const MozSubstitution = createToken({
	name: "MozSubstitution",
	pattern: /%{[\w\W]*%}/,
	line_breaks: true,
	group: Lexer.SKIPPED
});

const Comment = createToken({
	name: "Comment",
	pattern: /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)|(#.*)/,
	group: "comments"
});

const LCurlyBracket = createToken({ name: "LCurlyBracket", pattern: /\{/ });
const RCurlyBracket = createToken({ name: "RCurlyBracket", pattern: /\}/ });
const LRoundBracket = createToken({ name: "LRoundBracket", pattern: /\(/ });
const RRoundBracket = createToken({ name: "RRoundBracket", pattern: /\)/ });
const Semicolon = createToken({ name: "Semicolon", pattern: /\;/ });
const Colon = createToken({ name: "Colon", pattern: /\:/ });
const Comma = createToken({ name: "Comma", pattern: /\,/ });
const Equals = createToken({ name: "Equals", pattern: /\=/ });

const Interface = createToken({
	name: "Interface",
	pattern: /interface/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Declarator = createToken({
	name: "Declarator",
	pattern: /(attribute|const)/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const ReadOnly = createToken({
	name: "ReadOnly",
	pattern: /readonly/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const ArgumentDirection = createToken({
	name: "ArgumentDirection",
	pattern: /(in|out)/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const Decorator = createToken({
	name: "Decorator",
	pattern: /\[([^]*?)\]/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const TypeWithIdentifier = createToken({
	name: "TypeWithIdentifier",
	pattern: /((\w(\??))+) ([a-zA-Z]\w*)/,
	categories: [KeywordOrIdentifier]
});

const IntTypeSignedness = createToken({
	name: "IntTypeSignedness",
	pattern: /(signed|unsigned)/,
	longer_alt: Identifier,
	categories: [KeywordOrIdentifier]
});

const allTokens = [
	WhiteSpace,
	MozSubstitution,
	Comment,
	// Chars/types
	LCurlyBracket,
	RCurlyBracket,
	LRoundBracket,
	RRoundBracket,
	Semicolon,
	Colon,
	Comma,
	Equals,
	// Tokens
	Interface,
	Declarator,
	ReadOnly,
	Decorator,
	ArgumentDirection,
	IntTypeSignedness,
	// The Identifier must appear after the keywords because all keywords are valid identifiers.
	TypeWithIdentifier,
	Identifier,
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
	Colon,
	Comma,
	Equals,
	Interface,
	Declarator,
	ReadOnly,
	Decorator,
	ArgumentDirection,
	IntTypeSignedness,
	TypeWithIdentifier,
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
