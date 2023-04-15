import { CstChildrenDictionary, CstElement, CstNode, IToken } from "chevrotain";
import {
	ArgumentDirection,
	Comma,
	Declarator,
	Decorator,
	Equals,
	Identifier,
	IntTypeState,
	Interface,
	ReadOnly,
	TypeWithIdentifier
} from "./lexer";
import { inspect } from "util";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { basename, parse, resolve } from "path";
import { typeBindings } from "./types";
import beautify from "js-beautify";
import * as glob from "glob";
import chalk from "chalk";

enum InterfacePropType {
	Property,
	Method
}

enum InterfaceDeclarationType {
	Attribute,
	Const
}

interface InterfaceProp {
	name: string;
	type: InterfacePropType;
	declarationType?: InterfaceDeclarationType;
	dataType?: string;
	readOnly?: boolean;
	props?: InterfaceProp[];
}

export const translateDataType = (dataType: string) => {
	return typeBindings[dataType.toLowerCase()] || dataType;
};

const flipObject = (obj: any) => {
	return Object.keys(obj).reduce((ret, key) => {
		ret[obj[key]] = key;
		return ret;
	}, {});
};

export const compile = (
	idlPath: string,
	cst: CstNode,
	inPath: string,
	outPath: string,
	beautifyOptions?: boolean | beautify.JSBeautifyOptions
) => {
	let header = "";
	let declaration = "";

	const findIDLFileByName = (name: string) => {
		return glob
			.sync(resolve(inPath, "**/*.{webidl,idl}"))
			.find((p) => parse(p).base.startsWith(name + "."));
	};

	const createProperty = (prop: InterfaceProp) => {
		let property = "";
		let val = "";

		if (
			prop.declarationType !== InterfaceDeclarationType.Const &&
			prop.dataType &&
			!flipObject(typeBindings)[prop.dataType.toLowerCase()] &&
			prop.dataType !== parse(idlPath).name
		) {
			if (findIDLFileByName(prop.dataType)) {
				if (!header.includes(`import { ${prop.dataType} }`)) {
					header += `import { ${prop.dataType} } from "./${prop.dataType}";\n`;
				}
			} else {
				console.warn(
					`${chalk.yellow("WARN")}: Could not find data type for "${
						prop.dataType
					}" at ${idlPath} on property "${prop.name}".`
				);

				prop.dataType = `unknown /* todo: ${parse(idlPath).name}::${prop.dataType} */`;
			}
		}

		switch (prop.type) {
			case InterfacePropType.Property:
				property += `${prop.readOnly ? "readonly " : ""}${prop.name}: ${prop.dataType}`;

				break;
			case InterfacePropType.Method:
				const methodProps = prop.props?.map(createProperty);

				val = `(${(methodProps || []).join(", ")}): ${prop.dataType}`;

				property += `${prop.readOnly ? "readonly " : ""}${prop.name}${val}`;

				break;
		}

		return property;
	};

	const createInterface = ({
		name,
		extendInterfaces,
		props
	}: {
		name: string;
		extendInterfaces?: string[];
		props?: InterfaceProp[];
	}) => {
		if (props && props.length > 0) {
			const allowedInterfaces: string[] = [];

			if (extendInterfaces && extendInterfaces.length > 0) {
				for (const interfaceName of extendInterfaces) {
					if (declaration.includes(`export interface ${interfaceName}`)) {
						allowedInterfaces.push(interfaceName);
					} else {
						if (findIDLFileByName(interfaceName)) {
							allowedInterfaces.push(interfaceName);
							if (!header.includes(`import { ${interfaceName} }`)) {
								header += `import { ${interfaceName} } from "./${interfaceName}";\n`;
							}
						}
					}
				}
			}

			const extendsStr =
				allowedInterfaces && allowedInterfaces.length > 0
					? ` extends ${allowedInterfaces.join(", ")}`
					: "";

			declaration += `export interface ${name}${extendsStr} {\n`;

			for (const prop of props) {
				if (prop.name) {
					declaration += "\t" + createProperty(prop) + ";\n";
				}
			}

			declaration += `}\n\n`;
		}
	};

	for (const [childName, child] of Object.entries(cst.children)) {
		switch (childName) {
			case "interface":
				for (const { children, location } of child as CstNode[]) {
					const name = (children.InterfaceName[0] as IToken).image;
					const extendInterfaces = ((children.InterfaceImplements as IToken[]) || [])
						.map(
							(token) =>
								((token as unknown as CstNode).children.InterfaceName[0] as IToken)
									.image
						)
						.filter((t) => Boolean(t));

					if (!name || !name.length) {
						throw new Error(
							`Interface name is required at ${idlPath}:${location?.startLine}:${location?.startColumn}`
						);
					}

					const generateDeclaration = (prop: InterfaceProp, token: CstNode) => {
						if (!prop.type) {
							prop.type = InterfacePropType.Property;
						}

						for (const [id, child] of Object.entries(token.children)) {
							switch (id) {
								case ReadOnly.name:
									prop.readOnly = true;
									break;
								case Declarator.name:
									switch (((child as CstElement[])[0] as IToken).image) {
										case "attribute":
											prop.declarationType =
												InterfaceDeclarationType.Attribute;
											break;
										case "const":
											prop.declarationType = InterfaceDeclarationType.Const;
											break;
									}
									break;
								case "MemberName":
									if (prop.name && prop.name.length) {
										break;
									}

									const splitName = (
										(child as CstElement[])[0] as IToken
									).image.split(" ");
									if (splitName.length == 1) {
										prop.name = splitName[0];
									} else if (splitName.length == 2) {
										prop.dataType = translateDataType(splitName[0]);
										prop.name = splitName[1];
									}
								case ArgumentDirection.name:
								case IntTypeState.name:
								case Comma.name:
								case Decorator.name:
									// Do nothing
									break;
								default:
									console.warn(
										`${chalk.yellow(
											"WARN"
										)}: Unknown token "${id}"="${child.map(
											(i: any) => i.image
										)}"`
									);
									break;
							}
						}

						if (prop.name == "constructor") {
							prop.name = "new "; // The space is intentional
							prop.dataType = name;
						}

						return prop;
					};

					const generateProp = (token: any, index: number) => {
						const { children } = token as CstNode;

						let prop = {} as InterfaceProp;

						if (
							children &&
							children.LRoundBracket &&
							children.RRoundBracket &&
							children.declaration &&
							children.MemberDeclaration
						) {
							prop.type = InterfacePropType.Method;
						} else {
							prop.type = InterfacePropType.Property;
						}

						let childIndex = 0;

						for (const [childId, childToken] of Object.entries(children)) {
							if (childId == "MemberDeclaration" || childId == "declaration") {
								let dcIndex = 0;

								prop = {
									...prop,
									...generateDeclaration(prop, childToken[0] as CstNode)
								};
							} else if (childId == "Equals") {
								const nextToken = Object.values(children)[
									childIndex + 1
								][0] as IToken;

								if (nextToken.tokenType == Identifier) {
									prop.declarationType = InterfaceDeclarationType.Const;
									prop.dataType = nextToken.image;
								}
							}

							++childIndex;
						}

						if (prop.type == InterfacePropType.Method) {
							const fnArguments = children.declaration;

							prop.type = InterfacePropType.Method;
							prop.props = fnArguments.map((token: any) =>
								generateDeclaration({} as InterfaceProp, token)
							);
						}

						return prop;
					};

					const props =
						children.interface_contents && children.interface_contents.length
							? (
									children.interface_contents[0] as CstNode
							  ).children.interface_member.map(generateProp)
							: [];

					createInterface({
						name,
						extendInterfaces,
						props
					});
				}
			default:
				break;
		}
	}

	const output: string[] = [];

	if (header && header.trim().length) {
		output.push(header.trim());
	}

	if (declaration && declaration.trim().length) {
		output.push(declaration.trim());
	}

	if (!existsSync(outPath)) {
		mkdirSync(outPath);
	}

	const beautified = beautifyOptions
		? beautify.js(output.join("\n\n"), {
				indent_size: "4",
				indent_char: " ",
				max_preserve_newlines: "5",
				preserve_newlines: true,
				keep_array_indentation: false,
				break_chained_methods: false,
				indent_scripts: "normal",
				brace_style: "collapse",
				space_before_conditional: true,
				unescape_strings: false,
				jslint_happy: false,
				end_with_newline: false,
				wrap_line_length: "0",
				indent_inner_html: false,
				comma_first: false,
				e4x: false,
				indent_empty_lines: false,
				...((beautifyOptions as any) || {})
		  })
		: output.join("\n\n");

	writeFileSync(resolve(outPath, `${parse(idlPath).name}.d.ts`), beautified + "\n");
};
