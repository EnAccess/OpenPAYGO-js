# PAYGO Token Generator

This project is a **OpenPAYGO Token Generator** built with **Next.js**. It allows users to generate tokens for OpenPAYGO using specific parameters such as serial number, counter, starting code, and private key. The application provides a user-friendly interface to input these parameters and generates a token based on the provided data.

## Getting Started

To run the development server, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/EnAccess/OpenPAYGO-js
   cd website


2. Install the dependencies:
   ```bash
   npm install
   

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Features

- Input fields for serial number, counter, starting code, private key, command, and command argument.
- Validation for input fields to ensure correct data is provided.
- Displays the generated token and the next token count after submission.
- Error handling for invalid inputs and generation failures.

