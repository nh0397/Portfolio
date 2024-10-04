# Personal Portfolio with RAG Chatbot

This project is a personal portfolio website built with React.js, featuring a personalized RAG (Retrieval-Augmented Generation) Chatbot. The chatbot can answer questions related to the portfolio owner using data from their LinkedIn profile, resume, and GitHub repositories.

## Project Overview

The portfolio consists of two main components:

1. **Frontend**: A React.js application showcasing the portfolio.
2. **Backend**: A Flask application that powers the RAG Chatbot.

The chatbot uses vector embeddings stored in MongoDB to fetch relevant information and Google Gemini to summarize and generate responses.

## Backend Setup

To run the backend locally, follow these steps:

1. Clone the repository (if available).
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up the following environment variables:
   ```
   GOOGLE_API_KEY=
   MONGODB_API_KEY=
   MONGO_DB_NAME=
   MONGO_CL_NAME=
   MONGO_INDEX_NAME=
   MONGO_USERNAME=
   MONGO_PASSWORD=
   MONGO_EMBEDDING_FIELD_NAME=
   DEVELOPMENT_URL=
   PRODUCTION_URL=
   FLASK_ENV=
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```

## Frontend Repository

The frontend React application repository can be found at:
[https://github.com/nh0397/my-portfolio](https://github.com/nh0397/my-portfolio)

## How It Works

1. User asks a question through the portfolio interface.
2. The backend receives the question and queries the MongoDB database to retrieve relevant vector embeddings.
3. The retrieved data is sent to Google Gemini for summarization and answer generation.
4. The generated answer is returned to the user through the frontend interface.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Flask
- **Database**: MongoDB
- **AI Model**: Google Gemini
- **Vector Embeddings**: Google's models/embedding-001

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT License](https://opensource.org/licenses/MIT)

## Contact

For any questions or inquiries about this project, please contact Naisarg at naisarg.halvadiya@gmail.com

---

**Note**: This project uses Google's `models/embedding-001` for generating vector embeddings of the textual data. This model provides high-quality embeddings that enable efficient and accurate retrieval of relevant information for the RAG Chatbot.
