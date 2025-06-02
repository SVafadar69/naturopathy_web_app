# Naturopathy AI Platform

A web application designed for naturopathic healthcare professionals to analyze medical documents, images, and audio recordings using artificial intelligence.

## Features

- **Medical Document Analysis**: Upload and analyze patient records, lab reports, prescriptions (PDF, DOC, DOCX, TXT, RTF, ODT)
- **Medical Image Processing**: Analyze X-rays, lab results, skin conditions, and other medical imagery using AI vision
- **Patient Audio Notes**: Record consultations or upload audio files for automatic transcription
- **Patient Records Integration**: Connect with Google Docs for seamless record management
- **Secure Database Storage**: All patient data stored securely with PostgreSQL

## Quick Start

### Prerequisites

Before you begin, you'll need:
1. An OpenAI API key (for AI analysis features)
2. Node.js installed on your computer (version 18 or higher)
3. A PostgreSQL database (can be set up automatically)

### Getting Your OpenAI API Key

1. Visit [OpenAI's website](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (it starts with "sk-")
5. Keep this key secure - you'll need it for setup

### Installation Steps

1. **Download the code**
   ```bash
   git clone [your-repository-url]
   cd naturopathy-app
   ```

2. **Install required packages**
   ```bash
   npm install
   ```

3. **Set up your environment**
   Create a file called `.env` in the main folder and add:
   ```
   OPENAI_API_KEY=your_openai_key_here
   DATABASE_URL=your_database_connection_string
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Go to `http://localhost:5000` to use the application

## Database Setup

### Option 1: Automatic Setup (Recommended)
The application can automatically create a PostgreSQL database for you. No additional setup required.

### Option 2: Use Your Own Database
If you have an existing PostgreSQL database:
1. Create a new database for the application
2. Update the `DATABASE_URL` in your `.env` file
3. Run `npm run db:push` to create the necessary tables

## How to Use

### Upload Medical Documents
1. Click on the "Documents" tab
2. Drag and drop files or click "Browse Files"
3. The AI will automatically analyze the content
4. View the analysis results below your upload

### Analyze Medical Images
1. Click on the "Images" tab
2. Upload images of X-rays, lab results, or other medical imagery
3. The AI will provide detailed analysis of what it observes
4. Copy or save the analysis for your records

### Record Patient Audio
1. Click on the "Audio" tab
2. Click the microphone button to start recording
3. Speak your notes or patient consultation details
4. The audio will be automatically transcribed to text
5. Review and save the transcription

### Export to Google Docs
1. After processing any file, click "Upload to Docs"
2. Connect your Google account when prompted
3. The analysis will be saved to your Google Docs

## Security and Privacy

- All patient data is encrypted and stored securely
- API keys are kept private and never shared
- Database connections use secure protocols
- Regular backups are recommended for patient data

## Troubleshooting

### Application Won't Start
- Make sure Node.js is installed (`node --version`)
- Check that all packages are installed (`npm install`)
- Verify your OpenAI API key is correct

### Database Errors
- Ensure PostgreSQL is running
- Check your database connection string
- Try running `npm run db:push` again

### AI Features Not Working
- Verify your OpenAI API key is valid
- Check your internet connection
- Ensure you have sufficient API credits

### File Upload Issues
- Check file size limits (25MB for documents/audio, 10MB for images)
- Verify file formats are supported
- Clear your browser cache and try again

## Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT, RTF, ODT
- **Images**: JPG, PNG, GIF, WebP
- **Audio**: MP3, WAV, M4A

## Technical Support

For technical issues or questions:
1. Check the troubleshooting section above
2. Verify your API keys and database connection
3. Review the browser console for error messages
4. Ensure all prerequisites are properly installed

## Updates and Maintenance

To update the application:
1. Pull the latest code from the repository
2. Run `npm install` to update packages
3. Run `npm run db:push` to update database if needed
4. Restart the application

## Important Notes

- This application processes sensitive medical data
- Ensure compliance with local healthcare data regulations
- Regular backups of patient data are recommended
- Keep your OpenAI API key secure and never share it
- Monitor API usage to avoid unexpected charges

## Getting Help

If you need assistance:
- Review this README file
- Check the troubleshooting section
- Ensure all prerequisites are met
- Verify your API keys are correctly configured