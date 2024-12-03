import { Client } from '@opensearch-project/opensearch';
const client = new Client({
  node: process.env.OPENSEARCH_DOMAIN, // Replace with your OpenSearch domain
  auth: {
    username: process.env.OPENSEARCH_USERNAME ?? "", // Replace with your OpenSearch username (if applicable)
    password: process.env.OPENSEARCH_PASSWORD ?? "", // Replace with your OpenSearch password (if applicable)
  },
});

export default client;