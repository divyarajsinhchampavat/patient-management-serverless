import { Client } from '@opensearch-project/opensearch';
const client = new Client({
  node: process.env.OPENSEARCH_DOMAIN, //ANCHOR - Replace with your OpenSearch domain
  auth: {
    username: process.env.OPENSEARCH_USERNAME ?? "", //ANCHOR - Replace with your OpenSearch username (if applicable)
    password: process.env.OPENSEARCH_PASSWORD ?? "", //ANCHOR - Replace with your OpenSearch password (if applicable)
  },
});

export default client;