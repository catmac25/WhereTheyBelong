const { searchKeywords } = require("./fuseSearch.js");

function extractFields(description) {
  const results = searchKeywords(description.toLowerCase());

  const filters = {};

  results.forEach(r => {
    const { type, value } = r.item;
    filters[type] = value;
  });

  return filters;
}
module.exports = { extractFields };