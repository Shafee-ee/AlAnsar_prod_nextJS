// models/Article.js

import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the article.'],
        trim: true,
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name.'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category.'],
    },
    image: {
        type: String, // Path to the image file
    },
    content: {
        type: String,
        required: [true, 'Please provide content for the article.'],
    },
    question: {
        type: String, // Field for Q&A, based on your sample data
    },
    date: {
        type: Date,
        default: Date.now,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    language: {
        type: String,
        required: [true, 'Please specify the language (e.g., Kannada, English).'],
    },
}, {
    // Mongoose option to correctly handle timestamps if you decide to use them
    timestamps: true
});

// Use existing model or create a new one to prevent re-compilation errors
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

export default Article;