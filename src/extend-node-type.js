const { resolve } = require("path");

const {
	DuotoneGradientType,
	ImageCropFocusType,
} = require("gatsby-transformer-sharp/types");
const { queueImageResizing } = require("gatsby-plugin-sharp");

const Debug = require("debug");
const fs = require("fs-extra");
const {
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLBoolean,
} = require("gatsby/graphql");
const sharp = require("sharp");

const generateBlurhash = require("./generate-blurhash");

const debug = Debug("gatsby-transformer-blurhash");

module.exports = async args => {
	const {
		type: { name },
	} = args;

	if (name === "ImageSharp") {
		return blurhashSharp(args);
	}

	return {};
};

async function blurhashSharp({ cache, getNodeAndSavePathDependency, store }) {
	const program = store.getState().program;
	const cacheDir = resolve(
		`${program.directory}/node_modules/.cache/gatsby-transformer-blurhash/`,
	);

	await fs.ensureDir(cacheDir);

	return {
		blurHash: {
			type: new GraphQLObjectType({
				name: "BlurhashSharp",
				fields: {
					base64Image: { type: GraphQLString },
				},
			}),
			args: {
				componentX: {
					type: new GraphQLNonNull(GraphQLInt),
					defaultValue: 4,
				},
				componentY: {
					type: new GraphQLNonNull(GraphQLInt),
					defaultValue: 3,
				},
				width: {
					type: GraphQLInt,
					defaultValue: 400,
				},
				height: {
					type: GraphQLInt,
				},
				grayscale: {
					type: GraphQLBoolean,
					defaultValue: false,
				},
				duotone: {
					type: DuotoneGradientType,
					defaultValue: false,
				},
				cropFocus: {
					type: ImageCropFocusType,
					defaultValue: sharp.strategy.attention,
				},
				rotate: {
					type: GraphQLInt,
					defaultValue: 0,
				},
			},
			async resolve(image, fieldArgs, context) {
				const {
					componentX,
					componentY,
					grayscale,
					duotone,
					cropFocus,
					rotate,
				} = fieldArgs;

				const sharpArgs = {
					width: fieldArgs.width,
					height: fieldArgs.height,
					grayscale,
					duotone,
					cropFocus,
					rotate,
				};

				const file = getNodeAndSavePathDependency(image.parent, context.path);
				const { contentDigest } = image.internal;

				const job = await queueImageResizing({ file, args: sharpArgs });

				if (!(await fs.exists(job.absolutePath))) {
					debug(`Preparing ${file.name}`);
					await job.finishedPromise;
				}

				const {
					absolutePath,
					width,
					height,
				} = job;

				return generateBlurhash({
					cache,
					cacheDir,
					contentDigest,
					absolutePath,
					componentX,
					componentY,
					width,
					height,
				});
			},
		},
	};
}
