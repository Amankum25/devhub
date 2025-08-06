// MongoDB script to create a sample snippet
use devhub;

db.snippets.insertOne({
  title: "Hello World Example",
  description: "A simple Hello World example in JavaScript",
  code: "console.log('Hello, World!');",
  language: "javascript",
  author: new ObjectId(),
  tags: ["example", "javascript"],
  visibility: "public",
  stats: {
    views: 0,
    likes: 0,
    forks: 0
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Sample snippet created successfully!");
