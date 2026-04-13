const key = "8f4f02d4e36fc58b325b4fc01bbc0787";
const q = "Netanyahu Hezbollah Lebanon";
const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=5&token=${key}`;

console.log(`Testing URL: ${url}`);

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log("Response:", JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("Error:", err);
  });
