const Fuse = require ("fuse.js");
const { keywordDB } = require ("./keyworddb.js");

const fuse = new Fuse(keywordDB, {
  includeScore: true,
  threshold: 0.4,
  keys: ["keywords"]
});

//  function searchKeywords(text) {
//   return fuse.search(text);
// }
function searchKeywords(text) {
    const words = text.split(/\s+/); // split sentence into words
    let allResults = [];
  
    words.forEach(word => {
      const res = fuse.search(word);
      allResults.push(...res);
    });
  
    return allResults;
  }

module.exports = { searchKeywords };