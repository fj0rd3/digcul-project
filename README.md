# Digital Culture Data Visualization Dashboard

An interactive web application for exploring and analyzing digital culture survey data, featuring advanced data visualizations, statistical insights, and correlation analysis.

## 🌟 Features

### Interactive Visualizations
- **3D Scatter Plot** - Explore relationships between social media usage and political opinions with customizable axes and interactive trendlines
- **Correlation Heatmap** - Discover correlations between variables with an intuitive color-coded matrix
- **Parallel Categories Diagram** - Visualize multi-dimensional categorical data and filtering patterns
- **Statistical Insights** - Key metrics and trends with animated displays

### Advanced Functionality
- **Real-time Filtering** - Filter data by demographics, social media platforms, and response patterns
- **Saved Views** - Save and restore custom visualization configurations
- **Comprehensive Reports** - Export full analysis reports as PNG images
- **Responsive Design** - Optimized for desktop and mobile viewing
- **Dark Theme** - Modern, eye-friendly dark interface

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Visualization**: [Plotly.js](https://plotly.com/javascript/)
- **Data Processing**: [PapaParse](https://www.papaparse.com/)
- **Image Export**: html2canvas
- **Deployment**: Vercel

## 📊 Data Visualizations

### 3D Plot Component
Visualize relationships between social media usage time and ordinal variables (rankings, Likert scales):
- Multiple linear regression trendlines
- Platform-based color coding
- 2D/3D view modes
- Interactive camera controls

### Correlation Heatmap
Pearson correlation matrix showing relationships between:
- Time spent on social media
- Political opinion scales
- Demographic variables
- Rankings and preferences

### Parallel Categories
Flow-based visualization for:
- Demographic distributions
- Social media platform usage patterns
- Emotional responses
- Filter impact analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fj0rd3/digcul-project.git
cd digcul-project/digital-culture-webapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
digital-culture-webapp/
├── app/
│   ├── components/         # React components
│   │   ├── IntroSection.tsx
│   │   ├── StatisticalInsights.tsx
│   │   ├── ParallelCategories.tsx
│   │   ├── CorrelationHeatmap.tsx
│   │   ├── Plot3D.tsx
│   │   ├── ComprehensiveExport.tsx
│   │   ├── AboutSection.tsx
│   │   ├── Navbar.tsx
│   │   └── SavedViewsManager.tsx
│   ├── lib/                # Utility functions
│   │   ├── dataUtils.ts
│   │   ├── exportUtils.ts
│   │   ├── comprehensiveExport.ts
│   │   └── savedViews.ts
│   ├── page.tsx            # Main page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── public/
│   └── digcul-study.csv    # Survey data
└── package.json
```

## 🔧 Configuration

### Data Format
The application expects CSV data with the following structure:
- Demographic columns (age, gender, education)
- Social media usage columns
- Time spent columns
- Likert scale opinion columns
- Ranking/rating columns

### Customization
- Modify `app/lib/dataUtils.ts` for custom data parsing
- Update color schemes in component files
- Adjust layout in `app/globals.css`

## 📈 Key Components

### Statistical Insights
Automatically calculates:
- Most used social media platform
- Average daily usage time
- Primary emotional response
- Key demographic patterns

### Filters
Multi-dimensional filtering by:
- Gender
- Age group
- Social media platform
- Social sciences background
- Emotional responses

### Export Functionality
Generate comprehensive reports including:
- All active visualizations
- Applied filters summary
- Statistical insights
- High-resolution PNG output

## 🌐 Deployment

This project is deployed on [Vercel](https://vercel.com):

1. **Push to GitHub**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Vercel will auto-detect Next.js and deploy

3. **Automatic Deployments**
Every push to `main` triggers a new deployment automatically.

## 📝 Development Notes

- The app uses dynamic imports for Plotly to optimize bundle size
- CSV data is loaded client-side from the public directory
- Saved views are stored in browser localStorage
- All visualizations are responsive and optimized for performance

## 🤝 Contributing

This is a research project. For questions or collaboration opportunities, please open an issue or contact the repository maintainers.

## 📄 License

This project is part of a digital culture research initiative.

## 🙏 Acknowledgments

- Survey respondents for providing valuable data
- Next.js team for the excellent framework
- Plotly team for the powerful visualization library
- Vercel for hosting platform

---

Built with ❤️ using Next.js and Plotly.js
