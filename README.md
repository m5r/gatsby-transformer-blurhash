# Gatsby Blurhash plugin

## Usage

```jsx harmony
import { graphql } from "gatsby";
import Image from "gatsby-image";

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
            blurHash(
              componentX: 4
              componentY: 3
              width: 400
              height: 200
            ) {
              base64Image
            }
          }
        }
      }
    }
  }
`;
```
