# Gatsby Blurhash plugin

## Installation

```shell script
npm install @m5r/gatsby-transformer-blurhash
```

or

```shell script
yarn add @m5r/gatsby-transformer-blurhash
```

## Usage

You will need [`https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-sharp`]() to use this plugin.

### Configuration

Add `@m5r/gatsby-transformer-blurhash` to your `gatsby-config.js`

```javascript
module.exports = {
    siteMetadata: {
        title: `Gatsby Blurhash Example`,
    },
    plugins: [
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: `${__dirname}/src/images/`,
            },
        },
        `gatsby-image`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`,
        `@m5r/gatsby-transformer-blurhash`,
    ],
}
```

### Getting the previews

```jsx harmony
import { graphql } from "gatsby";
import Image from "gatsby-image";
import PropTypes from "prop-types";

const IndexPage = ({ data }) => (
    <>
        {data.images.edges.map(image => (
            <Image
                fluid={{
                    ...image.node.childImageSharp.fluid,
                    base64: image.node.childImageSharp.blurHash.base64Image,
                }}
            />
        ))}
    </>
);

export default IndexPage;

IndexPage.propTypes = {
    data: PropTypes.object,
};

export const query = graphql`
    query {
        images: allFile(
            filter: { sourceInstanceName: { eq: "images" }, ext: { eq: ".jpg" } }
        ) {
            edges {
                node {
                    publicURL
                    name
                    childImageSharp {
                        fluid(maxWidth: 400, maxHeight: 400) {
                            ...GatsbyImageSharpFluid_noBase64
                        }
                        blurHash(width: 400) {
                            base64Image
                        }
                    }
                }
            }
        }
    }
`;
```

### Options

##### `componentX`: Integer, default: `4`

See: https://github.com/woltapp/blurhash#how-do-i-pick-the-number-of-x-and-y-components

##### `componentY`: Integer, default: `3`

See: https://github.com/woltapp/blurhash#how-do-i-pick-the-number-of-x-and-y-components

##### `width`: Integer, default: `400`

Width of the input image, which is used to generate the preview.

##### `height`: Integer, default: `auto`

The height of the input image, which is used to generate the preview. By default this value is calculated automatically to keep the aspect ratio of the input image. Make sure to adjust the value to reflect the desired aspect ratio of your generated thumbnails.

#### Sharp

##### `grayscale`: GraphQLBoolean, default: `false`

See: https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp#grayscale

##### `duotone`: DuotoneGradientType, default: `false`

See: https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp#duotone

##### `cropFocus`: ImageCropFocusType, default: `sharp.strategy.attention`

See: https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp#cropfocus

##### `rotate`: GraphQLInt, default: `0`

See: https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp#rotate
