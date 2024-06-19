# Create your portfolio using React.js

This is a customizable portfolio website built with React. It showcases your skills, projects, experience, and more.

## Getting Started

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/portfolio.git
   ```
2. Navigate to the project directory:

    ```bash
    cd my-portfolio
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

4. Start the development server:
    ```bash
    npm start
    ```
The site will be available at http://localhost:3000.


## Features

- Dark/Light Theme: Toggle between dark and light themes.
- Responsive Design: Mobile-friendly layout.
- Smooth Transitions: Smooth animations and transitions between sections.
- Customizable Sections: Easily change the content of sections like About, - Skills, Projects, Experience, and Contact.
- Theme Switching: Uses a context-based theme switching mechanism.

## Customization 

### Changing the data 

To customize the data displayed on your portfolio, modify the data.json file located in the src/data directory.

```
{
  "name": "Your Name",
  "title": "Your Title",
  "about": "A brief introduction about yourself.",
  ...
}
```

### Changing Styles
To customize the styles, you can modify the CSS files located in the src/components directory. For example, to change the header style, edit Header.css.

### Adding New Sections
To add new sections, follow these steps:

- Create a new component in the src/components directory.
- Import and include the component in App.js within the content div.
- Add your section's data to data.json if needed.