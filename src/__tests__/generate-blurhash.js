const { resolve } = require("path");

const { exists, readFileSync, writeFile } = require("fs-extra");
const blurhash = require("blurhash");
const { createCanvas, loadImage } = require("canvas");

const generateBlurhash = require("../generate-blurhash");

jest.mock("blurhash", () => ({
	encode: jest.fn(() => "mocked blurhashed encoded string"),
	decode: jest.fn(() => new Uint8ClampedArray([])),
}));

jest.mock("canvas", () => ({
	createCanvas: jest.fn(() => ({
		getContext: jest.fn(() => ({
			drawImage: jest.fn(),
			getImageData: jest.fn(() => ({
				data: new Uint8ClampedArray([]),
				width: 400,
				height: 200,
			})),
			createImageData: jest.fn(() => ({
				data: new Uint8ClampedArray([]),
			})),
			putImageData: jest.fn(),
		})),
		toDataURL: jest.fn(() => "canvas data url"),
	})),
	loadImage: jest.fn(),
}));

jest.mock("fs-extra", () => ({
	exists: jest.fn(() => false),
	readFileSync: jest.fn(() => (JSON.stringify({
		"base64Image": "cached base64 image string",
		"hash": "mocked blurhashed encoded string"
	}))),
	writeFile: jest.fn(),
}));

afterEach(() => {
	blurhash.encode.mockClear();
	blurhash.decode.mockClear();

	createCanvas.mockClear();
	loadImage.mockClear();

	exists.mockClear();
	readFileSync.mockClear();
	writeFile.mockClear();
});

describe("gatsby-transformer-blurhash", () => {
	const filename = "this-file-does-not-need-to-exist-for-the-test.jpg";
	const absolutePath = resolve(
		__dirname,
		"images",
		filename,
	);
	const cacheDir = __dirname;

	describe("generateBlurhash", () => {
		it("not cached", async () => {
			const cache = {
				get: jest.fn(),
				set: jest.fn(),
			};
			const width = 400;
			const height = 200;
			const componentX = 4;
			const componentY = 3;
			const result = await generateBlurhash({
				cache,
				cacheDir,
				absolutePath,
				contentDigest: filename,
				width,
				height,
				componentX,
				componentY,
			});
			expect(result).toMatchSnapshot();

			const readFileArgs = readFileSync.mock.calls[0];
			expect(readFileArgs[0]).toBe(absolutePath);

			expect(blurhash.encode).toHaveBeenCalledTimes(1);
			expect(blurhash.decode).toHaveBeenCalledTimes(1);
			const decodeArgs = blurhash.decode.mock.calls[0];
			expect(decodeArgs[0]).toBe("mocked blurhashed encoded string");
			expect(decodeArgs[1]).toBe(width);
			expect(decodeArgs[2]).toBe(height);

			expect(exists).toHaveBeenCalledTimes(1);
			expect(writeFile).toHaveBeenCalledTimes(1);
			expect(readFileSync).toHaveBeenCalledTimes(1);
		});

		it("cached", async () => {
			exists.mockImplementationOnce(() => true);
			const cache = {
				get: jest.fn(),
				set: jest.fn(),
			};
			const width = 400;
			const height = 200;
			const componentX = 4;
			const componentY = 3;
			const result = await generateBlurhash({
				cache,
				cacheDir,
				absolutePath,
				contentDigest: filename,
				width,
				height,
				componentX,
				componentY,
			});

			expect(result).toMatchSnapshot();

			expect(blurhash.encode).toHaveBeenCalledTimes(0);
			expect(blurhash.decode).toHaveBeenCalledTimes(0);

			expect(exists).toHaveBeenCalledTimes(1);
			expect(writeFile).toHaveBeenCalledTimes(0);
			expect(readFileSync).toHaveBeenCalledTimes(1);
		});
	});
});
