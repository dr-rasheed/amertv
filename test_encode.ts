const data = { test: "أفلام" };
const str = JSON.stringify(data);
const encoded = btoa(unescape(encodeURIComponent(str)));
console.log(encoded);
