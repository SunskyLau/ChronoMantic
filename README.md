# ChronoMantic: A Natural Language Interface for Interactive Time Series Pattern Query

This repository contains the source code and implementation for the paper "ChronoMantic: A Natural Language Interface for Interactive Time Series Pattern Query".

## Abstract

Finding time series patterns is an important problem in finance, healthcare, climatology, and manufacturing, where temporal data analysis informs critical decision-making processes. While by-example and by-sketch methods are commonly employed for time series querying, they are limited by insufficient preciseness in specifying patterns and discrepancies between algorithmic similarity measures and human perception. Natural language (NL) offers a promising alternative for specifying patterns, providing enhanced preciseness and improved ease of use. However, existing NL-based approaches are constrained by limited expressiveness, opaque parsing mechanisms, and inadequate support for iterative querying. This paper introduces ChronoMantic, an NL-driven interactive system for time series pattern querying. The system enables transparent parsing interpretation and enhanced iterative querying through by-example interaction. We demonstrate ChronoMantic’s general utility through two usage scenarios, test its algorithmic performance on our manually annotated dataset, and evaluate its query effectiveness and usability via a two-stage user study.

## System Architecture

ChronoMantic consists of:
- **Frontend**: React + TypeScript interface for interactive time series pattern querying
- **Backend**: Flask-based API server with LLM integration for natural language processing
- **Query Engine**: Structured pattern matching and similarity computation
- **Dataset Processing**: Time series data preprocessing and approximation

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm/yarn package manager

### Backend Setup
```bash
cd backend
pip install flask flask-cors pandas numpy scipy matplotlib groq openai typeguard pydantic
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. **Start the backend server**: The Flask server runs on `http://localhost:5000` by default
2. **Launch the frontend**: The React application runs on `http://localhost:5173`
3. **Upload time series data**: Use CSV format with timestamp and value columns
4. **Query patterns**: Use natural language descriptions or interactive segment selection
5. **Review results**: Examine matched patterns with similarity scores and visualizations

## Core Features

- **Natural Language Query Parsing**: Convert human-readable pattern descriptions to structured queries
- **Interactive Query Refinement**: Iterative query modification through user feedback
- **Pattern Approximation**: Efficient time series segmentation and trend analysis
- **Multi-modal Querying**: Support for both NL descriptions and by-example selection
- **Transparent Interpretation**: Clear explanation of query parsing and matching results

## Dataset Support

The system supports time series data in CSV format. Sample datasets are included in the `datasets/` directory for testing and evaluation purposes.

<!-- ## Technical Evaluation -->

<!-- Technical evaluation scripts and annotated datasets are available in `backend/technical_evaluation/` for reproducing the experimental results reported in the paper. -->

<!-- ## Citation -->

<!-- If you use this code in your research, please cite: -->

<!-- ```bibtex
@article{chronomantic2024,
  title={ChronoMantic: An NL-Driven Approach for Time Series Pattern Query via Large Language Models},
  author={[Author Names]},
  journal={[Journal Name]},
  year={2024}
}
``` -->

<!-- ## License -->

<!-- This project is licensed under the [MIT License](LICENSE). -->

<!-- ## Contact -->

<!-- For questions about the implementation or research, please contact [email@domain.com]. -->