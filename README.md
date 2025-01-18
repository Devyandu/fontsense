# FontSense 🎨🔍

Welcome to **FontSense**! Ever wondered what fonts a website is using? Well, wonder no more! FontSense is here to save the day. Give it a list of URLs, and it will tell you all about the fonts those websites are loading. It's like having X-ray vision for fonts! 🕶️✨

## What Does It Do? 🤔

FontSense takes an input CSV file with URLs, visits each website, and detects all the font files being loaded. It handles redirects, waits for the page to fully load, and then sniffs out those fancy font files. Finally, it generates an output CSV with the following columns:

- **OriginalURL**: The URL you provided.
- **RedirectedURL**: The URL after any redirects.
- **ListofFontNames**: The names of the fonts detected.
- **ListOfFontUrls**: The URLs from which the font files are loaded.

## How to Use It 🚀

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/Devyandu/fontsense.git
   cd fontsense