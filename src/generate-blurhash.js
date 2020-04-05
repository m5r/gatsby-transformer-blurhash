const { resolve, parse } = require("path");

const Debug = require("debug");
const { exists, readFileSync, writeFile } = require("fs-extra");
const PQueue = require("p-queue");
const blurhash = require("blurhash");
const { createCanvas, loadImage } = require("canvas");
const { createContentDigest } = require("gatsby-core-utils");

const queue = new PQueue({ concurrency: 1 });
const debug = Debug("gatsby-transformer-blurhash");

module.exports = async function generateBlurhash(options) {
	const {
		cache,
		absolutePath,
		cacheDir,
		contentDigest,
		width,
		height,
		componentX,
		componentY,
	} = options;

	debug({ options });

	const { name } = parse(absolutePath);

	const blurhashOptions = {
		width,
		height,
		componentX,
		componentY,
	};

	const optionsHash = createContentDigest(blurhashOptions);

	const cacheKey = `${contentDigest}-${optionsHash}`;
	const cachePath = resolve(cacheDir, `${cacheKey}.b64`);

	debug(`Request preview generation for ${name} (${contentDigest}-${optionsHash})`);

	return queue.add(async () => {
		let base64Image = await cache.get(cacheKey);

		if (!base64Image) {
			debug(`Executing preview generation request for ${name} (${contentDigest}-${optionsHash})`);

			try {
				if (await exists(cachePath)) {
					debug(`Base64 result file already exists for ${name} (${contentDigest}-${optionsHash})`);
					base64Image = readFileSync(cachePath, `utf8`).toString();
				} else {
					debug(`Generate base64 result file of ${name} (${contentDigest}-${optionsHash})`);

					const clampedX = Math.min(9, Math.max(1, componentX));
					const clampedY = Math.min(9, Math.max(1, componentY));

					const buffer = readFileSync(absolutePath);
					const image = await loadImage(buffer);
					const canvas = createCanvas(width, height);
					const ctx = canvas.getContext("2d");
					ctx.drawImage(image, 0, 0, width, height);
					const imageData = ctx.getImageData(0, 0, width, height);

					const blurhashed = blurhash.encode(
						imageData.data,
						imageData.width,
						imageData.height,
						clampedX,
						clampedY,
					);
					const pixels = blurhash.decode(blurhashed, width, height);

					// Set in canvas to get Base64
					const imageCanvasPixels = ctx.createImageData(width, height);
					imageCanvasPixels.data.set(pixels);
					ctx.putImageData(imageCanvasPixels, 0, 0);

					base64Image = canvas.toDataURL();

					await writeFile(cachePath, base64Image);
					debug(`Wrote base64 result file to disk for ${name} (${contentDigest}-${optionsHash})`);
				}

				await cache.set(cacheKey, base64Image);
			} catch (err) {
				err.message = `Unable to generate blurhash for ${name} (${contentDigest}-${optionsHash})\n${err.message}`;

				throw err;
			}
		}

		return { base64Image };
	});
};
