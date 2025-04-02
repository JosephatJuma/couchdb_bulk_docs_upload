const axios = require("axios");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false, // Bypasses SSL verification
});
const DB_URL =
  process.env.DB_URL ||;

// Step 1: Fetch documents matching the query
async function fetchDocuments() {
  const response = await axios.post(
    `${DB_URL}/_find`,
    {
      selector: { type: "health_center" },
      limit: 100,
    },
    {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      httpsAgent: agent, // Use the custom agent
    }
  );
  return response.data.docs;
}
async function fetchParent(id) {
  const response = await axios.get(`${DB_URL}/${id}`, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    httpsAgent: agent, // Use the custom agent
  });
  return response.data.parent;
}
async function updateDocuments() {
  const docs = await fetchDocuments(); // Fetch all documents
  // Create a lookup map

  const updatedDocs = await Promise.all(
    docs.map(async (doc) => {
      //   console.log(doc.parent._id);
      const parent = await fetchParent(doc.parent._id);
      //   console.log(parent); // Fetch the parent document
      return {
        ...doc,
        type: "contact",
        contact_type: "c50-health_center",
        parent: { _id: doc.parent._id, parent: parent }, // Update the parent reference
      };
    })
  );

  const bulkUpdateResponse = await axios.post(
    `${DB_URL}/_bulk_docs`,
    {
      docs: updatedDocs,
    },
    {
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      httpsAgent: agent, // Use the custom agent
    }
  );
  console.log(bulkUpdateResponse.data);
  console.log(`Total documents updated: ${bulkUpdateResponse.data.length}`);
  console.log(`Total documents sent: ${updatedDocs.length}`);
}

// Step 2: Update and send bulk updates
// async function updateDocuments() {
//   const docs = await fetchDocuments();
//   const updatedDocs = docs.map((doc) => ({
//     ...doc,
//     type: "contact",
//     contact_type: "c50-health_center",
//   }));

// }

updateDocuments().catch(console.error);
