import { main } from "./lib";

const cli = async () => {
	const args = process.argv.splice(2);

	const [inputPath, outputPath] = args;

	main(inputPath, outputPath);
};

cli();
