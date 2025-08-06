const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/devhub');

// Define schema (simplified)
const snippetSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  language: String,
  author: mongoose.Schema.Types.ObjectId,
  tags: [String],
  visibility: String,
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    forks: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Snippet = mongoose.model('Snippet', snippetSchema);

async function createSampleSnippets() {
  try {
    // Create sample snippets
    const snippets = [
      {
        title: "Hello World Example",
        description: "A simple Hello World example in JavaScript",
        code: "console.log('Hello, World!');",
        language: "javascript",
        author: new mongoose.Types.ObjectId(),
        tags: ["example", "javascript"],
        visibility: "public"
      },
      {
        title: "Python Hello World",
        description: "Hello World in Python",
        code: "print('Hello, World!')",
        language: "python",
        author: new mongoose.Types.ObjectId(),
        tags: ["example", "python"],
        visibility: "public"
      },
      {
        title: "CSS Flexbox Center",
        description: "Center content using CSS Flexbox",
        code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}",
        language: "css",
        author: new mongoose.Types.ObjectId(),
        tags: ["css", "flexbox", "centering"],
        visibility: "public"
      }
    ];

    await Snippet.insertMany(snippets);
    console.log("Sample snippets created successfully!");
    
    const count = await Snippet.countDocuments();
    console.log(`Total snippets in database: ${count}`);
    
  } catch (error) {
    console.error("Error creating snippets:", error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleSnippets();
